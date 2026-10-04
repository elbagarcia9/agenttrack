'use client';

import { ChevronDown } from 'lucide-react';
import { diasRestantes } from '@/lib/plazos';
import { ETIQUETA_ESTATUS, type Alerta, type Estatus, type Severidad } from '@/lib/reservas';

export const ESTILO_ESTATUS: Record<Estatus, string> = {
  pagado: 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]',
  pendiente_alta: 'bg-[var(--chip-azul-bg)] text-[var(--accent)]',
  pendiente_pago: 'bg-[color-mix(in_oklab,var(--text-primary)_8%,transparent)] text-[var(--text-secondary)]',
  solicitar_revision: 'bg-[var(--slate)] text-white',
};

export const ESTILO_SEVERIDAD: Record<Severidad, string> = {
  vencido: 'bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]',
  urgente: 'bg-[var(--chip-oro-bg)] text-[var(--alerta-text)]',
  normal: 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]',
  info: 'bg-[var(--chip-azul-bg)] text-[var(--accent)]',
};

export function textoSeveridad(a: Alerta, hoy: Date): string {
  const d = diasRestantes(a.fecha, hoy);
  if (a.severidad === 'vencido') return 'Plazo vencido';
  if (a.tipo === 'salida') return d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
  if (d === 0) return 'Vence hoy';
  return a.severidad === 'urgente' ? `Quedan ${d} días` : `${d} días`;
}

export function InsigniaSeveridad({ alerta, hoy }: { alerta: Alerta; hoy: Date }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${ESTILO_SEVERIDAD[alerta.severidad]}`}>{textoSeveridad(alerta, hoy)}</span>;
}

export function InsigniaEstatus({ estatus }: { estatus: Estatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${ESTILO_ESTATUS[estatus]}`}>{ETIQUETA_ESTATUS[estatus]}</span>;
}

// El botón de estatus del final de cada reserva: se ve como una insignia y cambia con un toque (lista nativa, accesible).
export function SelectorEstatus({ valor, onCambio, etiqueta }: { valor: Estatus; onCambio: (e: Estatus) => void; etiqueta: string }) {
  return (
    <label className={`relative inline-flex min-h-11 items-center rounded-full ${ESTILO_ESTATUS[valor]}`}>
      <span className="sr-only">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onCambio(e.target.value as Estatus)}
        className="min-h-11 cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-3 pr-8 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        {(Object.keys(ETIQUETA_ESTATUS) as Estatus[]).map((e) => (
          <option key={e} value={e} className="text-[var(--text-primary)]">
            {ETIQUETA_ESTATUS[e]}
          </option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2" />
    </label>
  );
}
