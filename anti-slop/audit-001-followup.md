# Audit 001 · Laporan lanjutan (Arsip Jastip v2.0)

Tanggal: 1 November 2026
Disetujui pemilik: temuan 1 sampai 29 (semua).
Arah desain: `DESIGN.md`, disusun dari jawaban pemilik (logo B kotak arsip, rasa ceria-hangat, emoji dikurangi, gradien hanya di kartu Beranda).
Design Read: aplikasi pencatat bisnis jastip untuk satu jastiper di HP, bahasa visual putih bersih dengan satu aksen warna tema, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

## Status temuan

| No | Status | Perbaikan |
|---|---|---|
| 1 | Selesai | Tombol, chip aktif, dan tombol tambah memakai aksen solid. Putih di aksen 5,30 sampai 6,16:1 di 5 tema. Hero memakai gradien aksen tua ke aksen (keduanya di atas 5,3:1 dengan putih). |
| 2 | Selesai | Teks tautan memakai `--acc-ink`: sama dengan aksen di mode terang (4,67:1 ke atas), versi terang di mode gelap (8,26:1 ke atas). |
| 3 | Selesai | Abu-abu diganti #5F6577 (5,43:1). Placeholder #6B7285. Nav tidak aktif memakai warna yang sama. |
| 4 | Selesai | Hijau status #0A7A4E (4,78:1 di latar hijau muda), #63D49D di mode gelap. |
| 5 | Selesai | Escape menutup sheet, fokus pindah ke dalam sheet, Tab berputar di dalam sheet, fokus kembali ke tombol asal. |
| 6 | Selesai | Enter dan Spasi mengaktifkan baris `role="button"`. Baris tagihan sekarang `<button>`. |
| 7 | Selesai | Kolom cari punya label tersembunyi. Grup chip dan segmen memakai `role="group"` + `aria-labelledby` atau `fieldset/legend`. Textarea template punya label. |
| 8 | Selesai | Semua chip dan segmen memakai `aria-pressed` yang ikut berubah. |
| 9 | Selesai | Gaya hover untuk perangkat dengan pointer. `cursor: pointer` di kontrol, `not-allowed` di tombol nonaktif. |
| 10 | Selesai | Semua kontrol minimal 44 px, atau 38 sampai 40 px dengan area sentuh diperluas ke 44 px. |
| 11 | Selesai | Banner "Mode coba: semua nama dan angka di sini hanya contoh" selalu tampil di setiap halaman mode coba. |
| 12 | Selesai | Logo kotak arsip sesuai pilihan B pemilik. Ikon PNG dibuat ulang. |
| 13 | Selesai | Tampilan error penuh (penyebab + Coba lagi + Cek koneksi) saat belum ada data. Callout error di Beranda saat sinkron gagal dan data lama masih ada. |
| 14 | Selesai | Huruf disimpan di aplikasi (`fonts/`) dengan `preload`. Tidak ada skrip atau CSS pihak ketiga. Script memakai `defer`. Thumbnail punya `width`/`height`. |
| 15 | Selesai | `DESIGN.md` berisi arah, dial, warna, huruf, bentuk, dan tujuan animasi. |
| 16 | Selesai | Gradien hanya di kartu ringkasan Beranda. Aksen lain solid. |
| 17 | Selesai | Glow hanya di tombol tambah. |
| 18 | Selesai | Efek kaca hanya di navigasi bawah dan kartu ringkasan Beranda. |
| 19 | Selesai | Kartu memakai garis tipis. Bayangan hanya di lapisan melayang: navigasi bawah, tombol tambah, sheet, notifikasi. |
| 20 | Selesai | Emoji dihapus dari tampilan aplikasi. Tersisa di sapaan Beranda dan template pesan WhatsApp, sesuai pilihan pemilik. Thumbnail kategori memakai ikon. |
| 21 | Selesai | Ikon kilau dihapus. Alasan set ikon ditulis di `DESIGN.md`. |
| 22 | Selesai | Alasan Plus Jakarta Sans ditulis di `DESIGN.md`. |
| 23 | Selesai | Tujuh animasi dengan tujuan tertulis. Titik sinkron hanya berdenyut saat benar-benar sinkron. Semua mati dengan "kurangi gerakan". |
| 24 | Selesai | Alasan tertulis di `DESIGN.md`. |
| 25 | Selesai | Radius dikurangi ke 10, 14, 20 px + pill untuk chip dan label. |
| 26 | Selesai | `100dvh` dengan cadangan `100vh`. |
| 27 | Selesai | "Tips cepat" diganti menu FAQ & panduan. |
| 28 | Selesai | Nama pribadi dihapus dari bawaan. Layar sambutan menanyakan nama panggilan dan nama toko. |
| 29 | Selesai | Mode terang, gelap, ikuti HP, dan 5 warna tema. |

