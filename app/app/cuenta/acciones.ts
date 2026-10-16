'use server';

// Acciones de "Mi cuenta": cada una lee quién es la persona desde su sesión verificada en el servidor (nunca de lo que
// mande el navegador) y solo toca los datos de esa persona.

import { dentroDelLimite } from '@/lib/eventos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { supabaseServidor } from '@/lib/supabase/servidor';

export type Resultado = { ok: boolean; mensaje: string } | null;
const falla = (mensaje: string): Resultado => ({ ok: false, mensaje });

async function personaActual() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  return data.user ? { sb, user: data.user } : null;
}

// Avisos por correo: activar o desactivar desde la app
export async function guardarAvisosCorreo(activar: boolean): Promise<Resultado> {
  const p = await personaActual();
  if (!p || !servicioConfigurado()) return falla('Entra a tu cuenta para cambiar esto.');
  const { error } = await supabaseServicio().from('perfiles').update({ avisos_correo: activar }).eq('id', p.user.id);
  return error ? falla('No pudimos guardarlo. Inténtalo de nuevo.') : { ok: true, mensaje: activar ? 'Listo: seguirás recibiendo tus avisos por correo.' : 'Listo: ya no te escribiremos con avisos.' };
}

// Derecho de cancelación (ARCO): borra TODO lo de la persona y su cuenta de acceso. No se puede deshacer.
export async function eliminarMiCuenta(_previo: Resultado, fd: FormData): Promise<Resultado> {
  const p = await personaActual();
  if (!p || !servicioConfigurado()) return falla('Entra a tu cuenta para eliminarla.');
  if (!dentroDelLimite(`eliminar:${p.user.id}`, 5)) return falla('Demasiados intentos. Espera un minuto.');
  if (String(fd.get('confirmo') ?? '').trim().toUpperCase() !== 'ELIMINAR') return falla('Escribe la palabra ELIMINAR para confirmar.');

  const sb = supabaseServicio();
  const { data: perfil } = await sb.from('perfiles').select('rol, email').eq('id', p.user.id).maybeSingle();
  if (perfil?.rol === 'admin') return falla('La cuenta del dueño no se puede eliminar desde aquí.');
  const correo = (perfil?.email ?? p.user.email ?? '').toLowerCase();

  // Tablas con datos de la persona (los registros de pagos se conservan: la ley fiscal exige guardarlos)
  const porUsuario = ['reservas', 'preferencias', 'event_log', 'error_log', 'encuesta_salida', 'avisos_enviados', 'consentimientos'];
  for (const tabla of porUsuario) {
    const { error } = await sb.from(tabla).delete().eq('user_id', p.user.id);
    if (error) return falla('No pudimos borrar todo. Nada se cerró; inténtalo de nuevo o escríbenos a soporte@agenttrack.app.');
  }
  if (correo) await sb.from('accesos_regalo').delete().eq('email', correo);
  const { error: ePerfil } = await sb.from('perfiles').delete().eq('id', p.user.id);
  if (ePerfil) return falla('No pudimos borrar tu perfil. Inténtalo de nuevo o escríbenos a soporte@agenttrack.app.');
  const { error: eAuth } = await sb.auth.admin.deleteUser(p.user.id);
  if (eAuth) return falla('Borramos tus datos, pero no pudimos cerrar tu acceso. Escríbenos a soporte@agenttrack.app.');

  await p.sb.auth.signOut().catch(() => undefined);
  return { ok: true, mensaje: 'Tu cuenta y tus datos fueron eliminados.' };
}
