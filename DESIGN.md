# DESIGN.md · Arsip Jastip

Isi file ini disusun dari jawaban pemilik (@ahmddzul). Agen hanya merapikan formatnya.

## Identitas

- Nama: **Arsip Jastip**
- Fungsi: mencatat bisnis jastip pribadi, dari open PO, list pelanggan, bagi jatah, tagihan, sampai kiriman.
- Pengguna: satu orang jastiper. Dipakai di HP (Android dan iPhone), sering sambil membalas chat WhatsApp.
- Logo: kotak arsip (pilihan B). Tutup kotak dengan slot label. Bentuknya mewakili "arsip" sekaligus paket jastip.

## Rasa

- Ceria dan hangat, seperti etalase toko yang rapi (pilihan B).
- Dasar tetap putih bersih. Warna dipakai untuk menandai hal penting, tidak untuk menghias semua tempat.
- Emoji dikurangi. Emoji hanya muncul di sapaan Beranda dan di template pesan WhatsApp. Tampilan aplikasi lainnya memakai ikon.

## Dial

`Dial: ENERGY 2 / RHYTHM 2 / MOTION 2`

- ENERGY 2: hangat dan bersahabat, satu titik fokus per layar.
- RHYTHM 2: pola halaman konsisten, dengan Beranda dan halaman FAQ yang komposisinya berbeda.
- MOTION 2: transisi dan umpan balik terasa, tidak ada animasi yang berulang terus.

## Warna

- Enam tema pastel: Lavender (bawaan), Baby Blue, Koral, Peach, Mint, Baby Pink. Kunci tema di kode tetap `ungu`, `biru`, `merah`, `oranye`, `hijau`, `pink` supaya pilihan lama di HP tidak hilang.
- Warna pastel terlalu terang untuk tulisan putih (kontras sekitar 1,5:1). Karena itu tulisan di atas warna tema (kartu untung, tombol utama, chip terpilih, tombol tambah) memakai warna tua senada (`--on-acc`). Tulisan dan ikon berwarna di latar putih memakai versi tua (`--acc-ink`).
- Gradien hanya dipakai di kartu ringkasan Beranda, dari pastel tua ke pastel. Alasannya: kartu itu satu-satunya titik fokus di Beranda.
- Mode terang dan gelap. Bawaannya mengikuti pengaturan HP, dan bisa dipilih manual. Di mode gelap, isian pastel tetap sama dan tulisan berwarna memakai pastel terang.
- Status memakai warna tetap di semua tema: hijau (dapat/lunas), kuning tua (belum bayar), merah (perlu refund).
- Ikon aplikasi tetap ungu tua seperti sebelumnya.

| Tema | Isian | Pastel tua | Tulisan di atas isian | Tinta di latar putih | Tinta mode gelap | Kontras tulisan/isian |
|---|---|---|---|---|---|---|
| Lavender | #CBBBF6 | #B39FEF | #251456 | #5B3FC4 | #CDBEF7 | 9,1:1 |
| Baby Blue | #A9CCF5 | #88B7EE | #0D2850 | #2456AE | #ADCEF6 | 8,8:1 |
| Koral | #F5B0A9 | #EE928A | #4E1510 | #B0352A | #F6B5AF | 8,1:1 |
| Peach | #FAC8A0 | #F5B07C | #4D260A | #9E470C | #FACCA6 | 8,7:1 |
| Mint | #A6DDC1 | #86CFAB | #0B3523 | #0E774B | #A9DFC3 | 8,9:1 |
| Baby Pink | #F5B3CB | #EC93B4 | #4A1029 | #AD2A5E | #F7B9D0 | 8,7:1 |

## Huruf

- Plus Jakarta Sans, disimpan di aplikasi sendiri (tidak dimuat dari Google).
- Alasan: huruf ini dirancang untuk identitas kota Jakarta, cocok untuk produk berbahasa Indonesia. Bentuknya bulat dan ramah sesuai rasa "hangat", dan angkanya tetap jelas untuk nominal Rupiah.

## Bentuk

- Radius: 10 px (input, tombol kecil), 14 px (tombol, kartu kecil), 20 px (kartu, sheet). Pill hanya untuk chip filter dan label status.
- Bayangan hanya untuk lapisan yang benar-benar melayang: navigasi bawah, tombol tambah, sheet, dan notifikasi. Kartu biasa memakai garis tipis.
- Efek kaca hanya di navigasi bawah dan kartu ringkasan Beranda.
- Glow hanya di tombol tambah (aksi utama di setiap layar daftar).

## Ikon

- Set ikon digambar sendiri, garis 2 px dengan ujung bulat, mengikuti ketebalan huruf. Setiap ikon dipilih karena artinya (kotak = barang, truk = kiriman, dompet = tagihan), bukan karena tren. Ikon kilau tidak dipakai.

## Animasi (tujuan tertulis)

| Animasi | Tujuan |
|---|---|
| Halaman masuk dari bawah 12 px, 280 ms | Menandai halaman sudah berganti |
| Isi daftar muncul berurutan (maks. 8 baris) | Mata mengikuti urutan list, yang penting untuk bagi jatah |
| Angka untung di Beranda menghitung naik, 700 ms | Menarik perhatian ke angka terpenting saat aplikasi dibuka |
| Konfeti kecil saat Dapat, Lunas, atau Bagi jatah selesai | Merayakan momen penting dan memastikan aksinya berhasil |
| Ikon menu bawah memantul sekali saat diketuk | Umpan balik sentuhan |
| Sheet naik dengan pantulan halus | Menunjukkan sheet bisa ditutup ke bawah |
| Titik status berdenyut hanya saat benar-benar sinkron | Menandai proses yang sedang berjalan |

Semua animasi mati jika HP diatur "kurangi gerakan".

## Kredit

- Dibuat oleh @ahmddzul, dengan logo Instagram, mengarah ke https://instagram.com/ahmddzul. Ditampilkan di menu Lainnya, halaman FAQ, dan layar sambutan.

## Dukungan (Saweria)

- Ajakan traktir kopi tidak boleh terasa memaksa: tidak ada pop-up, tidak ada pengingat berulang, dan selalu disebut bahwa semua fitur tetap gratis.
- Tempat: kartu tetap di Lainnya, satu jawaban di FAQ, dan kartu sekali di Beranda setelah 10 tagihan lunas. Kartu Beranda hilang selamanya setelah diketuk atau ditutup.
- Ikon cangkir kopi dengan warna tema, bukan logo Saweria.

## Layar pembuka

- Muncul setiap aplikasi dibuka dari ikon, hanya untuk pengguna yang sudah tersambung atau mode coba. Hilang sendiri setelah sekitar 2,4 detik, atau saat diketuk. Bisa disembunyikan di Pengaturan.
- Isi: logo, sapaan sesuai waktu, dan satu kalimat penyemangat. Tanpa emoji.
- 120 kalimat khas jastip: sekitar 65% gaya sedang, 25% santai/lucu, 10% formal. Diacak tanpa pengulangan sampai semuanya tampil.

## Gulir

- Yang digulir hanya area isi (`#view`), bukan halaman. Judul menempel di atas, menu bawah menempel di bawah. Ini menghindari bug iPhone pada aplikasi layar utama yang membuat menu bawah hilang dan isi tidak bisa digulir habis.
- Mengetuk menu bawah yang sedang aktif menggulir ke atas.

