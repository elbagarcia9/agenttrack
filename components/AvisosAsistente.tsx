'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CalendarClock, CircleDollarSign, PlaneTakeoff, Upload } from 'lucide-react';

// Los cuatro avisos que da tu asistente por cada venta (definidos por el usuario, 2026-10-03).
const AVISOS = [
  { Icon: Upload, titulo: 'Dar de alta en el Hub', detalle: 'Antes de que se te pase el plazo de la venta.' },
  { Icon: CalendarClock, titulo: 'Cuando ya pasaron 60 días', detalle: 'Es momento de preguntar por tu pago, y de reclamar a tiempo si no llegó.' },
  { Icon: PlaneTakeoff, titulo: 'Cuando tu cliente inicia su viaje', detalle: 'Para que estés al pendiente y lo acompañes.' },
  { Icon: CircleDollarSign, titulo: 'Cuando hay un pago pendiente de tu cliente', detalle: 'Con su fecha y su cantidad, para completar la reserva.' },
];

export function AvisosAsistente() {
  const reducir = useReducedMotion();
  return (
    <section aria-label="Los avisos de tu asistente" className="bg-[var(--bg)] pb-12">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <h3 className="text-[22px] font-bold leading-tight [font-family:var(--font-display)]">Cada venta te da aviso de:</h3>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {AVISOS.map(({ Icon, titulo, detalle }, i) => (
            <motion.li
              key={titulo}
              initial={reducir ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]"
            >
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]">
                <Icon size={22} strokeWidth={1.8} color="var(--accent)" />
              </span>
              <div>
                <p className="font-semibold">{titulo}</p>
                <p className="text-sm text-[var(--text-secondary)]">{detalle}</p>
              </div>
            </motion.li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
          Cuando falten 5 días o menos para actuar, el aviso se pinta en dorado.
        </p>
      </div>
    </section>
  );
}
