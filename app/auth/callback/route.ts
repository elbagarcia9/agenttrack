// Destino del enlace mágico del correo: cambia el código de un solo uso por una sesión y entra a la app.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const siguiente = searchParams.get('next');
  // Solo rutas internas: evita que el enlace redirija a un sitio externo
  const destino = siguiente && siguiente.startsWith('/') && !siguiente.startsWith('//') ? siguiente : '/app';

  if (code) {
    const almacen = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => almacen.getAll(),
          setAll: (lista) => lista.forEach(({ name, value, options }) => almacen.set(name, value, options)),
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }
  return NextResponse.redirect(`${origin}/entrar?error=enlace`);
}
