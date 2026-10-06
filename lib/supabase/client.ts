// Cliente de Supabase para el navegador. Solo usa la clave PÚBLICA (publishable): la protección real
// de los datos la dan las políticas RLS de la base, no esta clave.

import { createBrowserClient } from '@supabase/ssr';

let cliente: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseNavegador() {
  if (!cliente) {
    cliente = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return cliente;
}
