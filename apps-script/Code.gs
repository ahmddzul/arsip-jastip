/**
 * ============================================================
 *  ARSIP JASTIP · Backend Google Apps Script
 * ============================================================
 *  Cara pakai singkat:
 *  1. Buka Google Sheet kosong > Extensions (Ekstensi) > Apps Script
 *  2. Hapus semua isi Code.gs, lalu tempel SELURUH isi file ini
 *  3. Simpan, pilih fungsi "setup" lalu klik Run (Jalankan)
 *  4. Deploy > New deployment > Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Salin link Web App + kode kunci (ada di tab "Pengaturan")
 *     lalu masukkan ke aplikasi.
 * ============================================================
 */

const SERVER_VERSION = 2;

const SCHEMA = {
  Pengaturan: ['kunci', 'nilai'],
  Supplier: ['id', 'nama', 'kontak', 'catatan', 'dibuat', 'diubah'],
  Barang: ['id', 'nama', 'kategori', 'supplierId', 'deskripsi', 'fotoId', 'fotoUrl', 'status', 'tanggal', 'diskonMin', 'diskonRp', 'dibuat', 'diubah'],
  Varian: ['id', 'barangId', 'nama', 'hargaModal', 'hargaJual', 'urut', 'stokDapat', 'dibuat', 'diubah'],
  Pelanggan: ['id', 'nama', 'panggilan', 'wa', 'alamat', 'catatan', 'isSelf', 'dibuat', 'diubah'],
  Pesanan: ['id', 'barangId', 'varianId', 'pelangganId', 'qty', 'qtyMinta', 'urut', 'status', 'hargaModal', 'hargaJual', 'diskon', 'bayar', 'tglBayar', 'tglDapat', 'solusi', 'kirimanId', 'catatan', 'dibuat', 'diubah'],
  Kiriman: ['id', 'pelangganId', 'tanggal', 'kurir', 'resi', 'alamat', 'ongkirTagih', 'ongkirBiaya', 'ongkirLunas', 'status', 'catatan', 'dibuat', 'diubah']
};

const DATA_TABLES = ['Supplier', 'Barang', 'Varian', 'Pelanggan', 'Pesanan', 'Kiriman'];
const NUM_FIELDS = ['qty', 'qtyMinta', 'urut', 'hargaModal', 'hargaJual', 'diskon', 'diskonMin', 'diskonRp', 'ongkirTagih', 'ongkirBiaya', 'stokDapat'];
const BOOL_FIELDS = ['isSelf', 'ongkirLunas'];

// Pengaturan bawaan. Bisa diubah dari aplikasi (menu Pengaturan).
const DEFAULTS = {
  namaPanggilan: '',
  namaToko: '',
  markupDefault: '10000',
  penutupPromosi: 'Langsung reply nama + varian ya kak. Siapa cepat dia dapat! 🏃‍♀️',
  infoBayar: '',
  panggilanDefault: 'Kak'
};

// Kunci berhuruf kapital (KODE_KUNCI, FOLDER_FOTO) bersifat rahasia/sistem:
// tidak dikirim ke aplikasi dan tidak bisa diubah dari aplikasi.
const SYSTEM_KEY = /^[A-Z_]+$/;

