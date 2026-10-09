// Acceso por enlace mágico + código de 6 dígitos (26: método primario del flujo Hotmart-first, sin contraseñas).
// Con las variables de Supabase configuradas usa Supabase Auth; sin ellas funciona en MODO LOCAL: no envía
// correos ni valida códigos, y la pantalla lo dice con claridad.
// NEXT_PUBLIC_AUTH_SOLO_COMPRADORES=1 (se activa al conectar Hotmart) impide crear cuentas desde esta pantalla:
// solo entran los correos que el aviso de pago ya dio de alta.

import { supabaseNavegador } from './supabase/client';

export const AUTH_LOCAL = !process.env.NEXT_PUBLIC_SUPABASE_URL;
export const AUTH_GOOGLE = process.env.NEXT_PUBLIC_AUTH_GOOGLE === '1';

export type ResultadoAuth = { ok: true } | { ok: false; motivo: 'limite' | 'invalido' | 'no_disponible' };

const LIMITE = 3; // 3 solicitudes
const VENTANA_MS = 5 * 60 * 1000; // por cada 5 minutos (26: rate limit de magic link)

function leerSolicitudes(): number[] {
  try {
    const crudo = JSON.parse(window.localStorage.getItem('cg_auth_solicitudes') ?? '[]');
    return Array.isArray(crudo) ? crudo.filter((t: unknown) => typeof t === 'number') : [];
  } catch {
    return [];
  }
}

export function solicitudesRestantes(ahora = Date.now()): number {
  const vigentes = leerSolicitudes().filter((t) => ahora - t < VENTANA_MS);
  return Math.max(0, LIMITE - vigentes.length);
}

export function correoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

export async function solicitarAcceso(correo: string): Promise<ResultadoAuth> {
  if (!correoValido(correo)) return { ok: false, motivo: 'invalido' };
  const ahora = Date.now();
  if (solicitudesRestantes(ahora) === 0) return { ok: false, motivo: 'limite' };
  try {
    const vigentes = leerSolicitudes().filter((t) => ahora - t < VENTANA_MS);
    window.localStorage.setItem('cg_auth_solicitudes', JSON.stringify([...vigentes, ahora]));
  } catch {
    /* sin almacenamiento: el límite real lo aplica el servidor */
  }
  if (AUTH_LOCAL) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true };
  }
  // Anti-enumeración (26): la respuesta es idéntica exista o no la cuenta.
  const { error } = await supabaseNavegador().auth.signInWithOtp({
    email: correo.trim().toLowerCase(),
    options: {
      shouldCreateUser: process.env.NEXT_PUBLIC_AUTH_SOLO_COMPRADORES !== '1',
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error?.status === 429) return { ok: false, motivo: 'limite' };
  if (error && !/signups? not allowed|user not found/i.test(error.message)) return { ok: false, motivo: 'no_disponible' };
  return { ok: true };
}

export async function verificarCodigo(correo: string, codigo: string): Promise<ResultadoAuth> {
  if (!correoValido(correo) || !/^\d{6}$/.test(codigo)) return { ok: false, motivo: 'invalido' };
  if (AUTH_LOCAL) return { ok: false, motivo: 'no_disponible' };
  const { error } = await supabaseNavegador().auth.verifyOtp({
    email: correo.trim().toLowerCase(),
    token: codigo,
    type: 'email',
  });
  return error ? { ok: false, motivo: 'invalido' } : { ok: true };
}

// Marca la última actividad de la persona (el panel del dueño la usa para saber quién sigue activo)
export async function registrarActividad(): Promise<void> {
  if (AUTH_LOCAL) return;
  try {
    await supabaseNavegador().rpc('registrar_actividad');
  } catch {
    /* medir nunca rompe nada */
  }
}

export async function cerrarSesion(): Promise<void> {
  if (AUTH_LOCAL) return;
  await supabaseNavegador().auth.signOut();
}
