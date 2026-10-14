// Guarda la encuesta de salida (2 preguntas). El enlace del correo lleva una firma: sin ella no se guarda nada.

import { NextRequest, NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { verificarFirma } from '@/lib/avisos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';

const MOTIVOS = ['diseno', 'uso', 'otro'] as const;

export async function POST(req: NextRequest) {
  if (!servicioConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida';
  if (!dentroDelLimite(`encuesta:${ip}`, 10)) return NextResponse.json({ ok: false }, { status: 429 });
  const c = (await req.json().catch(() => null)) as { t?: unknown; motivo?: unknown; motivoOtro?: unknown; queProbaria?: unknown } | null;
  if (!c || typeof c.t !== 'string' || typeof c.motivo !== 'string' || !(MOTIVOS as readonly string[]).includes(c.motivo)) return NextResponse.json({ ok: false }, { status: 400 });
  const userId = verificarFirma(c.t, 'encuesta');
  if (!userId) return NextResponse.json({ ok: false }, { status: 400 });
  const texto = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

  const sb = supabaseServicio();
  const { data: perfil } = await sb.from('perfiles').select('email').eq('id', userId).maybeSingle();
  if (!perfil) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await sb.from('encuesta_salida').upsert(
    { user_id: userId, email: perfil.email, motivo: c.motivo, motivo_otro: c.motivo === 'otro' ? texto(c.motivoOtro, 500) : null, que_probaria: texto(c.queProbaria, 1000) },
    { onConflict: 'user_id' },
  );
  return error ? NextResponse.json({ ok: false }, { status: 500 }) : NextResponse.json({ ok: true });
}
