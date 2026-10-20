'use server';

// Acciones del panel del dueño. Cada una vuelve a verificar en el servidor que quien llama es administrador
// (nunca se confía en que el botón estaba escondido) y valida todo lo que recibe.

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { dentroDelLimite } from '@/lib/eventos';
import { aCentavos } from '@/lib/admin/formato';
import { aReserva, avisosDeHoy, correoCancelacion, correoEncuesta, correoFinDePrueba, correoPagoAtrasado, correoReactivar, correoResumen, enviarCorreo, hoyMexico, type FilaReserva } from '@/lib/avisos';
import { semilla } from '@/lib/reservas-reglas';
import { exigirAdmin } from '@/lib/supabase/servidor';

export type Resultado = { ok: boolean; mensaje: string } | null;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MONEDAS = ['USD', 'MXN'];
const falla = (mensaje: string): Resultado => ({ ok: false, mensaje });
const exito = (mensaje: string): Resultado => ({ ok: true, mensaje });
const texto = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

async function origenDelSitio(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

// Manda el enlace de acceso. Con crearCuenta=true (invitados que aún no han entrado) la cuenta se crea al abrirlo
async function mandarAcceso(email: string, crearCuenta = false): Promise<boolean> {
  const anonimo = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await anonimo.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: crearCuenta, emailRedirectTo: `${await origenDelSitio()}/auth/callback` },
  });
  return !error;
}

// ───────── USUARIOS ─────────

const TIPOS_REGALO = ['14_dias', '1_mes', 'siempre'] as const;
type TipoRegalo = (typeof TIPOS_REGALO)[number];
const esTipoRegalo = (v: string): v is TipoRegalo => (TIPOS_REGALO as readonly string[]).includes(v);

