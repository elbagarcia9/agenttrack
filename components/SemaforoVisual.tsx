'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CircleCheck, TriangleAlert, CircleX } from 'lucide-react';

// Muestra el mecanismo (Semáforo de Comisiones) con sus tres estados y los plazos verificados de Archer MX/LatAm.
const ESTADOS = [
  { Icon: CircleCheck, titulo: 'En plazo', detalle: 'Todo en orden. Sin prisa.', clase: 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]' },
  { Icon: TriangleAlert, titulo: 'Quedan 5 días o menos', detalle: 'Dorado: actúa hoy.', clase: 'bg-[var(--chip-oro-bg)] text-[var(--alerta-text)]' },
  { Icon: CircleX, titulo: 'Plazo vencido', detalle: 'Rojo: consulta con tu agencia.', clase: 'bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]' },
];
const PLAZOS = [
  ['Alta', '30 días desde la compra'],
  ['Pago', '60 a 90 días'],
  ['Reclamo', '18 meses desde el inicio del viaje'],
];

export function SemaforoVisual() {
  const reducir = useReducedMotion();
  return (
    <section aria-label="Cómo funciona el semáforo" className="bg-[var(--bg)] pb-12">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="grid gap-3 md:grid-cols-3">
          {ESTADOS.map(({ Icon, titulo, detalle, clase }, i) => (
            <motion.div
              key={titulo}
              initial={reducir ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.35 }}
              className={`flex items-start gap-3 rounded-[var(--radius-card)] p-4 ${clase}`}
            >
              <Icon size={24} aria-hidden="true" className="mt-px shrink-0" />
              <div>
                <p className="font-bold [font-family:var(--font-display)]">{titulo}</p>
                <p className="text-sm">{detalle}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Plazos con las reglas de Archer México y Latinoamérica:{' '}
          {PLAZOS.map(([n, d], i) => (
            <span key={n}>
              <b className="text-[var(--text-primary)]">{n}</b> {d}
              {i < PLAZOS.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
