'use client';

// Pantalla de error de cualquier sección: la app nunca muestra una pantalla en blanco (UX 18).
// Además avisa al panel del dueño, que agrupa los errores por frecuencia.

import { useEffect } from 'react';
import { reportarError } from '@/lib/errores';

export default function ErrorDeSeccion({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportarError(error, 'seccion');
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <h1 className="text-balance text-3xl font-bold leading-[1.1] [font-family:var(--font-display)]">Algo no salió como esperábamos</h1>
      <p className="text-base text-[var(--text-secondary)]">
        Tus datos están a salvo. Ya avisamos del problema; intenta de nuevo y, si se repite, vuelve en unos minutos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)]"
      >
        Intentar de nuevo
      </button>
    </main>
  );
}
