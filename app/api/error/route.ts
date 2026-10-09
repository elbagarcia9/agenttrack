// Recibe los errores que ven las personas (desde las pantallas de error) y los guarda en error_log para el panel.

import { NextRequest, NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';
const VACIO = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return VACIO();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida';
    if (!dentroDelLimite(`error:${ip}`, 20)) return VACIO();
    const texto = await req.text();
    if (texto.length > 2000) return VACIO();
    const c = JSON.parse(texto) as { mensaje?: unknown; contexto?: unknown; ruta?: unknown };
    if (typeof c.mensaje !== 'string' || !c.mensaje) return VACIO();
    const sb = await supabaseServidor();
    const { data } = await sb.auth.getUser();
    const fila = {
      mensaje: c.mensaje.slice(0, 500),
      contexto: typeof c.contexto === 'string' ? c.contexto.slice(0, 200) : null,
      ruta: typeof c.ruta === 'string' ? c.ruta.slice(0, 200) : null,
      user_id: data.user?.id ?? null,
    };
    if (servicioConfigurado()) await supabaseServicio().from('error_log').insert(fila);
    else if (data.user) await sb.from('error_log').insert(fila);
  } catch {
    /* reportar un error nunca debe causar otro */
  }
  return VACIO();
}
