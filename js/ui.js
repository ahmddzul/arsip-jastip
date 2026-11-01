'use strict';
/* =========================================================
   ui.js — alat bantu tampilan: ikon, format Rupiah, toast,
   bottom sheet, konfirmasi, input uang, stepper.
   ========================================================= */

const ICONS = {
  home: '<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.8H9.2v5.8H5A1.5 1.5 0 0 1 3.5 19z"/>',
  box: '<path d="M20.5 7.6 12 3 3.5 7.6v8.8L12 21l8.5-4.6z"/><path d="M3.8 7.8 12 12.2l8.2-4.4M12 12.2V21"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" stroke-width="2.8"/>',
  users: '<circle cx="9" cy="8" r="3.6"/><path d="M2.8 20c.7-3.5 3.2-5.6 6.2-5.6s5.5 2.1 6.2 5.6"/><path d="M15.6 4.7a3.6 3.6 0 0 1 0 6.6M18 14.6c1.8.7 2.9 2.6 3.2 5.4"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  chat: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6a8.4 8.4 0 1 1 15.6-4.3z"/>',
  truck: '<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  store: '<path d="M4 9.5V20h16V9.5"/><path d="M2.8 9.2 4.6 4h14.8l1.8 5.2a2.6 2.6 0 0 1-4.6 1.6 2.6 2.6 0 0 1-4.6 0 2.6 2.6 0 0 1-4.6 0 2.6 2.6 0 0 1-4.6-1.6z"/><path d="M9.5 20v-5h5v5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5A1.5 1.5 0 0 0 8 21h8a1.5 1.5 0 0 0 1.5-1.5L18.5 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  camera: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.6l1.7-2.1M20 20v-4.5h-4.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  wallet: '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12.5v3"/><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M16.2 13.7h.01" stroke-width="2.8"/>',
  pie: '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15z"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  table: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M3.5 15h17M9.5 9.5V20"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
  phone: '<path d="M5 3.5h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.3 1.7V19a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5z"/>',
  note: '<path d="M6 3.5h9l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M8.5 12h7M8.5 16h5"/>',
  tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.3"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.6a4.5 4.5 0 0 1-.5 9.9z"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9 8.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.9-4 3.9-6.3 7.5-6.3s6.6 2.3 7.5 6.3"/>',
  info2: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cup: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c-.6.8.6 1.7 0 2.5M12 3.5c-.6.8.6 1.7 0 2.5"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  auto: '<rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
  food: '<path d="M4 11.5h16a8 8 0 0 1-16 0z"/><path d="M9 4.5c-.8.8-.8 2 0 3M13 4.5c-.8.8-.8 2 0 3"/>',
  chair: '<path d="M7 3.5h10v8H7z"/><path d="M5.5 11.5h13v3h-13zM7 14.5V21M17 14.5V21"/>',
  sofa: '<path d="M5 10V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5V10"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5 17v2.5M19 17v2.5"/>',
  lipstick: '<path d="M9 11.5h6v9H9z"/><path d="M10 11.5V6.5l4-3v8"/>',
  shirt: '<path d="M8.5 3.5 4 6l1.6 4H7.5v10.5h9V10h1.9L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z"/>',
  bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'
};

/* Logo kotak arsip. Warna mengikuti tema lewat currentColor. */
const LOGO = (cls = '') => `<svg class="${cls}" viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" rx="24" fill="currentColor"/><rect x="22" y="25" width="52" height="13" rx="3.5" style="fill:var(--logo-in,#fff)"/><rect x="26" y="40" width="44" height="34" rx="4.5" style="fill:var(--logo-in,#fff)"/><rect x="39" y="49" width="18" height="6" rx="3" fill="currentColor"/></svg>`;
const IG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>';

