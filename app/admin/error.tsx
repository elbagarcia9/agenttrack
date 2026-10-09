'use client';

// Si una sección del panel no puede cargar, se dice con claridad qué hacer (no pantalla en blanco).

import { useEffect } from 'react';
import { reportarError } from '@/lib/errores';

export default function ErrorPanel({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportarError(error, 'panel');
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] tarjeta-suave p-6">
      <h1 className="text-xl font-bold [font-family:var(--font-display)]">Esta sección no pudo cargar</h1>
      <p className="text-[var(--text-secondary)]">Tus datos no se tocaron. Intenta de nuevo; si se repite, avísame con el nombre de la sección.</p>
      <button type="button" onClick={reset} className="min-h-11 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)]">
        Intentar de nuevo
      </button>
    </div>
  );
}
