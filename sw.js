const CACHE_NAME = 'cronos-magic-v1';
const urlsToCache = [
  './',
  './index.html',
  './test_calculadora_Android.html',
  './test_calculadora_IOS.html',
  './configuracion.html',
  './instrucciones.html',
  './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Estrategia: Buscar en caché, si no hay, ir a la red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});