'use client';

// Franja blanca a todo el ancho (sin espacio debajo: las imágenes terminan justo donde termina la sección) con las dos imágenes de comparación de la usuaria. Los títulos "ANTES" y
// "CON AgentTrack" ya vienen DENTRO de las imágenes: no se escriben aparte. Lado a lado en computadora, apiladas en celular.

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

export function AntesDespues({ id }: { id?: string }) {
  const reducir = useReducedMotion();
  const entrada = (retraso: number) => ({
    initial: { opacity: 0, y: reducir ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.45, delay: reducir ? 0 : retraso, ease: [0.16, 1, 0.3, 1] as const },
  });
  return (
    <section id={id} aria-label="Antes y después" className="bg-[var(--surface)] pb-0 pt-12 md:pt-16">
      <div className="mx-auto grid w-full max-w-5xl items-end gap-6 px-5 md:grid-cols-2">
        <motion.figure {...entrada(0)} className="m-0 leading-none">
          <Image
            src="/img/antes-final.jpg"
            alt="Antes: una agente de viajes confundida, rascándose la cabeza, se pregunta si subió la compra de Disney y cuánto hace que fue el viaje de la Familia Martínez, si ya pasaron más de dos meses"
            width={1093}
            height={1238}
            sizes="(min-width: 1024px) 496px, (min-width: 768px) 45vw, 90vw"
            className="block h-auto w-full"
          />
        </motion.figure>
        <motion.figure {...entrada(0.1)} className="m-0 leading-none">
          <Image
            src="/img/con-agenttrack.jpg"
            alt="Con AgentTrack: la misma agente, relajada y tranquila, con avisos en el celular: a Marcos y Ana les quedan 4 días para dar de alta la venta y la Familia Romero viaja mañana"
            width={1110}
            height={1238}
            sizes="(min-width: 1024px) 496px, (min-width: 768px) 45vw, 90vw"
            className="block h-auto w-full"
          />
        </motion.figure>
      </div>
    </section>
  );
}