const UI = {
  BULAN: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  sheets: [],
  _ignorePop: 0,

  icon(n, cls = '') {
    return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  },
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  /* ---- Angka & Rupiah ---- */
  dots(n) { return String(Math.round(Math.abs(+n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
  rp(n) { n = Math.round(+n || 0); return (n < 0 ? '-' : '') + 'Rp ' + UI.dots(n); },
  rpShort(n) {
    n = +n || 0; const a = Math.abs(n), sg = n < 0 ? '-' : '';
    const f = x => (Math.round(x * 10) / 10).toString().replace('.',',');
    if (a >= 1e9) return sg + f(a / 1e9) + ' M';
    if (a >= 1e6) return sg + f(a / 1e6) + ' jt';
    if (a >= 1e3) return sg + Math.round(a / 1e3) + ' rb';
    return sg + a;
  },
  num(v) { const n = parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10); return isNaN(n) ? 0 : n; },

  /* ---- Tanggal ---- */
  now() { return new Date().toISOString(); },
  uid(p = 'x') { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  date(iso) {
    if (!iso) return '-'; const d = new Date(iso); if (isNaN(d)) return '-';
    return d.getDate() + ' ' + UI.BULAN[d.getMonth()] + ' ' + d.getFullYear();
  },
  rel(iso) {
    if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return '';
    const t = new Date(), day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const diff = Math.round((day(t) - day(d)) / 864e5);
    if (diff === 0) return 'Hari ini';
    if (diff === 1) return 'Kemarin';
    if (diff > 1 && diff < 7) return diff + ' hari lalu';
    return d.getDate() + ' ' + UI.BULAN[d.getMonth()] + (d.getFullYear() !== t.getFullYear() ? ' ' + d.getFullYear() : '');
  },
  ymd(d) { d = d ? new Date(d) : new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },

  /* ---- Nama & avatar ---- */
  initials(n) { const p = String(n || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); },
  ava(name, cls = '') {
    return `<span class="ava ${cls}" aria-hidden="true">${UI.esc(UI.initials(name))}</span>`;
  },

  /* ---- WhatsApp & clipboard ---- */
  waNum(n) {
    let d = String(n || '').replace(/\D/g, ''); if (!d) return '';
    if (d.startsWith('0')) d = '62' + d.slice(1); else if (d.startsWith('8')) d = '62' + d;
    return d;
  },
  wa(number, text) {
    const url = `https://wa.me/${UI.waNum(number)}?text=${encodeURIComponent(text || '')}`;
    window.open(url, '_blank', 'noopener');
  },
  async copy(text, msg = 'Tersalin! Tinggal tempel') {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { /* fallback di bawah */ }
    if (!ok) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* abaikan */ }
      ta.remove();
    }
    UI.toast(msg);
  },
  /* Status terpilih: kelas .on + aria-pressed supaya tidak hanya dibedakan lewat warna */
  on(el, v) { if (!el) return; el.classList.toggle('on', !!v); if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(!!v)); },
  syncPressed(root) { root.querySelectorAll('.chips button.chip, .seg button').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('on')))); },
  haptic() { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* abaikan */ } },

  /* ---- Toast ---- */
  toast(msg, type = '', action) {
    const root = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span>${UI.esc(msg)}</span>` + (action ? `<button type="button">${UI.esc(action.label)}</button>` : '');
    if (action) el.querySelector('button').onclick = () => { action.fn(); el.remove(); };
    while (root.children.length > 2) root.firstChild.remove();
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); }, action ? 5500 : 2600);
  },
  shake(el, msg) {
    if (msg) UI.toast(msg, 'bad');
    if (!el) return;
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
    if (el.focus && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) el.focus();
  },

  /* ---- Bottom sheet ---- */
  sheet({ title, html, onMount, cls = '' }) {
    const root = document.getElementById('sheets');
    const w = document.createElement('div');
    w.className = 'sheet-wrap ' + cls;
    w.innerHTML = `<div class="sheet-bg"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="${UI.esc(title)}" tabindex="-1">
        <div class="grip"></div>
        <header class="sheet-h"><h2>${UI.esc(title)}</h2><button class="icon-btn sm" type="button" data-x aria-label="Tutup">${UI.icon('x')}</button></header>
        <div class="sheet-b">${html}</div>
      </section>`;
    root.appendChild(w);
    document.body.classList.add('noscroll');

    const api = { el: w.querySelector('.sheet'), body: w.querySelector('.sheet-b'), closed: false, onClose: null, opener: document.activeElement };
    api.$ = s => api.el.querySelector(s);
    api.$$ = s => [...api.el.querySelectorAll(s)];
    api.close = fromPop => new Promise(res => {
      if (api.closed) return res();
      api.closed = true;
      w.classList.add('closing');
      w.classList.remove('open');
      if (api.opener && document.contains(api.opener) && api.opener.focus) setTimeout(() => api.opener.focus({ preventScroll: true }), 30);
      UI.sheets = UI.sheets.filter(x => x !== api);
      if (!UI.sheets.length) document.body.classList.remove('noscroll');
      setTimeout(() => w.remove(), 280);
      if (api.onClose) api.onClose();
      if (fromPop !== true) { UI._ignorePop++; history.back(); setTimeout(res, 120); } else res();
    });
    w.querySelector('.sheet-bg').onclick = () => api.close();
    w.querySelector('[data-x]').onclick = () => api.close();

    history.pushState({ sheet: true }, '');
    UI.sheets.push(api);
    requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
    setTimeout(() => { if (!api.el.contains(document.activeElement)) api.el.focus({ preventScroll: true }); }, 60);
    UI.moneyInputs(api.el);
    UI.steppers(api.el);
    if (onMount) onMount(api);
    UI.syncPressed(api.el);
    return api;
  },
  async closeAll() { while (UI.sheets.length) await UI.sheets[UI.sheets.length - 1].close(); },
  confirm({ title, text, ok = 'Ya, lanjut', danger = false }) {
    return new Promise(res => {
      let answered = false;
      UI.sheet({
        title, cls: 'small',
        html: `<p class="muted">${text}</p><div class="btn-row"><button class="btn ghost" data-n type="button">Batal</button><button class="btn ${danger ? 'danger' : 'primary'}" data-y type="button">${UI.esc(ok)}</button></div>`,
        onMount(api) {
          api.onClose = () => { if (!answered) res(false); };
          api.$('[data-n]').onclick = () => { answered = true; api.close(); res(false); };
          api.$('[data-y]').onclick = async () => { answered = true; await api.close(); res(true); };
        }
      });
    });
  },

  /* ---- Input khusus ---- */
  moneyInputs(root) {
    root.querySelectorAll('input[data-money]:not([data-b])').forEach(inp => {
      inp.dataset.b = 1;
      inp.addEventListener('input', () => { const n = UI.num(inp.value); inp.value = n ? UI.dots(n) : ''; });
    });
  },
  stepper(id, val = 1, min = 0) {
    return `<div class="stepper" data-min="${min}"><button type="button" data-d="-1" aria-label="Kurangi">−</button><input id="${id}" inputmode="numeric" value="${val}" aria-label="Jumlah"><button type="button" data-d="1" aria-label="Tambah">+</button></div>`;
  },
  steppers(root) {
    root.querySelectorAll('.stepper:not([data-b])').forEach(st => {
      st.dataset.b = 1;
      const inp = st.querySelector('input'), min = +st.dataset.min || 0;
      st.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        inp.value = Math.max(min, UI.num(inp.value) + (+b.dataset.d));
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        UI.haptic();
      }));
    });
  },
  resizeImage(file, max = 1080, q = 0.8) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Foto nggak bisa dibaca')); };
      img.src = url;
    });
  }
};

/* Keyboard: Escape menutup sheet teratas, Tab berputar di dalam sheet,
   Enter/Spasi mengaktifkan elemen role="button" */
document.addEventListener('keydown', e => {
  const top = UI.sheets[UI.sheets.length - 1];
  if (e.key === 'Escape' && top) { e.preventDefault(); top.close(); return; }
  if (e.key === 'Tab' && top) {
    const f = [...top.el.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([hidden]),select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === top.el)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  const t = e.target;
  if ((e.key === 'Enter' || e.key === '') && t && t.getAttribute && t.getAttribute('role') === 'button' && t.tagName !== 'BUTTON') {
    e.preventDefault(); t.click();
  }
});

/* Konfeti kecil untuk momen penting (dapat, lunas, bagi jatah) */
UI.confetti = (x, y) => {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cs = getComputedStyle(document.documentElement);
  const colors = [cs.getPropertyValue('--acc').trim(), '#F2B705', '#1FA971', '#FF6B81', '#4CC3FF'];
  const cx = x == null ? innerWidth / 2 : x, cy = y == null ? innerHeight * .45 : y;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('i');
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 120;
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 140}px;--rot:${Math.random() * 540 - 270}deg;animation-delay:${Math.random() * 60}ms`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1300);
};

