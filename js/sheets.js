'use strict';
/* =========================================================
   sheets.js — formulir & aksi dalam bottom sheet
   ========================================================= */

const Sheets = {

  /* ---------------- Barang (tambah / ubah) ---------------- */
  barang(id) {
    const it = id ? Store.get('Barang', id) : null;
    const vs = it ? Calc.variantsOf(id) : [];
    const md = +Store.settings.markupDefault || 10000;
    let rows = vs.length
      ? vs.map(v => ({ id: v.id, nama: v.nama === 'Standar' ? '' : v.nama, modal: +v.hargaModal || 0, jual: +v.hargaJual || 0, mk: (+v.hargaJual || 0) - (+v.hargaModal || 0) }))
      : [{ id: UI.uid('v'), nama: '', modal: 0, jual: 0, mk: md }];
    let kat = it ? it.kategori : '';
    const foto = { url: it ? it.fotoUrl : '', id: it ? it.fotoId : '', data: null, removed: false };
    const sups = Store.all('Supplier').slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama)));

    UI.sheet({
      title: it ? 'Ubah barang' : 'Barang baru',
      html: `<div class="form">
        <label class="field"><span>Nama barang</span><input id="bNama" value="${E(it ? it.nama : '')}" placeholder="Contoh: Tumbler Stainless 1L" autocomplete="off"></label>
        <div class="field" role="group" aria-labelledby="fl1"><span id="fl1">Kategori</span><div class="chips wrap" id="bKat">${KATEGORI.map(([k, ic]) => `<button type="button" class="chip ${kat === k ? 'on' : ''}" data-k="${k}" aria-pressed="${kat === k}">${I(ic)} ${k}</button>`).join('')}</div></div>
        <label class="field"><span>Supplier</span><select id="bSup"><option value="">Pilih supplier</option>${sups.map(s => `<option value="${s.id}" ${it && it.supplierId === s.id ? 'selected' : ''}>${E(s.nama)}</option>`).join('')}<option value="__new">+ Tambah supplier baru</option></select></label>
        <label class="field hide" id="bSupNewW"><span>Nama supplier baru</span><input id="bSupNew" placeholder="Contoh: Grosir Bu Ani" autocomplete="off"></label>
        <div class="field" role="group" aria-labelledby="fl2"><span id="fl2">Varian & harga</span><p class="hint" style="margin:0">Kosongkan nama varian kalau barangnya cuma satu jenis. Ukuran beda harga? Bikin varian terpisah.</p><div id="bVar"></div><button type="button" class="btn ghost sm" id="bAddVar">${I('plus')} Tambah varian</button></div>
        <details class="more" ${it && it.diskonMin > 0 ? 'open' : ''}><summary><span>Diskon beli banyak <em>(opsional)</em></span></summary>
          <div class="row2"><label class="field sm"><span>Minimal beli (pcs)</span><input id="bDMin" inputmode="numeric" value="${it && it.diskonMin ? it.diskonMin : ''}" placeholder="3"></label>
          <label class="field sm"><span>Potongan per pcs</span><input id="bDRp" data-money inputmode="numeric" value="${it && it.diskonRp ? UI.dots(it.diskonRp) : ''}" placeholder="5.000"></label></div>
          <p class="hint">Contoh: beli 3 pcs atau lebih, tiap pcs dipotong Rp 5.000. Dihitung otomatis di tagihan.</p></details>
        <div class="field" role="group" aria-labelledby="fl3"><span id="fl3">Foto <em>(opsional)</em></span><div class="photo" id="bFoto"></div><input type="file" id="bFile" accept="image/*" hidden></div>
        <label class="field"><span>Keterangan <em>(opsional)</em></span><textarea id="bDesk" rows="2" placeholder="Ukuran, bahan, estimasi tiba…">${E(it ? it.deskripsi : '')}</textarea></label>
        <button class="btn primary block" id="bSave" type="button">${it ? 'Simpan perubahan' : 'Simpan barang'}</button>
        ${it ? `<button class="btn danger-ghost block" id="bDel" type="button">${I('trash')} Hapus barang ini</button>` : ''}
      </div>`,
      onMount(api) {
        const box = api.$('#bVar');
        const renderVar = () => {
          box.innerHTML = rows.map((r, i) => `<div class="vrow" data-i="${i}">
            <div class="vrow-h"><input class="vn" placeholder="${rows.length > 1 ? 'Nama varian, misal: Merah / Besar' : 'Nama varian (opsional)'}" value="${E(r.nama)}" autocomplete="off">${rows.length > 1 ? `<button type="button" class="icon-btn sm" data-rm aria-label="Hapus varian">${I('x')}</button>` : ''}</div>
            <div class="row2"><label class="field sm"><span>Harga modal</span><input class="vm" data-money inputmode="numeric" value="${r.modal ? UI.dots(r.modal) : ''}" placeholder="0"></label>
            <label class="field sm"><span>Harga jual</span><input class="vj" data-money inputmode="numeric" value="${r.jual ? UI.dots(r.jual) : ''}" placeholder="0"></label></div>
            <div class="mk"><span>Untung</span>${[5000, 10000, 15000, 20000].map(m => `<button type="button" class="chip xs ${r.mk === m ? 'on' : ''}" data-m="${m}">+${m / 1000}rb</button>`).join('')}<b class="mk-v">${r.jual ? UI.rp(r.jual - r.modal) : ''}</b></div>
          </div>`).join('');
          UI.moneyInputs(box);
        };
        const sync = i => {
          const el = box.querySelector(`.vrow[data-i="${i}"]`), r = rows[i];
          if (!el) return;
          const vj = el.querySelector('.vj');
          if (document.activeElement !== vj) vj.value = r.jual ? UI.dots(r.jual) : '';
          el.querySelector('.mk-v').textContent = r.jual ? UI.rp(r.jual - r.modal) : '';
          el.querySelectorAll('[data-m]').forEach(b => UI.on(b, r.mk === +b.dataset.m));
        };
        box.addEventListener('input', e => {
          const row = e.target.closest('.vrow'); if (!row) return;
          const i = +row.dataset.i, r = rows[i];
          if (e.target.classList.contains('vn')) r.nama = e.target.value;
          if (e.target.classList.contains('vm')) { r.modal = UI.num(e.target.value); r.jual = r.modal ? r.modal + r.mk : r.jual; sync(i); }
          if (e.target.classList.contains('vj')) { r.jual = UI.num(e.target.value); r.mk = r.jual - r.modal; sync(i); }
        });
        box.addEventListener('click', e => {
          const row = e.target.closest('.vrow'); if (!row) return;
          const i = +row.dataset.i;
          const m = e.target.closest('[data-m]');
          if (m) { rows[i].mk = +m.dataset.m; rows[i].jual = rows[i].modal + rows[i].mk; sync(i); UI.haptic(); return; }
          if (e.target.closest('[data-rm]')) {
            if (Store.all('Pesanan').some(o => o.varianId === rows[i].id)) return UI.toast('Varian ini sudah ada yang list, jadi nggak bisa dihapus.', 'bad');
            rows.splice(i, 1); renderVar();
          }
        });
        api.$('#bAddVar').onclick = () => {
          const last = rows[rows.length - 1] || { modal: 0, jual: 0, mk: md };
          rows.push({ id: UI.uid('v'), nama: '', modal: last.modal, jual: last.jual, mk: last.mk });
          renderVar();
          box.querySelectorAll('.vn')[rows.length - 1].focus();
        };
        renderVar();

        api.$('#bKat').addEventListener('click', e => {
          const b = e.target.closest('[data-k]'); if (!b) return;
          kat = kat === b.dataset.k ? '' : b.dataset.k;
          api.$$('#bKat .chip').forEach(c => UI.on(c, c.dataset.k === kat));
        });
        api.$('#bSup').onchange = e => api.$('#bSupNewW').classList.toggle('hide', e.target.value !== '__new');

        const renderFoto = () => {
          const src = foto.data || (!foto.removed && foto.url);
          api.$('#bFoto').innerHTML = src
            ? `<img src="${E(src)}" alt="Foto barang"><div class="photo-a"><button type="button" class="btn ghost sm" data-ch>${I('camera')} Ganti</button><button type="button" class="btn ghost sm" data-rmf>${I('trash')} Hapus</button></div>`
            : `<button type="button" class="photo-add" data-ch>${I('camera')}<span>Tambah foto</span><small>Biar gampang diingat. Boleh dilewati.</small></button>`;
        };
        api.$('#bFoto').addEventListener('click', e => {
          if (e.target.closest('[data-ch]')) api.$('#bFile').click();
          if (e.target.closest('[data-rmf]')) { foto.data = null; foto.removed = true; renderFoto(); }
        });
        api.$('#bFile').onchange = async e => {
          const f = e.target.files[0]; if (!f) return;
          try { foto.data = await UI.resizeImage(f, Api.isDemo() ? 600 : 1080, Api.isDemo() ? 0.7 : 0.8); renderFoto(); }
          catch (err) { UI.toast(err.message, 'bad'); }
          e.target.value = '';
        };
        renderFoto();

        api.$('#bSave').onclick = async () => {
          const nama = api.$('#bNama').value.trim();
          if (!nama) return UI.shake(api.$('#bNama'), 'Nama barangnya diisi dulu ya');
          let supId = api.$('#bSup').value;
          if (supId === '__new') {
            const sn = api.$('#bSupNew').value.trim();
            if (!sn) return UI.shake(api.$('#bSupNew'), 'Nama supplier diisi dulu ya');
            supId = Store.upsert('Supplier', { id: UI.uid('s'), nama: sn, kontak: '', catatan: '' }, { quiet: true }).id;
          }
          const valid = rows.filter(r => r.nama.trim() || r.jual || r.modal);
          if (!valid.length || valid.some(r => !r.jual)) return UI.shake(box, 'Harga jualnya diisi dulu ya');
          if (valid.length > 1 && valid.some(r => !r.nama.trim())) return UI.shake(box, 'Kasih nama di setiap varian ya');

          const btn = api.$('#bSave'); btn.disabled = true;
          let fotoUrl = foto.removed ? '' : foto.url, fotoId = foto.removed ? '' : foto.id;
          if (foto.removed && foto.id && Api.isConnected()) Api.call('deletePhotos', { ids: [foto.id] }).catch(() => {});
          if (foto.data) {
            if (Api.isDemo()) { fotoUrl = foto.data; fotoId = ''; }
            else {
              btn.innerHTML = '<span class="spin"></span> Mengunggah foto…';
              try {
                const r = await Api.call('uploadPhoto', { data: foto.data.split(',')[1], mime: 'image/jpeg', name: nama + '.jpg' });
                if (foto.id) Api.call('deletePhotos', { ids: [foto.id] }).catch(() => {});
                fotoUrl = r.fotoUrl; fotoId = r.fotoId;
              } catch (err) { UI.toast('Foto gagal diunggah. Barang tetap disimpan tanpa foto baru.', 'bad'); }
            }
          }
          const bid = it ? it.id : UI.uid('b');
          Store.upsert('Barang', {
            ...(it || {}), id: bid, nama, kategori: kat, supplierId: supId, fotoUrl, fotoId,
            deskripsi: api.$('#bDesk').value.trim(),
            diskonMin: UI.num(api.$('#bDMin').value), diskonRp: UI.num(api.$('#bDRp').value),
            status: it ? it.status : 'open', tanggal: it ? it.tanggal : UI.now()
          }, { quiet: true });
          let modalSync = 0, jualSync = 0;
          const keep = valid.map(r => r.id);
          vs.forEach(v => { if (!keep.includes(v.id)) Store.remove('Varian', v.id, { quiet: true }); });
          valid.forEach((r, i) => {
            Store.upsert('Varian', { id: r.id, barangId: bid, nama: r.nama.trim() || 'Standar', hargaModal: r.modal, hargaJual: r.jual, urut: i + 1 }, { quiet: true });
            // Modal selalu ikut harga terbaru (modal = biaya kamu, tidak memengaruhi tagihan).
            // Harga jual ikut berubah hanya untuk pesanan yang belum lunas dan belum diberi harga khusus.
            const old = vs.find(v => v.id === r.id);
            Store.all('Pesanan').filter(o => o.varianId === r.id).forEach(o => {
              const upd = {};
              if (+o.hargaModal !== r.modal) upd.hargaModal = r.modal;
              if (old && +old.hargaJual !== r.jual && +o.hargaJual === +old.hargaJual && o.bayar !== 'lunas') { upd.hargaJual = r.jual; jualSync++; }
              if (Object.keys(upd).length) { modalSync += upd.hargaModal !== undefined ? 1 : 0; Store.upsert('Pesanan', { ...o, ...upd }, { quiet: true }); }
            });
          });
          await api.close();
          UI.toast(!it ? 'Barang baru siap dijual!' : jualSync ? `Disimpan. Harga jual baru dipakai di ${jualSync} pesanan yang belum lunas` : modalSync ? `Disimpan. Modal di ${modalSync} pesanan ikut diperbarui` : 'Perubahan disimpan');
          if (it) App.refresh(); else App.go('#/barang/' + bid);
        };

        if (it) api.$('#bDel').onclick = async () => {
          const n = Store.all('Pesanan').filter(o => o.barangId === id).length;
          const ok = await UI.confirm({ title: 'Hapus barang?', text: n ? `Ada ${n} list di barang ini yang ikut terhapus. Yakin?` : 'Barang ini akan dihapus permanen.', ok: 'Hapus', danger: true });
          if (!ok) return;
          Store.all('Pesanan').filter(o => o.barangId === id).forEach(o => Store.remove('Pesanan', o.id, { quiet: true }));
          vs.forEach(v => Store.remove('Varian', v.id, { quiet: true }));
          if (it.fotoId && Api.isConnected()) Api.call('deletePhotos', { ids: [it.fotoId] }).catch(() => {});
          Store.remove('Barang', id, { quiet: true });
          await api.close();
          UI.toast('Barang dihapus');
          App.go('#/barang');
        };
        if (!it) setTimeout(() => api.$('#bNama').focus(), 350);
      }
    });
  },

  /* ---------------- Tambah list pelanggan ---------------- */
  addList(itemId) {
    const it = Store.get('Barang', itemId); if (!it) return;
    const vs = Calc.variantsOf(itemId);
    if (!vs.length) return UI.toast('Isi harga barangnya dulu ya', 'bad');
    let varId = vs[0].id, sel = null, paid = false, mode = 'satu';
    const recent = [];
    Store.all('Pesanan').slice().sort((a, b) => String(b.dibuat).localeCompare(String(a.dibuat))).forEach(o => {
      if (o.pelangganId !== SELF_ID && !recent.includes(o.pelangganId) && Store.get('Pelanggan', o.pelangganId)) recent.push(o.pelangganId);
    });

    UI.sheet({
      title: 'Tambah list',
      html: `<div class="form">
        <div class="osum">${V.thumb(it, 'thumb md')}<div><b>${E(it.nama)}</b><small>${vs.length > 1 ? vs.length + ' varian' : UI.rp(vs[0].hargaJual)}</small></div></div>
        <div class="seg" id="lMode"><button type="button" class="on" data-m="satu">Satu-satu</button><button type="button" data-m="banyak">Tempel banyak</button></div>
        ${vs.length > 1 ? `<div class="field" role="group" aria-labelledby="fl4"><span id="fl4">Varian</span><div class="chips wrap" id="lVar">${vs.map((v, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-v="${v.id}">${E(v.nama)} <small>${UI.rpShort(v.hargaJual)}</small></button>`).join('')}</div></div>` : ''}
        <div id="lSatu" class="form">
          <div class="field" role="group" aria-labelledby="fl5"><span id="fl5">Siapa yang list?</span>
            <div class="combo"><input id="lNama" placeholder="Ketik nama pelanggan" autocomplete="off" enterkeyhint="done"><div class="combo-list" id="lSug"></div></div>
            <div class="chips scroll-x" id="lRecent" style="margin-top:8px"><button type="button" class="chip self" data-c="${SELF_ID}" aria-pressed="false">${I('heart')} Buat aku</button>${recent.slice(0, 8).map(cid => `<button type="button" class="chip" data-c="${cid}">${E(Store.get('Pelanggan', cid).nama)}</button>`).join('')}</div>
          </div>
          <div class="row2">
            <div class="field" role="group" aria-labelledby="fl6"><span id="fl6">Jumlah</span>${UI.stepper('lQty', 1, 1)}</div>
            <div class="field" role="group" aria-labelledby="fl7"><span id="fl7">Pembayaran</span><button type="button" class="toggle" id="lPaid" aria-pressed="false"><i></i>Udah bayar duluan</button></div>
          </div>
          <label class="field"><span>Catatan <em>(opsional)</em></span><input id="lNote" placeholder="Misal: kalau habis, ganti warna lain" autocomplete="off"></label>
          <div class="btn-row" style="margin-top:0"><button class="btn ghost" id="lMore" type="button">Simpan + lagi</button><button class="btn primary" id="lSave" type="button">Simpan</button></div>
        </div>
        <div id="lBanyak" class="form hide">
          <label class="field"><span>Tempel nama dari status atau grup</span><textarea id="lBulk" rows="7" placeholder="Rina&#10;Sari 2&#10;Bu Dewi x3"></textarea></label>
          <p class="hint" style="margin:0">Satu baris satu orang. Tambahkan angka di belakang nama kalau belinya lebih dari 1. Nomor urut di depan otomatis diabaikan.</p>
          <div id="lPrev"></div>
          <button class="btn primary block" id="lBulkSave" type="button">Simpan semua</button>
        </div>
      </div>`,
      onMount(api) {
        const nameIn = api.$('#lNama'), sug = api.$('#lSug');
        api.$('#lMode').addEventListener('click', e => {
          const b = e.target.closest('[data-m]'); if (!b) return;
          mode = b.dataset.m;
          api.$$('#lMode button').forEach(x => UI.on(x, x === b));
          api.$('#lSatu').classList.toggle('hide', mode !== 'satu');
          api.$('#lBanyak').classList.toggle('hide', mode !== 'banyak');
        });
        if (vs.length > 1) api.$('#lVar').addEventListener('click', e => {
          const b = e.target.closest('[data-v]'); if (!b) return;
          varId = b.dataset.v; api.$$('#lVar .chip').forEach(c => UI.on(c, c === b));
        });
        const setSel = c => {
          sel = c; nameIn.value = c ? c.nama : nameIn.value; sug.innerHTML = '';
          api.$$('#lRecent .chip').forEach(x => UI.on(x, !!c && x.dataset.c === c.id));
        };
        nameIn.addEventListener('input', () => {
          sel = null; api.$$('#lRecent .chip').forEach(x => x.classList.remove('on'));
          const q = nameIn.value.trim().toLowerCase();
          if (!q) { sug.innerHTML = ''; return; }
          const m = Store.all('Pelanggan').filter(c => !c.isSelf && c.nama.toLowerCase().includes(q)).slice(0, 5);
          const exact = m.some(c => c.nama.toLowerCase() === q);
          sug.innerHTML = m.map(c => `<button type="button" data-id="${c.id}">${UI.ava(c.nama, 'sm')}${E(c.nama)}${c.wa ? `<small>${E(c.wa)}</small>` : ''}</button>`).join('')
            + (exact ? '' : `<button type="button" class="new" data-new>${I('plus')} Pelanggan baru: “${E(nameIn.value.trim())}”</button>`);
        });
        sug.addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.id) setSel(Store.get('Pelanggan', b.dataset.id)); else sug.innerHTML = '';
        });
        api.$('#lRecent').addEventListener('click', e => {
          const b = e.target.closest('[data-c]'); if (!b) return;
          if (sel && sel.id === b.dataset.c) { setSel(null); nameIn.value = ''; nameIn.focus(); return; }
          const c = b.dataset.c === SELF_ID ? (Store.ensureSelf(), Store.get('Pelanggan', SELF_ID)) : Store.get('Pelanggan', b.dataset.c);
          setSel(c);
        });
        api.$('#lPaid').onclick = e => { paid = !paid; e.currentTarget.setAttribute('aria-pressed', paid); UI.haptic(); };

        const save = keepOpen => {
          const raw = nameIn.value.trim();
          if (!sel && !raw) return UI.shake(nameIn, 'Nama pelanggannya diisi dulu ya');
          const c = sel || Store.ensureCust(raw);
          const qty = Math.max(1, UI.num(api.$('#lQty').value));
          App.addOrder(itemId, varId, c.id, qty, paid, api.$('#lNote').value.trim());
          UI.haptic();
          if (keepOpen) {
            UI.toast(`${c.nama} masuk list`);
            setSel(null); nameIn.value = ''; api.$('#lQty').value = 1; api.$('#lNote').value = '';
            paid = false; api.$('#lPaid').setAttribute('aria-pressed', 'false'); nameIn.focus();
          } else { api.close(); UI.toast(`${c.nama} masuk list`); }
        };
        api.$('#lSave').onclick = () => save(false);
        api.$('#lMore').onclick = () => save(true);
        nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(true); } });

        const parse = t => t.split(/\n/).map(l => l.replace(/^\s*(\d+\s*[.)]|[-•*])\s*/, '').trim()).filter(Boolean).map(l => {
          const m = l.match(/^(.*?)[\s,:-]*(?:x\s*)?(\d+)\s*(?:pcs|pc|biji|buah)?\.?$/i);
          return m && m[1].trim() ? { nama: m[1].trim(), qty: Math.max(1, +m[2]) } : { nama: l, qty: 1 };
        });
        api.$('#lBulk').addEventListener('input', () => {
          const rows = parse(api.$('#lBulk').value);
          api.$('#lPrev').innerHTML = rows.length ? `<div class="callout info"><b>${rows.length} orang · ${rows.reduce((a, r) => a + r.qty, 0)} pcs</b>${rows.slice(0, 12).map(r => `${E(r.nama)}${r.qty > 1 ? ` (${r.qty})` : ''}${Store.findCust(r.nama) ? '' : ' <em>· baru</em>'}`).join(',')}${rows.length > 12 ?', …' : ''}</div>` : '';
        });
        api.$('#lBulkSave').onclick = () => {
          const rows = parse(api.$('#lBulk').value);
          if (!rows.length) return UI.shake(api.$('#lBulk'), 'Tempel nama-namanya dulu ya');
          rows.forEach(r => App.addOrder(itemId, varId, Store.ensureCust(r.nama).id, r.qty, false, '', true));
          App.refresh();
          api.close();
          UI.toast(`${rows.length} orang masuk list`);
        };
        setTimeout(() => nameIn.focus(), 350);
      }
    });
  },

  /* ---------------- Detail pesanan ---------------- */
  order(id) {
    const o0 = Store.get('Pesanan', id); if (!o0) return;
    const c = Calc.cust(o0), it = Calc.item(o0), self = Calc.isSelf(o0);
    const vs = it ? Calc.variantsOf(it.id) : [];
    const k = o0.kirimanId ? Store.get('Kiriman', o0.kirimanId) : null;

    UI.sheet({
      title: (c ? c.nama : 'Pesanan') + '',
      html: `<div class="form">
        <a class="osum" href="#/barang/${o0.barangId}" onclick="event.preventDefault();App.go('#/barang/${o0.barangId}')">${V.thumb(it, 'thumb md')}<div style="flex:1;min-width:0"><b>${E(it ? it.nama : 'Barang terhapus')}</b><small>Dicatat ${UI.rel(o0.dibuat).toLowerCase()}</small></div>${I('chev', 'chev')}</a>
        <div class="field" role="group" aria-labelledby="fl8"><span id="fl8">Status barang</span><div class="seg st" id="oSt">${[['list', 'Nunggu'], ['dapat', 'Dapat'], ['tidak', 'Nggak dapat'], ['batal', 'Batal']].map(([v, l]) => `<button type="button" data-s="${v}">${l}</button>`).join('')}</div></div>
        ${self ? '' : `<div class="field" role="group" aria-labelledby="fl9"><span id="fl9">Pembayaran</span><div class="seg" id="oPay"><button type="button" data-p="belum">Belum bayar</button><button type="button" data-p="lunas">Lunas</button></div></div>`}
        <div id="oSolusi"></div>
        ${vs.length > 1 ? `<label class="field"><span>Varian</span><select id="oVar">${vs.map(v => `<option value="${v.id}" ${v.id === o0.varianId ? 'selected' : ''}>${E(v.nama)} · ${UI.rp(v.hargaJual)}</option>`).join('')}</select></label>` : ''}
        <div class="row2"><div class="field" role="group" aria-labelledby="fl10"><span id="fl10">Jumlah</span>${UI.stepper('oQty', o0.qty, 1)}</div>
          <label class="field"><span>Harga / pcs</span><input id="oHarga" data-money inputmode="numeric" value="${UI.dots(o0.hargaJual)}"></label></div>
        ${self ? '' : `<label class="field"><span>Diskon tambahan <em>(total, opsional)</em></span><input id="oDisk" data-money inputmode="numeric" value="${o0.diskon ? UI.dots(o0.diskon) : ''}" placeholder="0"></label>`}
        <label class="field"><span>Catatan</span><input id="oNote" value="${E(o0.catatan)}" placeholder="Opsional" autocomplete="off"></label>
        <div class="total-box"><span>${self ? 'Nilai barang' : 'Total tagihan'}</span><div><b id="oTot"></b><small id="oSub"></small></div></div>
        ${k ? `<button type="button" class="callout info" style="text-align:left;border:0;width:100%" onclick="Sheets.kiriman({id:'${k.id}'})"><b>${E(k.kurir || 'Kiriman')}${k.resi ? ' · ' + E(k.resi) : ''}</b>${(V.KSTATUS[k.status] || ['Dikirim'])[0]} ${UI.rel(k.tanggal).toLowerCase()} · ketuk untuk detail</button>` : ''}
        <button class="btn primary block" id="oSave" type="button">Simpan</button>
        <div class="btn-row" style="margin-top:0">
          ${!self && c ? `<button class="btn ghost sm" type="button" onclick="App.chat('${c.id}')">${I('chat')} Chat</button><button class="btn ghost sm" type="button" onclick="App.go('#/pelanggan/${c.id}')">${I('user')} Pelanggan</button>` : ''}
        </div>
        <button class="btn danger-ghost block" id="oDel" type="button">${I('trash')} Hapus dari list</button>
      </div>`,
      onMount(api) {
        const d = { ...o0 };
        const read = () => {
          d.qty = Math.max(1, UI.num(api.$('#oQty').value));
          d.hargaJual = UI.num(api.$('#oHarga').value);
          if (api.$('#oDisk')) d.diskon = UI.num(api.$('#oDisk').value);
          d.catatan = api.$('#oNote').value.trim();
          if (api.$('#oVar') && api.$('#oVar').value !== d.varianId) {
            const v = Store.get('Varian', api.$('#oVar').value);
            d.varianId = v.id; d.hargaModal = v.hargaModal;
          }
        };
        const paint = () => {
          api.$$('#oSt button').forEach(b => UI.on(b, b.dataset.s === d.status));
          api.$$('#oPay button').forEach(b => UI.on(b, b.dataset.p === d.bayar));
          const tmp = { ...d };
          api.$('#oTot').textContent = UI.rp(Calc.total(tmp));
          const hemat = (+d.diskon || 0) + Calc.autoDisc(tmp);
          api.$('#oSub').textContent = hemat ? `sudah dipotong ${UI.rp(hemat)}` : (self ? '' : `untung ${UI.rp(Calc.profit(tmp))}`);
          const sol = api.$('#oSolusi');
          if ((d.status === 'tidak' || d.status === 'batal') && d.bayar === 'lunas' && !self) {
            sol.innerHTML = d.solusi
              ? `<div class="callout ok"><span>${d.solusi === 'refund' ? 'Uangnya sudah dikembalikan' : 'Sudah diganti barang lain'}</span><button class="link-btn" type="button" data-sol="">Batalkan</button></div>`
              : `<div class="callout bad"><b>Udah dibayar, tapi nggak dapat </b>Mau diselesaikan gimana?<div class="btn-row"><button class="btn ghost sm" type="button" data-sol="refund">Uang dikembalikan</button><button class="btn ghost sm" type="button" data-sol="ganti">Ganti barang lain</button></div></div>`;
          } else sol.innerHTML = '';
        };
        const commit = () => { read(); Store.upsert('Pesanan', d); };

        api.$('#oSt').addEventListener('click', e => {
          const b = e.target.closest('[data-s]'); if (!b || b.dataset.s === d.status) return;
          const was = d.status;
          d.status = b.dataset.s;
          d.tglDapat = d.status === 'dapat' ? (d.tglDapat || UI.now()) : '';
          if (d.status !== 'tidak' && d.status !== 'batal') d.solusi = '';
          commit(); paint(); UI.haptic();
          if (d.status === 'dapat') Calc.syncStok(d.varianId);
          const balik = was === 'dapat' && (d.status === 'batal' || d.status === 'tidak') && Calc.stokOf(Store.get('Varian', d.varianId) || {}).sisa;
          if (d.status === 'dapat') { const r = b.getBoundingClientRect(); UI.confetti(r.left + r.width / 2, r.top); }
          UI.toast(d.status === 'dapat' ? 'Yeay, dapat!' : d.status === 'tidak' ? 'Yah, belum rezeki' : d.status === 'batal' ? 'Pesanan dibatalkan' + (balik ? ' · barangnya masuk ke sisa' : '') : 'Ditandai nunggu kabar');
        });
        if (api.$('#oPay')) api.$('#oPay').addEventListener('click', e => {
          const b = e.target.closest('[data-p]'); if (!b || b.dataset.p === d.bayar) return;
          d.bayar = b.dataset.p; d.tglBayar = d.bayar === 'lunas' ? UI.now() : '';
          if (d.bayar !== 'lunas') d.solusi = '';
          commit(); paint(); UI.haptic();
          if (d.bayar === 'lunas') { const r = b.getBoundingClientRect(); UI.confetti(r.left + r.width / 2, r.top); }
          UI.toast(d.bayar === 'lunas' ? 'Lunas! Makasih, Kak' : 'Ditandai belum bayar');
        });
        api.$('#oSolusi').addEventListener('click', async e => {
          const b = e.target.closest('[data-sol]'); if (!b) return;
          if (b.dataset.sol === 'ganti') { await api.close(); return Sheets.ganti(id); }
          d.solusi = b.dataset.sol; commit(); paint();
          if (d.solusi) UI.toast('Dicatat: uang dikembalikan');
        });
        api.el.addEventListener('input', e => { if (e.target.matches('#oQty,#oHarga,#oDisk')) { read(); paint(); } });
        if (api.$('#oVar')) api.$('#oVar').onchange = () => {
          const v = Store.get('Varian', api.$('#oVar').value);
          api.$('#oHarga').value = UI.dots(v.hargaJual); read(); paint();
        };
        api.$('#oSave').onclick = () => { commit(); api.close(); UI.toast('Tersimpan'); };
        api.$('#oDel').onclick = async () => {
          const ok = await UI.confirm({ title: 'Hapus dari list?', text: `${E(c ? c.nama : 'Pesanan ini')} akan dihapus dari list ${E(it ? it.nama : '')}.`, ok: 'Hapus', danger: true });
          if (!ok) return;
          Store.remove('Pesanan', id, { quiet: true });
          await api.close();
          App.refresh();
          UI.toast('Dihapus dari list');
        };
        paint();
      }
    });
  },

  /* Ganti barang untuk pesanan lunas yang nggak dapat */
  ganti(orderId) {
    const o = Store.get('Pesanan', orderId); if (!o) return;
    const items = Store.all('Barang').filter(b => b.status !== 'tutup' && b.id !== o.barangId);
    UI.sheet({
      title: 'Ganti dengan barang apa?',
      html: items.length ? `<p class="hint">Pembayaran ${UI.rp(Calc.total(o))} dipindah ke barang pilihan. Pesanan baru langsung tercatat lunas.</p>`
        + items.map(b => Calc.variantsOf(b.id).map(v => `<button type="button" class="check-row" style="width:100%;background:#fff;text-align:left" data-b="${b.id}" data-v="${v.id}">${V.thumb(b, 'thumb sm')}<div><b>${E(b.nama)}</b><small>${v.nama === 'Standar' ? '' : E(v.nama) + ' · '}${UI.rp(v.hargaJual)}</small></div>${I('chev', 'chev')}</button>`).join('')).join('')
        : V.empty('box', 'Belum ada PO lain yang open', 'Buka PO baru dulu, lalu pilih ganti barang dari pesanan ini.'),
      onMount(api) {
        api.body.addEventListener('click', async e => {
          const b = e.target.closest('[data-v]'); if (!b) return;
          const old = Store.get('Barang', o.barangId);
          App.addOrder(b.dataset.b, b.dataset.v, o.pelangganId, o.qty, true, `Ganti dari ${old ? old.nama : 'barang lain'}`, true);
          Store.upsert('Pesanan', { ...o, solusi: 'ganti' }, { quiet: true });
          await api.close(); App.refresh();
          UI.toast('Sudah diganti. Pesanan baru tercatat lunas');
        });
      }
    });
  },

  /* ---------------- Bagi jatah ---------------- */
  jatah(itemId) {
    const it = Store.get('Barang', itemId); if (!it) return;
    const vs = Calc.variantsOf(itemId);
    const os = Calc.ordersOf(itemId).filter(o => o.status !== 'batal');
    if (!os.length) return UI.toast('Belum ada yang list di barang ini', 'bad');
    const want = o => +o.qtyMinta || +o.qty || 0;
    const rows = vs.map(v => {
      const vo = os.filter(o => o.varianId === v.id);
      const ask = vo.reduce((a, o) => a + want(o), 0);
      const got = vo.filter(o => o.status === 'dapat').reduce((a, o) => a + (+o.qty || 0), 0);
      const decided = vo.some(o => o.status !== 'list');
      return { v, vo, ask, def: +v.stokDapat || (decided ? got : ask) };
    });

    UI.sheet({
      title: 'Bagi jatah',
      html: `<p class="hint">Isi berapa pcs yang kamu dapat dari supplier. Jatah dibagi sesuai urutan list, yang paling atas duluan. Kalau kamu ambil lebih banyak dari yang minta, kelebihannya tercatat sebagai <b>barang sisa</b>.</p>
        <section class="card" style="margin-top:6px;padding:4px 16px">${rows.map(r => `<div class="jrow"><div><b>${vs.length > 1 ? E(r.v.nama) : 'Dapat berapa pcs?'}</b><small>${r.vo.length} orang minta ${r.ask} pcs</small></div>${UI.stepper('j_' + r.v.id, r.def, 0)}</div>`).join('')}</section>
        <div class="btn-row"><button class="btn ghost sm" type="button" data-all="1">Dapat semua</button><button class="btn ghost sm" type="button" data-all="0">Nggak dapat sama sekali</button></div>
        <button class="btn primary block" type="button" id="jGo" style="margin-top:14px">${I('pie')} Bagi sekarang</button>`,
      onMount(api) {
        api.body.addEventListener('click', e => {
          const b = e.target.closest('[data-all]'); if (!b) return;
          rows.forEach(r => { api.$('#j_' + r.v.id).value = b.dataset.all === '1' ? r.ask : 0; });
        });
        api.$('#jGo').onclick = async () => {
          let nDapat = 0, nTidak = 0, nSisa = 0;
          rows.forEach(r => {
            const stok = UI.num(api.$('#j_' + r.v.id).value);
            let left = stok;
            if (+r.v.stokDapat !== stok) Store.upsert('Varian', { ...r.v, stokDapat: stok }, { quiet: true });
            r.vo.forEach(o => {
              const w = want(o), n = { ...o };
              if (left >= w) { n.status = 'dapat'; n.qty = w; n.qtyMinta = 0; left -= w; }
              else if (left > 0) { n.status = 'dapat'; n.qty = left; n.qtyMinta = w; left = 0; }
              else { n.status = 'tidak'; n.qty = w; n.qtyMinta = 0; }
              if (n.status === 'dapat') { n.tglDapat = o.tglDapat || UI.now(); nDapat++; } else { n.tglDapat = ''; nTidak++; }
              if (n.status !== o.status || n.qty !== o.qty || n.qtyMinta !== o.qtyMinta) Store.upsert('Pesanan', n, { quiet: true });
            });
            nSisa += left;
          });
          await api.close();
          App.refresh();
          if (nDapat) UI.confetti();
          UI.toast(`${nDapat} dapat, ${nTidak} belum rezeki${nSisa ?`, sisa ${nSisa} pcs` : ''}`, '', { label: 'Salin list', fn: () => App.copyList(itemId) });
        };
      }
    });
  },

  /* ---------------- Pelanggan (tambah / ubah) ---------------- */
  pelanggan(id, preName = '') {
    const c = id ? Store.get('Pelanggan', id) : null;
    const self = c && c.isSelf;
    UI.sheet({
      title: c ? 'Ubah data' : 'Pelanggan baru',
      html: `<div class="form">
        <label class="field"><span>Nama</span><input id="cNama" value="${E(c ? c.nama : preName)}" placeholder="Nama pelanggan" autocomplete="off"></label>
        ${self ? '' : `<div class="field" role="group" aria-labelledby="fl11"><span id="fl11">Panggilan</span><div class="chips wrap" id="cPgl">${PANGGILAN.concat(['-']).map(p => `<button type="button" class="chip xs ${((c && c.panggilan) || Store.settings.panggilanDefault || '-') === p ? 'on' : ''}" data-p="${p}">${p === '-' ? 'Tanpa' : p}</button>`).join('')}</div><p class="hint" id="cPglHint"></p></div>`}
        ${self ? '' : `<label class="field"><span>Nomor WhatsApp</span><input id="cWa" type="tel" inputmode="tel" value="${E(c ? c.wa : '')}" placeholder="0812xxxxxxxx" autocomplete="off"></label>
        <label class="field"><span>Alamat kirim</span><textarea id="cAlamat" rows="3" placeholder="Jalan, nomor rumah, kecamatan, kota">${E(c ? c.alamat : '')}</textarea></label>`}
        <label class="field"><span>Catatan <em>(opsional)</em></span><input id="cNote" value="${E(c ? c.catatan : '')}" placeholder="Misal: suka barang Informa, transfer cepat" autocomplete="off"></label>
        <button class="btn primary block" id="cSave" type="button">${c ? 'Simpan perubahan' : 'Simpan pelanggan'}</button>
        ${c && !self ? `<button class="btn danger-ghost block" id="cDel" type="button">${I('trash')} Hapus pelanggan</button>` : ''}
      </div>`,
      onMount(api) {
        let pgl = c ? (c.panggilan || '') : '';
        const hint = () => { const h = api.$('#cPglHint'); if (h) h.textContent = `Akan disapa: "${Text.sapaan({ nama: api.$('#cNama').value.trim() || 'Nama', panggilan: pgl })}"`; };
        if (api.$('#cPgl')) {
          api.$('#cPgl').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; pgl = b.dataset.p; api.$$('#cPgl .chip').forEach(x => UI.on(x, x === b)); hint(); });
          api.$('#cNama').addEventListener('input', hint); hint();
        }
        api.$('#cSave').onclick = async () => {
          const nama = api.$('#cNama').value.trim();
          if (!nama) return UI.shake(api.$('#cNama'), 'Namanya diisi dulu ya');
          const dup = Store.findCust(nama);
          if (dup && (!c || dup.id !== c.id)) return UI.shake(api.$('#cNama'), 'Nama ini sudah ada. Tambahkan pembeda, misal "Rina Bekasi".');
          const row = { ...(c || {}), id: c ? c.id : UI.uid('c'), nama, catatan: api.$('#cNote').value.trim(), isSelf: !!self };
          if (!self) { row.wa = api.$('#cWa').value.trim(); row.alamat = api.$('#cAlamat').value.trim(); row.panggilan = pgl; }
          Store.upsert('Pelanggan', row, { quiet: true });
          await api.close();
          UI.toast(c ? 'Data pelanggan diperbarui' : `${nama} ditambahkan`);
          if (c) App.refresh(); else App.go('#/pelanggan/' + row.id);
        };
        if (api.$('#cDel')) api.$('#cDel').onclick = async () => {
          if (Store.all('Pesanan').some(o => o.pelangganId === id)) return UI.toast('Pelanggan ini punya riwayat pesanan, jadi nggak bisa dihapus.', 'bad');
          const ok = await UI.confirm({ title: 'Hapus pelanggan?', text: `${E(c.nama)} akan dihapus.`, ok: 'Hapus', danger: true });
          if (!ok) return;
          Store.remove('Pelanggan', id, { quiet: true });
          await api.close(); App.go('#/pelanggan'); UI.toast('Pelanggan dihapus');
        };
        if (!c) setTimeout(() => api.$('#cNama').focus(), 350);
      }
    });
  },

  /* ---------------- Tagihan ---------------- */
  tagih(cid) {
    const c = Store.get('Pelanggan', cid), text = Text.bill(cid);
    if (!text) return UI.toast('Nggak ada tagihan untuk pelanggan ini');
    UI.sheet({
      title: 'Tagihan ' + c.nama,
      html: `<p class="hint">Cek dulu, boleh diedit sebelum dikirim.</p>
        <textarea id="tText" class="preview-text">${E(text)}</textarea>
        ${c.wa ? '' : '<p class="hint" style="margin-top:8px">Nomor WA belum diisi, nanti kamu pilih kontaknya sendiri di WhatsApp.</p>'}
        <div class="btn-row"><button class="btn ghost" id="tCopy" type="button">${I('copy')} Salin</button><button class="btn wa" id="tWa" type="button">${I('chat')} Kirim ke WA</button></div>`,
      onMount(api) {
        api.$('#tCopy').onclick = () => UI.copy(api.$('#tText').value);
        api.$('#tWa').onclick = () => UI.wa(c.wa, api.$('#tText').value);
      }
    });
  },
  async lunasSemua(cid) {
    const b = Calc.billOf(cid), c = Store.get('Pelanggan', cid); if (!b) return;
    const ok = await UI.confirm({ title: 'Tandai lunas semua?', text: `Semua tagihan ${E(c.nama)} sebesar <b>${UI.rp(b.total)}</b> ditandai sudah dibayar.`, ok: 'Ya, sudah lunas' });
    if (!ok) return;
    const now = UI.now();
    b.orders.forEach(o => Store.upsert('Pesanan', { ...o, bayar: 'lunas', tglBayar: now }, { quiet: true }));
    b.kiriman.forEach(k => Store.upsert('Kiriman', { ...k, ongkirLunas: true }, { quiet: true }));
    App.refresh();
    UI.confetti();
    UI.toast(`${c.nama} lunas!`);
  },

  /* ---------------- Kiriman ---------------- */
  kiriman({ id, pelangganId }) {
    const k = id ? Store.get('Kiriman', id) : null;
    const cid = k ? k.pelangganId : pelangganId;
    const c = Store.get('Pelanggan', cid); if (!c) return;
    const cand = Store.all('Pesanan').filter(o => o.pelangganId === cid && o.status === 'dapat' && (!o.kirimanId || (k && o.kirimanId === k.id)));
    const pre = new Set(cand.filter(o => k ? o.kirimanId === k.id : o.bayar === 'lunas').map(o => o.id));
    let kurir = k ? k.kurir : '', status = k ? k.status : 'dikirim', lunas = k ? !!k.ongkirLunas : false;

    UI.sheet({
      title: k ? 'Detail kiriman' : 'Kiriman ke ' + c.nama,
      html: `<div class="form">
        ${k ? `<div class="osum">${UI.ava(c.nama)}<div><b>${E(c.nama)}</b><small>${c.wa ? E(c.wa) : 'Nomor WA belum ada'}</small></div></div>` : ''}
        <div class="field" role="group" aria-labelledby="fl12"><span id="fl12">Isi paket</span>${cand.length ? cand.map(o => { const it = Calc.item(o), vn = Calc.varName(o); return `<label class="check-row"><input type="checkbox" value="${o.id}" ${pre.has(o.id) ? 'checked' : ''}><div><b>${E(it ? it.nama : 'Barang')}${vn ? ' · ' + E(vn) : ''} x${o.qty}</b><small>${UI.rp(Calc.total(o))} · ${o.bayar === 'lunas' ? 'lunas' : '<span style="color:var(--warn);font-weight:700">belum bayar</span>'}</small></div></label>`; }).join('')
          : '<p class="hint">Belum ada pesanan yang dapat untuk dikirim.</p>'}</div>
        <div class="field" role="group" aria-labelledby="fl13"><span id="fl13">Status</span><div class="seg" id="kSt">${Object.entries(V.KSTATUS).map(([v, [l]]) => `<button type="button" data-s="${v}" class="${status === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="field" role="group" aria-labelledby="fl14"><span id="fl14">Kurir</span><div class="chips wrap" id="kKur">${KURIR.map(x => `<button type="button" class="chip xs ${kurir === x ? 'on' : ''}" data-k="${E(x)}">${E(x)}</button>`).join('')}</div></div>
        <label class="field"><span>Nomor resi <em>(opsional)</em></span><input id="kResi" value="${E(k ? k.resi : '')}" placeholder="Bisa diisi nanti" autocomplete="off" autocapitalize="characters"></label>
        <div class="row2">
          <label class="field"><span>Ongkir ditagih</span><input id="kTagih" data-money inputmode="numeric" value="${k && k.ongkirTagih ? UI.dots(k.ongkirTagih) : ''}" placeholder="0"></label>
          <label class="field"><span>Ongkir dibayar ke kurir</span><input id="kBiaya" data-money inputmode="numeric" value="${k && k.ongkirBiaya ? UI.dots(k.ongkirBiaya) : ''}" placeholder="0"></label>
        </div>
        <button type="button" class="toggle" id="kLunas" aria-pressed="${lunas}"><i></i>Ongkir sudah dibayar pelanggan</button>
        <label class="field"><span>Alamat</span><textarea id="kAlamat" rows="2" placeholder="Alamat tujuan">${E(k ? k.alamat : c.alamat)}</textarea></label>
        <label class="field"><span>Tanggal</span><input id="kTgl" type="date" value="${UI.ymd(k ? k.tanggal : null)}"></label>
        <button class="btn primary block" id="kSave" type="button">${k ? 'Simpan perubahan' : 'Simpan kiriman'}</button>
        ${k ? `<button class="btn wa block" id="kWa" type="button">${I('chat')} Kabari ${E(c.nama)} via WA</button>
          ${k.resi ? `<button class="btn ghost block" type="button" onclick="App.copyResi('${k.id}')">${I('copy')} Salin resi</button>` : ''}
          <button class="btn danger-ghost block" id="kDel" type="button">${I('trash')} Hapus kiriman</button>` : ''}
      </div>`,
      onMount(api) {
        api.$('#kSt').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; status = b.dataset.s; api.$$('#kSt button').forEach(x => UI.on(x, x === b)); });
        api.$('#kKur').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; kurir = kurir === b.dataset.k ? '' : b.dataset.k; api.$$('#kKur .chip').forEach(x => UI.on(x, x.dataset.k === kurir)); });
        api.$('#kLunas').onclick = e => { lunas = !lunas; e.currentTarget.setAttribute('aria-pressed', lunas); };

        const save = () => {
          const ids = api.$$('.check-row input:checked').map(x => x.value);
          if (!ids.length) { UI.shake(api.$('.field'), 'Pilih minimal satu barang yang dikirim'); return null; }
          const tgl = api.$('#kTgl').value ? new Date(api.$('#kTgl').value + 'T12:00:00').toISOString() : UI.now();
          const row = {
            ...(k || {}), id: k ? k.id : UI.uid('k'), pelangganId: cid, tanggal: tgl, kurir,
            resi: api.$('#kResi').value.trim(), alamat: api.$('#kAlamat').value.trim(),
            ongkirTagih: UI.num(api.$('#kTagih').value), ongkirBiaya: UI.num(api.$('#kBiaya').value),
            ongkirLunas: lunas, status
          };
          Store.upsert('Kiriman', row, { quiet: true });
          cand.forEach(o => {
            const want = ids.includes(o.id) ? row.id : (o.kirimanId === row.id ? '' : o.kirimanId);
            if (want !== o.kirimanId) Store.upsert('Pesanan', { ...o, kirimanId: want }, { quiet: true });
          });
          if (!c.alamat && row.alamat && !c.isSelf) Store.upsert('Pelanggan', { ...c, alamat: row.alamat }, { quiet: true });
          return row;
        };
        api.$('#kSave').onclick = async () => {
          const row = save(); if (!row) return;
          await api.close(); App.refresh();
          if (k) UI.toast('Kiriman diperbarui');
          else UI.toast('Kiriman dicatat', '', { label: 'Kabari via WA', fn: () => UI.wa(c.wa, Text.ship(Store.get('Kiriman', row.id))) });
        };
        if (k) {
          api.$('#kWa').onclick = () => { const row = save(); if (row) UI.wa(c.wa, Text.ship(Store.get('Kiriman', row.id))); };
          api.$('#kDel').onclick = async () => {
            const ok = await UI.confirm({ title: 'Hapus kiriman?', text: 'Barang di dalamnya kembali ke status "siap kirim".', ok: 'Hapus', danger: true });
            if (!ok) return;
            Store.all('Pesanan').filter(o => o.kirimanId === k.id).forEach(o => Store.upsert('Pesanan', { ...o, kirimanId: '' }, { quiet: true }));
            Store.remove('Kiriman', k.id, { quiet: true });
            await api.close(); App.refresh(); UI.toast('Kiriman dihapus');
          };
        }
      }
    });
  },

  /* ---------------- Ongkir dari supplier ke kamu ---------------- */
  ongkirSup({ id, supplierId, barangId } = {}) {
    const k = id ? Store.get('Kiriman', id) : null;
    let sid = k ? (k.supplierId || '') : (supplierId ?? (barangId && Store.get('Barang', barangId) ? Store.get('Barang', barangId).supplierId || '' : ''));
    let kurir = k ? k.kurir : '';
    const pilih = new Set(k ? Calc.barangIdsOf(k) : barangId ? [barangId] : []);
    const sups = Store.all('Supplier').slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama)));
    const barangChips = () => {
      const list = Store.all('Barang').filter(b => !sid || b.supplierId === sid || pilih.has(b.id))
        .sort((a, b) => String(b.tanggal || b.dibuat).localeCompare(String(a.tanggal || a.dibuat))).slice(0, 15);
      return list.length ? list.map(b => `<button type="button" class="chip xs ${pilih.has(b.id) ? 'on' : ''}" aria-pressed="${pilih.has(b.id)}" data-b="${b.id}">${E(b.nama)}</button>`).join('')
        : '<p class="hint" style="margin:0">Belum ada barang dari supplier ini.</p>';
    };
    UI.sheet({
      title: k ? 'Ongkir dari supplier' : 'Catat ongkir dari supplier',
      html: `<div class="form">
        <p class="hint" style="margin:0">Ongkir yang kamu bayar saat barang dikirim supplier ke kamu. Nominal ini mengurangi untung bersih.</p>
        <label class="field"><span>Ongkir yang kamu bayar</span><input id="osBiaya" data-money inputmode="numeric" value="${k && k.ongkirBiaya ? UI.dots(k.ongkirBiaya) : ''}" placeholder="0"></label>
        ${sups.length ? `<div class="field" role="group" aria-labelledby="flOs1"><span id="flOs1">Supplier</span><div class="chips wrap" id="osSup">${sups.map(x => `<button type="button" class="chip xs ${sid === x.id ? 'on' : ''}" aria-pressed="${sid === x.id}" data-s="${x.id}">${E(x.nama)}</button>`).join('')}</div></div>` : ''}
        <div class="field" role="group" aria-labelledby="flOs2"><span id="flOs2">Barang di kiriman ini <em>(opsional)</em></span>
          <div class="chips wrap" id="osBrg">${barangChips()}</div>
          <small class="hint" id="osHint" style="margin:6px 0 0"></small></div>
        <div class="field" role="group" aria-labelledby="flOs3"><span id="flOs3">Kurir <em>(opsional)</em></span><div class="chips wrap" id="osKur">${KURIR.filter(x => x !== 'Ambil sendiri').map(x => `<button type="button" class="chip xs ${kurir === x ? 'on' : ''}" aria-pressed="${kurir === x}" data-k="${E(x)}">${E(x)}</button>`).join('')}</div></div>
        <div class="row2">
          <label class="field"><span>Tanggal</span><input id="osTgl" type="date" value="${UI.ymd(k ? k.tanggal : null)}"></label>
          <label class="field"><span>Resi <em>(opsional)</em></span><input id="osResi" value="${E(k ? k.resi : '')}" autocomplete="off" autocapitalize="characters"></label>
        </div>
        <label class="field"><span>Catatan <em>(opsional)</em></span><input id="osCt" value="${E(k ? k.catatan : '')}" placeholder="Contoh: kiriman batch 2" autocomplete="off"></label>
        <button class="btn primary block" id="osSave" type="button">${k ? 'Simpan perubahan' : 'Simpan ongkir'}</button>
        ${k ? `<button class="btn danger-ghost block" id="osDel" type="button">${I('trash')} Hapus catatan ongkir</button>` : ''}
      </div>`,
      onMount(api) {
        const hint = () => {
          const n = pilih.size;
          api.$('#osHint').textContent = n === 0 ? 'Tidak memilih barang: ongkir hanya mengurangi untung total.'
            : n === 1 ? 'Ongkir dibebankan ke barang ini.' : `Ongkir dibagi ke ${n} barang sesuai jumlah pcs yang datang.`;
        };
        hint();
        if (api.$('#osSup')) api.$('#osSup').addEventListener('click', e => {
          const b = e.target.closest('[data-s]'); if (!b) return;
          sid = sid === b.dataset.s ? '' : b.dataset.s;
          api.$$('#osSup .chip').forEach(x => UI.on(x, x.dataset.s === sid));
          api.$('#osBrg').innerHTML = barangChips();
        });
        api.$('#osBrg').addEventListener('click', e => {
          const b = e.target.closest('[data-b]'); if (!b) return;
          pilih.has(b.dataset.b) ? pilih.delete(b.dataset.b) : pilih.add(b.dataset.b);
          UI.on(b, pilih.has(b.dataset.b)); hint();
        });
        api.$('#osKur').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; kurir = kurir === b.dataset.k ? '' : b.dataset.k; api.$$('#osKur .chip').forEach(x => UI.on(x, x.dataset.k === kurir)); });
        api.$('#osSave').onclick = async () => {
          const biaya = UI.num(api.$('#osBiaya').value);
          if (!biaya) return UI.shake(api.$('#osBiaya'), 'Isi nominal ongkirnya dulu ya');
          const tgl = api.$('#osTgl').value ? new Date(api.$('#osTgl').value + 'T12:00:00').toISOString() : UI.now();
          Store.upsert('Kiriman', {
            ...(k || {}), id: k ? k.id : UI.uid('k'), arah: 'masuk', supplierId: sid, barangIds: [...pilih].join(','),
            pelangganId: '', tanggal: tgl, kurir, resi: api.$('#osResi').value.trim(), catatan: api.$('#osCt').value.trim(),
            ongkirBiaya: biaya, ongkirTagih: 0, ongkirLunas: true, status: 'diterima'
          }, { quiet: true });
          await api.close(); App.refresh(); UI.toast(k ? 'Ongkir diperbarui' : `Ongkir ${UI.rp(biaya)} dicatat. Untung sudah dikurangi`);
        };
        if (k) api.$('#osDel').onclick = async () => {
          const ok = await UI.confirm({ title: 'Hapus catatan ongkir?', text: 'Untung kembali dihitung tanpa ongkir ini.', ok: 'Hapus', danger: true });
          if (!ok) return;
          Store.remove('Kiriman', k.id, { quiet: true });
          await api.close(); App.refresh(); UI.toast('Catatan ongkir dihapus');
        };
      }
    });
  },

  /* ---------------- Supplier ---------------- */
  supplier(id) {
    const s = id ? Store.get('Supplier', id) : null;
    const r = s ? Calc.supplierRate(id) : null;
    const items = s ? Store.all('Barang').filter(b => b.supplierId === id) : [];
    const ongs = s ? Calc.ongkirSupplier(id).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal))) : [];
    const ongTot = ongs.reduce((a, k) => a + (+k.ongkirBiaya || 0), 0);
    UI.sheet({
      title: s ? s.nama : 'Supplier baru',
      html: `<div class="form">
        ${s && r.tot ? `<div class="kpis" style="margin-top:0"><div class="kpi"><b>${r.rate}%</b><small>peluang dapat</small></div><div class="kpi"><b>${r.dapat}</b><small>pcs dapat</small></div><div class="kpi"><b>${items.length}</b><small>barang</small></div></div>` : ''}
        <label class="field"><span>Nama supplier</span><input id="sNm" value="${E(s ? s.nama : '')}" placeholder="Contoh: Grosir Bu Ani" autocomplete="off"></label>
        <label class="field"><span>Kontak <em>(opsional)</em></span><input id="sKt" type="tel" inputmode="tel" value="${E(s ? s.kontak : '')}" placeholder="Nomor WA / telepon" autocomplete="off"></label>
        <label class="field"><span>Catatan <em>(opsional)</em></span><textarea id="sCt" rows="2" placeholder="Jadwal update stok, minimal order…">${E(s ? s.catatan : '')}</textarea></label>
        ${s ? `<div class="field" role="group" aria-labelledby="flSo"><span id="flSo">Ongkir dari supplier</span>
          ${ongs.length ? `<section class="card" style="margin:0;padding:4px 14px">${ongs.map(k => `<button type="button" class="mini-row" style="width:100%;text-align:left" onclick="UI.closeAll().then(()=>Sheets.ongkirSup({id:'${k.id}'}))"><span><b>${UI.rp(k.ongkirBiaya)}</b><small class="muted" style="display:block">${UI.rel(k.tanggal || k.dibuat)}${Calc.barangIdsOf(k).length ? ' · ' + Calc.barangIdsOf(k).map(b => Store.get('Barang', b)).filter(Boolean).map(b => E(b.nama)).join(', ') : ' · untung total'}</small></span>${I('chev', 'chev')}</button>`).join('')}
            <div class="total-box" style="margin:8px 0 10px"><span>Total ongkir</span><b>${UI.rp(ongTot)}</b></div></section>` : ''}
          <button class="btn ghost block" type="button" onclick="UI.closeAll().then(()=>Sheets.ongkirSup({supplierId:'${s.id}'}))">${I('plus')} Catat ongkir dari supplier</button></div>` : ''}
        <button class="btn primary block" id="sSave" type="button">${s ? 'Simpan perubahan' : 'Simpan supplier'}</button>
        ${s && s.kontak ? `<button class="btn wa block" type="button" onclick="UI.wa('${E(UI.waNum(s.kontak))}','')">${I('chat')} Chat supplier</button>` : ''}
        ${s && !items.length && !ongs.length ? `<button class="btn danger-ghost block" id="sDel" type="button">${I('trash')} Hapus supplier</button>` : ''}
      </div>`,
      onMount(api) {
        api.$('#sSave').onclick = async () => {
          const nama = api.$('#sNm').value.trim();
          if (!nama) return UI.shake(api.$('#sNm'), 'Nama supplier diisi dulu ya');
          Store.upsert('Supplier', { ...(s || {}), id: s ? s.id : UI.uid('s'), nama, kontak: api.$('#sKt').value.trim(), catatan: api.$('#sCt').value.trim() }, { quiet: true });
          await api.close(); App.refresh(); UI.toast('Supplier disimpan');
        };
        if (api.$('#sDel')) api.$('#sDel').onclick = async () => {
          const ok = await UI.confirm({ title: 'Hapus supplier?', text: `${E(s.nama)} akan dihapus.`, ok: 'Hapus', danger: true });
          if (!ok) return;
          Store.remove('Supplier', id, { quiet: true });
          await api.close(); App.refresh();
        };
      }
    });
  },

  /* ---------------- Status sinkron ---------------- */
  sync() {
    const demo = Api.isDemo();
    const label = { ok: 'Semua data sudah tersimpan di Google Sheet', pending: 'Ada perubahan yang lagi dikirim…', sync: 'Lagi sinkron…', offline: 'Lagi offline. Perubahan disimpan di HP dan dikirim otomatis saat ada sinyal.', error: 'Ada masalah koneksi.', demo: 'Mode coba: data hanya ada di HP ini.' }[Sync.state];
    UI.sheet({
      title: 'Status data',
      html: `<div class="form">
        <div class="callout ${Sync.state === 'error' ? 'bad' : demo ? 'self' : 'info'}"><b>${label}</b>${Sync.state === 'error' && Sync.lastError ? E(Sync.lastError) : ''}
          ${!demo && Store.meta.lastPull ? `<div style="margin-top:4px">Terakhir ambil data: ${UI.rel(new Date(Store.meta.lastPull).toISOString()).toLowerCase()} ${new Date(Store.meta.lastPull).toTimeString().slice(0, 5)}</div>` : ''}
          ${Sync.queue.length ? `<div style="margin-top:4px">${Sync.queue.length} perubahan menunggu dikirim.</div>` : ''}</div>
        ${demo ? `<button class="btn primary block" type="button" onclick="UI.closeAll().then(()=>Sheets.connect())">${I('link')} Sambungkan ke Google Sheet</button>`
          : `<button class="btn primary block" type="button" id="syNow">${I('refresh')} Sinkron sekarang</button>
             ${Store.meta.sheetUrl ? `<a class="btn ghost block" href="${E(Store.meta.sheetUrl)}" target="_blank" rel="noopener">${I('table')} Buka Google Sheet</a>` : ''}`}
      </div>`,
      onMount(api) {
        if (api.$('#syNow')) api.$('#syNow').onclick = async () => {
          const b = api.$('#syNow'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Sinkron…';
          await App.pull(false, true);
          api.close();
        };
      }
    });
  },

  /* ---------------- Template pesan ---------------- */
  template(key) {
    const t = TEMPLATES[key];
    UI.sheet({
      title: t.label,
      html: `<div class="form">
        <p class="hint" style="margin:0">${t.hint}. Ketuk kata kunci untuk menyisipkan. Saat dipakai, kata kunci otomatis diganti isi aslinya.</p>
        <div class="chips wrap" id="tVars">${t.vars.map(([k, l]) => `<button type="button" class="chip xs" data-k="${k}">{${k}} <small>${l}</small></button>`).join('')}</div>
        <label class="sr-only" for="tTxt">Isi template ${t.label}</label><textarea id="tTxt" rows="10" spellcheck="false">${E(Text.tpl(key))}</textarea>
        <div class="field" role="group" aria-labelledby="fl15"><span id="fl15">Pratinjau <em>(pakai contoh)</em></span><div class="callout info preview-text" id="tPrev" style="min-height:0"></div></div>
        <div class="btn-row" style="margin-top:0"><button class="btn ghost" id="tReset" type="button">Kembalikan bawaan</button><button class="btn primary" id="tSave" type="button">Simpan</button></div>
      </div>`,
      onMount(api) {
        const ta = api.$('#tTxt');
        const prev = () => { api.$('#tPrev').textContent = Text.fill(ta.value, Text.sampleVars()) || '(kosong)'; };
        ta.addEventListener('input', prev); prev();
        api.$('#tVars').addEventListener('click', e => {
          const b = e.target.closest('[data-k]'); if (!b) return;
          const ins = '{' + b.dataset.k + '}';
          const a = typeof ta.selectionStart === 'number' ? ta.selectionStart : ta.value.length, z = typeof ta.selectionEnd === 'number' ? ta.selectionEnd : a;
          ta.value = ta.value.slice(0, a) + ins + ta.value.slice(z);
          ta.focus(); ta.setSelectionRange(a + ins.length, a + ins.length); prev();
        });
        api.$('#tReset').onclick = () => { ta.value = t.def; prev(); UI.toast('Teks bawaan dipasang. Ketuk Simpan untuk memakai.'); };
        api.$('#tSave').onclick = async () => {
          const v = ta.value.trim();
          if (!v) return UI.shake(ta, 'Teksnya jangan kosong ya');
          Store.setSetting(key, v === t.def.trim() ? '' : v);
          await api.close(); App.refresh();
          UI.toast('Template disimpan. Berlaku di kedua HP');
        };
      }
    });
  },

  /* ---------------- Rincian untung per pesanan ---------------- */
  untung(itemId) {
    const all = Calc.ordersOf(itemId).filter(o => o.status !== 'batal');
    const dapat = all.filter(o => o.status === 'dapat'), base = dapat.length ? dapat : all;
    const rows = base.filter(o => !Calc.isSelf(o)), self = base.filter(Calc.isSelf);
    const kotor = rows.reduce((a, o) => a + Calc.profit(o), 0);
    const ongs = Calc.masuk().filter(k => Calc.bagianOngkir(k, itemId) > 0);
    const ong = ongs.reduce((a, k) => a + Calc.bagianOngkir(k, itemId), 0);
    const tot = kotor - ong;
    UI.sheet({
      title: dapat.length ? 'Rincian untung' : 'Perkiraan untung',
      html: `<p class="hint">${dapat.length ? 'Dari pesanan yang sudah dapat.' : 'Belum ada yang dapat, jadi dihitung dari semua yang list.'} Untung = (harga jual − modal) × jumlah − diskon${ong ? ' − ongkir dari supplier' : ''}.</p>
        <section class="card" style="margin-top:6px">${rows.length ? rows.map(o => {
          const c = Calc.cust(o), hemat = (+o.diskon || 0) + Calc.autoDisc(o);
          return `<div class="mini-row" style="display:block" onclick="Sheets.order('${o.id}')"><div style="display:flex;justify-content:space-between;gap:10px"><span><b>${E(c ? c.nama : '-')}</b> · ${o.qty} pcs</span><b>${UI.rp(Calc.profit(o))}</b></div>
            <small class="muted">(${UI.rp(o.hargaJual)} − modal ${UI.rp(o.hargaModal)}) × ${o.qty}${hemat ? ` − diskon ${UI.rp(hemat)}` : ''}</small></div>`;
        }).join('') : '<p class="muted">Belum ada pesanan.</p>'}
        ${ongs.map(k => { const bag = Calc.bagianOngkir(k, itemId), n = Calc.barangIdsOf(k).length; return `<button type="button" class="mini-row" style="display:block;width:100%;text-align:left" onclick="UI.closeAll().then(()=>Sheets.ongkirSup({id:'${k.id}'}))"><div style="display:flex;justify-content:space-between;gap:10px"><span><b>Ongkir dari supplier</b> · ${UI.rel(k.tanggal || k.dibuat).toLowerCase()}</span><b>−${UI.rp(bag)}</b></div>
          <small class="muted">${n > 1 ? `Bagian barang ini dari ${UI.rp(k.ongkirBiaya)}, dibagi ke ${n} barang sesuai pcs` : 'Dibebankan penuh ke barang ini'}</small></button>`; }).join('')}
        <div class="total-box" style="margin-top:12px"><span>Total untung</span><b>${UI.rp(tot)}</b></div></section>
        <button class="btn ghost block" type="button" style="margin-top:10px" onclick="UI.closeAll().then(()=>Sheets.ongkirSup({barangId:'${itemId}'}))">${I('truck')} Catat ongkir dari supplier</button>
        ${self.length ? `<p class="hint" style="margin-top:10px">${self.reduce((a, o) => a + (+o.qty || 0), 0)} pcs buat kamu sendiri tidak dihitung sebagai untung.</p>` : ''}`
    });
  },

  /* ---------------- Stok dari supplier ---------------- */
  stok(itemId) {
    const vs = Calc.variantsOf(itemId);
    UI.sheet({
      title: 'Stok dari supplier',
      html: `<p class="hint">Jumlah barang yang kamu pegang dari supplier, termasuk lebihan. Sisa = stok − yang sudah dibagi ke pembeli. Pesanan yang dibatalkan otomatis kembali jadi sisa.</p>
        <section class="card" style="margin-top:6px;padding:4px 16px">${vs.map(v => {
          const st = Calc.stokOf(v);
          return `<div class="jrow"><div><b>${vs.length > 1 ? E(v.nama) : 'Total stok'}</b><small id="sk_${v.id}">${st.dipakai} sudah dibagi · sisa ${st.sisa}</small></div>${UI.stepper('st_' + v.id, Math.max(st.stok, st.dipakai), st.dipakai)}</div>`;
        }).join('')}</section>
        <button class="btn primary block" id="skSave" type="button" style="margin-top:14px">Simpan stok</button>`,
      onMount(api) {
        api.el.addEventListener('input', () => vs.forEach(v => {
          const st = Calc.stokOf(v), n = UI.num(api.$('#st_' + v.id).value);
          api.$('#sk_' + v.id).textContent = `${st.dipakai} sudah dibagi · sisa ${Math.max(0, n - st.dipakai)}`;
        }));
        api.$('#skSave').onclick = async () => {
          vs.forEach(v => {
            const st = Calc.stokOf(v), n = Math.max(st.dipakai, UI.num(api.$('#st_' + v.id).value));
            if (n !== (+v.stokDapat || 0)) Store.upsert('Varian', { ...v, stokDapat: n }, { quiet: true });
          });
          await api.close(); App.refresh(); UI.toast('Stok disimpan');
        };
      }
    });
  },

  /* ---------------- Sambungkan ke Google Sheet ---------------- */
  connect() {
    const cfg = Api.isDemo() ? { url: '', key: '' } : Api.cfg();
    UI.sheet({
      title: 'Sambungkan Google Sheet',
      html: `<div class="form">
        <label class="field"><span>Kode sambung <em>(dari HP lain)</em></span><input id="xCode" placeholder="JSTP1.xxxxx" autocomplete="off"></label>
        <p class="hint" style="text-align:center;margin:0">atau isi manual</p>
        <label class="field"><span>Link Web App</span><input id="xUrl" type="url" value="${E(cfg.url)}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off"></label>
        <label class="field"><span>Kode kunci</span><input id="xKey" value="${E(cfg.key)}" placeholder="JSTP-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters"></label>
        ${Api.isDemo() ? '<p class="callout self">Data contoh akan dihapus dan diganti data dari Google Sheet kamu.</p>' : ''}
        <button class="btn primary block" id="xGo" type="button">${I('link')} Sambungkan</button>
      </div>`,
      onMount(api) {
        api.$('#xGo').onclick = async () => {
          const ok = await App.connect(api.$('#xCode').value, api.$('#xUrl').value, api.$('#xKey').value, api.$('#xGo'));
          if (ok) { await api.close(); App.go('#/beranda'); }
        };
      }
    });
  }
};
