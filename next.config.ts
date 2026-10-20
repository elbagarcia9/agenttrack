import type { NextConfig } from 'next';

// Cabeceras de seguridad para todas las páginas. La política de contenido (CSP) solo deja que la página hable con
// ella misma y con Supabase, no permite que otro sitio la meta en un marco (anti-clickjacking, incluido el panel del dueño)
// y bloquea objetos y formularios hacia afuera. 'unsafe-inline' es necesario porque Next.js pone pequeños scripts y estilos
// dentro de la propia página; 'unsafe-eval' solo se permite al programar (modo desarrollo).
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const esDesarrollo = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabase}${esDesarrollo ? ' ws: http://localhost:*' : ''}`.trim(),
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(esDesarrollo ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
