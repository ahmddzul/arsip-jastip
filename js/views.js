'use strict';
/* =========================================================
   views.js: halaman-halaman utama aplikasi
   ========================================================= */

const I = (n, c) => UI.icon(n, c);
const E = s => UI.esc(s);
const V = {};

/* ---------- Komponen kecil ---------- */
V.syncBtn = () => `<button class="sync-dot" type="button" data-state="${Sync.state}" onclick="Sheets.sync()" aria-label="Status sinkron"><i></i></button>`;

V.demoBar = () => Api.isDemo()
  ? `<div class="demo-bar" role="note">${I('info2')}<span>Mode coba: semua nama dan angka di sini hanya contoh.</span><button class="btn primary sm" type="button" onclick="Sheets.connect()">Sambungkan</button></div>` : '';

V.head = (title, o = {}) => `
  <header class="vhead">
    ${o.back ? `<button class="icon-btn" type="button" onclick="App.back('${o.back}')" aria-label="Kembali">${I('back')}</button>` : ''}
    <div class="vhead-t">${o.sub ? `<p>${o.sub}</p>` : ''}<h1>${title}</h1></div>
    <div class="vhead-a">${o.right || ''}${V.syncBtn()}</div>
  </header>${V.demoBar()}`;

V.empty = (ic, title, text, cta = '', tone = '') =>
  `<div class="empty"><div class="empty-art ${tone}">${I(ic)}</div><h3>${title}</h3><p>${text}</p>${cta}</div>`;

V.search = (key, ph) => `<label class="search"><span class="sr-only">${ph}</span>${I('search')}<input id="q-${key}" type="search" enterkeyhint="search" placeholder="${ph}" value="${E(App.ui[key].q || '')}" oninput="App.setQ('${key}',this.value)" autocomplete="off"></label>`;

