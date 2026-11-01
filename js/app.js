'use strict';
/* =========================================================
   app.js — router, navigasi, aksi umum, dan proses awal
   ========================================================= */

const App = {
  ui: {
    periode: '30',
    chart: 'bulan',
    barang: { q: '', st: 'open' },
    pesanan: { q: '', f: 'semua' },
    pelanggan: { q: '' },
    kiriman: { f: 'semua' },
    item: { id: null, var: 'all', reorder: false },
    welcomeStep: 1
  },
  route: { name: 'beranda', id: null, params: {} },
  loading: false,
  _moved: false,
  _raf: 0,

  NAV: [
    ['beranda', 'home', 'Beranda'],
    ['barang', 'box', 'Barang'],
    ['pesanan', 'list', 'Pesanan'],
    ['pelanggan', 'users', 'Pelanggan'],
    ['lainnya', 'grid', 'Lainnya']
  ],
  NAV_PARENT: { kiriman: 'lainnya', supplier: 'lainnya', pengaturan: 'lainnya', faq: 'lainnya' },

  parse() {
    const h = location.hash.slice(1) || '/beranda';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    return { name: parts[0] || 'beranda', id: parts[1] ? decodeURIComponent(parts[1]) : null, params: Object.fromEntries(new URLSearchParams(qs || '')) };
  },

  ready() { return Api.isDemo() || !!Api.cfg().url; },

  render(anim = true) {
    const view = document.getElementById('view');
    const nav = document.getElementById('bnav');
    if (!this.ready()) {
      view.className = 'view no-nav';
      nav.classList.add('hide');
      view.innerHTML = V.welcome();
      if (anim) this.animate(view);
      UI.syncPressed(view);
      return;
    }
    nav.classList.remove('hide');
    view.className = anim ? 'view' : 'view static';
    const r = this.route;
    if (r.name === 'pesanan' && r.params.f) this.ui.pesanan.f = r.params.f;
    if (r.name === 'barang' && !r.id && r.params.st) this.ui.barang.st = r.params.st;

    let html;
    const noData = !Store.meta.lastPull && !Api.isDemo();
    if (this.loading && noData) html = V.skeleton();
    else if (noData && (Sync.state === 'error' || Sync.state === 'offline') && Sync.lastError && !Store.hasData() && r.name !== 'pengaturan') html = V.errorState();
    else switch (r.name) {
      case 'barang': html = r.id ? V.barangDetail(r.id) : V.barang(); break;
      case 'pesanan': html = V.pesanan(); break;
      case 'pelanggan': html = r.id ? V.pelangganDetail(r.id) : V.pelanggan(); break;
      case 'lainnya': html = V.lainnya(); break;
      case 'kiriman': html = V.kiriman(); break;
      case 'supplier': html = V.supplier(); break;
      case 'pengaturan': html = V.pengaturan(); break;
      case 'faq': html = V.faq(); break;
      default: html = V.beranda();
    }
    view.innerHTML = html;
    if (anim) this.animate(view);
    UI.moneyInputs(view);
    UI.syncPressed(view);
    this.paintNav();
    const big = view.querySelector('.big[data-count]');
    if (big && anim) UI.countUp(big, +big.dataset.count, UI.rp);
    this.onScroll();
  },
  onScroll() { const h = document.querySelector('.vhead'); if (h) h.classList.toggle('scrolled', window.scrollY > 4); },
  animate(view) { view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter'); },

  paintNav() {
    const cur = this.NAV_PARENT[this.route.name] || this.route.name;
    const unpaid = Calc.bills().length;
    document.getElementById('bnav').innerHTML = this.NAV.map(([k, ic, l]) =>
      `<a href="#/${k}" class="${cur === k ? 'on' : ''}" ${cur === k ? 'aria-current="page"' : ''} onclick="this.classList.add('tap')">${UI.icon(ic)}<span>${l}</span>${k === 'pesanan' && unpaid ? `<span class="badge">${unpaid}</span>` : ''}</a>`).join('');
  },

  /** Gambar ulang halaman tanpa animasi; posisi gulir & fokus input dipertahankan. */
  refresh() {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      const y = window.scrollY;
      const a = document.activeElement;
      const fid = a && a.id && document.getElementById('view').contains(a) ? a.id : null;
      const sel = fid && typeof a.selectionStart === 'number' ? [a.selectionStart, a.selectionEnd] : null;
      this.render(false);
      window.scrollTo(0, y);
      if (fid) { const el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(...sel); } catch (e) { /* abaikan */ } } }
    });
  },

  async go(hash) {
    await UI.closeAll();
    if (location.hash === hash) this.refresh(); else location.hash = hash;
  },
  back(fallback) {
    if (this._moved && history.length > 1) history.back();
    else location.hash = fallback;
  },

  /* ---------- Filter & pencarian ---------- */
  setQ(key, v) {
    this.ui[key].q = v;
    const el = document.getElementById('lst');
    const fn = V[key + 'List'];
    if (el && fn) el.innerHTML = fn();
  },
  setF(key, field, v) {
    this.ui[key][field] = v;
    if (Object.keys(this.route.params).length) { history.replaceState(null, '', '#/' + this.route.name); this.route.params = {}; }
    this.render(false);
  },
  setPeriode(p) { this.ui.periode = p; this.refresh(); },
  setChart(c) { this.ui.chart = c; this.refresh(); },
  setVar(v) { this.ui.item.var = v; this.refresh(); },
  toggleReorder() { this.ui.item.reorder = !this.ui.item.reorder; this.refresh(); },

  /* ---------- Aksi barang & pesanan ---------- */
  addOrder(itemId, varId, custId, qty, paid, note = '', quiet = false) {
    const v = Store.get('Varian', varId);
    const max = Calc.ordersOf(itemId).reduce((m, o) => Math.max(m, +o.urut || 0), 0);
    return Store.upsert('Pesanan', {
      id: UI.uid('o'), barangId: itemId, varianId: varId, pelangganId: custId,
      qty: Math.max(1, qty), qtyMinta: 0, urut: max + 1, status: 'list',
      hargaModal: v ? +v.hargaModal : 0, hargaJual: v ? +v.hargaJual : 0, diskon: 0,
      bayar: paid ? 'lunas' : 'belum', tglBayar: paid ? UI.now() : '', tglDapat: '',
      solusi: '', kirimanId: '', catatan: note
    }, { quiet });
  },
  move(orderId, dir) {
    const o = Store.get('Pesanan', orderId); if (!o) return;
    const all = Calc.ordersOf(o.barangId).filter(x => x.status !== 'batal');
    // pastikan urutan rapi 1..n dulu
    all.forEach((x, i) => { if (+x.urut !== i + 1) Store.upsert('Pesanan', { ...x, urut: i + 1 }, { quiet: true }); });
    const vf = this.ui.item.var;
    const list = Calc.ordersOf(o.barangId).filter(x => x.status !== 'batal' && (vf === 'all' || x.varianId === vf));
    const i = list.findIndex(x => x.id === orderId), j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    const ua = a.urut, ub = b.urut;
    Store.upsert('Pesanan', { ...a, urut: ub }, { quiet: true });
    Store.upsert('Pesanan', { ...b, urut: ua }, { quiet: true });
    UI.haptic();
    this.refresh();
  },
  async toggleClose(id) {
    const it = Store.get('Barang', id); if (!it) return;
    const closing = it.status !== 'tutup';
    if (closing) {
      const w = Calc.ordersOf(id).filter(o => o.status === 'list').length;
      if (w) {
        const ok = await UI.confirm({ title: 'Tutup PO?', text: `Masih ada ${w} list yang belum dibagi jatahnya. Tetap tutup? Kamu masih bisa mengubahnya nanti.`, ok: 'Tetap tutup' });
        if (!ok) return;
      }
    }
    Store.upsert('Barang', { ...it, status: closing ? 'tutup' : 'open' });
    UI.toast(closing ? 'PO ditutup. Kerja bagus!' : 'PO dibuka lagi');
  },
  copyPromo(id) { const it = Store.get('Barang', id); if (it) UI.copy(Text.promo(it), 'Teks promosi tersalin. Tempel di status atau grup'); },
  copyList(id) {
    const it = Store.get('Barang', id); if (!it) return;
    if (!Calc.ordersOf(id).some(o => !Calc.isSelf(o))) return UI.toast('Belum ada yang list di barang ini');
    UI.copy(Text.list(it), 'List tersalin. Tinggal tempel di grup');
  },
  copyAddr(cid) { const c = Store.get('Pelanggan', cid); if (c && c.alamat) UI.copy(`${c.nama}\n${c.wa || ''}\n${c.alamat}`.replace(/\n\n/g, '\n'), 'Alamat tersalin'); },
  copyResi(kid) { const k = Store.get('Kiriman', kid); if (k && k.resi) UI.copy(k.resi, 'Resi tersalin'); },
  chat(cid) { const c = Store.get('Pelanggan', cid); if (c) UI.wa(c.wa, Text.sapa(c)); },
  copySisa(id) { const it = Store.get('Barang', id); if (it) UI.copy(Text.sisa(it), 'Teks barang sisa tersalin. Tempel di status atau grup'); },
  pickChip(btn, groupId) { document.querySelectorAll('#' + groupId + ' .chip').forEach(c => UI.on(c, c === btn)); },
  setMode(m) { Theme.set('mode', m); this.refresh(); },
  setTheme(t) { Theme.set('theme', t); this.refresh(); UI.toast('Tema ' + (Theme.THEMES.find(x => x[0] === t) || [0, t])[1] + ' dipakai di HP ini'); },

  /* ---------- Pengaturan ---------- */
  saveSettings() {
    const v = id => document.getElementById(id).value;
    const nama = v('sNama').trim(), toko = v('sToko').trim();
    if (!nama) return UI.shake(document.getElementById('sNama'), 'Nama panggilannya diisi dulu ya');
    const next = { namaPanggilan: nama, namaToko: toko || 'Jastip ' + nama, markupDefault: UI.num(v('sMarkup')) || 0, infoBayar: v('sBayar').trim(), panggilanDefault: ((document.querySelector('#sPgl .chip.on') || {}).dataset || {}).p === '-' ? '' : ((document.querySelector('#sPgl .chip.on') || {}).dataset || {}).p || 'Kak' };
    Object.entries(next).forEach(([k, val]) => { if (Store.settings[k] !== val) Store.setSetting(k, val); });
    UI.toast(`Siap, Kak ${nama}! Pengaturan disimpan`);
    this.refresh();
  },
  async cleanPhotos() {
    const old = Store.all('Barang').filter(b => b.status === 'tutup' && (b.fotoId || b.fotoUrl));
    if (!old.length) return UI.toast('Nggak ada foto lama yang perlu dihapus');
    const ok = await UI.confirm({ title: 'Hapus foto lama?', text: `${old.length} foto dari PO yang sudah selesai akan dipindah ke sampah Google Drive. Data barangnya tetap ada.`, ok: 'Hapus foto', danger: true });
    if (!ok) return;
    const ids = old.map(b => b.fotoId).filter(Boolean);
    if (ids.length && Api.isConnected()) {
      try { await Api.call('deletePhotos', { ids }); } catch (e) { return UI.toast(Api.errText(e), 'bad'); }
    }
    old.forEach(b => Store.upsert('Barang', { ...b, fotoId: '', fotoUrl: '' }, { quiet: true }));
    this.refresh();
    UI.toast(`${old.length} foto dibersihkan`);
  },
  async resetLocal() {
    const demo = Api.isDemo();
    const ok = await UI.confirm({
      title: demo ? 'Keluar dari mode coba?' : 'Putuskan HP ini?',
      text: demo ? 'Data contoh akan dihapus dari HP ini.' : (Sync.queue.length ? `<b>Ada ${Sync.queue.length} perubahan yang belum terkirim</b> dan akan hilang. ` : '') + 'Data di Google Sheet tetap aman. Kamu bisa menyambung lagi kapan saja.',
      ok: demo ? 'Keluar' : 'Putuskan', danger: true
    });
    if (!ok) return;
    ['jt_url', 'jt_key', 'jt_demo', 'jt_queue'].forEach(k => localStorage.removeItem(k));
    Sync.queue = [];
    const nama = Store.settings.namaPanggilan;
    Store.wipe();
    Store.settings.namaPanggilan = nama;
    this.ui.welcomeStep = 2;
    history.replaceState(null, '', '#/beranda');
    this.route = this.parse();
    this.render();
  },

  /* ---------- Data dari Google Sheet ---------- */
  async pull(first = false, loud = false) {
    if (!Api.isConnected()) { if (loud) UI.toast('Mode coba: data cuma ada di HP ini'); return; }
    if (first && !Store.meta.lastPull) { this.loading = true; this.render(false); }
    try {
      await Sync.pull();
      Store.ensureSelf();
      if (loud) UI.toast('Data sudah paling baru');
    } catch (e) {
      Sync.setState(['KUNCI_SALAH', 'BELUM_SETUP', 'RESPON_ANEH'].includes(e.message) ? 'error' : 'offline');
      Sync.lastError = Api.errText(e);
      if (loud || first) UI.toast(Api.errText(e), 'bad');
    }
    this.loading = false;
    this.refresh();
  },

  async connect(code, url, key, btn) {
    const parsed = Api.parseCode(code);
    if (code && code.trim() && !parsed) { UI.toast('Kode sambungnya nggak valid. Salin ulang dari HP pertama ya.', 'bad'); return false; }
    const cfg = parsed || { url: String(url || '').trim(), key: String(key || '').trim() };
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(cfg.url)) { UI.toast('Link Web App harus diawali https://script.google.com/…', 'bad'); return false; }
    if (!cfg.key) { UI.toast('Kode kuncinya diisi dulu ya', 'bad'); return false; }
    const label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Menghubungkan…'; }
    try {
      await Api.call('ping', {}, cfg);
    } catch (e) {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      UI.toast(Api.errText(e), 'bad');
      return false;
    }
    const nama = Store.settings.namaPanggilan, toko = Store.settings.namaToko;
    const wasDemo = Api.isDemo();
    Api.setCfg(cfg.url, cfg.key);
    if (wasDemo || Store.meta.sheetUrl === '') { Sync.queue = []; Sync.persist(); Store.wipe(); }
    await this.pull(true);
    // nama dari layar sambutan dikirim ke Sheet kalau di Sheet masih kosong
    if (nama && !Store.settings.namaPanggilan) Store.setSetting('namaPanggilan', nama);
    if (toko && !Store.settings.namaToko) Store.setSetting('namaToko', toko);
    UI.toast(`Tersambung! Halo, Kak ${Store.settings.namaPanggilan || nama}`);
    this.refresh();
    return true;
  },

  /* ---------- Layar sambutan ---------- */
  welcomeNext() {
    const n = document.getElementById('wNama').value.trim();
    if (!n) return UI.shake(document.getElementById('wNama'), 'Isi nama panggilanmu dulu ya');
    Store.settings.namaPanggilan = n;
    Store.settings.namaToko = document.getElementById('wToko').value.trim();
    Store.save();
    this.ui.welcomeStep = 2;
    this.render();
  },
  async welcomeConnect() {
    const ok = await this.connect(document.getElementById('wCode').value, document.getElementById('wUrl').value, document.getElementById('wKey').value, document.getElementById('wGo'));
    if (ok) { location.hash = '#/beranda'; this.route = this.parse(); this.render(); }
  },
  startDemo() {
    localStorage.setItem('jt_demo', '1');
    const nama = Store.settings.namaPanggilan, toko = Store.settings.namaToko;
    Store.wipe();
    Demo.seed();
    Store.settings.namaPanggilan = nama;
    Store.settings.namaToko = toko;
    Store.save();
    Sync.setState('demo');
    location.hash = '#/beranda';
    this.route = this.parse();
    this.render();
    UI.toast(`Ini data contoh ya, Kak ${nama}. Coba pencet-pencet aja`);
  },

  /* ---------- Mulai ---------- */
  boot() {
    Theme.apply();
    Store.load();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('hashchange', () => {
      this._moved = true;
      this.route = this.parse();
      this.render();
      window.scrollTo(0, 0);
    });
    this.route = this.parse();
    if (Store.settings.namaPanggilan && this.ready()) this.ui.welcomeStep = 2;
    if (Api.isDemo() && !Store.hasData()) Demo.seed();
    Sync.setState(Api.isDemo() ? 'demo' : Sync.queue.length ? 'pending' : 'ok');
    this.render();

    if (Api.isConnected()) {
      this.pull(true);
      Sync.flush();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Api.isConnected() && Date.now() - Store.meta.lastPull > 20000) this.pull();
    });
    setInterval(() => {
      if (document.visibilityState === 'visible' && Api.isConnected() && !UI.sheets.length) this.pull();
    }, 90000);

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => { /* tetap jalan tanpa offline */ });
    }
  }
};

App.boot();
