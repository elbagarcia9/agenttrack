import 'server-only';

// AVISOS POR CORREO — la promesa central de la app: avisar de los plazos aunque la persona no abra la app.
// Cada día (8:00 hora de México) se revisa a cada persona y solo se escribe a quien tenga algo que hacer.
// Los enlaces de "dejar de recibir" y de la encuesta llevan una firma (HMAC) para que nadie pueda tocar cuentas ajenas.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { alertasDe, type Alerta, type Reserva } from '@/lib/reservas-reglas';
import { SOPORTE_EMAIL } from '@/lib/legal';
import { capitalizar, diasRestantes, formatoFecha, parseFecha, sumarDias } from '@/lib/plazos';
import { supabaseServicio } from '@/lib/supabase/servicio';

export const SITIO = 'https://agenttrack.app';
const REMITENTE = 'AgentTrack <avisos@agenttrack.app>';

// ───────────── firmas de enlaces ─────────────
function clave(): string {
  const k = process.env.SUPABASE_SECRET_KEY;
  if (!k) throw new Error('Falta SUPABASE_SECRET_KEY');
  return k;
}

export function firmar(userId: string, uso: 'baja' | 'encuesta'): string {
  const mac = createHmac('sha256', clave()).update(`${uso}:${userId}`).digest('base64url');
  return `${userId}.${mac}`;
}

export function verificarFirma(token: string, uso: 'baja' | 'encuesta'): string | null {
  const [userId, mac] = token.split('.');
  if (!userId || !mac || !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const esperado = createHmac('sha256', clave()).update(`${uso}:${userId}`).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b) ? userId : null;
}

