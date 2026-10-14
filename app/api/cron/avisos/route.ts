// Tarea diaria (Vercel Cron, 8:00 hora de México): manda por correo el resumen de plazos, el aviso de fin de
// tiempo gratis y la invitación a la encuesta de salida. Solo la puede llamar Vercel con CRON_SECRET (si falta, no corre).

import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { aReserva, avisosDeHoy, claveDia, correoEncuesta, correoFinDePrueba, correoResumen, enviarCorreo, hoyMexico, type FilaReserva } from '@/lib/avisos';
import { diasRestantes } from '@/lib/plazos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

interface Perfil {
  id: string;
  email: string;
  nombre: string | null;
  membresia: string | null;
  acceso_tipo: string | null;
  acceso_hasta: string | null;
  trial_ends_at: string | null;
}

const COLUMNAS_RESERVA =
  'id, user_id, cliente, contacto, destino, tipo, proveedor, precio_venta, comision, moneda, fecha_compra, fecha_viaje, pago_pendiente_fecha, pago_pendiente_monto, comentarios, estatus';

function autorizado(req: NextRequest): boolean {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const dado = Buffer.from(req.headers.get('authorization') ?? '');
  const esperado = Buffer.from(`Bearer ${secreto}`);
  return dado.length === esperado.length && timingSafeEqual(dado, esperado);
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || !servicioConfigurado() || !process.env.RESEND_API_KEY) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  if (!autorizado(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const sb = supabaseServicio();
  const hoy = hoyMexico();
  const dia = claveDia(hoy);
  const conteo = { personas: 0, resumenes: 0, fin_de_prueba: 0, encuestas: 0, fallidos: 0 };

  const { data: perfiles, error } = await sb
    .from('perfiles')
    .select('id, email, nombre, membresia, acceso_tipo, acceso_hasta, trial_ends_at')
    .eq('estado', 'activo')
    .eq('avisos_correo', true);
  if (error) return NextResponse.json({ error: 'No se pudo leer a las personas' }, { status: 500 });
  const personas = (perfiles ?? []) as Perfil[];
  conteo.personas = personas.length;

  // Reservas de todas las personas, por tandas de 1000
  const porPersona = new Map<string, FilaReserva[]>();
  for (let desde = 0; ; desde += 1000) {
    const { data, error: e } = await sb.from('reservas').select(COLUMNAS_RESERVA).range(desde, desde + 999);
    if (e) return NextResponse.json({ error: 'No se pudieron leer las reservas' }, { status: 500 });
    for (const f of (data ?? []) as (FilaReserva & { user_id: string })[]) porPersona.set(f.user_id, [...(porPersona.get(f.user_id) ?? []), f]);
    if (!data || data.length < 1000) break;
  }

  // Una sola vez por persona, tipo y día: se reserva el lugar antes de enviar y se libera si el envío falla
  const enviarUnaVez = async (p: Perfil, tipo: string, armar: () => Parameters<typeof enviarCorreo>[1]): Promise<boolean> => {
    const { error: dup } = await sb.from('avisos_enviados').insert({ user_id: p.id, tipo, dia });
    if (dup) return false; // ya se mandó hoy (o no se pudo reservar)
    let ok = false;
    try {
      ok = await enviarCorreo(p.email, armar());
    } catch {
      ok = false;
    }
    if (!ok) {
      conteo.fallidos += 1;
      await sb.from('avisos_enviados').delete().eq('user_id', p.id).eq('tipo', tipo).eq('dia', dia);
    }
    return ok;
  };

  for (const p of personas) {
    if (!p.email) continue;

    const avisos = avisosDeHoy((porPersona.get(p.id) ?? []).map(aReserva), hoy);
    if (avisos.length > 0 && (await enviarUnaVez(p, 'resumen', () => correoResumen(p.nombre, p.id, avisos, hoy)))) conteo.resumenes += 1;

    // Fin del tiempo gratis (regalo del dueño o prueba): aviso 2 días antes y encuesta al día siguiente de terminar
    const paga = p.membresia === 'active' || p.membresia === 'past_due';
    const fin = p.membresia === 'trialing' ? p.trial_ends_at : p.membresia === 'manual' && p.acceso_tipo !== 'siempre' ? p.acceso_hasta : null;
    if (fin && !paga) {
      const finDia = hoyMexico(new Date(fin));
      const faltan = diasRestantes(finDia, hoy);
      if (faltan === 2 && (await enviarUnaVez(p, 'fin_de_prueba', () => correoFinDePrueba(p.nombre, p.id, faltan, finDia, hoy)))) conteo.fin_de_prueba += 1;
      if (faltan === -1 && (await enviarUnaVez(p, 'encuesta', () => correoEncuesta(p.nombre, p.id)))) conteo.encuestas += 1;
    }
  }

  return NextResponse.json({ ok: true, dia, ...conteo });
}
