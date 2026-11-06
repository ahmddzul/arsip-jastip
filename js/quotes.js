'use strict';
/* quotes.js: kalimat penyemangat di layar pembuka.
   Komposisi: sekitar 65% gaya sedang, 25% santai/lucu, 10% formal. Semua ditulis khusus untuk jastiper.
   Diacak tanpa pengulangan: kalimat yang sama baru muncul lagi setelah semuanya tampil. */

const QUOTES = [
  /* ---- Sedang (78) ---- */
  'Satu list yang tercatat rapi lebih berharga dari sepuluh chat yang tenggelam.',
  'PO lama bukan berarti rezeki jauh. Sabar, barangnya lagi di jalan.',
  'Pelanggan balik lagi bukan karena harga paling murah, tapi karena kamu bisa dipercaya.',
  'Hari ini cukup satu langkah: tagih yang belum bayar.',
  'Istirahat juga bagian dari kerja. Toko yang hebat butuh pemilik yang sehat.',
  'Jualan kecil yang konsisten lama-lama jadi besar.',
  'Pembeli ingat cara kamu membalas chat, bukan cuma barang yang kamu kirim.',
  'Catatan yang rapi bikin kamu tenang waktu ada yang nanya, "Kak, punyaku gimana?"',
  'Untung kecil yang pasti lebih baik dari untung besar yang lupa dicatat.',
  'Mulai dari yang paling dekat: satu pesanan, satu pelanggan, satu senyum.',
  'Setiap resi yang kamu kirim adalah janji yang kamu tepati.',
  'Barang boleh nunggu supplier, tapi kabar ke pelanggan jangan sampai telat.',
  'Kejujuran soal stok bikin pelanggan betah, walau kadang barangnya nggak dapat.',
  'Rezeki sudah ada yang atur. Tugasmu menjemputnya dengan rapi.',
  'Promosi hari ini adalah pesanan minggu depan.',
  'Nggak apa-apa pelan, asal setiap pesanan terurus sampai selesai.',
  'Toko yang dipercaya dibangun dari hal kecil yang dikerjakan setiap hari.',
  'Tagihan yang ditagih dengan sopan biasanya dibayar dengan senang.',
  'Satu pelanggan puas bisa mendatangkan tiga teman barunya.',
  'Kerja hari ini nggak harus sempurna. Cukup lebih rapi dari kemarin.',
  'Barang yang sampai dengan selamat adalah iklan terbaik.',
  'Jangan hitung capeknya, hitung berapa orang yang terbantu titipannya.',
  'Rapi mencatat hari ini, nggak panik waktu rekap nanti.',
  'Yang bikin jastip bertahan bukan modal besar, tapi kepercayaan yang dijaga.',
  'Satu chat ramah bisa menyelamatkan satu pesanan yang hampir batal.',
  'Mulai hari dengan cek yang belum bayar, tutup hari dengan cek yang belum dikirim.',
  'Jualan itu maraton, bukan lari cepat. Atur napasmu.',
  'Pesanan sepi bukan tanda gagal. Itu waktu yang pas buat cari barang baru.',
  'Kamu nggak cuma jual barang, kamu bantu orang dapat yang mereka cari.',
  'Konsisten posting lebih kuat dari sekali viral.',
  'Uang yang tercatat jelas bikin keputusan jadi lebih mudah.',
  'Pelanggan yang sabar menunggu PO pantas dapat kabar yang jujur.',
  'Hari yang sibuk tanda usahamu dipercaya. Pelan-pelan, satu per satu.',
  'Kalau barangnya nggak dapat, kembalikan dengan cepat. Kepercayaan lebih mahal dari untung.',
  'Bukan soal seberapa banyak yang list, tapi seberapa banyak yang puas.',
  'Mencatat itu kerja kecil yang melindungi kerja besarmu.',
  'Senyum di caption, rapi di catatan, tepat di pengiriman.',
  'Setiap pesanan yang lunas adalah hasil dari kesabaranmu.',
  'Hari ini mungkin capek, tapi pelangganmu sedang menunggu paket dengan senang.',
  'Supplier bisa lama, tapi semangatmu jangan ikut lama datangnya.',
  'Usaha yang rapi lebih mudah dikembangkan.',
  'Lebih baik bilang "belum dapat" dengan jujur daripada janji yang meleset.',
  'Cek lagi alamatnya sebelum kirim. Teliti itu bentuk sayang ke pelanggan.',
  'Pelanggan setia lahir dari pengalaman yang menyenangkan, berulang kali.',
  'Jangan bandingkan tokomu dengan yang lain. Bandingkan dengan tokomu bulan lalu.',
  'Kerja keras itu penting, tapi kerja rapi bikin kerja keras nggak sia-sia.',
  'Satu foto barang yang jelas menjawab sepuluh pertanyaan.',
  'Tagih dengan hangat, kirim dengan cepat, catat dengan rapi.',
  'Kamu sudah sampai sejauh ini. Lanjutkan, satu pesanan lagi.',
  'Rezeki jastip itu datang lewat titipan orang yang percaya padamu.',
  'Nggak perlu buru-buru besar. Yang penting tumbuh terus.',
  'Pelanggan baru itu bonus, pelanggan lama itu fondasi.',
  'Atur waktu buat jualan, atur waktu juga buat dirimu sendiri.',
  'Balas chat dengan sabar, walau pertanyaannya sudah dijawab di caption.',
  'Usaha yang tercatat bisa dievaluasi. Yang tidak tercatat cuma bisa ditebak.',
  'Satu PO selesai dengan baik lebih berharga dari tiga PO yang berantakan.',
  'Bangun pagi, cek pesanan, lalu bersyukur masih ada yang percaya.',
  'Paket yang dikemas rapi bikin pelanggan merasa dihargai.',
  'Jangan takut menagih. Itu hakmu atas kerja yang sudah kamu lakukan.',
  'Pelan-pelan beres lebih baik dari cepat tapi ada yang terlewat.',
  'Bulan ini mungkin belum ramai, tapi setiap pelanggan baru adalah awal yang baik.',
  'Barang sisa bukan rugi, cuma belum ketemu jodohnya.',
  'Kepercayaan pelanggan dibangun lama, bisa hilang cepat. Jaga baik-baik.',
  'Kamu boleh capek, tapi jangan lupa lihat seberapa jauh usahamu sudah berjalan.',
  'Pesanan banyak itu berkah. Catat dulu, baru pusingnya dibagi.',
  'Cara terbaik promosi: kirim tepat waktu, lalu biarkan pelanggan yang cerita.',
  'Setiap angka di catatan ini adalah hasil kerjamu sendiri.',
  'Sabar sama supplier, ramah sama pelanggan, tegas sama catatan.',
  'Usaha kecil yang dikelola serius bisa jadi sumber rezeki yang besar.',
  'Hari ini cukup selesaikan yang ada di depan mata dulu.',
  'Pelanggan senang bukan karena kamu sempurna, tapi karena kamu bisa diandalkan.',
  'Selesaikan yang tertunda kemarin, baru buka PO baru hari ini.',
  'Untung bersih itu yang tersisa setelah semua tercatat dengan jujur.',
  'Kalau ragu, tanya dulu ke pelanggan. Lebih baik jelas dari awal.',
  'Bisnis yang tenang dimulai dari catatan yang lengkap.',
  'Tiap pesanan punya cerita. Pastikan semuanya berakhir bahagia.',
  'Kerja dari HP pun bisa rapi, asal kamu mau mulai.',
  'Satu hari, satu kemajuan kecil. Itu sudah cukup.',

  /* ---- Santai / lucu (30) ---- */
  'PO-nya lama? Tenang, yang penting bukan PHP.',
  'Nagih itu bukan galak, itu namanya tertib keuangan.',
  'Pelanggan setia itu kayak mantan yang baik: balik lagi tanpa drama.',
  'Catat sekarang, biar nanti nggak pusing nyari chat dari zaman purba.',
  'Rebahan 15 menit itu sah. Admin juga manusia.',
  'Ongkir boleh naik, semangat jangan turun.',
  'Kalau ditanya "ready, Kak?", jawab dengan senyum walau sudah ditulis di caption.',
  'Paket dikirim, hati lega. Tinggal nunggu testimoni masuk.',
  'Jastiper sejati: tidur ingat list, bangun ingat tagihan.',
  'Barang belum datang? Supplier juga lagi berjuang, kayaknya.',
  'Yang nanya banyak, yang transfer belum. Sabar, itu ujian level dasar.',
  'Hari ini target kecil saja: semua chat terbalas, semua list tercatat.',
  'Kopi dulu, baru bagi jatah. Biar adil dan nggak salah hitung.',
  'Kalau stok habis, bilang habis. Jangan bilang "otw restock" padahal belum pesan.',
  'Jangan sampai catatan pesanan lebih berantakan dari kamar sendiri.',
  'Satu notifikasi transfer masuk bisa bikin capek hilang separuh.',
  'Bagi jatah itu seni. Seni membuat semua orang tetap sayang padamu.',
  'Bukan admin biasa, kamu admin, kurir, CS, dan akuntan sekaligus.',
  'Hari Senin juga hari rezeki. Jangan dimusuhi.',
  'Kalau lupa siapa yang sudah bayar, untung ada aplikasi ini. Sama-sama.',
  'Resi sudah dikirim, tinggal berdoa paketnya nggak nyasar ke kota sebelah.',
  'Pelanggan bilang "nanti ya, Kak" itu artinya kamu perlu catat dan ingatkan.',
  'Chat "P" doang tetap pelanggan. Balas saja dengan ramah.',
  'Sabar itu ada batasnya. Makanya ada fitur tagih via WA.',
  'Untung sedikit tapi sering, lama-lama bisa buat jajan sendiri juga.',
  'Supplier slow respon itu biasa. Yang penting kamu fast respon ke pelanggan.',
  'Hari ini jangan lupa makan. Nanti yang bagi jatah siapa?',
  'Masukkan semua ke list, biar otakmu bisa dipakai buat hal yang lebih seru.',
  'Kalau ada yang batal, ikhlaskan. Mungkin barangnya jodoh orang lain.',
  'Laporan rapi, hati happy, saldo pun ikut berseri.',

  /* ---- Formal (12) ---- */
  'Kesabaran dalam menunggu adalah bagian dari proses yang membuahkan hasil.',
  'Penagihan yang tepat waktu menjaga kesehatan usaha.',
  'Kepercayaan pelanggan adalah aset paling berharga bagi setiap usaha.',
  'Pencatatan yang teratur merupakan fondasi pengelolaan usaha yang baik.',
  'Menjaga kesehatan diri adalah investasi bagi keberlangsungan usaha.',
  'Pelayanan yang konsisten akan menumbuhkan loyalitas pelanggan.',
  'Keputusan yang baik lahir dari data yang tercatat dengan jujur.',
  'Ketepatan janji adalah ukuran profesionalisme dalam berdagang.',
  'Usaha yang terencana lebih siap menghadapi perubahan.',
  'Evaluasi rutin membantu usaha tumbuh ke arah yang tepat.',
  'Komunikasi yang jelas mencegah kesalahpahaman dengan pelanggan.',
  'Keberhasilan usaha dibangun dari disiplin yang dijalankan setiap hari.'
];

