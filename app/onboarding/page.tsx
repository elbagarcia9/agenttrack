import Link from 'next/link';

// Paso 2 de la secuencia maestra (pendiente de construir). Ruta real para que el CTA no lleve a un 404.
export default function Onboarding() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-center [font-family:var(--font-body)]">
      <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Estamos preparando tu cuestionario</h1>
      <p className="text-[var(--text-secondary)]">Muy pronto podrás registrar tu primera reserva y ver tu Semáforo de Comisiones.</p>
      <Link href="/" className="font-semibold text-[var(--accent)] underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
