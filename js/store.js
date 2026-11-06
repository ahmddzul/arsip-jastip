'use strict';
/* =========================================================
   store.js — data lokal (cermin Google Sheet), hitungan bisnis,
   dan teks siap kirim (promosi, list, tagihan, resi).
   ========================================================= */

const TABLES = ['Supplier', 'Barang', 'Varian', 'Pelanggan', 'Pesanan', 'Kiriman'];
const SELF_ID = 'self';

const DEFAULT_SETTINGS = {
  namaPanggilan: '',
  namaToko: '',
  markupDefault: 10000,
  penutupPromosi: 'Langsung reply nama + varian ya kak. Siapa cepat dia dapat! 🏃‍♀️',
  infoBayar: '',
  panggilanDefault: 'Kak',
  tplPromo: '',
  tplSisa: '',
  tplTagih: '',
  tplSapa: '',
  tplKirim: ''
};

const PANGGILAN = ['Kak', 'Mas', 'Mbak', 'Bu', 'Pak'];

/* Template pesan: teks bawaan + kata kunci {…} yang diganti otomatis */
const TEMPLATES = {
  tplPromo: {
    label: 'Teks promosi', icon: 'copy', hint: 'Tombol "Promosi" di halaman barang',
    def: '✨ *JASTIP OPEN* ✨\n\n*{barang}*\n{keterangan}\n\n{harga}\n{diskon}\n\nLangsung reply nama + varian ya kak. Siapa cepat dia dapat! 🏃‍♀️',
    vars: [['barang', 'Nama barang'], ['keterangan', 'Keterangan barang'], ['harga', 'Daftar harga'], ['diskon', 'Info diskon'], ['toko', 'Nama toko']]
  },
  tplSisa: {
    label: 'Promosi barang sisa', icon: 'box', hint: 'Tombol "Tawarkan sisa" saat ada barang lebih',
    def: '🔥 *READY STOCK* 🔥\n\n*{barang}*\n{keterangan}\n\n{sisa}\n\nMau? Langsung reply ya kak, siapa cepat dia dapat 🏃‍♀️',
    vars: [['barang', 'Nama barang'], ['keterangan', 'Keterangan barang'], ['sisa', 'Sisa & harga'], ['toko', 'Nama toko']]
  },
  tplTagih: {
    label: 'Tagihan', icon: 'wallet', hint: 'Tombol "Tagih via WA"',
    def: 'Halo {sapaan} 👋\nIni rincian jastip dari {toko} ya:\n\n{rincian}\n\n*Total: {total}*\n\n{rekening}\n\nDitunggu transferannya ya. Makasih banyak 💜',
    vars: [['sapaan', 'Panggilan + nama'], ['nama', 'Nama saja'], ['rincian', 'Rincian barang'], ['total', 'Total tagihan'], ['rekening', 'Info pembayaran'], ['toko', 'Nama toko']]
  },
  tplSapa: {
    label: 'Sapa / chat', icon: 'chat', hint: 'Tombol "Chat" di pelanggan dan pesanan',
    def: 'Halo {sapaan} 👋',
    vars: [['sapaan', 'Panggilan + nama'], ['nama', 'Nama saja'], ['panggilan', 'Panggilan saja'], ['toko', 'Nama toko']]
  },
  tplKirim: {
    label: 'Kabar kiriman', icon: 'truck', hint: 'Tombol "Kabari via WA" di kiriman',
    def: 'Halo {sapaan} 👋\nPaket jastipnya {status_paket} ya 📦\n\n{kurir_resi}\n\nIsi paket:\n{isi_paket}\n\nMakasih udah jastip di {toko} 💜',
    vars: [['sapaan', 'Panggilan + nama'], ['status_paket', 'dikirim / siap diambil'], ['kurir_resi', 'Kurir & resi'], ['isi_paket', 'Isi paket'], ['toko', 'Nama toko']]
  }
};

const KATEGORI = [
  ['Makanan', 'food'], ['Perabotan', 'chair'], ['Informa', 'sofa'],
  ['Kosmetik', 'lipstick'], ['Fashion', 'shirt'], ['Lainnya', 'bag']
];
const KURIR = ['JNE', 'J&T', 'SiCepat', 'AnterAja', 'GoSend', 'GrabExpress', 'Antar sendiri', 'Ambil sendiri'];