/* ---------------- Menu di Google Sheet ---------------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Arsip Jastip')
    .addItem('Siapkan database', 'setup')
    .addItem('Lihat kode kunci', 'lihatKodeKunci')
    .addItem('Buat kode kunci baru', 'gantiKodeKunci')
    .addToUi();
}

/** Jalankan sekali di awal. Aman dijalankan ulang (tidak menghapus data). */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SCHEMA).forEach(function (name) { ensureSheet_(ss, name); });

  const s = readSettings_();
  Object.keys(DEFAULTS).forEach(function (k) {
    if (s[k] === undefined) writeSetting_(k, DEFAULTS[k]);
  });
  if (!s.KODE_KUNCI) writeSetting_('KODE_KUNCI', newKey_());
  getFolder_(); // sekalian minta izin Google Drive untuk foto

  ['Sheet1', 'Lembar1', 'Lembar 1'].forEach(function (n) {
    const sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  const key = readSettings_().KODE_KUNCI;
  Logger.log('Database siap. Kode kunci kamu: ' + key);
  notify_('Database siap', 'Kode kunci kamu:\n\n' + key +
    '\n\nKode ini juga tersimpan di tab "Pengaturan". Kamu butuh kode ini dan link Web App untuk menyambungkan aplikasi.');
  return key;
}

function lihatKodeKunci() {
  const key = readSettings_().KODE_KUNCI || '(belum ada, jalankan "Siapkan database")';
  Logger.log('Kode kunci: ' + key);
  notify_('Kode kunci', key);
}

/** Pakai kalau kode kunci bocor. HP yang sudah tersambung harus diisi kode baru. */
function gantiKodeKunci() {
  const key = newKey_();
  writeSetting_('KODE_KUNCI', key);
  Logger.log('Kode kunci baru: ' + key);
  notify_('Kode kunci baru', key + '\n\nMasukkan kode ini lagi di aplikasi (Pengaturan > Koneksi) di semua HP.');
}

/* ---------------- Endpoint Web App ---------------- */

function doGet() {
  return json_({ ok: true, pesan: 'API Arsip Jastip aktif. Buka aplikasinya, bukan halaman ini.' });
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const s = readSettings_();
    if (!s.KODE_KUNCI) throw new Error('BELUM_SETUP');
    if (String(req.key || '').trim() !== s.KODE_KUNCI) throw new Error('KUNCI_SALAH');
    out = { ok: true, data: route_(req, s) };
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return json_(out);
}

function route_(req, s) {
  switch (req.action) {
    case 'ping':
      return { namaPanggilan: s.namaPanggilan || '', namaToko: s.namaToko || '', serverVersion: SERVER_VERSION };

    case 'getAll': {
      const tables = {};
      DATA_TABLES.forEach(function (t) { tables[t] = readTable_(t); });
      const settings = {};
      Object.keys(s).forEach(function (k) { if (!SYSTEM_KEY.test(k)) settings[k] = s[k]; });
      return {
        tables: tables,
        settings: settings,
        sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        serverVersion: SERVER_VERSION,
        serverTime: new Date().toISOString()
      };
    }

    case 'batch': {
      const lock = LockService.getScriptLock();
      lock.waitLock(25000);
      try {
        const r = applyOps_(req.ops || []);
        SpreadsheetApp.flush();
        return r;
      } finally {
        lock.releaseLock();
      }
    }

    case 'uploadPhoto':
      return uploadPhoto_(req);

    case 'deletePhotos':
      return deletePhotos_(req.ids || []);

    default:
      throw new Error('AKSI_TIDAK_DIKENAL');
  }
}

/* ---------------- Baca & tulis data ---------------- */

function readTable_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const h = v[0].map(String);
  const out = [];
  for (let r = 1; r < v.length; r++) {
    const row = v[r];
    if (!row[0]) continue;
    const o = {};
    h.forEach(function (k, i) { if (k) o[k] = cell_(k, row[i]); });
    out.push(o);
  }
  return out;
}

function cell_(k, val) {
  if (val instanceof Date) val = val.toISOString();
  if (NUM_FIELDS.indexOf(k) >= 0) return Number(String(val).replace(/[^\d-]/g, '')) || 0;
  if (BOOL_FIELDS.indexOf(k) >= 0) return val === true || String(val).toUpperCase() === 'TRUE';
  return val === null || val === undefined ? '' : String(val);
}

function toCell_(v) {
  if (v === true) return 'TRUE';
  if (v === false || v === null || v === undefined) return '';
  return String(v);
}