V.chips = (key, field, opts) => `<div class="chips scroll-x">${opts.map(([v, l, n]) =>
  `<button type="button" class="chip ${App.ui[key][field] === v ? 'on' : ''}" aria-pressed="${App.ui[key][field] === v}" onclick="App.setF('${key}','${field}','${v}')">${l}${n != null ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}</div>`;

V.thumb = (it, cls = 'thumb') => it && it.fotoUrl
  ? `<img class="${cls}" src="${E(it.fotoUrl)}" alt="" width="60" height="60" loading="lazy" onerror="this.classList.add('broken')">`
  : `<div class="${cls} ph" aria-hidden="true">${UI.icon(UI.katIcon(it && it.kategori))}</div>`;

V.fab = (label, fn) => `<button class="fab" type="button" onclick="${fn}">${I('plus')}<span>${label}</span></button>`;

V.stPill = o => ({
  list: '<span class="pill">Nunggu</span>',
  dapat: '<span class="pill ok">Dapat</span>',
  tidak: '<span class="pill bad">Nggak dapat</span>',
  batal: '<span class="pill">Batal</span>'
})[o.status] || '';

V.payPill = o => {
  if (Calc.isSelf(o)) return '<span class="pill self">Buat aku</span>';
  if ((o.status === 'tidak' || o.status === 'batal') && o.bayar === 'lunas') {
    if (o.solusi === 'refund') return '<span class="pill">Di-refund</span>';
    if (o.solusi === 'ganti') return '<span class="pill">Diganti</span>';
    return '<span class="pill bad">Perlu refund</span>';
  }
  if (o.kirimanId) {
    const k = Store.get('Kiriman', o.kirimanId);
    return `<span class="pill info">${k && k.status === 'diterima' ? 'Diterima' : k && k.status === 'dikemas' ? 'Dikemas' : 'Dikirim'}</span>`;
  }
  if (o.bayar === 'lunas') return '<span class="pill ok-soft">Lunas</span>';
  if (o.status === 'dapat') return '<span class="pill warn">Belum bayar</span>';
  return '';
};

V.orderRow = (o, opt = {}) => {
  const c = Calc.cust(o), it = Calc.item(o), vn = Calc.varName(o);
  const line = [opt.item && it ? E(it.nama) : null, vn ? E(vn) : null, `${o.qty} pcs`, UI.rp(Calc.total(o))].filter(Boolean).join(' · ');
  const left = opt.num != null ? `<span class="onum">${opt.num}</span>` : UI.ava(c ? c.nama : '?', 'sm');
  return `<div class="orow" style="--i:${Math.min(opt.i || 0, 8)}" role="button" tabindex="0" onclick="Sheets.order('${o.id}')">
    ${left}
    <div class="orow-m"><b>${E(c ? c.nama : '(pelanggan terhapus)')}${Calc.isSelf(o) ? ' ' + I('heart', 'ic-inline') : ''}</b><small>${line}</small></div>
    ${opt.reorder
      ? `<div class="reorder" onclick="event.stopPropagation()"><button class="icon-btn sm" type="button" onclick="App.move('${o.id}',-1)" aria-label="Naikkan urutan">${I('up')}</button><button class="icon-btn sm" type="button" onclick="App.move('${o.id}',1)" aria-label="Turunkan urutan">${I('down')}</button></div>`
      : `<div class="orow-t">${V.stPill(o)}${V.payPill(o)}</div>`}
  </div>`;
};

V.todo = (tone, ic, title, sub, href) =>
  `<a class="todo" href="${href}"><span class="todo-ic tone-${tone || 'info'}">${I(ic)}</span><div><b>${E(title)}</b><small>${E(sub)}</small></div>${I('chev', 'chev')}</a>`;

/* =========================================================
   BERANDA (dashboard)
   ========================================================= */
V.beranda = () => {
  const p = App.ui.periode;
  const s = Calc.summary(p);
  const bills = Calc.bills(), unpaid = bills.reduce((a, b) => a + b.total, 0);
  const os = Store.all('Pesanan');
  const ready = os.filter(Calc.isReady), readyC = new Set(ready.map(o => o.pelangganId)).size;
  const refund = os.filter(Calc.isRefund);
  const open = Store.all('Barang').filter(b => b.status !== 'tutup');
  const waiting = os.filter(Calc.isWaiting);
  const packing = Calc.keluar().filter(k => k.status === 'dikemas');
  const g = Text.greet();
  const nama = E(Store.settings.namaPanggilan || '');
  const err = Sync.state === 'error' || (Sync.state === 'offline' && Sync.lastError);

  const mood = refund.length ? `Ada ${refund.length} pesanan yang udah dibayar tapi nggak dapat. Beresin dulu, yuk.`
    : bills.length ? `${bills.length} pelanggan belum bayar. Tagih pelan-pelan ya.`
    : readyC ? `${readyC} paket siap dikirim. Gas!`
    : waiting.length ? `${waiting.length} list lagi nunggu kabar supplier. Semoga dapat semua.`
    : open.length ? 'PO lagi jalan, tinggal tunggu yang list.'
    : 'Semua beres! Waktunya cari barang lucu lagi.';

  const todo = [];
  if (refund.length) todo.push(V.todo('bad', 'wallet', `${refund.length} pesanan perlu refund atau ganti`, 'Udah dibayar tapi barangnya nggak dapat', '#/pesanan?f=refund'));
  if (bills.length) todo.push(V.todo('warn', 'chat', `Tagih ${bills.length} pelanggan`, `Total ${UI.rp(unpaid)}`, '#/pesanan?f=bayar'));
  if (readyC) todo.push(V.todo('info', 'truck', `${readyC} paket siap dikirim`, `${ready.length} pesanan udah lunas`, '#/pesanan?f=kirim'));
  if (packing.length) todo.push(V.todo('info', 'box', `${packing.length} paket masih dikemas`, 'Update resinya kalau udah dikirim', '#/kiriman'));
  const sisaAll = Calc.sisaAll();
  if (sisaAll.length) {
    const pcs = sisaAll.reduce((a, x) => a + x.pcs, 0), modal = sisaAll.reduce((a, x) => a + x.modal, 0);
    todo.push(V.todo('self', 'box', `Ada ${pcs} pcs barang sisa`, `${sisaAll.length} barang · modal ${UI.rp(modal)} · tawarkan lagi yuk`, '#/barang?st=sisa'));
  }
  open.map(b => ({ b, n: os.filter(o => o.barangId === b.id && o.status === 'list').length }))
    .filter(x => x.n).slice(0, 4)
    .forEach(({ b, n }) => todo.push(V.todo('self', 'pie', b.nama, `${n} list nunggu dibagi jatah`, '#/barang/' + b.id)));

  const periods = [['minggu', '7 hari'], ['30', '30 hari'], ['bulan', 'Bulan ini'], ['semua', 'Semua']];
  const plabel = { minggu: '7 hari terakhir', '30': '30 hari terakhir', bulan: 'bulan ini', semua: 'sejak awal' }[p];

  const top = Calc.topItems(p);
  const topC = Calc.topCustomers(p);
  const sups = Store.all('Supplier').map(su => ({ su, r: Calc.supplierRate(su.id) })).filter(x => x.r.tot).sort((a, b) => b.r.tot - a.r.tot).slice(0, 5);

  return `
  <section class="hero">
    <div class="hero-top">
      <div><span class="hero-brand">${LOGO()}Arsip Jastip</span><p class="hero-hi">${g.g} ${g.e}</p><h1>${nama ? 'Kak ' + nama : 'Halo!'}</h1></div>
      ${V.syncBtn()}
    </div>
    <p class="hero-mood">${mood}</p>
    <div class="hero-card">
      <div class="seg glass seg-sm" role="group" aria-label="Periode">${periods.map(([v, l]) => `<button type="button" class="${p === v ? 'on' : ''}" aria-pressed="${p === v}" onclick="App.setPeriode('${v}')">${l}</button>`).join('')}</div>
      <p class="label">Untung bersih ${plabel}</p>
      <p class="big" data-count="${Math.round(s.untung)}">${UI.rp(s.untung)}</p>
      <div class="hero-sub">
        <span>Omzet <b>${UI.rp(s.omzet)}</b></span>
        <span><b>${s.pcs}</b> pcs terjual</span>
        ${s.ongkir ? `<span>Selisih ongkir <b>${UI.rp(s.ongkir)}</b></span>` : ''}
        ${s.ongkirSup ? `<span>Ongkir supplier <b>−${UI.rp(s.ongkirSup)}</b></span>` : ''}
      </div>
    </div>
  </section>
  ${V.demoBar()}
  ${err ? `<section class="callout bad" style="margin-top:14px" role="alert"><b>Data belum bisa diperbarui</b>${E(Sync.lastError || 'Koneksi ke Google Sheet gagal.')}${Store.meta.lastPull ? ` Angka di bawah dari ${UI.rel(new Date(Store.meta.lastPull).toISOString()).toLowerCase()} pukul ${new Date(Store.meta.lastPull).toTimeString().slice(0, 5)}.` : ''}<div class="btn-row"><button class="btn primary sm" type="button" onclick="App.pull(false,true)">${I('refresh')} Coba lagi</button><a class="btn ghost sm" href="#/pengaturan">Cek koneksi</a></div></section>` : ''}

  <section class="stat-grid stagger">
    <a class="stat" style="--i:0" href="#/pesanan?f=bayar"><span class="stat-ic tone-warn">${I('wallet')}</span><b>${UI.rp(unpaid)}</b><small>Belum dibayar · ${bills.length} orang</small></a>
    <a class="stat" style="--i:1" href="#/pesanan?f=kirim"><span class="stat-ic tone-info">${I('truck')}</span><b>${readyC} paket</b><small>Siap dikirim</small></a>
    <a class="stat" style="--i:2" href="#/barang"><span class="stat-ic tone-self">${I('box')}</span><b>${open.length} PO</b><small>Lagi open · ${waiting.length} list nunggu</small></a>
    <a class="stat" style="--i:3" href="#/pesanan?f=aku"><span class="stat-ic tone-ok">${I('heart')}</span><b>${UI.rp(s.self)}</b><small>Belanja buat aku sendiri</small></a>
  </section>

  ${todo.length ? `<section class="card"><div class="sec-h"><h2 class="sec-t">Yang perlu diurus</h2><small>${todo.length} hal</small></div>${todo.join('')}</section>` : ''}
  ${V.kopiNudge()}

  <section class="card chart">
    <div class="sec-h"><h2 class="sec-t">Grafik untung</h2>
      <div class="seg seg-sm" style="width:170px" role="group" aria-label="Rentang grafik">${[['hari', '7 hari'], ['bulan', '6 bulan']].map(([v, l]) => `<button type="button" class="${App.ui.chart === v ? 'on' : ''}" aria-pressed="${App.ui.chart === v}" onclick="App.setChart('${v}')">${l}</button>`).join('')}</div>
    </div>
    ${V.chart(Calc.series(App.ui.chart))}
  </section>

  <section class="card">
    <div class="sec-h"><h2 class="sec-t">Barang paling cuan</h2><small>${plabel}</small></div>
    ${top.length ? top.map((x, i) => { const it = Store.get('Barang', x.id); return `<a class="rank" href="#/barang/${x.id}"><span class="rank-n">${i + 1}</span>${V.thumb(it, 'thumb sm')}<div class="rank-m"><b>${E(it.nama)}</b><small>${x.pcs} pcs</small></div><span class="rank-v">${UI.rp(x.untung)}</span></a>`; }).join('')
      : '<p class="muted">Belum ada barang yang terjual di periode ini.</p>'}
  </section>

  <section class="card">
    <div class="sec-h"><h2 class="sec-t">Pelanggan setia</h2><small>${plabel}</small></div>
    ${topC.length ? topC.map((x, i) => { const c = Store.get('Pelanggan', x.id); return `<a class="rank" href="#/pelanggan/${x.id}"><span class="rank-n">${i + 1}</span>${UI.ava(c.nama, 'sm')}<div class="rank-m"><b>${E(c.nama)}</b><small>${x.n} pesanan</small></div><span class="rank-v">${UI.rp(x.belanja)}</span></a>`; }).join('')
      : '<p class="muted">Belum ada data pelanggan di periode ini.</p>'}
  </section>

  <section class="card">
    <div class="sec-h"><h2 class="sec-t">Peluang dapat per supplier</h2><a class="link-btn" href="#/supplier">Lihat semua</a></div>
    ${sups.length ? sups.map(({ su, r }) => `<div class="rank"><div class="rank-m"><b>${E(su.nama)}</b><small>Dapat ${r.dapat} dari ${r.tot} pcs</small><div class="bar"><i style="width:${r.rate}%"></i></div></div><span class="rank-v">${r.rate}%</span></div>`).join('')
      : '<p class="muted">Muncul setelah kamu membagi jatah barang dari supplier.</p>'}
  </section>`;
};

V.chart = ser => {
  const W = 320, H = 160, padX = 8, base = H - 24;
  const max = Math.max(1, ...ser.map(x => x.v));
  const bw = (W - padX * 2) / ser.length;
  const total = ser.reduce((a, x) => a + x.v, 0);
  const bars = ser.map((x, i) => {
    const h = x.v > 0 ? Math.max(6, (x.v / max) * (base - 26)) : 3;
    const X = padX + i * bw + bw * 0.18, w = bw * 0.64, Y = base - h;
    return `<rect class="${x.v > 0 ? 'bar-on' : 'bar-off'}" style="animation-delay:${i * 50}ms" x="${X}" y="${Y}" width="${w}" height="${h}" rx="6"/>`
      + (x.v > 0 ? `<text class="cv" x="${X + w / 2}" y="${Y - 6}">${UI.rpShort(x.v)}</text>` : '')
      + `<text class="cl" x="${X + w / 2}" y="${H - 6}">${x.l}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik untung per ${App.ui.chart === 'hari' ? 'hari, 7 hari terakhir' : 'bulan, 6 bulan terakhir'}">${bars}</svg>
    <div class="chart-foot"><span>Total periode</span><b>${UI.rp(total)}</b></div>`;
};

/* =========================================================
   BARANG
   ========================================================= */
V.barang = () => {
  const items = Store.all('Barang');
  const nOpen = items.filter(b => b.status !== 'tutup').length;
  const f = App.ui.barang;
  return V.head('Barang', { sub: `${nOpen} PO lagi open` })
    + V.search('barang', 'Cari barang')
    + V.chips('barang', 'st', [['open', 'Lagi open', nOpen], ['sisa', 'Ada sisa', Calc.sisaAll().length], ['tutup', 'Selesai', items.length - nOpen], ['semua', 'Semua', items.length]].filter(([v, , n]) => v !== 'sisa' || n || f.st === 'sisa'))
    + `<div id="lst" class="list stagger">${V.barangList()}</div>`
    + V.fab('Barang baru', 'Sheets.barang()');
};

V.barangList = () => {
  const f = App.ui.barang, q = (f.q || '').trim().toLowerCase();
  let items = Store.all('Barang').slice().sort((a, b) => String(b.tanggal || b.dibuat).localeCompare(String(a.tanggal || a.dibuat)));
  if (f.st === 'open') items = items.filter(b => b.status !== 'tutup');
  if (f.st === 'tutup') items = items.filter(b => b.status === 'tutup');
  if (f.st === 'sisa') items = items.filter(b => Calc.sisaItem(b.id).length);
  if (q) items = items.filter(b => {
    const su = Store.get('Supplier', b.supplierId);
    return [b.nama, b.kategori, su && su.nama].join(' ').toLowerCase().includes(q);
  });
  if (!items.length) {
    if (q) return V.empty('search', 'Nggak ketemu', `Belum ada barang dengan kata "${E(q)}". Coba kata lain atau pilih filter Semua.`);
    if (!Store.all('Barang').length) return V.empty('box', 'Belum ada barang', 'Dapat info barang baru dari supplier? Catat di sini, nanti teks promosinya langsung jadi.', `<button class="btn primary" type="button" onclick="Sheets.barang()">${I('plus')} Catat barang pertama</button>`);
    if (f.st === 'sisa') return V.empty('box', 'Nggak ada barang sisa', 'Semua barang dari supplier sudah ada pemiliknya.');
    return V.empty('check', f.st === 'open' ? 'Nggak ada PO yang open' : 'Belum ada PO yang selesai', f.st === 'open' ? 'Semua PO sudah ditutup. Ketuk Barang baru untuk buka PO berikutnya.' : 'PO yang kamu tutup akan pindah ke sini.');
  }
  return items.map((it, i) => {
    const vs = Calc.variantsOf(it.id);
    const os = Calc.ordersOf(it.id).filter(o => o.status !== 'batal');
    const prices = vs.map(v => +v.hargaJual || 0);
    const min = Math.min(...prices), max = Math.max(...prices);
    const price = !prices.length ? '' : min === max ? UI.rp(min) : `${UI.rp(min)} – ${UI.rp(max)}`;
    const su = Store.get('Supplier', it.supplierId);
    const tunggu = os.filter(o => o.status === 'list').length;
    const sisa = Calc.sisaItem(it.id).reduce((a, r) => a + r.sisa, 0);
    return `<a class="icard" style="--i:${Math.min(i, 8)}" href="#/barang/${it.id}">
      ${V.thumb(it)}
      <div class="icard-m"><b>${E(it.nama)}</b><small>${E(su ? su.nama : 'Tanpa supplier')} · ${UI.rel(it.tanggal || it.dibuat)}</small><span class="price">${price}</span></div>
      <div class="icard-r">${it.status === 'tutup' ? '<span class="pill">Selesai</span>' : tunggu ? `<span class="pill warn">${tunggu} nunggu</span>` : '<span class="pill info">Open</span>'}${sisa ? `<span class="pill self">Sisa ${sisa}</span>` : `<small>${os.length} list</small>`}</div>
    </a>`;
  }).join('');
};

V.barangDetail = id => {
  const it = Store.get('Barang', id);
  if (!it) return V.head('Barang', { back: '#/barang' }) + V.empty('search', 'Barangnya nggak ada', 'Mungkin sudah dihapus dari HP lain.', `<a class="btn ghost" href="#/barang">Kembali ke daftar barang</a>`);
  const st = App.ui.item;
  if (st.id !== id) { st.id = id; st.var = 'all'; st.reorder = false; }
  const vs = Calc.variantsOf(id);
  const all = Calc.ordersOf(id).filter(o => o.status !== 'batal');
  const batal = Calc.ordersOf(id).filter(o => o.status === 'batal');
  const list = all.filter(o => st.var === 'all' || o.varianId === st.var);
  const su = Store.get('Supplier', it.supplierId);
  const sisa = Calc.sisaItem(id), sisaPcs = sisa.reduce((a, r) => a + r.sisa, 0);
  const pcs = all.reduce((a, o) => a + (+o.qty || 0), 0);
  const dapat = all.filter(o => o.status === 'dapat');
  const dapatPcs = dapat.reduce((a, o) => a + (+o.qty || 0), 0);
  const est = (dapat.length ? dapat : all).filter(o => !Calc.isSelf(o)).reduce((a, o) => a + Calc.profit(o), 0) - Calc.ongkirBarang(id);
  const closed = it.status === 'tutup';
  const hasStok = vs.some(v => +v.stokDapat);

  return V.head('Detail barang', { back: '#/barang', right: `<button class="icon-btn" type="button" onclick="Sheets.barang('${id}')" aria-label="Ubah barang">${I('edit')}</button>` })
  + `<section class="card" style="margin-top:4px">
      <div class="ihero">${V.thumb(it)}
        <div class="ihero-m"><h2>${E(it.nama)}</h2><p>${E(su ? su.nama : 'Tanpa supplier')}${it.kategori ? ' · ' + E(it.kategori) : ''} · ${UI.rel(it.tanggal || it.dibuat)}</p>
        ${closed ? '<span class="pill">PO selesai</span>' : '<span class="pill info">PO lagi open</span>'}</div>
      </div>
      <div class="vchips">${vs.map(v => `<span class="vchip">${v.nama === 'Standar' ? 'Harga' : E(v.nama)} · <b>${UI.rp(v.hargaJual)}</b></span>`).join('')}
        ${it.diskonMin > 0 && it.diskonRp > 0 ? `<span class="vchip">Beli ${it.diskonMin}+ hemat ${UI.rpShort(it.diskonRp)}/pcs</span>` : ''}</div>
      ${it.deskripsi ? `<p class="desc">${E(it.deskripsi)}</p>` : ''}
    </section>
    <div class="actions">
      <button class="act" type="button" onclick="App.copyPromo('${id}')">${I('copy')}Promosi</button>
      <button class="act" type="button" onclick="App.copyList('${id}')">${I('list')}Salin list</button>
      <button class="act" type="button" onclick="Sheets.jatah('${id}')">${I('pie')}Bagi jatah</button>
      <button class="act" type="button" onclick="App.toggleClose('${id}')">${I(closed ? 'refresh' : 'check')}${closed ? 'Buka lagi' : 'Tutup PO'}</button>
    </div>
    ${sisaPcs ? `<section class="callout self" style="margin-top:14px"><b>Kamu punya sisa ${sisaPcs} pcs</b>${sisa.map(r => `${vs.length > 1 ? E(r.v.nama) + ': ' : ''}${r.sisa} pcs`).join(' · ')} · modal ${UI.rp(sisa.reduce((a, r) => a + r.sisa * (+r.v.hargaModal || 0), 0))}
      <div class="btn-row"><button class="btn ghost sm" type="button" onclick="Sheets.stok('${id}')">Ubah stok</button><button class="btn primary sm" type="button" onclick="App.copySisa('${id}')">${I('copy')} Tawarkan sisa</button></div></section>` : ''}
    <div class="kpis">
      <div class="kpi"><b>${pcs}</b><small>pcs di-list · ${new Set(all.map(o => o.pelangganId)).size} orang</small></div>
      <button class="kpi" type="button" onclick="Sheets.stok('${id}')" aria-label="Pcs dapat ${dapatPcs}${hasStok ? ' dari stok ' + vs.reduce((a, v) => a + (+v.stokDapat || 0), 0) : ''}. Ketuk untuk ubah stok"><b>${dapatPcs}${hasStok ? `<small> / ${vs.reduce((a, v) => a + (+v.stokDapat || 0), 0)}</small>` : ''}</b><small>pcs dapat${hasStok ? ' / stok' : ''}</small></button>
      <button class="kpi" type="button" onclick="Sheets.untung('${id}')"><b>${UI.rpShort(est)}</b><small>${dapat.length ? 'untung' : 'perkiraan untung'} · rincian</small></button>
    </div>
    <section class="card">
      <div class="sec-h"><h2 class="sec-t">Daftar list</h2>
        ${all.length > 1 ? `<button class="link-btn" type="button" aria-pressed="${st.reorder}" onclick="App.toggleReorder()">${st.reorder ? 'Selesai atur' : 'Atur urutan'}</button>` : ''}</div>
      ${vs.length > 1 ? `<div class="chips scroll-x" role="group" aria-label="Filter varian" style="margin:0 -16px 6px;padding:4px 16px">${[['all', 'Semua']].concat(vs.map(v => [v.id, E(v.nama)])).map(([v, l]) => {
        const n = v === 'all' ? all.length : all.filter(o => o.varianId === v).length;
        return `<button type="button" class="chip xs ${st.var === v ? 'on' : ''}" aria-pressed="${st.var === v}" onclick="App.setVar('${v}')">${l}<span class="cnt">${n}</span></button>`; }).join('')}</div>` : ''}
      ${st.reorder ? '<p class="hint">Urutan paling atas dapat jatah duluan saat kamu bagi jatah.</p>' : ''}
      <div class="orows stagger">${list.length ? list.map((o, i) => V.orderRow(o, { num: i + 1, reorder: st.reorder, i })).join('')
        : V.empty('list', 'Belum ada yang list', 'Tulis nama-nama yang reply di status atau grup WA di sini.', `<button class="btn primary" type="button" onclick="Sheets.addList('${id}')">${I('plus')} Tambah list</button>`)}</div>
    </section>
    ${batal.length ? `<h3 class="sec-label">Dibatalkan (${batal.length})</h3><section class="card" style="margin-top:0"><div class="orows">${batal.map(o => V.orderRow(o)).join('')}</div></section>` : ''}`
  + (list.length ? V.fab('Tambah list', `Sheets.addList('${id}')`) : '');
};

/* =========================================================
   PESANAN
   ========================================================= */
V.PESANAN_F = [
  ['semua', 'Semua'], ['tunggu', 'Nunggu kabar'], ['bayar', 'Belum bayar'], ['kirim', 'Siap kirim'],
  ['jalan', 'Dikirim'], ['refund', 'Perlu refund'], ['aku', 'Buat aku'], ['batal', 'Batal']
];
V.pesananFilter = f => ({
  semua: o => o.status !== 'batal',
  tunggu: Calc.isWaiting,
  bayar: Calc.isUnpaid,
  kirim: Calc.isReady,
  jalan: Calc.isShipped,
  refund: Calc.isRefund,
  aku: o => Calc.isSelf(o) && o.status !== 'tidak' && o.status !== 'batal',
  batal: o => o.status === 'batal'
})[f] || (() => true);

V.pesanan = () => {
  const os = Store.all('Pesanan');
  const opts = V.PESANAN_F.map(([v, l]) => [v, l, os.filter(V.pesananFilter(v)).length])
    .filter(([v, , n]) => n || v === 'semua' || v === App.ui.pesanan.f);
  return V.head('Pesanan', { sub: `${os.filter(Calc.isWaiting).length} nunggu · ${os.filter(Calc.isUnpaid).length} belum bayar` })
    + V.search('pesanan', 'Cari nama pelanggan atau barang')
    + V.chips('pesanan', 'f', opts)
    + `<div id="lst" class="list stagger">${V.pesananList()}</div>`;
};

V.pesananList = () => {
  const f = App.ui.pesanan.f, q = (App.ui.pesanan.q || '').trim().toLowerCase();
  const match = o => { if (!q) return true; const c = Calc.cust(o), it = Calc.item(o); return [c && c.nama, it && it.nama, Calc.varName(o)].join(' ').toLowerCase().includes(q); };
  const os = Store.all('Pesanan').filter(V.pesananFilter(f)).filter(match);

  if (f === 'bayar') {
    const bills = Calc.bills().filter(b => { const c = Store.get('Pelanggan', b.pelangganId); return !q || (c && c.nama.toLowerCase().includes(q)) || b.orders.some(match); });
    if (!bills.length) return V.empty('check', 'Semua sudah bayar', 'Nggak ada tagihan yang nyangkut.');
    return bills.map((b, i) => V.billCard(b, i)).join('');
  }
  if (f === 'kirim') {
    const groups = {}; os.forEach(o => (groups[o.pelangganId] = groups[o.pelangganId] || []).push(o));
    const ids = Object.keys(groups);
    if (!ids.length) return V.empty('truck', 'Belum ada yang siap kirim', 'Pesanan yang sudah dapat dan lunas akan muncul di sini.');
    return ids.map((cid, i) => {
      const c = Store.get('Pelanggan', cid), g = groups[cid];
      return `<section class="card" style="margin-top:0;--i:${Math.min(i, 8)}">
        <div class="group-h">${UI.ava(c ? c.nama : '?')}<div><b>${E(c ? c.nama : '-')}</b><small>${g.length} pesanan · ${g.reduce((a, o) => a + (+o.qty || 0), 0)} pcs${c && c.alamat ? '' : ' · alamat belum ada'}</small></div></div>
        ${g.map(o => V.orderRow(o, { item: true })).join('')}
        <button class="btn primary block" type="button" style="margin-top:10px" onclick="Sheets.kiriman({pelangganId:'${cid}'})">${I('truck')} Buat kiriman</button>
      </section>`;
    }).join('');
  }
  if (!os.length) {
    if (q) return V.empty('search', 'Nggak ketemu', `Nggak ada pesanan untuk "${E(q)}".`);
    const msg = {
      semua: ['list', 'Belum ada pesanan', 'Buka salah satu barang lalu ketuk Tambah list untuk mencatat siapa saja yang mau.', `<a class="btn primary" href="#/barang">${I('box')} Buka daftar barang</a>`],
      tunggu: ['clock', 'Nggak ada yang nunggu', 'Semua list sudah kamu bagi jatahnya.'],
      jalan: ['truck', 'Belum ada kiriman', 'Pesanan yang sudah dikirim muncul di sini.'],
      refund: ['check', 'Aman, nggak ada refund', 'Nggak ada pesanan lunas yang gagal dapat.'],
      aku: ['heart', 'Belum ada buat kamu', 'Pilih Buat aku saat menambah list kalau kamu juga mau barangnya.'],
      batal: ['x', 'Nggak ada yang batal', 'Pesanan yang dibatalkan akan muncul di sini.']
    }[f] || ['list', 'Kosong', ''];
    return V.empty(...msg);
  }
  const sorted = os.slice().sort((a, b) => String(b.diubah || b.dibuat).localeCompare(String(a.diubah || a.dibuat)));
  return `<section class="card" style="margin-top:0"><div class="orows">${sorted.slice(0, 200).map((o, i) => V.orderRow(o, { item: true, i })).join('')}</div></section>`;
};

V.billCard = (b, i = 0) => {
  const c = Store.get('Pelanggan', b.pelangganId);
  return `<section class="card" style="margin-top:0;--i:${Math.min(i, 8)}">
    <div class="group-h">${UI.ava(c ? c.nama : '?')}<div><b>${E(c ? c.nama : '-')}</b><small>${b.orders.length} pesanan${b.kiriman.length ? ' + ongkir' : ''}</small></div><span class="amt">${UI.rp(b.total)}</span></div>
    ${b.orders.map(o => { const it = Calc.item(o), vn = Calc.varName(o); return `<button type="button" class="mini-row" onclick="Sheets.order('${o.id}')"><span>${E(it ? it.nama : 'Barang')}${vn ? ' · ' + E(vn) : ''} x${o.qty}</span><b>${UI.rp(Calc.total(o))}</b></button>`; }).join('')}
    ${b.kiriman.map(k => `<button type="button" class="mini-row" onclick="Sheets.kiriman({id:'${k.id}'})"><span>Ongkir ${E(k.kurir || '')}</span><b>${UI.rp(k.ongkirTagih)}</b></button>`).join('')}
    <div class="btn-row"><button class="btn ghost sm" type="button" onclick="Sheets.lunasSemua('${b.pelangganId}', this)">${I('check')} Tandai lunas</button><button class="btn wa sm" type="button" onclick="Sheets.tagih('${b.pelangganId}')">${I('chat')} Tagih via WA</button></div>
  </section>`;
};

/* =========================================================
   PELANGGAN
   ========================================================= */
V.pelanggan = () => {
  const n = Store.all('Pelanggan').filter(c => !c.isSelf).length;
  return V.head('Pelanggan', { sub: `${n} orang tercatat` })
    + V.search('pelanggan', 'Cari nama atau nomor WA')
    + `<div id="lst" class="list stagger">${V.pelangganList()}</div>`
    + V.fab('Pelanggan', 'Sheets.pelanggan()');
};

V.pelangganList = () => {
  const q = (App.ui.pelanggan.q || '').trim().toLowerCase();
  const bills = Object.fromEntries(Calc.bills().map(b => [b.pelangganId, b]));
  let cs = Store.all('Pelanggan').filter(c => !c.isSelf);
  if (q) cs = cs.filter(c => [c.nama, c.wa].join(' ').toLowerCase().includes(q));
  const stat = Object.fromEntries(cs.map(c => [c.id, Calc.custStats(c.id)]));
  cs.sort((a, b) => (bills[b.id] ? 1 : 0) - (bills[a.id] ? 1 : 0) || stat[b.id].belanja - stat[a.id].belanja || String(a.nama).localeCompare(String(b.nama)));
  if (!cs.length) {
    if (q) return V.empty('search', 'Nggak ketemu', `Belum ada pelanggan bernama "${E(q)}".`, `<button class="btn primary" type="button" onclick="Sheets.pelanggan(null, App.ui.pelanggan.q)">${I('plus')} Tambah "${E(App.ui.pelanggan.q)}"</button>`);
    return V.empty('users', 'Belum ada pelanggan', 'Pelanggan otomatis tercatat waktu kamu menambah list. Bisa juga ditambah manual.', `<button class="btn primary" type="button" onclick="Sheets.pelanggan()">${I('plus')} Tambah pelanggan</button>`);
  }
  const self = Store.get('Pelanggan', SELF_ID);
  const selfRow = !q && self ? `<a class="prow self" href="#/pelanggan/${SELF_ID}"><span class="ava">${I('heart')}</span><div class="prow-m"><b>Aku sendiri</b><small>Barang yang kamu list buat diri sendiri</small></div>${I('chev', 'chev')}</a>` : '';
  return selfRow + cs.map((c, i) => {
    const s = stat[c.id], b = bills[c.id];
    return `<a class="prow" style="--i:${Math.min(i + 1, 8)}" href="#/pelanggan/${c.id}">${UI.ava(c.nama)}
      <div class="prow-m"><b>${E(c.nama)}</b><small>${s.n ? `${s.n} pesanan · ${UI.rp(s.belanja)}` : 'Belum ada pesanan yang dapat'}</small></div>
      ${b ? `<span class="pill warn">${UI.rpShort(b.total)}</span>` : ''}
    </a>`;
  }).join('');
};

V.pelangganDetail = id => {
  const c = Store.get('Pelanggan', id);
  if (!c) return V.head('Pelanggan', { back: '#/pelanggan' }) + V.empty('search', 'Pelanggan nggak ada', 'Mungkin sudah dihapus dari HP lain.', `<a class="btn ghost" href="#/pelanggan">Kembali ke daftar pelanggan</a>`);
  const s = Calc.custStats(id), b = Calc.billOf(id);
  const os = Calc.ordersOfCust(id);
  const ready = os.filter(Calc.isReady);
  const ks = Calc.keluar().filter(k => k.pelangganId === id).sort((a, b2) => String(b2.tanggal).localeCompare(String(a.tanggal)));
  const self = !!c.isSelf;

  return V.head(self ? 'Buat aku sendiri' : 'Pelanggan', { back: '#/pelanggan', right: `<button class="icon-btn" type="button" onclick="Sheets.pelanggan('${id}')" aria-label="Ubah data pelanggan">${I('edit')}</button>` })
  + `<section class="card" style="margin-top:4px">
      <div class="profile">${self ? `<span class="ava lg">${I('heart')}</span>` : UI.ava(c.nama, 'lg')}<div><h2>${E(c.nama)}</h2><p>${self ? 'Barang yang kamu list buat diri sendiri' : `Disapa "${E(Text.sapaan(c))}" · pelanggan sejak ${UI.date(c.dibuat)}`}</p></div></div>
      ${!self ? `
      <div style="margin-top:12px">
        <div class="info-row">${I('phone')}<span>${c.wa ? E(c.wa) : '<em>Nomor WA belum diisi</em>'}</span>${c.wa ? `<button class="link-btn" type="button" onclick="App.chat('${id}')">Chat</button>` : `<button class="link-btn" type="button" onclick="Sheets.pelanggan('${id}')">Isi</button>`}</div>
        <div class="info-row">${I('pin')}<span>${c.alamat ? E(c.alamat) : '<em>Alamat belum diisi</em>'}</span>${c.alamat ? `<button class="link-btn" type="button" onclick="App.copyAddr('${id}')">Salin</button>` : ''}</div>
        ${c.catatan ? `<div class="info-row">${I('note')}<span>${E(c.catatan)}</span></div>` : ''}
      </div>` : ''}
    </section>
    <div class="kpis">
      <div class="kpi"><b>${UI.rpShort(s.belanja)}</b><small>${self ? 'nilai barang' : 'total belanja'}</small></div>
      <div class="kpi"><b>${s.n}</b><small>pesanan dapat</small></div>
      <div class="kpi"><b>${self ? UI.rpShort(os.filter(o => o.status === 'dapat').reduce((a, o) => a + Calc.modal(o), 0)) : UI.rpShort(s.untung)}</b><small>${self ? 'modal keluar' : 'untung darinya'}</small></div>
    </div>
    ${b ? `<h3 class="sec-label">Tagihan</h3>` + V.billCard(b) : ''}
    ${ready.length ? `<section class="callout info" style="margin-top:14px"><b>${ready.length} pesanan siap dikirim</b>Semua sudah dapat dan lunas.<div class="btn-row"><button class="btn primary sm" type="button" onclick="Sheets.kiriman({pelangganId:'${id}'})">${I('truck')} Buat kiriman</button></div></section>` : ''}
    <h3 class="sec-label">Riwayat pesanan</h3>
    <section class="card" style="margin-top:0">${os.length ? `<div class="orows">${os.map(o => V.orderRow(o, { item: true })).join('')}</div>` : '<p class="muted">Belum ada pesanan.</p>'}</section>
    ${ks.length ? `<h3 class="sec-label">Kiriman</h3><section class="card" style="margin-top:0">${ks.map(k => V.kirimanRow(k, false)).join('')}</section>` : ''}`;
};

/* =========================================================
   KIRIMAN
   ========================================================= */
V.KSTATUS = { dikemas: ['Dikemas', 'warn'], dikirim: ['Dikirim', 'info'], diterima: ['Diterima', 'ok'] };
V.kirimanRow = (k, showName = true, i = 0) => {
  const c = Store.get('Pelanggan', k.pelangganId);
  const [l, t] = V.KSTATUS[k.status] || ['Dikirim', 'info'];
  const n = Store.all('Pesanan').filter(o => o.kirimanId === k.id).length;
  return `<div class="orow" style="--i:${Math.min(i, 8)}" role="button" tabindex="0" onclick="Sheets.kiriman({id:'${k.id}'})">
    ${showName ? UI.ava(c ? c.nama : '?', 'sm') : `<span class="onum">${I('truck')}</span>`}
    <div class="orow-m"><b>${showName ? E(c ? c.nama : '-') : E(k.kurir || 'Kiriman')}</b><small>${[showName ? E(k.kurir) : null, k.resi ? E(k.resi) : null, `${n} barang`, UI.rel(k.tanggal || k.dibuat)].filter(Boolean).join(' · ')}</small></div>
    <div class="orow-t"><span class="pill ${t}">${l}</span>${k.ongkirTagih ? `<span class="pill ${k.ongkirLunas ? 'ok' : 'warn'}">Ongkir ${UI.rpShort(k.ongkirTagih)}</span>` : ''}</div>
  </div>`;
};

V.kiriman = () => {
  const ks = Calc.keluar();
  const f = App.ui.kiriman.f;
  let list = ks.slice().sort((a, b) => String(b.tanggal || b.dibuat).localeCompare(String(a.tanggal || a.dibuat)));
  if (f !== 'semua') list = list.filter(k => k.status === f);
  const ready = Store.all('Pesanan').filter(Calc.isReady).length;
  return V.head('Kiriman', { back: '#/lainnya', sub: `${ks.filter(k => k.status !== 'diterima').length} paket di jalan` })
    + V.chips('kiriman', 'f', [['semua', 'Semua', ks.length], ['dikemas', 'Dikemas', ks.filter(k => k.status === 'dikemas').length], ['dikirim', 'Dikirim', ks.filter(k => k.status === 'dikirim').length], ['diterima', 'Diterima', ks.filter(k => k.status === 'diterima').length]])
    + (ready ? `<a class="callout info" href="#/pesanan?f=kirim" style="margin-top:12px"><b>${ready} pesanan siap dikirim</b>Ketuk untuk buat kiriman per pelanggan.</a>` : '')
    + `<div class="list">${list.length ? `<section class="card stagger" style="margin-top:0">${list.map((k, i) => V.kirimanRow(k, true, i)).join('')}</section>`
      : V.empty('truck', f === 'semua' ? 'Belum ada kiriman' : 'Nggak ada di status ini', 'Kiriman dibuat dari pesanan yang sudah dapat. Resi dan ongkir tersimpan di sini, jadi gampang dicek kalau pelanggan nanya.')}</div>`;
};

/* =========================================================
   SUPPLIER
   ========================================================= */
V.supplier = () => {
  const ss = Store.all('Supplier').slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama)));
  return V.head('Supplier', { back: '#/lainnya', sub: `${ss.length} supplier` })
    + `<div class="list stagger">${ss.length ? ss.map((s, i) => {
      const r = Calc.supplierRate(s.id), n = Store.all('Barang').filter(b => b.supplierId === s.id).length;
      const ong = Calc.ongkirSupplier(s.id).reduce((a, k) => a + (+k.ongkirBiaya || 0), 0);
      return `<button class="prow" type="button" style="text-align:left;width:100%;--i:${Math.min(i, 8)}" onclick="Sheets.supplier('${s.id}')"><span class="ava">${I('store')}</span>
        <div class="prow-m"><b>${E(s.nama)}</b><small>${n} barang${r.rate != null ? ` · peluang dapat ${r.rate}%` : ''}${ong ? ` · ongkir ${UI.rpShort(ong)}` : ''}</small>${r.rate != null ? `<div class="bar"><i style="width:${r.rate}%"></i></div>` : ''}</div>${I('chev', 'chev')}</button>`;
    }).join('') : V.empty('store', 'Belum ada supplier', 'Catat supplier biar kelihatan mana yang paling sering dapat barang.', `<button class="btn primary" type="button" onclick="Sheets.supplier()">${I('plus')} Tambah supplier</button>`)}</div>`
    + (ss.length ? V.fab('Supplier', 'Sheets.supplier()') : '');
};

/* =========================================================
   LAINNYA
   ========================================================= */
V.credit = () => `<a class="credit" href="https://instagram.com/ahmddzul" target="_blank" rel="noopener">${IG}<span>Dibuat oleh <b>@ahmddzul</b></span><span class="sr-only">(buka Instagram)</span></a>`;

const SAWERIA = 'https://saweria.co/ahmddzul';
const KOPI_KEY = 'aj_kopi_done';
V.kopi = () => `<section class="card kopi">
    <span class="kopi-ic">${I('cup')}</span>
    <div><h2 class="sec-t">Beliin aku kopi?</h2>
    <p>Arsip Jastip dibuat sendiri oleh @ahmddzul. Kalau aplikasi ini bikin urusan jastipmu lebih rapi, kamu bisa traktir kopi lewat Saweria. Semua fitur tetap bisa dipakai tanpa dukungan.</p>
    <a class="btn ghost sm" href="${SAWERIA}" target="_blank" rel="noopener">${I('cup')} Traktir kopi di Saweria<span class="sr-only">(membuka Saweria)</span></a></div>
  </section>`;
/* Kartu sekali di Beranda: muncul setelah 10 tagihan lunas, hilang selamanya setelah diketuk atau ditutup */
V.kopiNudge = () => {
  if (Api.isDemo()) return '';
  try { if (localStorage.getItem(KOPI_KEY)) return ''; } catch (e) { return ''; }
  const lunas = Store.all('Pesanan').filter(o => o.bayar === 'lunas' && o.pelangganId !== SELF_ID && o.status !== 'batal').length;
  if (lunas < 10) return '';
  return `<section class="card kopi" id="kopiNudge">
    <span class="kopi-ic">${I('cup')}</span>
    <div><h2 class="sec-t">10 tagihan sudah lunas lewat Arsip Jastip</h2>
    <p>Kalau aplikasi ini membantu, boleh traktir kopi pembuatnya.</p>
    <div class="btn-row"><a class="btn primary sm" href="${SAWERIA}" target="_blank" rel="noopener" onclick="App.kopiDone(false)">${I('cup')} Traktir kopi<span class="sr-only">(membuka Saweria)</span></a><button class="btn ghost sm" type="button" onclick="App.kopiDone(true)">Nanti saja</button></div></div>
  </section>`;
};

V.lainnya = () => {
  const ks = Calc.keluar().filter(k => k.status !== 'diterima').length;
  return V.head('Lainnya')
    + `<div class="tiles stagger">
      <a class="tile" style="--i:0" href="#/kiriman"><span class="stat-ic tone-info">${I('truck')}</span><b>Kiriman</b><small>${ks ? ks + ' paket belum diterima' : 'Resi & ongkir per paket'}</small></a>
      <a class="tile" style="--i:1" href="#/supplier"><span class="stat-ic tone-info">${I('store')}</span><b>Supplier</b><small>Kontak & peluang dapat</small></a>
      <a class="tile" style="--i:2" href="#/faq"><span class="stat-ic tone-ok">${I('help')}</span><b>FAQ & panduan</b><small>Tujuan, cara pakai, fitur</small></a>
      <a class="tile" style="--i:3" href="#/pengaturan"><span class="stat-ic tone-warn">${I('gear')}</span><b>Pengaturan</b><small>Tema, nama, template, koneksi</small></a>
    </div>
    ${Store.meta.sheetUrl ? `<section class="card"><a class="menu-row" href="${E(Store.meta.sheetUrl)}" target="_blank" rel="noopener"><span class="todo-ic tone-ok">${I('table')}</span><div><b>Buka Google Sheet</b><small>Lihat dan backup data mentah</small></div>${I('chev', 'chev')}</a></section>` : ''}
    ${V.kopi()}
    <div style="text-align:center;margin-top:22px">${LOGO('welcome-mini')}</div>
    <p class="hint" style="text-align:center;margin:6px 0 0">Arsip Jastip · versi 2.3</p>
    ${V.credit()}`;
};

/* =========================================================
   PENGATURAN
   ========================================================= */
V.pengaturan = () => {
  const s = Store.settings, demo = Api.isDemo(), cfg = Api.cfg();
  const pglDef = s.panggilanDefault || '-';
  return V.head('Pengaturan', { back: '#/lainnya' })
  + `<h3 class="sec-label">Tampilan</h3>
    <section class="card form" style="margin-top:0">
      <fieldset class="field"><legend>Mode</legend><div class="seg" id="sMode">${[['auto', 'Ikuti HP', 'auto'], ['light', 'Terang', 'sun'], ['dark', 'Gelap', 'moon']].map(([v, l, ic]) => `<button type="button" class="${Theme.mode === v ? 'on' : ''}" aria-pressed="${Theme.mode === v}" onclick="App.setMode('${v}')">${l}</button>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Warna tema</legend><div class="swatches">${Theme.THEMES.map(([v, l, c]) => `<button type="button" class="swatch" aria-pressed="${Theme.theme === v}" onclick="App.setTheme('${v}')"><i style="background:${c}"></i>${l}</button>`).join('')}</div></fieldset>
    </section>
    <h3 class="sec-label">Tentang kamu</h3>
    <section class="card form" style="margin-top:0">
      <label class="field"><span>Nama panggilan</span><input id="sNama" value="${E(s.namaPanggilan)}" placeholder="Nama panggilanmu" autocomplete="off"></label>
      <label class="field"><span>Nama toko / jastip</span><input id="sToko" value="${E(s.namaToko)}" placeholder="Contoh: Jastip Barokah" autocomplete="off"></label>
    </section>
    <h3 class="sec-label">Jualan</h3>
    <section class="card form" style="margin-top:0">
      <label class="field"><span>Untung default per barang</span><input id="sMarkup" data-money inputmode="numeric" value="${UI.dots(s.markupDefault)}"><p class="hint">Otomatis ditambahkan ke harga modal saat isi barang baru.</p></label>
      <label class="field"><span>Info pembayaran <em>(muncul di tagihan)</em></span><textarea id="sBayar" rows="2" placeholder="Nama bank, nomor rekening, atas nama">${E(s.infoBayar)}</textarea></label>
      <fieldset class="field"><legend>Sapaan bawaan untuk pelanggan</legend><div class="chips wrap" id="sPgl">${PANGGILAN.concat(['-']).map(p => `<button type="button" class="chip xs ${pglDef === p ? 'on' : ''}" aria-pressed="${pglDef === p}" data-p="${p}" onclick="App.pickChip(this,'sPgl')">${p === '-' ? 'Tanpa' : p}</button>`).join('')}</div><p class="hint">Dipakai di tagihan dan chat, misal "${E(s.panggilanDefault ? s.panggilanDefault + ' ' : '')}Rina". Tiap pelanggan bisa diatur sendiri.</p></fieldset>
    </section>
    <button class="btn primary block" type="button" style="margin-top:14px" onclick="App.saveSettings()">${I('check')} Simpan pengaturan</button>

    <h3 class="sec-label">Template pesan</h3>
    <section class="card" style="margin-top:0">
      ${Object.entries(TEMPLATES).map(([k, t]) => `<button class="menu-row" type="button" onclick="Sheets.template('${k}')"><span class="todo-ic tone-info">${I(t.icon)}</span><div><b>${t.label}${s[k] ? ' <span class="pill self">diubah</span>' : ''}</b><small>${t.hint}</small></div>${I('chev', 'chev')}</button>`).join('')}
    </section>

    <h3 class="sec-label">Koneksi Google Sheet</h3>
    <section class="card" style="margin-top:0">
      ${demo ? `<p class="muted">Kamu lagi di mode coba. Data contoh cuma ada di HP ini.</p><div class="btn-row"><button class="btn primary" type="button" onclick="Sheets.connect()">${I('link')} Sambungkan</button></div>` : ''}
      ${!demo && cfg.url && (Store.meta.serverVersion || 1) < 2 ? `<div class="callout bad" style="margin-bottom:12px"><b>Code.gs perlu diperbarui</b>Panggilan pelanggan dan stok barang sisa belum tersimpan ke Google Sheet sampai Code.gs versi baru dipasang.</div>` : ''}
      ${!demo && !cfg.url ? `<p class="muted">Belum tersambung.</p><div class="btn-row"><button class="btn primary" type="button" onclick="Sheets.connect()">${I('link')} Sambungkan</button></div>` : ''}
      ${!demo && cfg.url ? `<div class="info-row" style="border-top:0">${I('cloud')}<span>Tersambung${Store.meta.lastPull ? ` · update ${UI.rel(new Date(Store.meta.lastPull).toISOString()).toLowerCase()} ${new Date(Store.meta.lastPull).toTimeString().slice(0, 5)}` : ''}</span></div>
        <div class="info-row">${I('link')}<span style="word-break:break-all;font-size:13px">${E(cfg.url.replace(/^(.{38}).+(.{10})$/, '$1…$2'))}</span></div>
        <div class="btn-row"><button class="btn ghost sm" type="button" onclick="App.pull(false,true)">${I('refresh')} Sinkron</button><button class="btn ghost sm" type="button" onclick="UI.copy(Api.connectCode(),'Kode sambung tersalin. Tempel di HP kedua.')">${I('copy')} Kode sambung</button></div>
        <p class="hint" style="margin-top:10px">Pakai <b>Kode sambung</b> untuk menyambungkan HP kedua tanpa mengetik ulang link dan kunci.</p>
        <button class="link-btn" type="button" onclick="Sheets.connect()">Ganti koneksi</button>` : ''}
    </section>

    <h3 class="sec-label">Rapikan data</h3>
    <section class="card" style="margin-top:0">
      <button class="menu-row" type="button" onclick="App.cleanPhotos()"><span class="todo-ic tone-warn">${I('image')}</span><div><b>Hapus foto barang lama</b><small>Foto dari PO yang sudah selesai dipindah ke sampah Google Drive.</small></div>${I('chev', 'chev')}</button>
      <button class="menu-row" type="button" onclick="App.resetLocal()"><span class="todo-ic tone-bad">${I('trash')}</span><div><b>${demo ? 'Keluar dari mode coba' : 'Putuskan HP ini'}</b><small>${demo ? 'Hapus data contoh dan mulai dari awal.' : 'Data di Google Sheet tetap aman.'}</small></div>${I('chev', 'chev')}</button>
    </section>`;
};

/* =========================================================
   SELAMAT DATANG (pertama kali dibuka)
   ========================================================= */
V.welcome = () => {
  const step = App.ui.welcomeStep;
  if (step === 1) return `<div class="welcome">
    ${LOGO('welcome-logo')}
    <div class="steps" aria-hidden="true"><i class="on"></i><i></i></div>
    <h1>Selamat datang di <span>Arsip Jastip</span></h1>
    <p>Catat PO, siapa aja yang list, siapa yang udah bayar, sampai resi kiriman. Kenalan dulu, yuk.</p>
    <section class="card form">
      <label class="field"><span>Mau dipanggil apa?</span><input id="wNama" value="${E(Store.settings.namaPanggilan)}" placeholder="Nama panggilanmu" autocomplete="off" enterkeyhint="next"></label>
      <label class="field"><span>Nama toko jastip <em>(muncul di tagihan)</em></span><input id="wToko" value="${E(Store.settings.namaToko)}" placeholder="Contoh: Jastip Barokah" autocomplete="off" enterkeyhint="next"></label>
      <button class="btn primary block" type="button" onclick="App.welcomeNext()">Lanjut ${I('chev')}</button>
    </section>
    ${V.credit()}
  </div>`;
  return `<div class="welcome">
    <div class="steps" aria-hidden="true"><i class="on"></i><i class="on"></i></div>
    <h1>Salam kenal, <span>Kak ${E(Store.settings.namaPanggilan)}</span></h1>
    <p>Sambungkan ke Google Sheet milikmu supaya data tersimpan aman dan sama di HP Android maupun iPhone.</p>
    <section class="card form">
      <label class="field"><span>Kode sambung <em>(dari HP pertama)</em></span><input id="wCode" placeholder="JSTP1.xxxxx" autocomplete="off"></label>
      <p class="hint" style="text-align:center;margin:0">atau isi manual</p>
      <label class="field"><span>Link Web App Apps Script</span><input id="wUrl" type="url" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off"></label>
      <label class="field"><span>Kode kunci</span><input id="wKey" placeholder="JSTP-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters"></label>
      <button class="btn primary block" id="wGo" type="button" onclick="App.welcomeConnect()">${I('link')} Sambungkan</button>
    </section>
    <button class="btn ghost block" type="button" style="margin-top:12px" onclick="App.startDemo()">${I('box')} Coba dulu pakai data contoh</button>
    <p class="hint" style="text-align:center;margin-top:10px">Belum punya link dan kode kunci? Lihat panduan setup di README GitHub (cukup sekali, sekitar 10 menit).</p>
    <button class="link-btn" type="button" style="margin:0 auto" onclick="App.ui.welcomeStep=1;App.render()">${I('back')} Kembali</button>
  </div>`;
};

V.skeleton = () => `<section class="hero" style="min-height:230px" aria-busy="true"><div class="hero-top"><div><span class="hero-brand">${LOGO()}Arsip Jastip</span><p class="hero-hi">Lagi ambil data dari Google Sheet…</p><h1>${Store.settings.namaPanggilan ? 'Kak ' + E(Store.settings.namaPanggilan) : 'Halo!'}</h1></div>${V.syncBtn()}</div></section>
  <div class="stat-grid">${'<div class="skel" style="height:108px"></div>'.repeat(4)}</div>
  <div class="skel" style="height:180px;margin-top:14px"></div>`;

/* Data pertama gagal diambil dan belum ada salinan di HP */
V.errorState = () => `${V.head('Arsip Jastip')}${V.empty('cloud', 'Data belum bisa diambil', `${E(Sync.lastError || 'Koneksi ke Google Sheet gagal.')} Cek internet, lalu coba lagi. Kalau masih gagal, cek link dan kode kunci di Pengaturan.`,
  `<div class="btn-row" style="width:100%"><a class="btn ghost" href="#/pengaturan">Cek koneksi</a><button class="btn primary" type="button" onclick="App.pull(true,true)">${I('refresh')} Coba lagi</button></div>`, 'bad')}`;
