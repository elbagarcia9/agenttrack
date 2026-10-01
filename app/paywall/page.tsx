import Link from 'next/link';

// Paso 3 de la secuencia (pantalla de planes) — pendiente de construir. Ruta real para que el flujo no termine en un 404.
export default function Paywall() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-center [font-family:var(--font-body)]">
      <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Estamos preparando tus planes</h1>
      <p className="text-[var(--text-secondary)]">Aquí elegirás tu plan y empezarás tus 14 días gratis.</p>
      <Link href="/onboarding" className="font-semibold text-[var(--accent)] underline underline-offset-4">
        Volver a mi plan
      </Link>
    </main>
  );
}
