'use client';

// Barra que cruza el corte entre dos secciones: la mitad de arriba descansa sobre el fondo de la sección anterior
// y la mitad de abajo sobre el de la siguiente (por eso el fondo de la franja se parte en dos colores al 50%).
// Resume el dolor en una frase y da la salida en la siguiente.

import { motion, useReducedMotion } from 'motion/react';
import { MarkedCopy } from './MarkedCopy';

export interface BandaPuenteProps {
  /** Copy MARCADO de la pregunta (se lee en azul de marca). */
  preguntaMarked: string;
  /** Copy MARCADO de la respuesta. */
  respuestaMarked: string;
  /** Fondo de la sección que queda ARRIBA de la barra. */
  fondoArriba?: string;
  /** Fondo de la sección que queda ABAJO de la barra. */
  fondoAbajo?: string;
}

export function BandaPuente({ preguntaMarked, respuestaMarked, fondoArriba = 'var(--bg)', fondoAbajo = 'var(--surface)' }: BandaPuenteProps) {
  const reducir = useReducedMotion();
  return (
    <div className="relative z-10 px-5" style={{ background: `linear-gradient(to bottom, ${fondoArriba} 50%, ${fondoAbajo} 50%)` }}>
      <motion.div
        initial={{ opacity: 0, y: reducir ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--surface)_70%,transparent)] bg-[var(--surface-2)] px-6 py-6 text-center shadow-[var(--shadow-2)] md:px-10 md:py-8"
      >
        <p className="text-balance text-3xl font-bold leading-tight text-[var(--accent)] [font-family:var(--font-display)] md:text-5xl">
          <MarkedCopy text={preguntaMarked} />
        </p>
        <p className="mt-2 text-balance text-lg font-semibold leading-snug text-[var(--text-primary)] md:text-2xl">
          <MarkedCopy text={respuestaMarked} />
        </p>
      </motion.div>
    </div>
  );
}
