const CACHE_NAME = 'cronosforce-v6';

// Lista de archivos para funcionamiento offline
const ASSETS = [
  './index.html',        // Punto de inicio
  './cronometro.html',   // Menú principal
  './config.html',
  './instructions.html',
  './style.css',
  './script.js',
  './config.js',
  './manifest.json',
  './icon.png'
];

// Instalación: Guarda los archivos en la memoria del teléfono
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CronosForcePro: Cacheando archivos críticos');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Borra cachés antiguas para evitar conflictos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('CronosForcePro: Borrando caché antigua', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de carga: Red primero, si falla usa Caché (ideal para mentalismo)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
