'use client';

import { useState } from 'react';

type Motivo = 'diseno' | 'uso' | 'otro';
const OPCIONES: { id: Motivo; texto: string }[] = [
  { id: 'diseno', texto: 'El diseño' },
  { id: 'uso', texto: 'La forma de usarse' },
  { id: 'otro', texto: 'Otra cosa' },
];

const campo =
  'mt-1 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 py-3 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';

export function EncuestaForm({ token }: { token: string }) {
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [otro, setOtro] = useState('');
  const [probaria, setProbaria] = useState('');
  const [fase, setFase] = useState<'escribiendo' | 'enviando' | 'listo' | 'error'>('escribiendo');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo) return;
    setFase('enviando');
    try {
      const r = await fetch('/api/encuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: token, motivo, motivoOtro: otro, queProbaria: probaria }),
      });
      setFase(r.ok ? 'listo' : 'error');
    } catch {
      setFase('error');
    }
  };

  if (fase === 'listo') {
    return (
      <div className="rounded-[var(--radius-card)] tarjeta-suave p-6" aria-live="polite">
        <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Gracias por contarnos</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Leemos cada respuesta. Lo que escribiste nos ayuda a decidir qué mejorar primero.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5 rounded-[var(--radius-card)] tarjeta-suave p-6">
      <div>
        <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Cuéntanos qué faltó</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Son 2 preguntas. Tardas menos de un minuto.</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-base font-semibold">1. ¿Qué fue lo que no te convenció de la app?</legend>
        {OPCIONES.map((o) => (
          <label key={o.id} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 tarjeta-suave ${motivo === o.id ? 'ring-2 ring-[var(--accent)]' : ''}`}>
            <input type="radio" name="motivo" value={o.id} checked={motivo === o.id} onChange={() => setMotivo(o.id)} className="size-5 accent-[var(--accent)]" />
            {o.texto}
          </label>
        ))}
        {motivo === 'otro' && (
          <label className="block">
            <span className="sr-only">Cuéntanos qué fue</span>
            <input type="text" value={otro} maxLength={500} onChange={(e) => setOtro(e.target.value)} placeholder="Escribe aquí qué fue" className={campo} />
          </label>
        )}
      </fieldset>

      <label className="block">
        <span className="text-base font-semibold">2. ¿Estarías dispuesta a probarla otra vez si tuviera algo en especial? ¿Qué te gustaría que tuviera?</span>
        <textarea value={probaria} maxLength={1000} rows={4} onChange={(e) => setProbaria(e.target.value)} placeholder="Cuéntanos con tus palabras" className={campo} />
      </label>

      {fase === 'error' && (
        <p role="alert" className="text-sm font-medium text-[var(--rojo-text)]">
          No pudimos guardar tus respuestas. Inténtalo de nuevo en un momento.
        </p>
      )}
      <button
        type="submit"
        disabled={!motivo || fase === 'enviando'}
        className="flex min-h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {fase === 'enviando' ? 'Enviando…' : 'Enviar mis respuestas'}
      </button>
    </form>
  );
}
