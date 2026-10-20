// Guarda el dispositivo de la persona para mandarle avisos. La persona sale de la sesión verificada en el servidor,
// nunca de lo que mande el navegador.

import { NextRequest, NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { supabaseServidor } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

const ENDPOINT = /^https:\/\/[^\s]{10,1000}$/;

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !servicioConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!dentroDelLimite(`push:${data.user.id}`, 20)) return NextResponse.json({ ok: false }, { status: 429 });

  const c = (await req.json().catch(() => null)) as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  const endpoint = c?.endpoint;
  const p256dh = c?.keys?.p256dh;
  const auth = c?.keys?.auth;
  if (typeof endpoint !== 'string' || !ENDPOINT.test(endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const dispositivo = (req.headers.get('user-agent') ?? '').slice(0, 120) || null;
  const { error } = await supabaseServicio().from('push_suscripciones').upsert({ user_id: data.user.id, endpoint, p256dh, auth, dispositivo }, { onConflict: 'endpoint' });
  return error ? NextResponse.json({ ok: false }, { status: 500 }) : NextResponse.json({ ok: true });
}
