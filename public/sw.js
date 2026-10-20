// Service worker de AgentTrack: recibe los avisos (push) y abre la app al tocarlos.
// No guarda páginas en caché: la app siempre muestra datos al día.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Necesario para que el navegador ofrezca instalar la app; no cambia nada de lo que se descarga.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (evento) => {
  let datos = {};
  try {
    datos = evento.data ? evento.data.json() : {};
  } catch {
    datos = { titulo: 'AgentTrack', cuerpo: evento.data ? evento.data.text() : '' };
  }
  const titulo = datos.titulo || 'AgentTrack';
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: datos.tag || 'agenttrack',
      renotify: true,
      data: { url: datos.url || '/app/alertas' },
    }),
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url) || '/app/alertas';
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ('focus' in v) {
          v.navigate(destino).catch(() => {});
          return v.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
