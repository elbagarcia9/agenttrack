import type { Metadata } from 'next';
import { exigirAdmin } from '@/lib/supabase/servidor';

export const metadata: Metadata = {
  title: 'AgentTrack',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return <>{children}</>;
}
