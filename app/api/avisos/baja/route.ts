// Dejar de recibir avisos por correo. Se confirma con un botón en /baja (un POST) para que los
// escáneres de correo que abren enlaces solos no den de baja a nadie por accidente.

import { NextRequest, NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { verificarFirma } from '@/lib/avisos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!servicioConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida';
  if (!dentroDelLimite(`baja:${ip}`, 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const cuerpo = (await req.json().catch(() => null)) as { t?: unknown; volver?: unknown } | null;
  if (!cuerpo || typeof cuerpo.t !== 'string') return NextResponse.json({ ok: false }, { status: 400 });
  const userId = verificarFirma(cuerpo.t, 'baja');
  if (!userId) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await supabaseServicio().from('perfiles').update({ avisos_correo: cuerpo.volver === true }).eq('id', userId);
  return error ? NextResponse.json({ ok: false }, { status: 500 }) : NextResponse.json({ ok: true });
}
