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
  // Cuenta desactivada desde el panel del dueño: se cierra su sesión y no entra a la app
  if (data.user && enApp) {
    const { data: perfil } = await supabase.from('perfiles').select('estado').eq('id', data.user.id).maybeSingle();
    if (perfil?.estado === 'desactivado') {
      await supabase.auth.signOut();
      const destino = request.nextUrl.clone();
      destino.pathname = '/entrar';
      destino.search = '?error=desactivada';
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
