const CACHE_NAME = 'casa-v2.0.0';
const ASSETS = [
  '/v2/', '/v2/index.html',
  '/v2/css/glass.css', '/v2/css/animations.css',
  '/v2/src/app.js', '/v2/src/api.js', '/v2/src/store.js', '/v2/src/config.js', '/v2/src/utils.js',
  '/v2/src/components/index.js', '/v2/src/components/Header.js', '/v2/src/components/DeviceCard.js',
  '/v2/src/components/MediaPlayer.js', '/v2/src/components/WeatherCard.js',
  '/v2/src/components/FamilyMap.js', '/v2/src/components/CameraGrid.js',
  '/config/dashboard-config.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  if (e.request.url.includes('websocket')) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request)));
});