UI.katIcon = k => (KATEGORI.find(x => x[0] === k) || [0, 'bag'])[1];
const tokoName = () => Store.settings.namaToko || (Store.settings.namaPanggilan ? 'Jastip ' + Store.settings.namaPanggilan : 'Arsip Jastip');

const Store = {
  db: Object.fromEntries(TABLES.map(t => [t, []])),
  settings: { ...DEFAULT_SETTINGS },
  meta: { sheetUrl: '', lastPull: 0 },

  load() {
    try {
      const j = JSON.parse(localStorage.getItem('jt_db') || 'null');
      if (!j) return;
      TABLES.forEach(t => { this.db[t] = (j.db && j.db[t]) || []; });
      Object.assign(this.settings, j.settings || {});
      Object.assign(this.meta, j.meta || {});
    } catch (e) { /* cache rusak: abaikan */ }
  },
  save() {
    try { localStorage.setItem('jt_db', JSON.stringify({ db: this.db, settings: this.settings, meta: this.meta })); }
    catch (e) { UI.toast('Memori HP penuh. Coba bersihkan foto lama di Pengaturan.', 'bad'); }
  },
  wipe() {
    TABLES.forEach(t => { this.db[t] = []; });
    this.settings = { ...DEFAULT_SETTINGS };
    this.meta = { sheetUrl: '', lastPull: 0 };
    this.save();
  },
  hasData() { return TABLES.some(t => this.db[t].length); },

  all(t) { return this.db[t]; },
  get(t, id) { return this.db[t].find(r => r.id === id); },

  _put(t, row) {
    const a = this.db[t], i = a.findIndex(r => r.id === row.id);
    if (i >= 0) { a[i] = { ...a[i], ...row }; return a[i]; }
    a.push(row); return row;
  },
  upsert(t, row, opt = {}) {
    const exists = !!this.get(t, row.id);
    const now = UI.now();
    row = { ...row, diubah: now };
    if (!exists && !row.dibuat) row.dibuat = now;
    const full = this._put(t, row);
    this.save();
    Sync.push({ op: 'upsert', table: t, row: { ...full } });
    if (!opt.quiet) App.refresh();
    return full;
  },
  remove(t, id, opt = {}) {
    this.db[t] = this.db[t].filter(r => r.id !== id);
    this.save();
    Sync.push({ op: 'remove', table: t, id });
    if (!opt.quiet) App.refresh();
  },
  setSetting(k, v) {
    this.settings[k] = v;
    this.save();
    Sync.push({ op: 'setting', key: k, value: v });
  },

  applyRemote(data) {
    TABLES.forEach(t => { this.db[t] = (data.tables && data.tables[t]) || []; });
    const s = data.settings || {};
    Object.keys(DEFAULT_SETTINGS).forEach(k => {
      if (s[k] !== undefined) this.settings[k] = typeof DEFAULT_SETTINGS[k] === 'number' ? (UI.num(s[k]) || DEFAULT_SETTINGS[k]) : s[k];
    });
    this.meta.sheetUrl = data.sheetUrl || this.meta.sheetUrl;
    this.meta.lastPull = Date.now();
    this.meta.serverVersion = data.serverVersion || 1;
    // terapkan lagi perubahan yang belum sempat terkirim
    Sync.queue.forEach(op => {
      if (op.op === 'upsert') this._put(op.table, op.row);
      else if (op.op === 'remove') this.db[op.table] = this.db[op.table].filter(r => r.id !== op.id);
      else if (op.op === 'setting') this.settings[op.key] = op.value;
    });
    this.save();
  },

  /* Pelanggan khusus "Aku sendiri" untuk barang yang kamu list sendiri */
  ensureSelf() {
    if (!this.get('Pelanggan', SELF_ID)) {
      this.upsert('Pelanggan', { id: SELF_ID, nama: 'Aku sendiri', wa: '', alamat: '', catatan: 'Barang yang aku list buat diri sendiri', isSelf: true }, { quiet: true });
    }
  },
  findCust(name) {
    const n = String(name || '').trim().toLowerCase();
    if (!n) return null;
    return this.all('Pelanggan').find(c => !c.isSelf && String(c.nama).trim().toLowerCase() === n) || null;
  },
  ensureCust(name) {
    return this.findCust(name) || this.upsert('Pelanggan', { id: UI.uid('c'), nama: String(name).trim(), wa: '', alamat: '', catatan: '', isSelf: false }, { quiet: true });
  }
};

