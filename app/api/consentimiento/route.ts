// Guarda que ESTA persona (ya identificada por su sesión) aceptó los documentos legales, con su versión y fecha.
// La identidad sale de la sesión verificada en el servidor, nunca de lo que mande el navegador.

import { NextRequest, NextResponse } from 'next/server';
import { VERSION_LEGAL } from '@/lib/legal';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { supabaseServidor } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !servicioConfigurado()) return new NextResponse(null, { status: 204 });
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  const cuerpo = (await req.json().catch(() => null)) as { version?: unknown } | null;
  // Solo se registra la versión vigente: una versión vieja o inventada no cuenta
  if (!cuerpo || cuerpo.version !== VERSION_LEGAL) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await supabaseServicio().from('consentimientos').upsert({ user_id: data.user.id, version: VERSION_LEGAL, origen: 'entrar' }, { onConflict: 'user_id,version', ignoreDuplicates: true });
  return error ? NextResponse.json({ ok: false }, { status: 500 }) : NextResponse.json({ ok: true });
}
