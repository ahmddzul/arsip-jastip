'use strict';
/* =========================================================
   demo.js — data contoh untuk "Mode coba" (tanpa Google Sheet).
   Data ini hanya ada di HP dan hilang saat aplikasi disambungkan.
   ========================================================= */

const Demo = {
  seed() {
    const ago = (d, h = 10) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, 15, 0, 0); return x.toISOString(); };
    const put = (t, r) => Store._put(t, r);

    put('Supplier', { id: 's1', nama: 'Grosir Bu Ani', kontak: '0812 3456 7890', catatan: 'Update stok tiap Senin', dibuat: ago(60) });
    put('Supplier', { id: 's2', nama: 'Informa Mall Kota', kontak: '', catatan: 'Promo akhir bulan', dibuat: ago(60) });
    put('Supplier', { id: 's3', nama: 'Reseller Kosmetik Rina', kontak: '0857 1111 2222', catatan: '', dibuat: ago(40) });

    const custs = [
      ['c1', 'Rina Amelia', '081234567801', 'Jl. Melati No. 12, Cikarang Utara'],
      ['c2', 'Sari Wulandari', '081234567802', 'Perum Grand Cikarang City Blok B3'],
      ['c3', 'Bu Dewi', '081234567803', ''],
      ['c4', 'Mega Putri', '081234567804', 'Jl. Kenanga 5, Bekasi'],
      ['c5', 'Tika', '', ''],
      ['c6', 'Ayu Lestari', '081234567806', 'Apartemen Meikarta Tower 2']
    ];
    custs.forEach(([id, nama, wa, alamat]) => put('Pelanggan', { id, nama, wa, alamat, catatan: '', isSelf: false, dibuat: ago(50) }));
    put('Pelanggan', { id: SELF_ID, nama: 'Aku sendiri', wa: '', alamat: '', catatan: 'Barang yang aku list buat diri sendiri', isSelf: true, dibuat: ago(60) });

    put('Barang', { id: 'b1', nama: 'Tumbler Stainless 1L', kategori: 'Perabotan', supplierId: 's1', deskripsi: 'Tahan panas & dingin 12 jam', fotoUrl: '', fotoId: '', status: 'tutup', tanggal: ago(12), diskonMin: 3, diskonRp: 5000, dibuat: ago(12) });
    put('Varian', { id: 'v1a', barangId: 'b1', nama: 'Sage', hargaModal: 75000, hargaJual: 90000, urut: 1 });
    put('Varian', { id: 'v1b', barangId: 'b1', nama: 'Cream', hargaModal: 75000, hargaJual: 90000, urut: 2 });

    put('Barang', { id: 'b2', nama: 'Rak Lipat Serbaguna', kategori: 'Informa', supplierId: 's2', deskripsi: '', fotoUrl: '', fotoId: '', status: 'open', tanggal: ago(2), diskonMin: 0, diskonRp: 0, dibuat: ago(2) });
    put('Varian', { id: 'v2a', barangId: 'b2', nama: 'Kecil', hargaModal: 119000, hargaJual: 134000, urut: 1 });
    put('Varian', { id: 'v2b', barangId: 'b2', nama: 'Besar', hargaModal: 169000, hargaJual: 189000, urut: 2 });

    put('Barang', { id: 'b3', nama: 'Cushion Glow SPF 35', kategori: 'Kosmetik', supplierId: 's3', deskripsi: 'Shade 21 & 23', fotoUrl: '', fotoId: '', status: 'open', tanggal: ago(0, 8), diskonMin: 0, diskonRp: 0, dibuat: ago(0, 8) });
    put('Varian', { id: 'v3a', barangId: 'b3', nama: 'Shade 21', hargaModal: 98000, hargaJual: 110000, urut: 1 });
    put('Varian', { id: 'v3b', barangId: 'b3', nama: 'Shade 23', hargaModal: 98000, hargaJual: 110000, urut: 2 });

    put('Barang', { id: 'b4', nama: 'Kue Kering Nastar Premium', kategori: 'Makanan', supplierId: 's1', deskripsi: 'Toples 500 gr', fotoUrl: '', fotoId: '', status: 'tutup', tanggal: ago(40), diskonMin: 0, diskonRp: 0, dibuat: ago(40) });
    put('Varian', { id: 'v4a', barangId: 'b4', nama: 'Standar', hargaModal: 85000, hargaJual: 100000, urut: 1 });

    let u = 0;
    const o = (id, b, v, c, qty, status, bayar, extra = {}) => {
      const vr = Store.get('Varian', v);
      put('Pesanan', Object.assign({
        id, barangId: b, varianId: v, pelangganId: c, qty, qtyMinta: 0, urut: ++u, status,
        hargaModal: vr.hargaModal, hargaJual: vr.hargaJual, diskon: 0, bayar,
        tglBayar: bayar === 'lunas' ? ago(5) : '', tglDapat: status === 'dapat' ? ago(10) : '',
        solusi: '', kirimanId: '', catatan: '', dibuat: ago(12)
      }, extra));
    };
    // Tumbler (sudah selesai)
    o('o1', 'b1', 'v1a', 'c1', 3, 'dapat', 'lunas', { kirimanId: 'k1' });
    o('o2', 'b1', 'v1b', 'c2', 1, 'dapat', 'belum');
    o('o3', 'b1', 'v1a', 'c3', 1, 'dapat', 'lunas');
    o('o4', 'b1', 'v1b', 'c4', 2, 'tidak', 'lunas');
    o('o5', 'b1', 'v1a', SELF_ID, 1, 'dapat', 'belum');
    // Nastar (bulan lalu)
    u = 0;
    o('o6', 'b4', 'v4a', 'c1', 2, 'dapat', 'lunas', { tglDapat: ago(38), kirimanId: 'k0' });
    o('o7', 'b4', 'v4a', 'c6', 3, 'dapat', 'lunas', { tglDapat: ago(38), kirimanId: 'k2' });
    o('o8', 'b4', 'v4a', 'c5', 1, 'dapat', 'lunas', { tglDapat: ago(37), kirimanId: 'k3' });
    // Rak (masih open, sebagian sudah dibagi)
    u = 0;
    o('o9', 'b2', 'v2b', 'c4', 1, 'dapat', 'belum', { tglDapat: ago(1), dibuat: ago(2) });
    o('o10', 'b2', 'v2a', 'c6', 2, 'dapat', 'belum', { tglDapat: ago(1), dibuat: ago(2) });
    o('o11', 'b2', 'v2b', 'c5', 1, 'list', 'lunas', { dibuat: ago(2) });
    // Cushion (baru open hari ini)
    u = 0;
    o('o12', 'b3', 'v3a', 'c2', 1, 'list', 'belum', { dibuat: ago(0, 9) });
    o('o13', 'b3', 'v3b', 'c1', 1, 'list', 'belum', { dibuat: ago(0, 9) });
    o('o14', 'b3', 'v3a', 'c3', 2, 'list', 'belum', { dibuat: ago(0, 9) });
    o('o15', 'b3', 'v3a', SELF_ID, 1, 'list', 'belum', { dibuat: ago(0, 9) });

    put('Kiriman', { id: 'k0', pelangganId: 'c1', tanggal: ago(36), kurir: 'JNE', resi: 'JNE0012345678', alamat: 'Jl. Melati No. 12, Cikarang Utara', ongkirTagih: 12000, ongkirBiaya: 10000, ongkirLunas: true, status: 'diterima', catatan: '', dibuat: ago(36) });
    put('Kiriman', { id: 'k2', pelangganId: 'c6', tanggal: ago(36), kurir: 'GoSend', resi: '', alamat: 'Apartemen Meikarta Tower 2', ongkirTagih: 18000, ongkirBiaya: 18000, ongkirLunas: true, status: 'diterima', catatan: '', dibuat: ago(36) });
    put('Kiriman', { id: 'k3', pelangganId: 'c5', tanggal: ago(35), kurir: 'Ambil sendiri', resi: '', alamat: '', ongkirTagih: 0, ongkirBiaya: 0, ongkirLunas: true, status: 'diterima', catatan: '', dibuat: ago(35) });
    put('Kiriman', { id: 'k1', pelangganId: 'c1', tanggal: ago(3), kurir: 'J&T', resi: 'JX4402918377', alamat: 'Jl. Melati No. 12, Cikarang Utara', ongkirTagih: 15000, ongkirBiaya: 12000, ongkirLunas: false, status: 'dikirim', catatan: '', dibuat: ago(3) });

    Store.save();
  }
};