const Quote = {
  KEY: 'aj_quote_bag',
  /** Ambil satu kalimat. Urutan diacak, dan tidak ada yang terulang sebelum semua tampil. */
  next() {
    let bag = null, last = -1;
    try { const raw = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (raw) { bag = raw.bag; last = raw.last; } } catch (e) { /* mulai baru */ }
    if (!Array.isArray(bag) || !bag.length || bag.some(i => i >= QUOTES.length)) {
      bag = QUOTES.map((_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (bag[bag.length - 1] === last && bag.length > 1) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const i = bag.pop();
    try { localStorage.setItem(this.KEY, JSON.stringify({ bag, last: i })); } catch (e) { /* tetap tampil */ }
    return QUOTES[i];
  },
  on() { try { return localStorage.getItem('aj_splash') !== '0'; } catch (e) { return true; } },
  set(v) { try { localStorage.setItem('aj_splash', v ? '1' : '0'); } catch (e) { /* abaikan */ } },

  /** Layar pembuka: sapaan + satu kalimat, hilang sendiri setelah ±2,4 detik atau saat diketuk. */
  show() {
    const el = document.getElementById('splash');
    if (!el) return;
    const g = Text.greet().g, nama = Store.settings.namaPanggilan;
    el.innerHTML = `<div class="splash-in">${LOGO('splash-logo')}
      <p class="splash-hi">${UI.esc(g)}${nama ? ', Kak ' + UI.esc(nama) : ''}</p>
      <blockquote class="splash-q">${UI.esc(this.next())}</blockquote>
      <p class="splash-skip">Ketuk untuk mulai</p></div>`;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('on'));
    let done = false;
    const close = () => {
      if (done) return; done = true;
      el.classList.remove('on'); el.classList.add('off');
      document.removeEventListener('keydown', key);
      setTimeout(() => { el.hidden = true; el.className = ''; el.innerHTML = ''; }, 320);
    };
    const key = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close(); };
    el.onclick = close;
    document.addEventListener('keydown', key);
    setTimeout(close, 2400);
  }
};
