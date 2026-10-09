// Recibe los eventos de uso del navegador y los guarda en event_log.
// Siempre responde 204: medir nunca debe romper ni frenar la experiencia de nadie.

import { NextRequest, NextResponse } from 'next/server';
import { dentroDelLimite, esEventoValido, limpiarProps } from '@/lib/eventos';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';
const VACIO = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return VACIO();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida';
    if (!dentroDelLimite(`evento:${ip}`)) return VACIO();
    const texto = await req.text();
    if (texto.length > 2000) return VACIO();
    const cuerpo = JSON.parse(texto) as { tipo?: unknown; sesion?: unknown; props?: unknown; qa?: unknown };
    if (!esEventoValido(cuerpo.tipo)) return VACIO();

    // Si hay sesión, el usuario sale de la sesión verificada (nunca de lo que diga el navegador)
    const sb = await supabaseServidor();
    const { data } = await sb.auth.getUser();
    const fila = {
      tipo: cuerpo.tipo,
      user_id: data.user?.id ?? null,
      sesion: typeof cuerpo.sesion === 'string' ? cuerpo.sesion.slice(0, 64) : null,
      props: limpiarProps(cuerpo.props),
      es_qa: cuerpo.qa === true,
    };
    if (servicioConfigurado()) await supabaseServicio().from('event_log').insert(fila);
    else if (data.user) await sb.from('event_log').insert(fila); // con sesión, la política RLS deja guardar el evento propio
  } catch {
    /* medir nunca rompe nada */
  }
  return VACIO();
}
