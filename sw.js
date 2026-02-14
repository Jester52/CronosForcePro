const CACHE_NAME = 'cronosforce-v2'; // Incrementamos versión para forzar actualización

// Lista exacta de archivos según tu carpeta
const ASSETS = [
  './cronometro.html',
  './index.html',
  './config.html',
  './instructions.html',
  './style.css',
  './script.js',
  './config.js',
  './manifest.json',
  './icon.jpg',
  './sw.js'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Red primero, fallback a Caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
