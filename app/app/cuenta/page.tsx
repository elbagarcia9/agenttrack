import type { Metadata } from 'next';
import { CuentaPanel } from '@/components/app/CuentaPanel';
import { supabaseServidor } from '@/lib/supabase/servidor';

export const metadata: Metadata = { title: 'Mi cuenta — AgentTrack' };

// MI CUENTA — tu correo, tus avisos, cómo cancelar y cómo borrar tus datos (derecho de cancelación).
export default async function Cuenta() {
  let correo: string | null = null;
  let avisos = true;
  let esAdmin = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const sb = await supabaseServidor();
    const { data } = await sb.auth.getUser();
    correo = data.user?.email ?? null;
    if (data.user) {
      const { data: perfil } = await sb.from('perfiles').select('avisos_correo, rol').eq('id', data.user.id).maybeSingle();
      avisos = perfil?.avisos_correo ?? true;
      esAdmin = perfil?.rol === 'admin';
    }
  }
  return <CuentaPanel correo={correo} avisosInicial={avisos} esAdmin={esAdmin} />;
}
