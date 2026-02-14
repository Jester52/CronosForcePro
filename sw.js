const CACHE_NAME = 'cronosforce-v1';

// Lista de archivos para funcionamiento Offline
const ASSETS = [
  './home.html',
  './index.html',
  './config.html',
  './instructions.html',
  './style.css',
  './script.js',
  './config.js',
  './manifest.json',
  './icon.png'
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

// Activación y limpieza de versiones antiguas
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

// Estrategia: Red primero, si falla, Caché (Ideal para cambios de configuración)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});