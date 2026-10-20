import 'server-only';

// AVISOS EN EL CELULAR (notificaciones push). Las claves VAPID (la "firma" que identifica a AgentTrack ante Google/Apple)
// se derivan de la clave secreta del servidor que ya existe: no hay una clave nueva que guardar ni copiar a ningún lado.
// Si algún día se cambia esa clave secreta, las personas tienen que volver a activar los avisos en su celular.

import { createECDH, createHmac } from 'node:crypto';
import webpush from 'web-push';
import { SOPORTE_EMAIL } from '@/lib/legal';
import { supabaseServicio } from '@/lib/supabase/servicio';

let claves: { publica: string; privada: string } | null = null;

export function clavesVapid(): { publica: string; privada: string } {
  if (claves) return claves;
  const base = process.env.SUPABASE_SECRET_KEY;
  if (!base) throw new Error('Falta SUPABASE_SECRET_KEY');
  const ecdh = createECDH('prime256v1');
  for (let i = 0; i < 20; i++) {
    const d = createHmac('sha256', base).update(`agenttrack-vapid-v1:${i}`).digest();
    try {
      ecdh.setPrivateKey(d); // falla si el número no es una clave válida de la curva (casi nunca): se prueba el siguiente
      claves = { publica: ecdh.getPublicKey().toString('base64url'), privada: d.toString('base64url') };
      return claves;
    } catch {
      /* siguiente intento */
    }
  }
  throw new Error('No se pudieron derivar las claves de avisos');
}

let configurado = false;
function configurar() {
  if (configurado) return;
  const c = clavesVapid();
  webpush.setVapidDetails(`mailto:${SOPORTE_EMAIL}`, c.publica, c.privada);
  configurado = true;
}

export interface AvisoPush {
  titulo: string;
  cuerpo: string;
  url?: string;
  tag?: string;
}

// Manda el aviso a todos los dispositivos de la persona. Los que ya no existen (la persona quitó la app o los permisos) se borran solos.
export async function enviarPush(userId: string, aviso: AvisoPush): Promise<{ enviados: number; fallidos: number }> {
  configurar();
  const sb = supabaseServicio();
  const { data } = await sb.from('push_suscripciones').select('id, endpoint, p256dh, auth').eq('user_id', userId);
  let enviados = 0;
  let fallidos = 0;
  for (const s of data ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(aviso), { TTL: 60 * 60 * 24, urgency: 'normal' });
      enviados += 1;
      await sb.from('push_suscripciones').update({ ultimo_envio: new Date().toISOString() }).eq('id', s.id);
    } catch (e) {
      const codigo = (e as { statusCode?: number }).statusCode;
      if (codigo === 404 || codigo === 410) await sb.from('push_suscripciones').delete().eq('id', s.id);
      else fallidos += 1;
    }
  }
  return { enviados, fallidos };
}