function applyOps_(ops) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cache = {};

  function ctx(name) {
    if (!cache[name]) {
      const sh = ss.getSheetByName(name) || ensureSheet_(ss, name);
      cache[name] = { sh: sh, h: sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) };
    }
    return cache[name];
  }

  function findRow(c, id) {
    const n = c.sh.getLastRow();
    if (n < 2) return -1;
    const ids = c.sh.getRange(2, 1, n - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
    return -1;
  }

  let done = 0;
  ops.forEach(function (op) {
    if (op.op === 'setting') {
      if (!op.key || SYSTEM_KEY.test(op.key)) return;
      writeSetting_(op.key, op.value);
      done++;
      return;
    }
    if (DATA_TABLES.indexOf(op.table) < 0) throw new Error('TABEL_TIDAK_DIKENAL');
    const c = ctx(op.table);

    if (op.op === 'upsert') {
      const row = op.row || {};
      if (!row.id) return;
      // kolom baru dari aplikasi versi terbaru otomatis ditambahkan ke sheet
      Object.keys(row).forEach(function (k) {
        if (c.h.indexOf(k) < 0 && /^[A-Za-z][A-Za-z0-9]{0,40}$/.test(k)) {
          c.h.push(k);
          c.sh.getRange(1, c.h.length).setValue(k).setFontWeight('bold').setBackground('#EEF1FF').setFontColor('#28306B');
        }
      });
      const r = findRow(c, row.id);
      const cur = r > 0 ? c.sh.getRange(r, 1, 1, c.h.length).getValues()[0] : c.h.map(function () { return ''; });
      const vals = c.h.map(function (k, i) {
        if (Object.prototype.hasOwnProperty.call(row, k)) return toCell_(row[k]);
        const x = cur[i];
        if (x instanceof Date) return x.toISOString();
        return x === null || x === undefined ? '' : String(x);
      });
      const target = r > 0 ? r : c.sh.getLastRow() + 1;
      c.sh.getRange(target, 1, 1, vals.length).setNumberFormat('@').setValues([vals]);
      done++;
    } else if (op.op === 'remove') {
      const r = findRow(c, op.id);
      if (r > 0) c.sh.deleteRow(r);
      done++;
    }
  });
  return { done: done };
}

/* ---------------- Pengaturan ---------------- */

function readSettings_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pengaturan');
  const o = {};
  if (!sh || sh.getLastRow() < 2) return o;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (r[0] !== '' && r[0] !== null) o[String(r[0])] = String(r[1]);
  });
  return o;
}

function writeSetting_(k, v) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Pengaturan') || ensureSheet_(ss, 'Pengaturan');
  const n = sh.getLastRow();
  if (n >= 2) {
    const keys = sh.getRange(2, 1, n - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]) === k) {
        sh.getRange(i + 2, 2).setNumberFormat('@').setValue(String(v));
        return;
      }
    }
  }
  sh.getRange(n + 1, 1, 1, 2).setNumberFormat('@').setValues([[k, String(v)]]);
}

/* ---------------- Foto (Google Drive) ---------------- */

function getFolder_() {
  const s = readSettings_();
  if (s.FOLDER_FOTO) {
    try { return DriveApp.getFolderById(s.FOLDER_FOTO); } catch (e) { /* folder terhapus, buat baru */ }
  }
  const f = DriveApp.createFolder('Foto Arsip Jastip');
  writeSetting_('FOLDER_FOTO', f.getId());
  return f;
}

function uploadPhoto_(req) {
  if (!req.data) throw new Error('FOTO_KOSONG');
  const bytes = Utilities.base64Decode(req.data);
  if (bytes.length > 5 * 1024 * 1024) throw new Error('FOTO_TERLALU_BESAR');
  const name = String(req.name || 'foto').replace(/[\\/:*?"<>|]/g, '').slice(0, 80) || 'foto';
  const blob = Utilities.newBlob(bytes, req.mime || 'image/jpeg', name);
  const file = getFolder_().createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) { /* beberapa akun kantor membatasi berbagi link */ }
  const id = file.getId();
  return { fotoId: id, fotoUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000' };
}

function deletePhotos_(ids) {
  let n = 0;
  ids.forEach(function (id) {
    try { DriveApp.getFileById(id).setTrashed(true); n++; } catch (e) { /* sudah tidak ada */ }
  });
  return { deleted: n };
}

/* ---------------- Utilitas ---------------- */

function ensureSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const want = SCHEMA[name];
  const lastCol = sh.getLastColumn();
  const have = lastCol ? sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
  want.forEach(function (h) { if (have.indexOf(h) < 0) have.push(h); });
  sh.getRange(1, 1, 1, have.length).setValues([have])
    .setFontWeight('bold').setBackground('#EEF1FF').setFontColor('#28306B');
  sh.setFrozenRows(1);
  return sh;
}

function newKey_() {
  const raw = Utilities.getUuid().replace(/-/g, '').toUpperCase();
  return 'JSTP-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12);
}

function notify_(title, msg) {
  try {
    SpreadsheetApp.getUi().alert(title, msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) { /* dijalankan dari editor: lihat hasilnya di Execution log */ }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
