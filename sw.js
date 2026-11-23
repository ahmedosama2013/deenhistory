// DeenHistory service worker
// Bump CACHE_VERSION whenever you deploy changes so users get fresh files.
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `deenhistory-shell-${CACHE_VERSION}`;
const API_CACHE = `deenhistory-api-${CACHE_VERSION}`;

const SHELL_FILES = [
  './',
  'index.html',
  'style.css',
  'manifest.json',
  'app.js',
  'navigation.js',
  'theme.js',
  'loading.js',
  'search.js',
  'pwa.js',
  'prophets.js',
  'seerah.js',
  'duas.js',
  'sahabah.js',
  'battles.js',
  'empires.js',
  'tyrants.js',
  'quran.js',
  'tensigns.js',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // add files one by one so a single missing file doesn't break install
      .then((cache) => Promise.all(SHELL_FILES.map((f) => cache.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== API_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Quran text/translation API: network first, fall back to cache when offline
  if (url.hostname === 'api.alquran.cloud') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(API_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Your own files: serve from cache instantly, refresh in the background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
        return cached || network;
      })
    );
  }
  // Everything else (e.g. Quran audio MP3s) goes straight to the network, uncached.
});