// ───────────── fecha de hoy en México ─────────────
// Devuelve un Date a medianoche "local" con el día que es ahora en Ciudad de México (los cálculos de plazos usan días, no horas).
export function hoyMexico(ahora: Date = new Date()): Date {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
  const [y, m, d] = p.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function claveDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ───────────── qué avisos merece cada persona hoy ─────────────
export interface FilaReserva {
  id: string;
  cliente: string;
  contacto: string | null;
  destino: string;
  tipo: string;
  proveedor: string | null;
  precio_venta: number | string;
  comision: number | string;
  moneda: string;
  fecha_compra: string;
  fecha_viaje: string;
  pago_pendiente_fecha: string | null;
  pago_pendiente_monto: number | string | null;
  comentarios: string | null;
  estatus: string;
}

export function aReserva(f: FilaReserva): Reserva {
  return {
    id: f.id,
    cliente: f.cliente,
    contacto: f.contacto ?? '',
    destino: f.destino,
    tipo: f.tipo as Reserva['tipo'],
    proveedor: f.proveedor ?? '',
    precioVenta: Number(f.precio_venta),
    comision: Number(f.comision),
    moneda: f.moneda as Reserva['moneda'],
    fechaCompra: f.fecha_compra,
    fechaViaje: f.fecha_viaje,
    pagoPendienteFecha: f.pago_pendiente_fecha ?? undefined,
    pagoPendienteMonto: f.pago_pendiente_monto === null ? undefined : Number(f.pago_pendiente_monto),
    comentarios: f.comentarios ?? '',
    estatus: f.estatus as Reserva['estatus'],
    creada: 0,
  };
}

// Para no insistir todos los días con lo mismo: lo urgente (5 días o menos) avisa a diario, lo vencido solo el día
// que venció, y la apertura de la ventana de revisión (60 días tras el viaje) solo el día que abre.
export function avisosDeHoy(reservas: Reserva[], hoy: Date): Alerta[] {
  const salida: Alerta[] = [];
  for (const r of reservas) {
    const viaje = parseFecha(r.fechaViaje);
    for (const a of alertasDe(r, hoy)) {
      if (a.tipo === 'salida') salida.push(a);
      else if (a.severidad === 'urgente') salida.push(a);
      else if (a.severidad === 'vencido' && diasRestantes(a.fecha, hoy) === -1) salida.push(a);
      else if (a.tipo === 'revision' && viaje && diasRestantes(sumarDias(viaje, 60), hoy) === 0) salida.push(a);
    }
  }
  const orden = { vencido: 0, urgente: 1, normal: 2, info: 3 } as const;
  return salida.sort((a, b) => orden[a.severidad] - orden[b.severidad] || a.fecha.getTime() - b.fecha.getTime());
}

// ───────────── correos ─────────────
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function plantilla(titulo: string, cuerpo: string, pie: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#eaeaea;font-family:Arial,Helvetica,sans-serif;color:#111518">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<p style="margin:0 0 16px"><a href="${SITIO}"><img src="${SITIO}/img/logo-agenttrack.png" width="180" height="43" alt="AgentTrack" style="display:block;border:0;height:auto;max-width:180px"></a></p>
<div style="background:#ffffff;border-radius:14px;padding:24px">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${titulo}</h1>
${cuerpo}
</div>
<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#5b666d">${pie}</p>
</div></body></html>`;
}

function boton(url: string, texto: string): string {
  return `<p style="margin:20px 0 0"><a href="${url}" style="display:inline-block;background:#226697;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:11px">${esc(texto)}</a></p>`;
}

function pieBaja(userId: string): { texto: string; url: string } {
  const url = `${SITIO}/baja?t=${encodeURIComponent(firmar(userId, 'baja'))}`;
  return { url, texto: `Recibes este correo porque tienes una cuenta en AgentTrack. <a href="${url}" style="color:#5b666d">Dejar de recibir avisos</a>.` };
}

export function correoResumen(nombre: string | null, userId: string, avisos: Alerta[], hoy: Date): { asunto: string; html: string; baja: string } {
  const baja = pieBaja(userId);
  const n = avisos.length;
  const saludo = nombre ? `Hola, ${esc(nombre.split(' ')[0])}.` : 'Hola.';
  const filas = avisos
    .map((a) => {
      const d = diasRestantes(a.fecha, hoy);
      const cuando = a.tipo === 'salida' ? (d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`) : a.severidad === 'vencido' ? 'Venció ayer' : d === 0 ? 'Vence hoy' : d === 1 ? 'Vence mañana' : `Quedan ${d} días`;
      const color = a.severidad === 'vencido' ? '#8a1c1c' : a.severidad === 'urgente' ? '#8a5a00' : '#226697';
      return `<tr><td style="padding:12px 0;border-top:1px solid #e6eef4"><p style="margin:0;font-weight:bold">${esc(a.titulo)}</p><p style="margin:4px 0 0;font-size:14px;color:#5b666d">${esc(a.detalle)}</p><p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:${color}">${cuando} · ${esc(formatoFecha(a.fecha, hoy))}</p></td></tr>`;
    })
    .join('');
  const cuerpo = `<p style="margin:0 0 8px;font-size:16px">${saludo} Esto necesita tu atención:</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px">${filas}</table>${boton(`${SITIO}/app/alertas`, 'Ver mis avisos')}`;
  const asunto = n === 1 ? `1 aviso para hoy: ${avisos[0].titulo}` : `${n} avisos para hoy en AgentTrack`;
  return { asunto, html: plantilla(capitalizar(n === 1 ? 'tienes 1 plazo por atender' : `tienes ${n} plazos por atender`), cuerpo, baja.texto), baja: baja.url };
}

export function correoFinDePrueba(nombre: string | null, userId: string, dias: number, hasta: Date, hoy: Date): { asunto: string; html: string; baja: string } {
  const baja = pieBaja(userId);
  const cuando = dias === 1 ? 'mañana' : `en ${dias} días`;
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">${nombre ? `Hola, ${esc(nombre.split(' ')[0])}. ` : ''}Tu tiempo gratis en AgentTrack termina <b>${cuando}</b> (${esc(formatoFecha(hasta, hoy))}).</p>
<p style="margin:0 0 12px;font-size:16px">Para que tu asistente siga recordándote tus altas, cobros y reclamos de comisión, elige tu plan antes de esa fecha.</p>${boton(`${SITIO}/paywall`, 'Elegir mi plan')}`;
  return { asunto: `Tu tiempo gratis termina ${cuando}`, html: plantilla('Tu tiempo gratis está por terminar', cuerpo, baja.texto), baja: baja.url };
}

export function correoEncuesta(nombre: string | null, userId: string): { asunto: string; html: string; baja: string } {
  const baja = pieBaja(userId);
  const url = `${SITIO}/encuesta?t=${encodeURIComponent(firmar(userId, 'encuesta'))}`;
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">${nombre ? `Hola, ${esc(nombre.split(' ')[0])}. ` : ''}Tu tiempo gratis en AgentTrack terminó y no queremos que te vayas sin escucharte.</p>
<p style="margin:0 0 12px;font-size:16px">Son 2 preguntas y toman menos de un minuto. Lo que nos cuentes decide qué mejoramos primero.</p>${boton(url, 'Contestar 2 preguntas')}`;
  return { asunto: '¿Qué faltó en AgentTrack? Son 2 preguntas', html: plantilla('Cuéntanos qué no te convenció', cuerpo, baja.texto), baja: baja.url };
}

