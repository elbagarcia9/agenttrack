'use client';

// KIT DE LANDING — §3 AGITACIÓN (blueprint: 55 §3)
// El costo de seguir igual, visible. El tipo de `frases` es string[] a propósito:
// es IMPOSIBLE pasarle un párrafo de 72 palabras — cada frase es corta (máx 2
// líneas; warn a las 18 palabras). MISMO fondo elevado que §2 (un solo movimiento
// visual, sin separador). Cero decoración de miedo.
// Desviación documentada (ESTADO.md): `escena` = la imagen de la usuaria acostada que se acuerda de
// pendientes + frase de cierre tranquilizadora (idea del usuario). Sustituye al par "hoy vs en 6 meses".

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface AgitacionProps {
  /** 2-4 frases MARCADAS y cortas — el array es el contrato: nada de párrafos. */
  frases: string[];
  /** Íconos opcionales por frase (misma longitud que frases) — ancla visual para escanear. */
  iconos?: LucideIcon[];
  /** Mini-card opcional "hoy vs en 6 meses" (55 §3). */
  contraste?: { labelHoy: string; hoy: string; labelFuturo: string; futuro: string };
  /** La escena del dolor: cita + imagen opcional + cierre tranquilizador. */
  escena?: {
    citaMarked: string;
    imagen?: ReactNode;
    cierreMarked: string;
  };
  id?: string;
}

export function Agitacion({ frases, iconos, contraste, escena, id }: AgitacionProps) {
  warnRango('Agitación → frases', frases.length, 2, 4);
  frases.forEach((f, i) => warnCopy(`Agitación → frase ${i + 1}`, f, 18));
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" flush="top" ariaLabel="El costo de seguir igual">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[620px]"
      >
        <div className="flex flex-col gap-4">
          {frases.map((f, i) => {
            const Icono = iconos?.[i];
            return (
              <motion.div key={i} variants={item} className="flex items-start gap-3">
                {Icono && (
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
                  >
                    <Icono size={22} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
                  </span>
                )}
                <p className="pt-2 text-[17px] leading-[1.5] text-[var(--text-secondary)]">
                  <MarkedCopy text={f} />
                </p>
              </motion.div>
            );
          })}
        </div>

        {contraste && (
          <motion.div variants={item} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] bg-[var(--bg)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{contraste.labelHoy}</p>
              <p className="mt-2 text-[15px] leading-snug text-[var(--text-primary)]">{contraste.hoy}</p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{contraste.labelFuturo}</p>
              <p className="mt-2 text-[15px] leading-snug text-[var(--text-secondary)]">{contraste.futuro}</p>
            </div>
          </motion.div>
        )}

        {escena && (
          <motion.div variants={item} className="mt-10 flex flex-col gap-5">
            <blockquote className="border-l-4 border-[var(--accent)] py-1 pl-4 text-[22px] font-semibold leading-snug text-[var(--text-primary)] [font-family:var(--font-display)]">
              <MarkedCopy text={escena.citaMarked} />
            </blockquote>
            {escena.imagen}
            <p className="text-[19px] font-medium leading-snug text-[var(--text-primary)]">
              <MarkedCopy text={escena.cierreMarked} />
            </p>
          </motion.div>
        )}
      </motion.div>
    </SectionShell>
  );
}
