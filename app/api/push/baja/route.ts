// Quita el dispositivo de la persona (deja de recibir avisos en ese celular).

import { NextRequest, NextResponse } from 'next/server';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { supabaseServidor } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !servicioConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  const c = (await req.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (typeof c?.endpoint !== 'string') return NextResponse.json({ ok: false }, { status: 400 });
  // solo borra una suscripción que sea de esta persona
  const { error } = await supabaseServicio().from('push_suscripciones').delete().eq('endpoint', c.endpoint).eq('user_id', data.user.id);
  return error ? NextResponse.json({ ok: false }, { status: 500 }) : NextResponse.json({ ok: true });
}