/* =========================================================
   Hitungan bisnis
   ========================================================= */
const Calc = {
  item: o => Store.get('Barang', o.barangId),
  varian: o => Store.get('Varian', o.varianId),
  cust: o => Store.get('Pelanggan', o.pelangganId),
  isSelf: o => { if (o.pelangganId === SELF_ID) return true; const c = Calc.cust(o); return !!(c && c.isSelf); },

  variantsOf: itemId => Store.all('Varian').filter(v => v.barangId === itemId).sort((a, b) => (a.urut || 0) - (b.urut || 0)),
  ordersOf: itemId => Store.all('Pesanan').filter(o => o.barangId === itemId)
    .sort((a, b) => (a.urut || 0) - (b.urut || 0) || String(a.dibuat).localeCompare(String(b.dibuat))),
  ordersOfCust: cid => Store.all('Pesanan').filter(o => o.pelangganId === cid)
    .sort((a, b) => String(b.dibuat).localeCompare(String(a.dibuat))),
  varName: o => { const v = Calc.varian(o); return v && v.nama !== 'Standar' ? v.nama : ''; },

  /* Diskon otomatis: total beli pelanggan di barang ini >= minimal → potong per pcs */
  autoDisc(o) {
    const it = Calc.item(o);
    if (!it || !(it.diskonMin > 0) || !(it.diskonRp > 0)) return 0;
    const q = Store.all('Pesanan')
      .filter(x => x.barangId === o.barangId && x.pelangganId === o.pelangganId && x.status !== 'tidak' && x.status !== 'batal')
      .reduce((s, x) => s + (+x.qty || 0), 0);
    return q >= it.diskonMin ? (+o.qty || 0) * it.diskonRp : 0;
  },
  gross: o => (+o.qty || 0) * (+o.hargaJual || 0),
  total: o => Math.max(0, Calc.gross(o) - (+o.diskon || 0) - Calc.autoDisc(o)),
  modal: o => (+o.qty || 0) * (+o.hargaModal || 0),
  profit: o => Calc.total(o) - Calc.modal(o),

  isWaiting: o => o.status === 'list',
  isUnpaid: o => o.status === 'dapat' && o.bayar !== 'lunas' && !Calc.isSelf(o),
  isReady: o => o.status === 'dapat' && o.bayar === 'lunas' && !o.kirimanId && !Calc.isSelf(o),
  isShipped: o => !!o.kirimanId,
  isRefund: o => (o.status === 'tidak' || o.status === 'batal') && o.bayar === 'lunas' && !o.solusi && !Calc.isSelf(o),

  /* Stok: total yang didapat dari supplier per varian. Sisa = stok − yang sudah dibagi (status Dapat). */
  stokOf(v) {
    const dipakai = Store.all('Pesanan').filter(o => o.varianId === v.id && o.status === 'dapat').reduce((a, o) => a + (+o.qty || 0), 0);
    const stok = +v.stokDapat || 0;
    return { stok, dipakai, sisa: Math.max(0, stok - dipakai) };
  },
  sisaItem: itemId => Calc.variantsOf(itemId).map(v => ({ v, ...Calc.stokOf(v) })).filter(x => x.sisa > 0),
  sisaAll: () => Store.all('Barang').map(b => ({ b, rows: Calc.sisaItem(b.id) })).filter(x => x.rows.length)
    .map(x => ({ ...x, pcs: x.rows.reduce((a, r) => a + r.sisa, 0), modal: x.rows.reduce((a, r) => a + r.sisa * (+r.v.hargaModal || 0), 0) })),
  /* Kalau ada pesanan ditandai Dapat melebihi stok tercatat, stok ikut naik (artinya barangnya memang ada). */
  syncStok(varianId) {
    const v = Store.get('Varian', varianId); if (!v) return;
    const st = Calc.stokOf(v);
    if (st.dipakai > st.stok) Store.upsert('Varian', { ...v, stokDapat: st.dipakai }, { quiet: true });
  },

  inPeriod(iso, p) {
    if (p === 'semua') return true;
    const d = new Date(iso); if (isNaN(d)) return false;
    const now = new Date();
    if (p === 'minggu') { const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); return d >= from; }
    if (p === '30') { const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); return d >= from; }
    if (p === 'bulan') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    // Bulan tertentu 'm:2026-10' dan tahun tertentu 'y:2026' (dipakai pilihan Bulanan/Tahunan)
    if (p.startsWith('m:')) { const [y, m] = p.slice(2).split('-').map(Number); return d.getFullYear() === y && d.getMonth() === m - 1; }
    if (p.startsWith('y:')) return d.getFullYear() === +p.slice(2);
    return true;
  },
  soldDate: o => o.tglDapat || o.diubah || o.dibuat,

  summary(p) {
    let omzet = 0, untung = 0, pcs = 0, self = 0;
    Store.all('Pesanan').forEach(o => {
      if (o.status !== 'dapat' || !Calc.inPeriod(Calc.soldDate(o), p)) return;
      if (Calc.isSelf(o)) { self += Calc.modal(o); return; }
      omzet += Calc.total(o); untung += Calc.profit(o); pcs += +o.qty || 0;
    });
    let ongkir = 0, ongkirSup = 0;
    Calc.keluar().forEach(k => {
      if (Calc.inPeriod(k.tanggal || k.dibuat, p)) ongkir += (+k.ongkirTagih || 0) - (+k.ongkirBiaya || 0);
    });
    Calc.masuk().forEach(k => { if (Calc.inPeriod(k.tanggal || k.dibuat, p)) ongkirSup += +k.ongkirBiaya || 0; });
    return { omzet, untung: untung + ongkir - ongkirSup, untungBarang: untung, ongkir, ongkirSup, pcs, self };
  },

  /* Pesanan masuk: semua yang memesan (Nunggu kabar + Dapat) menurut tanggal dicatat, walau belum dibayar.
     Nggak dapat, Batal, dan Buat aku tidak dihitung. */
  pesananMasuk(p) {
    const r = { total: 0, untung: 0, pcs: 0, pelanggan: 0, lunas: 0, belum: 0, nunggu: 0, n: 0 }, cs = new Set();
    Store.all('Pesanan').forEach(o => {
      if ((o.status !== 'list' && o.status !== 'dapat') || Calc.isSelf(o) || !Calc.inPeriod(o.dibuat, p)) return;
      const t = Calc.total(o);
      r.total += t; r.untung += Calc.profit(o); r.pcs += +o.qty || 0; r.n++; cs.add(o.pelangganId);
      if (o.bayar === 'lunas') r.lunas += t; else if (o.status === 'dapat') r.belum += t; else r.nunggu += t;
    });
    r.pelanggan = cs.size;
    return r;
  },
  /* Bulan paling awal yang punya data, untuk batas tombol mundur */
  firstDate() {
    let min = null;
    Store.all('Pesanan').forEach(o => { const d = new Date(o.dibuat); if (!isNaN(d) && (!min || d < min)) min = d; });
    return min || new Date();
  },

  /* Kiriman ke pelanggan (keluar) dan ongkir dari supplier ke kamu (masuk) disimpan di tabel yang sama. */
  isMasuk: k => k.arah === 'masuk',
  keluar: () => Store.all('Kiriman').filter(k => !Calc.isMasuk(k)),
  masuk: () => Store.all('Kiriman').filter(Calc.isMasuk),
  barangIdsOf: k => String(k.barangIds || '').split(',').map(x => x.trim()).filter(Boolean),
  /* Bobot pembagian ongkir: jumlah pcs yang datang (stok), kalau belum diisi pakai pcs Dapat. */
  pcsDatang(barangId) {
    const stok = Calc.variantsOf(barangId).reduce((a, v) => a + (+v.stokDapat || 0), 0);
    if (stok) return stok;
    return Calc.ordersOf(barangId).filter(o => o.status === 'dapat').reduce((a, o) => a + (+o.qty || 0), 0);
  },
  /* Bagian ongkir satu kiriman supplier untuk satu barang. Dibagi sesuai pcs; kalau pcs belum ada, dibagi rata. */
  bagianOngkir(k, barangId) {
    const ids = Calc.barangIdsOf(k).filter(id => Store.get('Barang', id));
    if (!ids.includes(barangId)) return 0;
    const w = ids.map(Calc.pcsDatang), tot = w.reduce((a, x) => a + x, 0);
    const biaya = +k.ongkirBiaya || 0;
    return Math.round(tot ? biaya * w[ids.indexOf(barangId)] / tot : biaya / ids.length);
  },
  ongkirBarang: (barangId, p = 'semua') => Calc.masuk().filter(k => Calc.inPeriod(k.tanggal || k.dibuat, p)).reduce((a, k) => a + Calc.bagianOngkir(k, barangId), 0),
  ongkirSupplier: sid => Calc.masuk().filter(k => k.supplierId === sid),

  bills() {
    const m = {};
    const add = id => m[id] || (m[id] = { pelangganId: id, orders: [], kiriman: [], total: 0 });
    Store.all('Pesanan').forEach(o => { if (Calc.isUnpaid(o)) { const b = add(o.pelangganId); b.orders.push(o); b.total += Calc.total(o); } });
    Calc.keluar().forEach(k => {
      if ((+k.ongkirTagih || 0) > 0 && !k.ongkirLunas && k.pelangganId !== SELF_ID) { const b = add(k.pelangganId); b.kiriman.push(k); b.total += +k.ongkirTagih; }
    });
    return Object.values(m).sort((a, b) => b.total - a.total);
  },
  billOf: cid => Calc.bills().find(b => b.pelangganId === cid) || null,

  /* mode: 'hari' (7 hari terakhir), 'bulan' (6 bulan sampai bulan `end`), 'tahun' (12 bulan pada tahun `end`) */
  series(mode, end) {
    const now = new Date(), out = [];
    if (mode === 'hari') {
      const H = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      for (let i = 6; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i); out.push({ k: UI.ymd(d), l: i === 0 ? 'Hari ini' : H[d.getDay()], v: 0 }); }
    } else if (mode === 'tahun') {
      const y = +end || now.getFullYear();
      for (let m = 0; m < 12; m++) out.push({ k: y + '-' + m, l: UI.BULAN[m], v: 0 });
    } else {
      const e = end ? new Date(+end.slice(0, 4), +end.slice(5, 7) - 1, 1) : now;
      for (let i = 5; i >= 0; i--) { const d = new Date(e.getFullYear(), e.getMonth() - i, 1); out.push({ k: d.getFullYear() + '-' + d.getMonth(), l: UI.BULAN[d.getMonth()], v: 0 }); }
    }
    const key = iso => { const d = new Date(iso); if (isNaN(d)) return ''; return mode === 'hari' ? UI.ymd(d) : d.getFullYear() + '-' + d.getMonth(); };
    const idx = Object.fromEntries(out.map((x, i) => [x.k, i]));
    Store.all('Pesanan').forEach(o => {
      if (o.status !== 'dapat' || Calc.isSelf(o)) return;
      const i = idx[key(Calc.soldDate(o))]; if (i !== undefined) out[i].v += Calc.profit(o);
    });
    Store.all('Kiriman').forEach(k => {
      const i = idx[key(k.tanggal || k.dibuat)]; if (i === undefined) return;
      out[i].v += Calc.isMasuk(k) ? -(+k.ongkirBiaya || 0) : (+k.ongkirTagih || 0) - (+k.ongkirBiaya || 0);
    });
    return out;
  },

  topItems(p, n = 5) {
    const m = {};
    Store.all('Pesanan').forEach(o => {
      if (o.status !== 'dapat' || Calc.isSelf(o) || !Calc.inPeriod(Calc.soldDate(o), p)) return;
      const x = m[o.barangId] || (m[o.barangId] = { id: o.barangId, untung: 0, pcs: 0 });
      x.untung += Calc.profit(o); x.pcs += +o.qty || 0;
    });
    Object.values(m).forEach(x => { x.untung -= Calc.ongkirBarang(x.id, p); });
    return Object.values(m).filter(x => Store.get('Barang', x.id)).sort((a, b) => b.untung - a.untung).slice(0, n);
  },
  topCustomers(p, n = 5) {
    const m = {};
    Store.all('Pesanan').forEach(o => {
      if (o.status !== 'dapat' || Calc.isSelf(o) || !Calc.inPeriod(Calc.soldDate(o), p)) return;
      const x = m[o.pelangganId] || (m[o.pelangganId] = { id: o.pelangganId, belanja: 0, n: 0 });
      x.belanja += Calc.total(o); x.n++;
    });
    return Object.values(m).filter(x => Store.get('Pelanggan', x.id)).sort((a, b) => b.belanja - a.belanja).slice(0, n);
  },
  supplierRate(sid) {
    let dapat = 0, tidak = 0;
    Store.all('Pesanan').forEach(o => {
      const it = Calc.item(o); if (!it || it.supplierId !== sid) return;
      if (o.status === 'dapat') dapat += +o.qty || 0;
      else if (o.status === 'tidak') tidak += +o.qty || 0;
    });
    const tot = dapat + tidak;
    return { dapat, tidak, tot, rate: tot ? Math.round(dapat / tot * 100) : null };
  },
  custStats(cid) {
    let belanja = 0, untung = 0, n = 0;
    Calc.ordersOfCust(cid).forEach(o => { if (o.status === 'dapat') { belanja += Calc.total(o); untung += Calc.profit(o); n++; } });
    return { belanja, untung, n };
  }
};