// ───────────── correos de cobro (los manda el aviso de pagos de Hotmart) ─────────────
const HOTMART_COMPRAS = 'https://consumer.hotmart.com';

// Pago atrasado: es un aviso de cuenta, no de mercadotecnia (no lleva "dejar de recibir")
export function correoPagoAtrasado(nombre: string | null): { asunto: string; html: string } {
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">${nombre ? `Hola, ${esc(nombre.split(' ')[0])}. ` : ''}Hotmart no pudo cobrar el último pago de tu suscripción de AgentTrack.</p>
<p style="margin:0 0 12px;font-size:16px"><b>Tu acceso sigue activo unos días</b> para que lo resuelvas. Para no perderlo, actualiza tu forma de pago en Hotmart: entra a <b>Mis compras</b>, abre AgentTrack, <b>Mostrar detalles</b> y <b>Configurar forma de pago</b>.</p>${boton(HOTMART_COMPRAS, 'Actualizar mi forma de pago')}
<p style="margin:16px 0 0;font-size:14px;color:#5b666d">¿Dudas? Responde a este correo o escríbenos a ${esc(SOPORTE_EMAIL)}.</p>`;
  return { asunto: 'No pudimos cobrar tu suscripción de AgentTrack', html: plantilla('Hubo un problema con tu pago', cuerpo, 'Si ya lo resolviste, ignora este correo.') };
}

// Cancelación: confirma que no habrá más cobros, hasta cuándo tiene acceso y cómo llevarse sus datos
export function correoCancelacion(nombre: string | null, userId: string, hasta: Date | null, hoy: Date): { asunto: string; html: string } {
  const quedan = hasta && hasta.getTime() > hoy.getTime() ? `Tienes acceso hasta el <b>${esc(formatoFecha(hasta, hoy))}</b>.` : 'Tu acceso termina ahora.';
  const url = `${SITIO}/encuesta?t=${encodeURIComponent(firmar(userId, 'encuesta'))}`;
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">${nombre ? `Hola, ${esc(nombre.split(' ')[0])}. ` : ''}Cancelamos tu suscripción de AgentTrack. <b>No habrá más cobros.</b></p>
<p style="margin:0 0 12px;font-size:16px">${quedan} Tus reservas se conservan y puedes descargarlas a Excel cuando quieras desde <b>Mi cuenta</b>.</p>${boton(`${SITIO}/app/cuenta`, 'Descargar mis reservas')}
<p style="margin:20px 0 0;font-size:16px">¿Nos cuentas qué faltó? Son 2 preguntas y nos ayudan a mejorar: <a href="${url}" style="color:#226697;font-weight:bold">contestar</a>.</p>`;
  return { asunto: 'Cancelaste AgentTrack: así queda tu cuenta', html: plantilla('Tu suscripción quedó cancelada', cuerpo, `Si fue un error, puedes volver cuando quieras en ${SITIO}/paywall.`) };
}

