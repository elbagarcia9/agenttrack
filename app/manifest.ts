import type { MetadataRoute } from 'next';

// Para instalar AgentTrack en la pantalla de inicio del celular (se abre sin barra del navegador y puede recibir avisos).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgentTrack',
    short_name: 'AgentTrack',
    description: 'Tu asistente de comisiones: avisa antes de que venza cada plazo de alta, cobro y reclamo.',
    lang: 'es-MX',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#eaeaea',
    theme_color: '#226697',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
