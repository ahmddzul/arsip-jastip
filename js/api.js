'use strict';
/* =========================================================
   api.js — komunikasi ke Google Apps Script + antrean sinkron.
   Semua perubahan disimpan dulu di HP (langsung tampil),
   lalu dikirim ke Google Sheet di belakang layar. Kalau sinyal
   hilang, antrean disimpan dan dikirim ulang otomatis.
   ========================================================= */

const Api = {
  cfg() { return { url: localStorage.getItem('jt_url') || '', key: localStorage.getItem('jt_key') || '' }; },
  setCfg(url, key) {
    localStorage.setItem('jt_url', String(url).trim());
    localStorage.setItem('jt_key', String(key).trim());
    localStorage.removeItem('jt_demo');
  },
  isDemo() { return localStorage.getItem('jt_demo') === '1'; },
  isConnected() { return !!this.cfg().url && !this.isDemo(); },

  async call(action, payload = {}, cfg) {
    const c = cfg || this.cfg();
    if (!c.url) throw new Error('BELUM_TERSAMBUNG');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    let res;
    try {
      // Content-Type text/plain agar tidak memicu CORS preflight di Apps Script
      res = await fetch(c.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, action, key: c.key }),
        signal: ctrl.signal
      });
    } catch (e) {
      throw new Error(navigator.onLine ? 'TIDAK_TERJANGKAU' : 'JARINGAN');
    } finally { clearTimeout(t); }
    let j;
    try { j = await res.json(); } catch (e) { throw new Error('RESPON_ANEH'); }
    if (!j.ok) throw new Error(j.error || 'GAGAL');
    return j.data;
  },

  errText(e) {
    const m = (e && e.message) || String(e);
    return ({
      KUNCI_SALAH: 'Kode kuncinya nggak cocok. Cek lagi di tab "Pengaturan" pada Google Sheet.',
      BELUM_SETUP: 'Database belum disiapkan. Jalankan fungsi "setup" di Apps Script dulu.',
      JARINGAN: 'Lagi nggak ada internet. Datamu aman, nanti dikirim otomatis.',
      TIDAK_TERJANGKAU: 'Server nggak bisa dihubungi. Cek link Web App dan pastikan aksesnya "Anyone / Siapa saja".',
      RESPON_ANEH: 'Link-nya sepertinya bukan link Web App Apps Script. Coba salin ulang.',
      BELUM_TERSAMBUNG: 'Belum tersambung ke Google Sheet.',
      FOTO_TERLALU_BESAR: 'Fotonya kebesaran. Coba foto lain.'
    })[m] || 'Ups, ada kendala: ' + m;
  },

  /* Kode sambung: link + kunci dalam satu teks, untuk HP kedua */
  connectCode() {
    const c = this.cfg();
    return 'JSTP1.' + btoa(unescape(encodeURIComponent(JSON.stringify([c.url, c.key]))));
  },
  parseCode(s) {
    s = String(s || '').trim();
    if (!s.startsWith('JSTP1.')) return null;
    try {
      const [url, key] = JSON.parse(decodeURIComponent(escape(atob(s.slice(6)))));
      return url && key ? { url, key } : null;
    } catch (e) { return null; }
  }
};

const Sync = {
  queue: (() => { try { return JSON.parse(localStorage.getItem('jt_queue') || '[]'); } catch (e) { return []; } })(),
  state: 'ok',
  busy: false,
  inflight: 0,
  retry: 0,
  timer: null,
  lastError: '',

  persist() { try { localStorage.setItem('jt_queue', JSON.stringify(this.queue)); } catch (e) { /* abaikan */ } },

  setState(s) {
    if (Api.isDemo()) s = 'demo';
    this.state = s;
    document.querySelectorAll('.sync-dot').forEach(el => { el.dataset.state = s; });
  },

  push(op) {
    if (Api.isDemo()) return;
    // gabungkan perubahan berulang pada baris yang sama (hemat kiriman)
    if (op.op === 'upsert') {
      for (let i = this.queue.length - 1; i >= this.inflight; i--) {
        const q = this.queue[i];
        if (q.op === 'upsert' && q.table === op.table && q.row.id === op.row.id) { this.queue.splice(i, 1); break; }
      }
    }
    this.queue.push(op);
    this.persist();
    this.setState('pending');
    this.schedule(350);
  },

  schedule(ms) { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), ms); },

  async flush() {
    if (Api.isDemo()) { this.queue = []; this.persist(); this.setState('demo'); return; }
    if (this.busy) return;
    if (!this.queue.length) { this.setState('ok'); return; }
    if (!navigator.onLine) { this.setState('offline'); return; }
    this.busy = true;
    this.setState('sync');
    const ops = this.queue.slice(0, 40);
    this.inflight = ops.length;
    try {
      await Api.call('batch', { ops });
      this.queue.splice(0, ops.length);
      this.inflight = 0; this.retry = 0; this.lastError = '';
      this.persist();
      this.busy = false;
      if (this.queue.length) return this.flush();
      this.setState('ok');
    } catch (e) {
      this.inflight = 0; this.busy = false;
      this.lastError = Api.errText(e);
      const fatal = ['KUNCI_SALAH', 'BELUM_SETUP', 'RESPON_ANEH', 'TABEL_TIDAK_DIKENAL'].includes(e.message);
      this.setState(fatal ? 'error' : 'offline');
      this.retry++;
      this.schedule(Math.min(60000, 3000 * this.retry));
    }
  },

  /** Ambil data terbaru dari Sheet. Perubahan yang belum terkirim tetap dipertahankan. */
  async pull() {
    if (Api.isDemo()) return false;
    if (this.queue.length) await this.flush();
    this.setState('sync');
    const data = await Api.call('getAll');
    Store.applyRemote(data);
    this.setState(this.queue.length ? 'pending' : 'ok');
    return true;
  }
};

window.addEventListener('online', () => Sync.flush());
window.addEventListener('offline', () => Sync.setState('offline'));
