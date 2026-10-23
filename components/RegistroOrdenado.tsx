'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { CalendarDays, Download, ListFilter, PencilLine, Smartphone, Timer } from 'lucide-react';

// El registro de ventas es el corazón del negocio de cada agente: si no la convence, los avisos no bastan.
// Esta sección vende ORDEN (fichas, registro rápido, búsqueda, agenda automática) y no promete lo que Excel ya hace:
// lo que gana la app es lo automático y el celular. Las imágenes son de la propia app con datos ficticios.
const VENTAJAS = [
  { Icon: Smartphone, titulo: 'Fichas fáciles de leer', detalle: 'Cada venta en una tarjeta clara, hecha para tu celular.' },
  { Icon: PencilLine, titulo: 'Registra y edita en segundos', detalle: 'Cliente, destino, fechas y comisión. Corriges lo que quieras con un toque.' },
  { Icon: ListFilter, titulo: 'Encuentra lo que buscas', detalle: 'Busca por cliente o destino y filtra por estatus.' },
  { Icon: CalendarDays, titulo: 'Se acomoda sola en tu agenda', detalle: 'Viajes, altas, cobros y reclamos en un calendario con dos vistas: pagos y viajeros.' },
  { Icon: Timer, titulo: 'Los plazos se calculan solos', detalle: 'Pones las fechas y ella saca el alta, la revisión y el reclamo.' },
  { Icon: Download, titulo: 'Tus datos son tuyos', detalle: 'Importa tu Excel cuando empiezas y bájalo cuando quieras.' },
];

export function RegistroOrdenado() {
  const reducir = useReducedMotion();
  return (
    <section aria-label="Tu registro de ventas" className="border-y border-black/5 bg-[var(--surface)] py-12 md:py-16">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_auto] lg:content-center lg:gap-x-12">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">Tu registro de ventas</p>
          <h2 className="mt-2 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)] md:text-4xl">
            Tus ventas, <span className="text-[var(--accent)]">ordenadas</span> y a la mano
          </h2>
          <p className="mt-3 max-w-prose text-lg leading-relaxed text-[var(--text-secondary)]">
            Más que un Excel: cada venta es una ficha que <b className="text-[var(--text-primary)]">lees y editas desde el celular</b> y que se acomoda sola en tu agenda.
          </p>
        </div>

        {/* Imagen de la app (con datos ficticios). En celular va después del texto y antes de la lista */}
        <figure className="mx-auto flex w-full max-w-xs flex-col items-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] shadow-[var(--shadow-2)]">
            <Image
              src="/mock/reservas.png"
              alt="Vista de ejemplo: lista de reservas con búsqueda y fichas fáciles de leer en el celular"
              width={780}
              height={1380}
              sizes="300px"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-xs text-[var(--text-tertiary)]">Vista de ejemplo con datos ficticios</figcaption>
        </figure>

        <ul className="grid gap-3 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
          {VENTAJAS.map(({ Icon, titulo, detalle }, i) => (
            <motion.li
              key={titulo}
              initial={reducir ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] p-4"
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
      </div>
    </section>
  );
}
