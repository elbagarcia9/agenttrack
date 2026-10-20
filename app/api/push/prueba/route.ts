// Manda un aviso de prueba a los celulares de la propia persona, para comprobar que las notificaciones llegan.

import { NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { enviarPush } from '@/lib/push';
import { servicioConfigurado } from '@/lib/supabase/servicio';
import { supabaseServidor } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !servicioConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!dentroDelLimite(`push-prueba:${data.user.id}`, 5)) return NextResponse.json({ ok: false, motivo: 'limite' }, { status: 429 });
  const r = await enviarPush(data.user.id, {
    titulo: 'AgentTrack: así llegan tus avisos',
    cuerpo: 'Dar de alta · Cliente de ejemplo: quedan 4 días. Toca para abrir tu app.',
    url: '/app/alertas',
    tag: 'prueba',
  });
  return NextResponse.json({ ok: r.enviados > 0, ...r });
}
