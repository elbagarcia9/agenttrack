import { exigirAdmin } from '@/lib/supabase/servidor';

export default async function Resumen() {
  const { user } = await exigirAdmin();
  return <main className="p-6">Panel del dueño · {user.email}</main>;
}
