'use strict';
/* faq.js: halaman FAQ & panduan di dalam aplikasi */

V.faq = () => {
  const q = (t, body, open = false) => `<details${open ? ' open' : ''}><summary>${t}</summary><div>${body}</div></details>`;
  return V.head('FAQ & panduan', { back: '#/lainnya' })
  + `<section class="faq-hero">${LOGO()}<div><h2>Arsip Jastip</h2><p>Buku catatan jastip di HP. Dari open PO sampai paket sampai ke pelanggan.</p></div></section>

  <h3 class="sec-label">Tujuan aplikasi</h3>
  <section class="card" style="margin-top:0">
    <p>Jastiper biasanya mencatat di banyak tempat: status WA, chat grup, buku catatan, dan ingatan. Arsip Jastip mengumpulkan semuanya di satu tempat supaya kamu tahu:</p>
    <ul>
      <li>siapa yang list dan siapa yang dapat,</li>
      <li>siapa yang sudah bayar dan siapa yang belum,</li>
      <li>paket mana yang sudah dikirim beserta resinya,</li>
      <li>berapa untung bersihmu dan barang mana yang masih sisa.</li>
    </ul>
  </section>

  <h3 class="sec-label">Deskripsi</h3>
  <section class="card" style="margin-top:0">
    <p>Arsip Jastip adalah aplikasi web yang dipasang di layar utama HP. Datanya disimpan di Google Sheet milikmu sendiri, jadi tetap aman, bisa dibuka di dua HP sekaligus, dan bisa di-backup kapan saja. Aplikasi ini untuk dipakai pribadi: setiap orang memakai Google Sheet dan kode kuncinya sendiri.</p>
  </section>

  <h3 class="sec-label">Cara penggunaan</h3>
  <section class="card" style="margin-top:0">
    <ol class="steps-list">
      <li><div><b>Buka PO.</b> Menu Barang, ketuk Barang baru. Isi nama, supplier, varian, harga modal, dan harga jual. Ketuk Promosi untuk menyalin teks status.</div></li>
      <li><div><b>Catat yang list.</b> Di halaman barang, ketuk Tambah list. Ketik nama satu per satu, atau pilih Tempel banyak untuk memasukkan nama dari grup sekaligus.</div></li>
      <li><div><b>Bagi jatah.</b> Isi berapa pcs yang kamu dapat dari supplier. Jatah dibagi dari urutan list paling atas, kelebihannya tercatat sebagai barang sisa.</div></li>
      <li><div><b>Tagih.</b> Menu Pesanan, filter Belum bayar, ketuk Tagih via WA. Setelah uang masuk, ketuk Tandai lunas.</div></li>
      <li><div><b>Kirim.</b> Filter Siap kirim, ketuk Buat kiriman. Isi kurir, resi, dan ongkir, lalu kabari pelanggan lewat WA.</div></li>
    </ol>
  </section>

  <h3 class="sec-label">Fitur</h3>
  <section class="card faq" style="margin-top:0">
    ${q('Beranda', 'Untung bersih dan pesanan masuk per periode (7 hari, 30 hari, per bulan, per tahun, atau semua), tagihan yang belum dibayar, paket siap kirim, daftar hal yang perlu diurus, grafik untung, barang paling cuan, pelanggan setia, dan peluang dapat per supplier.', true)}
    ${q('Barang', 'Catat PO dengan varian dan harga berbeda, diskon beli banyak, foto opsional, teks promosi otomatis, salin list untuk grup, bagi jatah sesuai urutan, stok dan barang sisa, serta rincian untung per pesanan.')}
    ${q('Pesanan', 'Semua pesanan dari semua barang, dengan filter Nunggu kabar, Belum bayar, Siap kirim, Dikirim, Perlu refund, Buat aku, dan Batal. Ketuk satu pesanan untuk mengubah status, pembayaran, jumlah, harga, atau diskon.')}
    ${q('Pelanggan', 'Riwayat belanja tiap pelanggan, sapaan (Kak, Mas, Mbak, Bu, Pak), nomor WA, alamat, tagihan, dan resi kiriman. Pelanggan baru tercatat otomatis saat kamu menambah list.')}
    ${q('Kiriman & supplier', 'Kiriman menyimpan kurir, resi, ongkir yang ditagih, dan ongkir yang kamu bayar ke kurir. Supplier menyimpan kontak, persentase seberapa sering barang didapat, dan ongkir yang kamu bayar saat supplier mengirim barang ke kamu.')}
    ${q('Ongkir dari supplier', 'Kalau kamu yang menanggung ongkir dari supplier ke kamu, catat di Lainnya, Supplier, pilih suppliernya, lalu Catat ongkir dari supplier. Bisa juga dari halaman barang: ketuk angka untung, lalu Catat ongkir dari supplier. Pilih barang yang ada di kiriman itu supaya ongkirnya dibagi sesuai jumlah pcs yang datang. Kalau tidak memilih barang, ongkirnya hanya mengurangi untung total. Untung di Beranda selalu sudah dikurangi ongkir ini.')}
    ${q('Template pesan', 'Teks promosi, promosi barang sisa, tagihan, sapaan chat, dan kabar kiriman bisa kamu ubah sendiri di Pengaturan. Kata kunci seperti {sapaan} dan {total} otomatis diganti isi aslinya.')}
    ${q('Tampilan', 'Mode terang, gelap, atau ikuti HP. Enam warna tema pastel: Lavender, Baby Blue, Koral, Peach, Mint, dan Baby Pink. Kalimat penyemangat saat aplikasi dibuka bisa ditampilkan atau disembunyikan. Pilihan ini tersimpan di masing-masing HP.')}
  </section>

  <h3 class="sec-label">Pertanyaan yang sering muncul</h3>
  <section class="card faq" style="margin-top:0">
    ${q('Kenapa angka di HP satu belum muncul di HP lain?', 'Data dikirim ke Google Sheet beberapa detik setelah kamu menyimpan. HP lain mengambil data terbaru saat aplikasi dibuka, setiap 1,5 menit selama terbuka, atau saat kamu ketuk titik status di pojok kanan atas lalu Sinkron sekarang.')}
    ${q('Arti titik kecil di pojok kanan atas?', 'Hijau: tersimpan di Google Sheet. Kuning: sedang dikirim. Abu-abu: sedang offline, data aman di HP dan dikirim otomatis saat ada sinyal. Merah: koneksi bermasalah, ketuk titiknya untuk melihat penyebabnya.')}
    ${q('Bisa dipakai tanpa internet?', 'Bisa. Aplikasi tetap terbuka dan kamu tetap bisa mencatat. Semua perubahan disimpan di HP dulu, lalu dikirim ke Google Sheet begitu internet kembali.')}
    ${q('Untungnya dihitung dari mana?', 'Untung = (harga jual dikurangi modal) dikali jumlah, dikurangi diskon, hanya untuk pesanan berstatus Dapat. Selisih ongkir yang ditagih dan ongkir ke kurir ikut dihitung, lalu dikurangi ongkir dari supplier. Barang Buat aku tidak dihitung sebagai untung. Ketuk angka untung di halaman barang untuk melihat rinciannya.')}
    ${q('Apa bedanya Untung bersih dan Pesanan masuk?', 'Untung bersih hanya menghitung pesanan yang sudah Dapat, menurut tanggal ditandai Dapat. Pesanan masuk menghitung semua yang memesan (Nunggu kabar dan Dapat) menurut tanggal pesanan dicatat, termasuk yang belum bayar. Pakai Pesanan masuk untuk melihat performa jualan bulan itu walau PO-nya masih jalan. Perkiraan untung di kartu itu bisa berkurang kalau ada barang yang nggak dapat.')}
    ${q('Cara melihat bulan atau tahun sebelumnya?', 'Di kartu untung Beranda, pilih Bulanan atau Tahunan, lalu ketuk panah kiri untuk mundur. Grafik pada pilihan Tahunan menampilkan untung per bulan sepanjang tahun itu.')}
    ${q('Bagaimana barang sisa tercatat?', 'Saat Bagi jatah, isi jumlah yang benar-benar kamu dapat dari supplier, termasuk lebihannya. Kalau ada pesanan yang dibatalkan, barangnya otomatis kembali jadi sisa. Barang sisa muncul di Beranda dan di filter Ada sisa pada menu Barang.')}
    ${q('Pelanggan sudah bayar tapi barangnya nggak dapat?', 'Buka pesanannya. Pilih Uang dikembalikan, atau Ganti barang lain. Pesanan pengganti otomatis tercatat lunas.')}
    ${q('Bagaimana menyambungkan HP kedua?', 'Di HP pertama: Lainnya, Pengaturan, Kode sambung. Kirim kodenya ke WA sendiri. Di HP kedua, pasang aplikasi ke layar utama dulu, buka, lalu tempel kode itu di kolom Kode sambung.')}
    ${q('Apakah datanya aman?', 'Data hanya tersimpan di Google Sheet milikmu. Setiap permintaan ke Google Sheet wajib membawa kode kunci. Jangan bagikan kode kunci atau kode sambung ke orang lain. Kalau terlanjur tersebar, buat kode kunci baru dari menu Arsip Jastip di Google Sheet.')}
    ${q('Mau dipakai orang lain?', 'Bisa, dengan salinan sendiri. Orang lain membuat Google Sheet, Apps Script, dan GitHub Pages miliknya sendiri mengikuti README di GitHub. Data kalian tidak tercampur.')}
    ${q('Apakah aplikasi ini berbayar?', `Gratis, dan semua fitur bisa dipakai tanpa bayar. Kalau Arsip Jastip membantu dan kamu mau mendukung pembuatnya, kamu bisa <a class="link" href="https://saweria.co/ahmddzul" target="_blank" rel="noopener">traktir kopi di Saweria<span class="sr-only"> (membuka Saweria)</span></a>.`)}
  </section>
  ${V.credit()}`;
};
