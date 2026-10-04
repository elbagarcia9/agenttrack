'use client';

// INICIO — protagonista: el total de comisiones por cobrar y lo que urge. Todo lo demás se llega desde aquí en un toque.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, MotionConfig } from 'motion/react';
import { ArrowRight, FileUp, Plus, TriangleAlert } from 'lucide-react';
import { Contador } from '@/components/Contador';
import { InsigniaEstatus, InsigniaSeveridad } from '@/components/app/Insignias';
import { fechaConDia, formatoFecha } from '@/lib/plazos';
import { formatoDinero, todasLasAlertas, totales, useReservas } from '@/lib/reservas';

function nombreGuardado(): string {
  try {
    const e = JSON.parse(window.localStorage.getItem('cg_onboarding_v1') ?? '{}');
    return typeof e.nombre === 'string' ? e.nombre.trim() : '';
  } catch {
    return '';
  }
}

const entrada = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
});

export default function Inicio() {
  const { reservas, listo } = useReservas();
  const [nombre, setNombre] = useState('');
  const hoy = useMemo(() => new Date(), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNombre(nombreGuardado());
  }, []);

  const alertas = useMemo(() => todasLasAlertas(reservas, hoy), [reservas, hoy]);
  const t = useMemo(() => totales(reservas, hoy), [reservas, hoy]);
  const urgente = alertas.find((a) => a.severidad === 'vencido' || a.severidad === 'urgente');
  const siguientes = alertas.filter((a) => a.id !== urgente?.id).slice(0, 4);
  const recientes = [...reservas].sort((a, b) => b.creada - a.creada).slice(0, 3);

  if (!listo) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4 pt-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[var(--surface-2)] motion-reduce:animate-none" />
        <div className="h-44 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-reduce:animate-none" />
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 pt-6">
        <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">Registra tu primera venta</h1>
        <p className="max-w-[44ch] text-base text-[var(--text-secondary)]">
          Tu asistente empieza a vigilar en cuanto guardes una reserva. Si ya tienes todo en Excel, puedes traerlo en segundos.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link href="/app/nueva" className="flex h-14 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] px-6 text-base font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-2)]">
            <Plus size={18} aria-hidden="true" />
            Registrar venta nueva
          </Link>
          <Link href="/app/importar" className="flex h-14 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-6 text-base font-semibold">
            <FileUp size={18} aria-hidden="true" />
            Importar mi Excel
          </Link>
        </div>
      </div>
    );
  }

  const hayMxn = t.porCobrar.MXN > 0;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5">
        <motion.div {...entrada(0)}>
          <p className="text-sm font-semibold text-[var(--text-secondary)]">{fechaConDia(hoy)}</p>
          <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
        </motion.div>

        {urgente && (
          <motion.div {...entrada(1)}>
            <Link
              href="/app/alertas"
              className={`flex items-start gap-3 rounded-[var(--radius-button)] border p-3 text-sm font-semibold ${
                urgente.severidad === 'vencido'
                  ? 'border-[var(--rojo-text)]/40 bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]'
                  : 'border-[var(--alerta-border)] bg-[var(--alerta-bg)] text-[var(--alerta-text)]'
              }`}
            >
              <TriangleAlert size={18} aria-hidden="true" className="mt-px shrink-0" />
              <span className="flex-1">
                {urgente.titulo}. {urgente.detalle}
              </span>
              <ArrowRight size={18} aria-hidden="true" className="mt-px shrink-0" />
            </Link>
          </motion.div>
        )}

        <motion.section
          {...entrada(2)}
          aria-label="Comisiones por cobrar"
          className="rounded-[var(--radius-card)] border-b-4 border-[var(--btn-oro-to)] bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] p-4 text-white shadow-[var(--shadow-2)]"
        >
          <p className="text-sm font-semibold opacity-90">Comisiones por cobrar</p>
          <p className="text-4xl font-extrabold leading-none tabular-nums [font-family:var(--font-display)]">
            <Contador hasta={t.porCobrar.USD} /> <span className="text-sm font-semibold opacity-80">USD</span>
          </p>
          {hayMxn && <p className="mt-1 text-sm font-semibold opacity-90">+ {formatoDinero(t.porCobrar.MXN, 'MXN')}</p>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              [t.porDarDeAlta, 'por dar de alta'],
              [t.porCobrarN, 'por cobrar'],
              [t.enRevision, 'en revisión'],
            ].map(([n, l]) => (
              <div key={l as string} className="rounded-lg bg-white/15 px-2 py-2">
                <b className="block text-xl leading-none [font-family:var(--font-display)]">{n}</b>
                <span className="mt-1 block text-xs leading-tight opacity-90">{l}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div {...entrada(3)} className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/app/nueva"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-gradient-to-b sm:flex-1 from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] text-base font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-2)]"
          >
            <Plus size={18} aria-hidden="true" />
            Registrar venta nueva
          </Link>
          <Link
            href="/app/importar"
            className="flex h-14 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-5 text-base font-semibold"
          >
            <FileUp size={18} aria-hidden="true" />
            Importar Excel
          </Link>
        </motion.div>

        {siguientes.length > 0 && (
          <motion.section {...entrada(4)} aria-label="Lo que sigue" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold [font-family:var(--font-display)]">Lo que sigue</h2>
              <Link href="/app/alertas" className="flex min-h-11 items-center text-sm font-semibold text-[var(--accent)]">
                Ver todas
              </Link>
            </div>
            <ul className="flex flex-col gap-2">
              {siguientes.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.titulo}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{formatoFecha(a.fecha, hoy)}</p>
                  </div>
                  <InsigniaSeveridad alerta={a} hoy={hoy} />
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section {...entrada(5)} aria-label="Reservas recientes" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold [font-family:var(--font-display)]">Reservas recientes</h2>
            <Link href="/app/reservas" className="flex min-h-11 items-center text-sm font-semibold text-[var(--accent)]">
              Ver todas
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recientes.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {r.cliente} · {r.destino}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Sale el {formatoFecha(new Date(r.fechaViaje + 'T00:00:00'), hoy)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-extrabold tabular-nums [font-family:var(--font-display)]">{formatoDinero(r.comision, r.moneda)}</span>
                  <InsigniaEstatus estatus={r.estatus} />
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </MotionConfig>
  );
}
