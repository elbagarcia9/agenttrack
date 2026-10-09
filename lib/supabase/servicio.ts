import 'server-only';

// Cliente con la clave SECRETA de Supabase: se salta RLS. SOLO servidor (rutas API y acciones del panel ya verificadas).
// La clave vive únicamente en variables de entorno del servidor (nunca NEXT_PUBLIC_, nunca en el navegador).

import { createClient } from '@supabase/supabase-js';

export function servicioConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export function supabaseServicio() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) throw new Error('Falta SUPABASE_SECRET_KEY: el servicio del servidor no está configurado');
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
