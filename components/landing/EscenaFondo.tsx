'use client';

// Escena del desvelo: la frase sobre una foto de fondo que SIEMPRE cubre todo el ancho.
// La foto no se encoge al reducir la pantalla: la franja mantiene su alto y la imagen se recorta por los lados
// (object-cover) enfocando a la persona, en vez de achicarse. Un velo oscuro asegura que el texto blanco se lea.

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { MarkedCopy } from './MarkedCopy';

export interface EscenaFondoProps {
  /** Ruta de la foto (public/…). */
  src: string;
  /** Descripción para lectores de pantalla; la foto es ambiental, el mensaje va en el texto. */
  alt?: string;
  /** Copy MARCADO de la frase grande. */
  citaMarked: string;
  /** Copy MARCADO de la frase tranquilizadora. */
  cierreMarked: string;
  /** Punto de la foto que nunca debe cortarse al recortar por los lados (x y). */
  enfoque?: string;
  id?: string;
}

export function EscenaFondo({ src, alt = '', citaMarked, cierreMarked, enfoque = '62% center', id }: EscenaFondoProps) {
  const reducir = useReducedMotion();
  return (
    <section id={id} aria-label="Lo que pasa cuando se te olvida" className="relative isolate flex min-h-150 items-start overflow-hidden md:min-h-160">
      <Image src={src} alt={alt} fill quality={80} sizes="(min-width: 768px) 100vw, 1820px" className="-z-20 object-cover" style={{ objectPosition: enfoque }} />
      {/* Velo: más oscuro donde va el texto (arriba/izquierda) y transparente donde está la persona */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/25 md:to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: reducir ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-[1140px] px-5 pt-14 md:pt-20"
      >
        <blockquote className="max-w-xl text-balance text-4xl font-bold leading-tight text-white [font-family:var(--font-display)] md:text-6xl">
          <MarkedCopy text={citaMarked} />
        </blockquote>
        <p className="mt-4 max-w-md text-xl leading-snug text-white/95 md:text-2xl">
          <MarkedCopy text={cierreMarked} />
        </p>
      </motion.div>
    </section>
  );
}