/* Angka naik perlahan (dipakai untuk untung di Beranda) */
UI.countUp = (el, to, fmt) => {
  if (!el) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 700;
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(to * e)); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};

/* Tema & mode gelap, disimpan per HP */
const Theme = {
  THEMES: [['ungu', 'Ungu', '#6A45E0'], ['biru', 'Biru', '#2457D6'], ['merah', 'Merah', '#C42A3F'], ['oranye', 'Oranye', '#B14E0B'], ['hijau', 'Hijau', '#0E7A4D'], ['pink', 'Pink', '#C2185B']],
  get theme() { return localStorage.getItem('aj_theme') || 'ungu'; },
  get mode() { return localStorage.getItem('aj_mode') || 'auto'; },
  resolved() { return this.mode === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : this.mode; },
  apply() {
    const r = document.documentElement;
    r.dataset.theme = this.theme; r.dataset.mode = this.resolved();
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = this.resolved() === 'dark' ? '#0E1015' : '#F7F7F9';
  },
  set(k, v) { localStorage.setItem(k === 'theme' ? 'aj_theme' : 'aj_mode', v); this.apply(); }
};
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => Theme.apply());

window.addEventListener('popstate', () => {
  if (UI._ignorePop > 0) { UI._ignorePop--; return; }
  const top = UI.sheets[UI.sheets.length - 1];
  if (top) top.close(true);
});