/* =========================================================
   Teks siap kirim
   ========================================================= */
const Text = {
  greet() {
    const h = new Date().getHours();
    if (h < 4) return { g: 'Masih melek nih', e: '🌙' };
    if (h < 11) return { g: 'Selamat pagi', e: '☀️' };
    if (h < 15) return { g: 'Selamat siang', e: '🌤️' };
    if (h < 18) return { g: 'Selamat sore', e: '🌇' };
    return { g: 'Selamat malam', e: '🌙' };
  },
  /* Ganti {kata_kunci}. Baris yang isinya cuma kata kunci kosong ikut dibuang. */
  fill(tpl, vars) {
    const re = /\{([a-z_]+)\}/g;
    const lines = String(tpl || '').split('\n').map(line => {
      let used = false, filled = false;
      const out = line.replace(re, (m, k) => {
        if (!(k in vars)) return m;
        used = true;
        const v = vars[k] == null ? '' : String(vars[k]);
        if (v.trim()) filled = true;
        return v;
      });
      if (used && !filled && !line.replace(re, '').trim()) return null;
      return out;
    }).filter(l => l !== null);
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  },
  tpl(key) { return Store.settings[key] || TEMPLATES[key].def; },
  panggilan(c) {
    if (!c || c.isSelf || c.panggilan === '-') return '';
    return c.panggilan || Store.settings.panggilanDefault || '';
  },
  sapaan(c) {
    if (!c) return '';
    const n = String(c.nama || '').trim(), p = Text.panggilan(c);
    if (!p || /^(kak|ka|mas|mbak|mba|bu|ibu|pak|bapak|bang|teh|om|tante|cik|ci|ko|koh|mama|mami|papa)\b/i.test(n)) return n;
    return p + ' ' + n;
  },
  rekening() { return Store.settings.infoBayar ? 'Pembayaran ke:\n' + Store.settings.infoBayar : ''; },
  custVars(c) { return { sapaan: Text.sapaan(c), nama: c ? c.nama : '', panggilan: Text.panggilan(c), toko: tokoName() }; },

  promoVars(it) {
    const vs = Calc.variantsOf(it.id);
    return {
      barang: it.nama, keterangan: it.deskripsi || '', toko: tokoName(),
      harga: vs.length === 1 ? `💰 ${UI.rp(vs[0].hargaJual)}` : ['💰 Harga:'].concat(vs.map(v => `• ${v.nama}: ${UI.rp(v.hargaJual)}`)).join('\n'),
      diskon: it.diskonMin > 0 && it.diskonRp > 0 ? `🎁 Beli ${it.diskonMin} pcs atau lebih, hemat ${UI.rp(it.diskonRp)}/pcs` : ''
    };
  },
  promo(it, tpl) { return Text.fill(tpl || Text.tpl('tplPromo'), Text.promoVars(it)); },
  sisaVars(it) {
    const rows = Calc.sisaItem(it.id), multi = Calc.variantsOf(it.id).length > 1;
    return {
      barang: it.nama, keterangan: it.deskripsi || '', toko: tokoName(),
      sisa: rows.map(r => multi ? `• ${r.v.nama}: ${r.sisa} pcs · ${UI.rp(r.v.hargaJual)}` : `💰 ${UI.rp(r.v.hargaJual)} · sisa ${r.sisa} pcs`).join('\n')
    };
  },
  sisa(it, tpl) { return Text.fill(tpl || Text.tpl('tplSisa'), Text.sisaVars(it)); },
  billVars(cid) {
    const c = Store.get('Pelanggan', cid), b = Calc.billOf(cid);
    if (!c || !b) return null;
    const L = []; let n = 1;
    b.orders.forEach(o => {
      const it = Calc.item(o), vn = Calc.varName(o);
      L.push(`${n++}. ${it ? it.nama : 'Barang'}${vn ? ` (${vn})` : ''} x${o.qty} = ${UI.rp(Calc.total(o))}`);
      const hemat = (+o.diskon || 0) + Calc.autoDisc(o);
      if (hemat) L.push(`    _sudah hemat ${UI.rp(hemat)}_`);
    });
    b.kiriman.forEach(k => L.push(`${n++}. Ongkir${k.kurir ? ' ' + k.kurir : ''} = ${UI.rp(k.ongkirTagih)}`));
    return { ...Text.custVars(c), rincian: L.join('\n'), total: UI.rp(b.total), rekening: Text.rekening() };
  },
  bill(cid, tpl) { const v = Text.billVars(cid); return v ? Text.fill(tpl || Text.tpl('tplTagih'), v) : ''; },
  sapa(c, tpl) { return Text.fill(tpl || Text.tpl('tplSapa'), Text.custVars(c)); },
  shipVars(k) {
    const c = Store.get('Pelanggan', k.pelangganId);
    const os = Store.all('Pesanan').filter(o => o.kirimanId === k.id);
    const pickup = k.kurir === 'Ambil sendiri';
    return {
      ...Text.custVars(c),
      status_paket: pickup ? 'udah siap diambil' : 'udah dikirim',
      kurir_resi: [!pickup && k.kurir ? `Kurir: ${k.kurir}` : '', k.resi ? `Resi: ${k.resi}` : ''].filter(Boolean).join('\n'),
      isi_paket: os.map(o => { const it = Calc.item(o), vn = Calc.varName(o); return `• ${it ? it.nama : 'Barang'}${vn ? ` (${vn})` : ''} x${o.qty}`; }).join('\n')
    };
  },
  ship(k, tpl) { return Text.fill(tpl || Text.tpl('tplKirim'), Text.shipVars(k)); },

  /* Contoh isian untuk pratinjau template */
  sampleVars() {
    return {
      barang: 'Tumbler Stainless 1L', keterangan: 'Tiba tgl 4 November', toko: tokoName(),
      harga: '💰 Harga:\n• Sage: Rp 90.000\n• Cream: Rp 90.000', diskon: '🎁 Beli 3 pcs atau lebih, hemat Rp 5.000/pcs',
      sisa: '• Sage: 2 pcs · Rp 90.000',
      sapaan: 'Kak Rina', nama: 'Rina', panggilan: 'Kak',
      rincian: '1. Tumbler Stainless 1L (Sage) x2 = Rp 180.000\n2. Ongkir JNE = Rp 12.000', total: 'Rp 192.000', rekening: Text.rekening() || 'Pembayaran ke:\nBCA 1234567890 a.n. Nama Kamu',
      status_paket: 'udah dikirim', kurir_resi: 'Kurir: JNE\nResi: JNE0012345678', isi_paket: '• Tumbler Stainless 1L (Sage) x2'
    };
  },

  list(it) {
    const vs = Calc.variantsOf(it.id);
    const os = Calc.ordersOf(it.id).filter(o => o.status !== 'batal' && !Calc.isSelf(o));
    const row = (o, i) => {
      const c = Calc.cust(o);
      const mark = o.status === 'dapat' ? ' ✅' : o.status === 'tidak' ? ' ❌' : '';
      return `${i + 1}. ${c ? c.nama : '-'}${o.qty > 1 ? ` (${o.qty})` : ''}${mark}`;
    };
    const L = [`📝 *LIST ${String(it.nama).toUpperCase()}*`, ''];
    if (vs.length > 1) {
      vs.forEach(v => {
        const vo = os.filter(o => o.varianId === v.id); if (!vo.length) return;
        L.push(`*${v.nama}*`); vo.forEach((o, i) => L.push(row(o, i))); L.push('');
      });
    } else { os.forEach((o, i) => L.push(row(o, i))); L.push(''); }
    if (os.some(o => o.status !== 'list')) L.push('✅ dapat   ❌ belum rezeki', '');
    L.push('Yang belum masuk list, reply aja ya kak 💜');
    return L.join('\n');
  }

};
