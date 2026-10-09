import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { exigirAdmin } from '@/lib/supabase/servidor';

// El título es genérico a propósito: ni siquiera la página 404 debe delatar que existe un panel.
export const metadata: Metadata = {
  title: 'AgentTrack',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await exigirAdmin();
  return <AdminShell correo={user.email ?? ''}>{children}</AdminShell>;
}
