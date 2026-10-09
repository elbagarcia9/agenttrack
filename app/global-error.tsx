'use client';

// Último recurso: si falla incluso el diseño general de la app. Reemplaza al layout raíz, así que carga sus propios estilos.

import './globals.css';
import { useEffect } from 'react';
import { reportarError } from '@/lib/errores';

export default function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportarError(error, 'global');
  }, [error]);

  return (
    <html lang="es-MX">
      <body className="bg-[var(--bg)] text-[var(--text-primary)]">
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-4">
          <h1 className="text-balance text-3xl font-bold leading-[1.1]">Algo no salió como esperábamos</h1>
          <p className="text-base text-[var(--text-secondary)]">Tus datos están a salvo. Ya avisamos del problema; intenta de nuevo en unos minutos.</p>
          <button
            type="button"
            onClick={reset}
            className="flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)]"
          >
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  );
}
