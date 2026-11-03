/* Contador Ratas de Wistar · PenTech
   Estrategia: RED PRIMERO (siempre la última versión publicada) y caché solo
   como respaldo sin conexión. Al instalar se descarga todo saltándose la caché
   HTTP del navegador para no guardar versiones antiguas. */
const CACHE = 'ratas-wistar-v33';
const ICONOS = ['marcador','habilidades','camas','habitaciones','invitados','inventos','finales','electricidad','recursos','comodines'].map(n => `./iconos/${n}.png`);
const MENU = ['nueva','continuar','historial','ayuda','sonido-on','sonido-off','volver','madriguera','resumen','editar','borrar','guardar','revancha','corona','llave'].map(n => `./iconos/menu/${n}.svg`);
const FAMILIAS = ['azul','rojo','amarillo','blanco'].flatMap(n => [`./iconos/familias/${n}.webp`, `./iconos/familias/mini/${n}.webp`]);
const ARCHIVOS = ['./', './index.html', './manifest.json', './splash.jpg', './icono-app.png',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './sonidos/intro.mp3', './sonidos/chillido.mp3', './sonidos/victoria.mp3', ...MENU, ...FAMILIAS, ...ICONOS];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ARCHIVOS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const mismoOrigen = req.url.startsWith(self.location.origin);
  const fuentes = req.url.includes('fonts.g');
  if (!mismoOrigen && !fuentes) return;

  e.respondWith(
    fetch(mismoOrigen ? new Request(req, { cache: 'no-cache' }) : req)
      .then(resp => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
  );
});