## Delivery Gate

### Blok 1: Hard Gate

- R-02 PASS: tidak ada em dash di teks aplikasi, README, dan FAQ (dicek dengan grep).
- R-03 PASS: tidak ada overflow horizontal di 15 rute pada 320, 390, 768, 1024 px. Pengukuran otomatis: semua target 44 px ke atas.
- R-17 PASS: angka hanya dari data pengguna. Mode coba diberi label.
- R-18 PASS: tidak ada testimoni.
- R-23 PASS: logo dipilih pemilik (B). Gambar README memakai data contoh dan diberi keterangan.
- R-24 PASS: semua item navigasi dan tile menuju halaman yang ada (Beranda, Barang, Pesanan, Pelanggan, Lainnya, Kiriman, Supplier, FAQ, Pengaturan).
- R-25 PASS: pemindaian kontras otomatis di 10 rute × 5 tema × 2 mode, 0 kegagalan.
- R-26 PASS: semua tombol diuji, lihat daftar klik di bawah.
- R-27 PASS: empty state dengan penyebab dan aksi, skeleton saat memuat, tampilan error dengan Coba lagi.
- R-28 PASS: FAQ berisi pertanyaan khusus aplikasi ini (sinkron, titik status, offline, hitungan untung, barang sisa, refund, HP kedua, keamanan, salinan untuk orang lain).
- R-32 PASS: Tab, Enter, Spasi, Escape diuji. Fokus terlihat (outline 3 px warna aksen).
- R-33 PASS: semua fitur ditulis langsung di source, tidak ada skrip tambalan.
- R-34 PASS: 5 tema × 2 mode dibuka dan dipindai, tidak ada gaya yang rusak.
- R-35 PASS: aplikasi dijalankan di Chromium, konsol tanpa error, klik per elemen tercatat di bawah.
- R-36 PASS: tidak ada klaim keamanan atau performa yang dikarang. README hanya menjelaskan mekanisme kode kunci yang memang ada.
- R-37 PASS: arah dari pemilik, ditulis di `DESIGN.md`.
- R-38 PASS: data contoh diberi label di aplikasi dan di README.
- R-39 PASS: kontrol bernama, `aria-pressed`, label grup, `lang="id"`, satu `h1` per halaman, zoom tidak diblokir, `prefers-reduced-motion` dihormati, tidak ada animasi berulang selain indikator sinkron yang menandai proses berjalan.
- R-40 PASS: tidak ada skrip pihak ketiga, huruf lokal di-preload, thumbnail punya ukuran. Skor Lighthouse dan Web Vitals tidak diukur.

### Blok 2: Purpose-Gate

- R-01 PASS: satu gradien untuk satu titik fokus, alasan tertulis.
- R-04 PASS: ikon dipilih per arti, tidak ada ikon kilau, alasan set tertulis.
- R-06 PASS: alasan huruf tertulis.
- R-07, R-08, R-09, R-22 PASS: tidak ada pola latar, panah dekoratif, badge dekoratif, atau ilustrasi generik. Label status dipakai karena menandai status nyata.
- R-10 PASS: kaca di 2 elemen.
- R-12 PASS: bayangan hanya di 4 lapisan melayang.
- R-13 PASS: glow di 1 elemen.
- R-14 PASS: kartu statistik dan tile menu memuat isi berbeda, bukan template.
- R-19 PASS: tujuan setiap animasi tertulis, sesuai MOTION 2.

### Blok 3: Liveliness

- Dial ditulis: ENERGY 2 / RHYTHM 2 / MOTION 2. PASS
- Konsisten: Beranda (hero + kartu) dan FAQ (blok bernomor + akordeon) berbeda komposisi dari halaman daftar. PASS
- Titik fokus per layar: kartu untung di Beranda, tombol tambah di halaman daftar, kotak total di sheet pesanan. PASS
- Ruang kosong sebagai struktur: label bagian dan jarak 14 sampai 22 px memisahkan kelompok. PASS
- Satu aksen: warna tema solid. PASS
- Motif identitas: bentuk kotak arsip (logo, ikon Barang, thumbnail kategori). PASS
- Design Read ditulis di awal laporan ini. PASS

