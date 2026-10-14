import type { Metadata } from 'next';
import Link from 'next/link';
import { EncuestaForm } from '@/components/avisos/EncuestaForm';
import { verificarFirma } from '@/lib/avisos';
import { servicioConfigurado } from '@/lib/supabase/servicio';

export const metadata: Metadata = { title: 'Cuéntanos qué faltó — AgentTrack', robots: { index: false } };

export default async function Encuesta({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = '' } = await searchParams;
  const valido = servicioConfigurado() && verificarFirma(t, 'encuesta') !== null;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 bg-[var(--bg)] px-4 py-8 [font-family:var(--font-body)]">
      {valido ? (
        <EncuestaForm token={t} />
      ) : (
        <div className="rounded-[var(--radius-card)] tarjeta-suave p-6">
          <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Este enlace ya no sirve</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Abre la encuesta desde el correo más reciente que te mandamos.</p>
          <Link href="/" className="mt-4 flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
            Ir al inicio
          </Link>
        </div>
      )}
    </main>
  );
}
