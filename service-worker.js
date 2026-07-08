const CACHE='clarity-offertemaker-v2.1dev1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./css/app.css','./css/pdf.css','./js/app.js','./js/storage.js','./js/locales.js','./js/database.js','./js/parser.js','./js/pdf.js','./assets/logo.jpg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));