### Blok 4: Craftsmanship & Quality Locks

C-1 sampai C-5, R-05, R-11, R-15, R-16, R-20, R-21, R-29, R-30, R-31: PASS. Palet: netral + 1 warna aksen per tema + 3 warna status tetap.

## Daftar klik (Chromium, 390 px)

- Lanjut tanpa nama: kolom bergetar + pesan. Lanjut dengan nama: pindah ke langkah 2.
- Coba dulu pakai data contoh: Beranda terbuka, banner mode coba tampil.
- 15 rute dibuka satu per satu tanpa error konsol.
- Baris pesanan + Enter: sheet terbuka, fokus di dalam sheet. Escape: sheet tertutup, fokus kembali ke baris.
- Status Dapat: tersimpan, konfeti muncul, `aria-pressed=true`.
- Chip Buat aku: aktif lalu nonaktif saat diketuk lagi.
- Bagi jatah: jatah dibagi, notifikasi muncul.
- Ubah pelanggan: chip sapaan Kak, Mas, Mbak, Bu, Pak, Tanpa (tanpa duplikat), Kak terpilih otomatis.
- Tagih via WA: teks tagihan berisi Total. Tandai lunas: konfirmasi, lalu notifikasi lunas.
- FAQ: akordeon terbuka. Kredit mengarah ke https://instagram.com/ahmddzul.
- Pengaturan: tema Oranye dan mode Gelap diterapkan ke `<html>`. Tema Biru, Merah, Hijau, Ungu diuji di Beranda.
- Sinkron dua HP lewat server tiruan: barang dari HP A muncul di HP B, ganti nama di HP B muncul di HP A.
- Yang tidak bisa diuji di sini: koneksi ke Google Sheet asli dan pemasangan di layar utama HP sungguhan.

## Tambahan v2.2: dukungan Saweria

- Kartu "Beliin aku kopi?" di Lainnya, satu jawaban di FAQ ("Apakah aplikasi ini berbayar?"), dan bagian "Dukung pembuat" di README. Semua menyebut bahwa fitur tetap bisa dipakai tanpa dukungan.
- Kartu sekali di Beranda muncul setelah 10 tagihan lunas (tidak termasuk Buat aku dan Batal). Bentuknya kartu biasa, bukan pop-up. Setelah Traktir kopi atau Nanti saja diketuk, kartu tidak muncul lagi di HP itu. Tidak muncul di mode coba.
- Link ke https://saweria.co/ahmddzul dibuka di tab baru, `rel="noopener"`, dengan label pembaca layar "(membuka Saweria)". Ikon cangkir digambar sendiri dengan garis 2 px, tanpa logo Saweria.
- Kontras: Lainnya, FAQ (semua akordeon terbuka), dan Beranda dengan kartu sekali diuji di 6 tema × 2 mode. PASS.
- Tombol: tinggi 44 px. Nanti saja lewat keyboard: kartu hilang, fokus pindah ke kontrol berikutnya, tetap hilang setelah halaman dimuat ulang.
- Lebar 320, 390, 768, 1024 px: tidak ada scroll ke samping. Di 320 px tombol turun ke baris kedua dengan rapi.
- Delivery Gate v2.2: PASS.

## Tambahan v2.3: ongkir dari supplier

- Dicatat di tabel Kiriman dengan `arah: masuk`, `supplierId`, `barangIds`. Server lama otomatis menambah kolomnya, jadi `Code.gs` tidak perlu diganti (diuji dengan server tiruan).
- Untung bersih (Beranda, grafik, barang paling cuan) dikurangi ongkir ini. Kalau barang dipilih, ongkir dibagi sesuai pcs yang datang (stok, atau pcs Dapat kalau stok kosong); kalau tidak dipilih, hanya mengurangi untung total.
- Pintu masuk: sheet Supplier dan Rincian untung di halaman barang. Kiriman ke pelanggan, tagihan, dan riwayat pelanggan tidak ikut menampilkan catatan ini.
- Kontras 6 tema × 2 mode di Beranda, Supplier, Detail barang, dan form ongkir: PASS. Lebar 320 dan 768 px: tidak ada scroll ke samping. Tidak ada error konsol.
