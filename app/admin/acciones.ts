'use server';

// Acciones del panel del dueño. Cada una vuelve a verificar en el servidor que quien llama es administrador
// (nunca se confía en que el botón estaba escondido) y valida todo lo que recibe.

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { dentroDelLimite } from '@/lib/eventos';
import { aCentavos } from '@/lib/admin/formato';
import { exigirAdmin } from '@/lib/supabase/servidor';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';

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

// Manda el enlace de acceso a una cuenta que YA existe (no crea cuentas nuevas)
async function mandarAcceso(email: string): Promise<boolean> {
  const anonimo = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await anonimo.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${await origenDelSitio()}/auth/callback` },
  });
  return !error;
}

// ───────── USUARIOS ─────────

export async function agregarUsuario(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const { user } = await exigirAdmin();
  if (!dentroDelLimite(`alta:${user.id}`, 20)) return falla('Hiciste muchas altas seguidas. Espera un minuto e inténtalo de nuevo.');
  const email = texto(fd, 'email').toLowerCase();
  const nombre = texto(fd, 'nombre');
  if (!CORREO.test(email)) return falla('Escribe un correo válido, como nombre@correo.com.');
  if (nombre.length < 2 || nombre.length > 80) return falla('Escribe el nombre de la persona (entre 2 y 80 letras).');
  if (!servicioConfigurado()) {
    return falla('Falta conectar la clave del servidor para crear cuentas. Mientras tanto, la persona puede entrar sola desde la pantalla de acceso con su correo.');
  }

  const svc = supabaseServicio();
  const { data, error } = await svc.auth.admin.createUser({ email, email_confirm: true, user_metadata: { nombre } });
  if (error || !data.user) {
    if (error && /already|registered|exists/i.test(error.message)) return falla('Ese correo ya tiene una cuenta.');
    console.error('panel: no se pudo crear la cuenta', { codigo: error?.status });
    return falla('No pudimos crear la cuenta. Inténtalo de nuevo en un momento.');
  }

  // Si esa persona ya había pagado en Hotmart sin tener cuenta, su membresía refleja ese pago; si no, queda como acceso manual
  const { data: pagos } = await svc
    .from('payment_transactions')
    .select('economic_kind, ciclo, source, occurred_at')
    .ilike('buyer_email', email)
    .order('occurred_at', { ascending: true });
  const ventas = (pagos ?? []).filter((p) => p.economic_kind === 'sale');
  const devuelto = (pagos ?? []).some((p) => p.economic_kind !== 'sale');
  const ultima = ventas[ventas.length - 1];
  const cambios =
    ventas.length === 0
      ? { membresia: 'manual', fuente: 'manual' }
      : devuelto
        ? { membresia: 'refunded', fuente: ventas[0].source, first_paid_at: ventas[0].occurred_at }
        : { membresia: 'active', ciclo: ultima.ciclo, fuente: ventas[0].source, first_paid_at: ventas[0].occurred_at };
  await svc.from('perfiles').update({ nombre, ...cambios }).eq('id', data.user.id);

  let aviso = '';
  if (fd.get('enviar') === 'on') {
    aviso = (await mandarAcceso(email)) ? ' Le enviamos el enlace de acceso.' : ' No pudimos enviarle el correo; pulsa "Reenviar acceso" en su fila.';
  }
  revalidatePath('/admin/usuarios');
  revalidatePath('/admin');
  return exito(`Listo: ${nombre} ya tiene cuenta.${aviso}`);
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
  return (await mandarAcceso(email)) ? exito(`Enlace enviado a ${email}.`) : falla('No pudimos enviar el correo ahora mismo. Inténtalo en unos minutos.');
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
