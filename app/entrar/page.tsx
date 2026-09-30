import Link from 'next/link';

// Paso 4 de la secuencia (login/auth) — pendiente. Ruta real para que "Entrar" no lleve a un 404.
export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-center [font-family:var(--font-body)]">
      <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Entrar</h1>
      <p className="text-[var(--text-secondary)]">El acceso a tu cuenta se habilita muy pronto.</p>
      <Link href="/" className="font-semibold text-[var(--accent)] underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
