// Protege la app interna: sin sesión válida, /app/* manda a /entrar. También renueva la sesión en cada visita.
// Sin variables de Supabase (modo local) no hace nada, para poder seguir probando sin cuenta.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clave) return NextResponse.next({ request });

  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida el token con el servidor de Supabase (getSession() solo lee la cookie y no basta)
  const { data } = await supabase.auth.getUser();
  const enApp = request.nextUrl.pathname.startsWith('/app');
  // CANDADO DE ACCESO. La regla vive en la base (mi_acceso): una sola fuente para la app y los correos.
  // · Cuenta desactivada desde el panel del dueño: se cierra su sesión.
  // · Sin acceso (nunca pagó, terminó su prueba o su suscripción): ve la pantalla de planes. Solo "Mi cuenta" sigue
  //   abierta, para descargar su Excel, ver cómo cancelar o borrar sus datos.
  // · Si la consulta falla no se bloquea a nadie (es un candado comercial; los datos siguen protegidos por RLS).
  if (data.user && enApp) {
    const { data: acceso } = await supabase.rpc('mi_acceso');
    const info = acceso as { ok?: boolean; motivo?: string; estado?: string } | null;
    if (info?.estado === 'desactivado') {
      await supabase.auth.signOut();
      const destino = request.nextUrl.clone();
      destino.pathname = '/entrar';
      destino.search = '?error=desactivada';
      const salida = NextResponse.redirect(destino);
      respuesta.cookies.getAll().forEach(({ name, value }) => salida.cookies.set(name, value));
      return salida;
    }
    if (info?.ok === false && !request.nextUrl.pathname.startsWith('/app/cuenta')) {
      const destino = request.nextUrl.clone();
      destino.pathname = '/paywall';
      destino.search = `?acceso=${encodeURIComponent(info.motivo ?? 'sin_plan')}`;
      const salida = NextResponse.redirect(destino);
      respuesta.cookies.getAll().forEach(({ name, value }) => salida.cookies.set(name, value));
      return salida;
    }
  }
  if (!data.user && enApp) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = '';
    return NextResponse.redirect(destino);
  }
  return respuesta;
}

export const config = {
  matcher: ['/app/:path*', '/entrar', '/admin/:path*', '/admin'],
};
