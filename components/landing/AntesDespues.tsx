'use client';

// Franja blanca a todo el ancho con los dos títulos "Antes" y "Con <marca>" y, debajo, el ESPACIO RESERVADO para la
// imagen de comparación. PENDIENTE (ESTADO.md): la usuaria aún no tiene esa imagen; cuando la entregue se coloca dentro
// del contenedor reservado (ya tiene su proporción para que la página no se mueva al cargar).

import { motion, useReducedMotion } from 'motion/react';

export interface AntesDespuesProps {
  labelAntes: string;
  labelDespues: string;
  id?: string;
}

export function AntesDespues({ labelAntes, labelDespues, id }: AntesDespuesProps) {
  const reducir = useReducedMotion();
  return (
    <section id={id} aria-label="Antes y después" className="bg-[var(--surface)] py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: reducir ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-5xl px-5"
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <h3 className="whitespace-nowrap text-lg font-semibold text-[var(--text-primary)] [font-family:var(--font-display)] md:text-3xl">{labelAntes}</h3>
          <h3 className="whitespace-nowrap text-lg font-semibold text-[var(--text-primary)] [font-family:var(--font-display)] md:text-3xl">{labelDespues}</h3>
        </div>
        {/* Espacio reservado para la imagen antes/después (pendiente) */}
        <div data-pendiente="imagen-antes-despues" aria-hidden="true" className="mt-8 aspect-[4/3] w-full md:aspect-[2/1]" />
      </motion.div>
    </section>
  );
}
