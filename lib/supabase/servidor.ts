// Cliente de Supabase para el SERVIDOR (páginas, rutas API) con la sesión de quien visita.
// Usa solo la clave pública: lo que cada quien puede leer lo decide la base con RLS.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function supabaseServidor() {
  const almacen = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          /* en páginas de lectura las cookies no se pueden escribir; el proxy ya renueva la sesión */
        }
      },
    },
  });
}

// Guardia del panel del dueño. Se llama en el layout Y en cada carga de datos o acción
// (un layout no se vuelve a ejecutar al navegar entre páginas, así que no basta solo ahí).
// Quien no es administrador verificado ve un 404: ni siquiera se confirma que el panel existe.
export async function exigirAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound();
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser(); // valida el token con el servidor de Supabase
  if (!data.user) notFound();
  const { data: perfil } = await sb.from('perfiles').select('rol, estado').eq('id', data.user.id).maybeSingle();
  if (perfil?.rol !== 'admin' || perfil.estado === 'desactivado') notFound();
  return { sb, user: data.user };
}
