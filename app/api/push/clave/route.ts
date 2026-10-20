// Clave PÚBLICA para que el celular pueda suscribirse a los avisos (no es secreta: solo identifica a AgentTrack).

import { NextResponse } from 'next/server';
import { clavesVapid } from '@/lib/push';
import { servicioConfigurado } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';

export async function GET() {
  if (!servicioConfigurado()) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  return NextResponse.json({ clave: clavesVapid().publica }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
