import Link from 'next/link';

// Documento legal en redacción (se genera con el flujo /legal antes del lanzamiento — ver ESTADO.md).
export default function Privacidad() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-center [font-family:var(--font-body)]">
      <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Aviso de privacidad</h1>
      <p className="text-[var(--text-secondary)]">Este documento se está redactando y se publicará antes del lanzamiento.</p>
      <Link href="/" className="font-semibold text-[var(--accent)] underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
