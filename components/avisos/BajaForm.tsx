'use client';

import { useState } from 'react';

type Fase = 'pregunta' | 'enviando' | 'baja' | 'activa' | 'error';

export function BajaForm({ token }: { token: string }) {
  const [fase, setFase] = useState<Fase>('pregunta');

  const cambiar = async (volver: boolean) => {
    setFase('enviando');
    try {
      const r = await fetch('/api/avisos/baja', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, volver }) });
      setFase(r.ok ? (volver ? 'activa' : 'baja') : 'error');
    } catch {
      setFase('error');
    }
  };

  const boton = 'flex min-h-11 w-full items-center justify-center rounded-[var(--radius-button)] px-6 text-base font-semibold disabled:opacity-70';

  return (
    <div className="rounded-[var(--radius-card)] tarjeta-suave p-6" aria-live="polite">
      {fase === 'baja' ? (
        <>
          <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Listo, no te escribiremos más</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Ya no recibirás avisos por correo. Tus plazos siguen en la app. Si cambias de opinión, puedes reactivarlos aquí mismo.</p>
          <button type="button" onClick={() => cambiar(true)} className={`${boton} mt-4 border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]`}>
            Volver a recibir avisos
          </button>
        </>
      ) : fase === 'activa' ? (
        <>
          <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Avisos reactivados</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Volverás a recibir tus recordatorios de plazos por correo.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold [font-family:var(--font-display)]">¿Dejar de recibir avisos por correo?</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Tu asistente deja de escribirte con tus plazos por vencer. Tus reservas y alertas seguirán dentro de la app.</p>
          {fase === 'error' && (
            <p role="alert" className="mt-3 text-sm font-medium text-[var(--rojo-text)]">
              No pudimos guardarlo. Inténtalo de nuevo en un momento.
            </p>
          )}
          <button type="button" disabled={fase === 'enviando'} onClick={() => cambiar(false)} className={`${boton} mt-4 bg-[var(--accent)] text-[var(--on-accent)]`}>
            {fase === 'enviando' ? 'Guardando…' : 'Sí, dejar de recibir avisos'}
          </button>
        </>
      )}
    </div>
  );
}
