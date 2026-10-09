// Webhook de Hotmart (18): autenticidad → catálogo → frescura → idempotencia + libro de transacciones + membresía (atómico en la base).
// Cada intento queda en webhook_log para el panel del dueño. Responde 5xx si falla de verdad (Hotmart reintenta)
// y 200 cuando la decisión ya se tomó (duplicado, ignorado, rechazado).
// ALCANCE: registra ventas y membresías. Crear la cuenta del comprador y mandarle el acceso es el paso de Hotmart/Resend.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { hottokValido, interpretarEvento } from '@/lib/hotmart';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';

// Una ventana corta rechazaría reintentos legítimos de Hotmart tras una caída; la repetición ya la frena la idempotencia.
const VENTANA_MS = Number(process.env.HOTMART_VENTANA_MIN ?? 1440) * 60_000;

export async function POST(req: NextRequest) {
  const hottokEsperado = process.env.HOTMART_HOTTOK;
  const productos = (process.env.HOTMART_PRODUCT_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  // Fail-secure: sin las tres piezas no se procesa nada (nunca valores por defecto "de juguete")
  if (!hottokEsperado || productos.length === 0 || !servicioConfigurado()) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }
  const sb = supabaseServicio();
  const registrar = async (result: string, eventId?: string, type?: string) => {
    await sb.from('webhook_log').insert({ event_id: eventId ?? null, type: type ?? null, result });
  };

  const crudo = await req.text(); // bytes exactos, antes de interpretar nada
  const hottok = req.headers.get('x-hotmart-hottok');
  if (!hottokValido(hottok, hottokEsperado)) {
    await registrar('unauthorized');
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); // genérico: no revela por qué
  }

  let payload: unknown;
  try {
    payload = JSON.parse(crudo);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const ev = interpretarEvento(payload);
  if (!ev) {
    await registrar('ignored');
    return NextResponse.json({ received: true, ignored: true });
  }

  const creado = Number((payload as { creation_date?: unknown }).creation_date);
  if (Number.isFinite(creado) && creado > 0 && Date.now() - creado > VENTANA_MS) {
    await registrar('rejected', ev.eventId, ev.evento);
    return NextResponse.json({ received: true, stale: true });
  }
  if (!ev.productId || !productos.includes(ev.productId)) {
    await registrar('rejected', ev.eventId, ev.evento); // producto ajeno: se registra y se rechaza
    return NextResponse.json({ received: true, rejected: true });
  }
  if (!ev.nuevaMembresia) {
    await registrar('ignored', ev.eventId, ev.evento); // evento que aún no mapeamos: visible en el panel
    return NextResponse.json({ received: true, ignored: ev.evento });
  }

  const { data, error } = await sb.rpc('aplicar_evento_hotmart', {
    p: {
      event_id: ev.eventId,
      event_type: ev.evento,
      payload_hash: crypto.createHash('sha256').update(crudo).digest('hex'),
      email: ev.email,
      subscriber_code: ev.subscriberCode,
      nueva_membresia: ev.nuevaMembresia,
      churn_tipo: ev.churnTipo,
      ciclo: ev.ciclo,
      recurrence_number: ev.recurrencia,
      tx: ev.tx,
    },
  });
  if (error) {
    console.error('webhook hotmart: error al aplicar', { evento: ev.evento, codigo: error.code }); // sin datos personales
    await registrar('error', ev.eventId, ev.evento);
    return NextResponse.json({ error: 'processing failed' }, { status: 500 }); // Hotmart reintenta
  }
  const estado = (data as { status?: string } | null)?.status;
  await registrar(estado === 'duplicate' ? 'duplicate' : estado === 'illegal_transition' ? 'illegal' : 'applied', ev.eventId, ev.evento);
  return NextResponse.json({ received: true, result: estado ?? 'ok' });
}
