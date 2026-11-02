/* Service worker: bikin aplikasi tetap bisa dibuka walau sinyal jelek.
   Data tetap diambil dari Google Sheet; yang disimpan di sini cuma tampilan aplikasinya.
   Kalau kamu mengubah file aplikasi, naikkan angka VERSION supaya HP mengambil versi baru. */
const VERSION = 'arsip-jastip-v6';
const SHELL = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/ui.js', 'js/api.js', 'js/store.js', 'js/demo.js', 'js/views.js', 'js/sheets.js', 'js/faq.js', 'js/app.js',
  'fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // File aplikasi: tampilkan dari cache dulu (cepat), lalu perbarui di belakang layar
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit => {
        const net = fetch(req).then(res => {
          if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
          return res;
        }).catch(() => hit || caches.match('index.html'));
        return hit || net;
      })
    );
    return;
  }

  // Selain itu (Google Apps Script, foto Drive) langsung ke internet
});
