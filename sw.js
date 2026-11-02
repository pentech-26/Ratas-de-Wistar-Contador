const CACHE = 'ratas-wistar-v19';
const ICONOS = ['marcador','habilidades','camas','habitaciones','invitados','inventos','finales','electricidad','recursos','comodines'].map(n => `./iconos/${n}.png`);
const ARCHIVOS = ['./', './index.html', './splash.jpg', './icono-app.png', './splash-alto.jpg', './iconos/menu/nueva.svg', './iconos/menu/continuar.svg', './iconos/menu/historial.svg', './iconos/menu/ayuda.svg', './iconos/menu/sonido-on.svg', './iconos/menu/sonido-off.svg', ...['volver','madriguera','resumen','editar','borrar','guardar','revancha','corona','llave'].map(n => `./iconos/menu/${n}.svg`), './sonidos/chillido.mp3', './sonidos/victoria.mp3', ...['rojo','azul','amarillo','blanco'].map(n => `./iconos/familias/${n}.webp`), './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', ...ICONOS];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