function finDelRegalo(tipo: TipoRegalo): string | null {
  if (tipo === 'siempre') return null;
  const d = new Date();
  if (tipo === '14_dias') d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
const textoRegalo = (t: TipoRegalo) => (t === '14_dias' ? '14 días gratis' : t === '1_mes' ? '1 mes gratis' : 'acceso gratis para siempre');

// Agregar a alguien: se guarda su invitación (correo + nombre + tiempo regalado) y, si se quiere, se le manda el enlace de acceso.
// Al entrar por primera vez, la base crea su cuenta con ese regalo (el reloj empieza ese día). No hace falta la clave del servidor.
export async function agregarUsuario(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { sb, user } = await exigirAdmin();
  if (!dentroDelLimite(`alta:${user.id}`, 20)) return falla('Hiciste muchas altas seguidas. Espera un minuto e inténtalo de nuevo.');
  const email = texto(fd, 'email').toLowerCase();
  const nombre = texto(fd, 'nombre');
  const tipo = texto(fd, 'tiempo');
  if (!CORREO.test(email)) return falla('Escribe un correo válido, como nombre@correo.com.');
  if (nombre.length < 2 || nombre.length > 80) return falla('Escribe el nombre de la persona (entre 2 y 80 letras).');
  if (!esTipoRegalo(tipo)) return falla('Elige cuánto tiempo gratis le das: 14 días, 1 mes o siempre.');
  const enviar = fd.get('enviar') === 'on';

  const { data: existente } = await sb.from('perfiles').select('id, membresia').ilike('email', email).maybeSingle();
  let mensaje: string;
  if (existente) {
    if (['active', 'trialing', 'past_due'].includes(existente.membresia ?? '')) return falla('Esa persona ya es cliente de pago: no hace falta regalarle tiempo.');
    const { error } = await sb.from('perfiles').update({ membresia: 'manual', acceso_tipo: tipo, acceso_hasta: finDelRegalo(tipo), nombre }).eq('id', existente.id);
    if (error) return falla('No pudimos guardar el regalo. Inténtalo de nuevo.');
    mensaje = `${nombre} ya tenía cuenta: le diste ${textoRegalo(tipo)} desde hoy.`;
  } else {
    await sb.from('accesos_regalo').delete().eq('email', email).is('aplicado_en', null); // una sola invitación pendiente por correo
    const { error } = await sb.from('accesos_regalo').insert({ email, nombre, tipo });
    if (error) return falla('No pudimos guardar la invitación. Inténtalo de nuevo.');
    mensaje = `Listo: ${nombre} queda invitada con ${textoRegalo(tipo)}. El tiempo empieza a contar el día que entre por primera vez.`;
  }
  if (enviar) {
    mensaje += (await mandarAcceso(email, !existente)) ? ' Le enviamos el enlace de acceso.' : ' No pudimos enviarle el correo ahora; pulsa "Reenviar acceso" en su fila.';
  }
  revalidatePath('/admin/usuarios');
  revalidatePath('/admin');
  return exito(mensaje);
}

// Cambiar el tiempo gratis de alguien que YA tiene cuenta (o quitárselo)
export async function darTiempoGratis(fd: FormData): Promise<Resultado> {
  const { sb } = await exigirAdmin();
  const id = texto(fd, 'id');
  const tiempo = texto(fd, 'tiempo');
  if (!UUID.test(id)) return falla('No encontramos a esa persona.');
  const { data: persona } = await sb.from('perfiles').select('membresia, rol').eq('id', id).maybeSingle();
  if (!persona || persona.rol === 'admin') return falla('Esa cuenta no se puede cambiar.');
  if (['active', 'trialing', 'past_due'].includes(persona.membresia ?? '')) return falla('Es cliente de pago: no se le cambia el acceso desde aquí.');
  if (tiempo === 'quitar') {
    const { error } = await sb.from('perfiles').update({ membresia: null, acceso_tipo: null, acceso_hasta: null }).eq('id', id);
    if (error) return falla('No pudimos quitarlo. Inténtalo de nuevo.');
    revalidatePath('/admin/usuarios');
    return exito('Se le quitó el tiempo gratis.');
  }
  if (!esTipoRegalo(tiempo)) return falla('Elige cuánto tiempo gratis.');
  const { error } = await sb.from('perfiles').update({ membresia: 'manual', acceso_tipo: tiempo, acceso_hasta: finDelRegalo(tiempo) }).eq('id', id);
  if (error) return falla('No pudimos guardar el regalo. Inténtalo de nuevo.');
  revalidatePath('/admin/usuarios');
  return exito(`Listo: ${textoRegalo(tiempo)} desde hoy.`);
}

export async function quitarInvitacion(fd: FormData): Promise<void> {
  const { sb } = await exigirAdmin();
  const id = Number(texto(fd, 'id'));
  if (!Number.isInteger(id) || id <= 0) return;
  await sb.from('accesos_regalo').delete().eq('id', id).is('aplicado_en', null);
  revalidatePath('/admin/usuarios');
}

export async function cambiarEstadoUsuario(fd: FormData): Promise<void> {
  const { sb, user } = await exigirAdmin();
  const id = texto(fd, 'id');
  const estado = texto(fd, 'estado');
  if (!UUID.test(id) || (estado !== 'activo' && estado !== 'desactivado')) return;
  if (id === user.id) return; // nadie se desactiva a sí mismo
  const { data: objetivo } = await sb.from('perfiles').select('rol').eq('id', id).maybeSingle();
  if (!objetivo || objetivo.rol === 'admin') return;
  await sb.from('perfiles').update({ estado }).eq('id', id);
  revalidatePath('/admin/usuarios');
}

export async function reenviarAcceso(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { user } = await exigirAdmin();
  if (!dentroDelLimite(`reenvio:${user.id}`, 10)) return falla('Muchos reenvíos seguidos. Espera un minuto.');
  const email = texto(fd, 'email').toLowerCase();
  if (!CORREO.test(email)) return falla('Correo no válido.');
  return (await mandarAcceso(email, fd.get('crear') === '1')) ? exito(`Enlace enviado a ${email}.`) : falla('No pudimos enviar el correo ahora mismo. Inténtalo en unos minutos.');
}

// ───────── COSTOS Y GASTOS ─────────

export async function guardarCosto(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { sb } = await exigirAdmin();
  const mes = texto(fd, 'mes');
  const concepto = texto(fd, 'concepto');
  const moneda = texto(fd, 'moneda');
  const monto = aCentavos(texto(fd, 'monto'));
  const nota = texto(fd, 'nota').slice(0, 200);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return falla('Elige el mes del costo.');
  if (!['infra', 'email', 'dominio', 'otro'].includes(concepto)) return falla('Elige qué tipo de costo es.');
  if (!MONEDAS.includes(moneda)) return falla('Elige la moneda.');
  if (monto === null) return falla('Escribe el importe con números, por ejemplo 25 o 25.50.');
  const { error } = await sb.from('costos_operativos').insert({ mes: `${mes}-01`, concepto, monto_minor: monto, moneda, nota: nota || null });
  if (error) return falla('No pudimos guardar el costo. Inténtalo de nuevo.');
  revalidatePath('/admin', 'layout');
  return exito('Costo guardado.');
}

export async function borrarCosto(fd: FormData): Promise<void> {
  const { sb } = await exigirAdmin();
  const id = Number(texto(fd, 'id'));
  if (!Number.isInteger(id) || id <= 0) return;
  await sb.from('costos_operativos').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
}

export async function guardarGasto(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { sb } = await exigirAdmin();
  const canal = texto(fd, 'canal').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  const moneda = texto(fd, 'moneda');
  const monto = aCentavos(texto(fd, 'monto'));
  const desde = texto(fd, 'desde');
  const hasta = texto(fd, 'hasta');
  const nota = texto(fd, 'nota').slice(0, 200);
  if (!canal) return falla('Escribe el canal (por ejemplo ads_meta, afiliado, organico).');
  if (!MONEDAS.includes(moneda)) return falla('Elige la moneda.');
  if (monto === null) return falla('Escribe el importe con números, por ejemplo 500 o 500.50.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) return falla('Elige desde y hasta qué día se gastó.');
  if (hasta < desde) return falla('La fecha final no puede ser antes de la inicial.');
  const { error } = await sb.from('acquisition_spend').insert({ canal, monto_minor: monto, moneda, desde, hasta, nota: nota || null });
  if (error) return falla('No pudimos guardar el gasto. Inténtalo de nuevo.');
  revalidatePath('/admin', 'layout');
  return exito('Gasto guardado.');
}

export async function borrarGasto(fd: FormData): Promise<void> {
  const { sb } = await exigirAdmin();
  const id = Number(texto(fd, 'id'));
  if (!Number.isInteger(id) || id <= 0) return;
  await sb.from('acquisition_spend').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
}

export async function guardarTasa(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { sb } = await exigirAdmin();
  const v = Number(texto(fd, 'tasa').replace(',', '.'));
  if (!Number.isFinite(v) || v < 0 || v > 100) return falla('Escribe un porcentaje entre 0 y 100.');
  const { error } = await sb.from('ajustes_negocio').upsert({ clave: 'tasa_impuestos_pct', valor: v, actualizado_en: new Date().toISOString() });
  if (error) return falla('No pudimos guardar la tasa. Inténtalo de nuevo.');
  revalidatePath('/admin', 'layout');
  return exito('Tasa guardada.');
}

// ───────── ERRORES ─────────

export async function resolverError(fd: FormData): Promise<void> {
  const { sb } = await exigirAdmin();
  const mensaje = texto(fd, 'mensaje').slice(0, 500);
  if (!mensaje) return;
  await sb.from('error_log').update({ resuelto: true }).eq('mensaje', mensaje);
  revalidatePath('/admin', 'layout');
}

export async function reabrirError(fd: FormData): Promise<void> {
  const { sb } = await exigirAdmin();
  const mensaje = texto(fd, 'mensaje').slice(0, 500);
  if (!mensaje) return;
  await sb.from('error_log').update({ resuelto: false }).eq('mensaje', mensaje);
  revalidatePath('/admin', 'layout');
}

// Mandarte a ti misma un correo de prueba (resumen, fin de prueba o encuesta) para ver cómo le llega a una persona
export async function probarAvisos(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { sb, user } = await exigirAdmin();
  if (!dentroDelLimite(`prueba-avisos:${user.id}`, 6)) return falla('Muchas pruebas seguidas. Espera un minuto.');
  if (!user.email) return falla('Tu cuenta no tiene correo.');
  const tipo = texto(fd, 'tipo');
  const hoy = hoyMexico();
  const { data: perfil } = await sb.from('perfiles').select('nombre').eq('id', user.id).maybeSingle();
  const nombre = perfil?.nombre ?? null;
  let correo;
  if (tipo === 'resumen') {
    const { data } = await sb.from('reservas').select('id, cliente, contacto, destino, tipo, proveedor, precio_venta, comision, moneda, fecha_compra, fecha_viaje, pago_pendiente_fecha, pago_pendiente_monto, comentarios, estatus').eq('user_id', user.id);
    let avisos = avisosDeHoy(((data ?? []) as FilaReserva[]).map(aReserva), hoy);
    let ejemplo = false;
    if (avisos.length === 0) {
      avisos = avisosDeHoy(semilla(hoy), hoy);
      ejemplo = true;
    }
    if (avisos.length === 0) return falla('Hoy no hay ningún aviso para mostrar ni con datos de ejemplo.');
    correo = correoResumen(nombre, user.id, avisos, hoy);
    if (ejemplo) correo.asunto = `[Prueba con datos de ejemplo] ${correo.asunto}`;
  } else if (tipo === 'fin') {
    correo = correoFinDePrueba(nombre, user.id, 2, new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 2), hoy);
    correo.asunto = `[Prueba] ${correo.asunto}`;
  } else if (tipo === 'pago_atrasado') {
    correo = correoPagoAtrasado(nombre);
    correo.asunto = `[Prueba] ${correo.asunto}`;
  } else if (tipo === 'cancelacion') {
    correo = correoCancelacion(nombre, user.id, new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 10), hoy);
    correo.asunto = `[Prueba] ${correo.asunto}`;
  } else if (tipo === 'reactivar') {
    correo = correoReactivar(nombre, user.id);
    correo.asunto = `[Prueba] ${correo.asunto}`;
  } else if (tipo === 'encuesta') {
    correo = correoEncuesta(nombre, user.id);
    correo.asunto = `[Prueba] ${correo.asunto}`;
  } else return falla('Elige qué correo quieres probar.');
  try {
    return (await enviarCorreo(user.email, correo)) ? exito(`Te lo mandamos a ${user.email}. Revisa tu bandeja (y spam).`) : falla('El servicio de correos no lo aceptó. Revisa que la clave de Resend esté bien puesta.');
  } catch {
    return falla('Falta la clave de Resend en el servidor.');
  }
}