// A los 30 días de cancelar: una sola invitación a volver (sí lleva "dejar de recibir")
export function correoReactivar(nombre: string | null, userId: string): { asunto: string; html: string; baja: string } {
  const baja = pieBaja(userId);
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">${nombre ? `Hola, ${esc(nombre.split(' ')[0])}. ` : ''}Hace un mes dejaste AgentTrack. <b>Tus reservas siguen guardadas</b>, tal como las dejaste.</p>
<p style="margin:0 0 12px;font-size:16px">Si quieres que tu asistente vuelva a vigilar tus plazos de alta, cobro y reclamo, puedes retomar tu plan cuando quieras.</p>${boton(`${SITIO}/paywall`, 'Volver a mi plan')}`;
  return { asunto: 'Tus reservas te esperan en AgentTrack', html: plantilla('Tus reservas siguen aquí', cuerpo, baja.texto), baja: baja.url };
}

// Recordatorio semanal para la dueña: bajar el respaldo (el plan gratis de Supabase no guarda copias)
export function correoRecordatorioRespaldo(): { asunto: string; html: string } {
  const cuerpo = `<p style="margin:0 0 12px;font-size:16px">Es lunes: toca bajar el respaldo de tus datos de AgentTrack.</p>
<p style="margin:0 0 12px;font-size:16px">Son 10 segundos: entra a <b>Panel → Salud</b> y pulsa <b>Descargar respaldo ahora</b>. Guarda el archivo en un lugar privado.</p>${boton(`${SITIO}/admin/salud`, 'Ir a descargar el respaldo')}`;
  return { asunto: 'Lunes de respaldo: baja tus datos de AgentTrack', html: plantilla('Recordatorio de respaldo', cuerpo, 'Este recordatorio llega cada lunes solo a la dueña de AgentTrack.') };
}

// Manda un correo de cobro a quien tenga cuenta, una sola vez al día por tipo. Nunca lanza error: el aviso de pagos de Hotmart no debe fallar por un correo.
export async function correoDeCobro(email: string, tipo: 'pago_atrasado' | 'cancelacion'): Promise<void> {
  try {
    const sb = supabaseServicio();
    const { data: p } = await sb.from('perfiles').select('id, nombre').eq('email', email).maybeSingle();
    if (!p) return; // todavía no tiene cuenta
    const hoy = hoyMexico();
    const dia = claveDia(hoy);
    const { error: dup } = await sb.from('avisos_enviados').insert({ user_id: p.id, tipo, dia });
    if (dup) return; // ya se mandó hoy
    let correo: { asunto: string; html: string };
    if (tipo === 'pago_atrasado') correo = correoPagoAtrasado(p.nombre);
    else {
      const { data: acceso } = await sb.rpc('acceso_de', { uid: p.id });
      const hasta = (acceso as { hasta?: string } | null)?.hasta;
      correo = correoCancelacion(p.nombre, p.id, hasta ? new Date(hasta) : null, hoy);
    }
    const ok = await enviarCorreo(email, correo).catch(() => false);
    if (!ok) await sb.from('avisos_enviados').delete().eq('user_id', p.id).eq('tipo', tipo).eq('dia', dia);
  } catch {
    /* un correo que falla nunca rompe el aviso de pagos */
  }
}

// El aviso corto que aparece en la pantalla del celular: lo más urgente primero
export function resumenPush(avisos: Alerta[], hoy: Date): { titulo: string; cuerpo: string } {
  const a = avisos[0];
  const d = diasRestantes(a.fecha, hoy);
  const cuando = a.tipo === 'salida' ? (d === 0 ? 'sale hoy' : d === 1 ? 'sale mañana' : `sale en ${d} días`) : a.severidad === 'vencido' ? 'venció ayer' : d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `quedan ${d} días`;
  const n = avisos.length;
  return { titulo: n === 1 ? '1 plazo por atender' : `${n} plazos por atender`, cuerpo: `${a.titulo}: ${cuando}${n > 1 ? ` (y ${n - 1} más)` : ''}` };
}

// ───────────── envío (Resend) ─────────────
let alertaDeLimiteDada = false;
async function avisarFalla(estado: number, detalle: string): Promise<void> {
  // Si el proveedor rechaza por límite o por permisos, queda una alerta visible en el panel (Salud → Errores)
  if (alertaDeLimiteDada || (estado !== 429 && estado !== 401 && estado !== 403)) return;
  alertaDeLimiteDada = true;
  const mensaje = estado === 429 ? 'Resend: se alcanzó el límite de correos (revisa tu plan y uso en resend.com)' : 'Resend: rechazó el envío (revisa la clave en Vercel)';
  await supabaseServicio().from('error_log').insert({ mensaje, contexto: `correo ${estado}: ${detalle.slice(0, 120)}`, ruta: 'avisos' });
}

export async function enviarCorreo(para: string, c: { asunto: string; html: string; baja?: string }): Promise<boolean> {
  const k = process.env.RESEND_API_KEY;
  if (!k) throw new Error('Falta RESEND_API_KEY');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: REMITENTE,
      to: [para],
      subject: c.asunto,
      html: c.html,
      ...(c.baja ? { headers: { 'List-Unsubscribe': `<${c.baja}>` } } : {}),
    }),
  });
  if (!r.ok) await avisarFalla(r.status, await r.text().catch(() => '')).catch(() => undefined);
  return r.ok;
}
