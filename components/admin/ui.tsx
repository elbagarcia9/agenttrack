// Piezas visuales compartidas del panel del dueño. Mismo lenguaje que la app (tarjeta suave, azul de marca, dorado
// solo para urgencia) y una regla fija: si un dato no existe, se dice "Sin datos" y se explica qué lo llenará.

import Link from 'next/link';
import { ChevronLeft, ChevronRight, CircleCheck, Info, TriangleAlert, OctagonAlert } from 'lucide-react';
import { SIN_DATOS, type RangoMes } from '@/lib/admin/formato';
import type { Aviso } from '@/lib/admin/derivados';

export function Encabezado({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)] md:text-4xl">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{descripcion}</p>}
      </div>
      {children}
    </header>
  );
}

// Navegación entre meses con fechas reales (regla UX 13): ← mes anterior · mes · mes siguiente →
export function SelectorMes({ rango, base }: { rango: RangoMes; base: string }) {
  const clase = 'flex size-11 items-center justify-center rounded-[var(--radius-button)] border border-black/10 bg-[var(--surface)] text-[var(--text-primary)]';
  return (
    <nav aria-label="Elegir mes" className="flex items-center gap-2">
      <Link href={`${base}?mes=${rango.anterior}`} aria-label="Mes anterior" className={clase}>
        <ChevronLeft size={18} aria-hidden="true" />
      </Link>
      <span className="min-w-36 text-center text-base font-bold" aria-live="polite">
        {rango.etiqueta}
      </span>
      {rango.siguiente ? (
        <Link href={`${base}?mes=${rango.siguiente}`} aria-label="Mes siguiente" className={clase}>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${clase} opacity-40`}>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}

export function Tarjeta({ titulo, subtitulo, children, className = '' }: { titulo?: string; subtitulo?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[var(--radius-card)] tarjeta-suave p-4 md:p-6 ${className}`}>
      {titulo && (
        <div className="mb-4">
          <h2 className="text-lg font-bold [font-family:var(--font-display)]">{titulo}</h2>
          {subtitulo && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitulo}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// Un dato héroe + su interpretación (regla de gráficos: el número, y qué significa)
export function Kpi({ etiqueta, valor, detalle, tono = 'neutro' }: { etiqueta: string; valor: string | null; detalle?: string; tono?: 'neutro' | 'bien' | 'mal' }) {
  const color = tono === 'bien' ? 'text-[var(--verde-text)]' : tono === 'mal' ? 'text-[var(--rojo-text)]' : 'text-[var(--text-primary)]';
  return (
    <div className="rounded-[var(--radius-card)] tarjeta-suave p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{etiqueta}</p>
      {valor === null ? (
        <p className="mt-2 text-xl font-semibold text-[var(--text-secondary)]">{SIN_DATOS}</p>
      ) : (
        <p className={`mt-2 text-3xl font-bold tabular-nums leading-none [font-family:var(--font-display)] ${color}`}>{valor}</p>
      )}
      {detalle && <p className="mt-2 text-sm text-[var(--text-secondary)]">{detalle}</p>}
    </div>
  );
}

export function SinDatos({ titulo = SIN_DATOS, queFalta }: { titulo?: string; queFalta: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4">
      <Info size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent)]" />
      <div>
        <p className="text-base font-semibold">{titulo}</p>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{queFalta}</p>
      </div>
    </div>
  );
}

export function Insignia({ tono, children }: { tono: 'verde' | 'rojo' | 'oro' | 'azul' | 'gris'; children: React.ReactNode }) {
  const clases: Record<string, string> = {
    verde: 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]',
    rojo: 'bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]',
    oro: 'bg-[var(--alerta-bg)] text-[var(--alerta-text)]',
    azul: 'bg-[var(--chip-azul-bg)] text-[var(--accent)]',
    gris: 'bg-[var(--surface-2)] text-[var(--text-secondary)]',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${clases[tono]}`}>{children}</span>;
}

// Barra con la etiqueta directamente sobre el dato (sin leyendas ni ejes)
export function BarraHorizontal({ etiqueta, valor, max, texto, tono = 'acento' }: { etiqueta: string; valor: number; max: number; texto: string; tono?: 'acento' | 'rojo' | 'verde' }) {
  const ancho = max > 0 ? Math.max(2, Math.round((valor / max) * 100)) : 0;
  const fondo = tono === 'rojo' ? 'bg-[var(--rojo-text)]' : tono === 'verde' ? 'bg-[var(--verde-text)]' : 'bg-[var(--accent)]';
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{etiqueta}</span>
        <span className="font-bold tabular-nums">{texto}</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden="true">
        <div className={`h-full rounded-full ${fondo}`} style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

const ESTILO_AVISO = {
  critico: { caja: 'border-[var(--rojo-text)]/30 bg-[var(--chip-rojo-bg)]', texto: 'text-[var(--rojo-text)]', Icono: OctagonAlert, etiqueta: 'Urgente' },
  atencion: { caja: 'border-[var(--alerta-border)] bg-[var(--alerta-bg)]', texto: 'text-[var(--alerta-text)]', Icono: TriangleAlert, etiqueta: 'Atención' },
  info: { caja: 'border-[var(--accent)]/25 bg-[var(--chip-azul-bg)]', texto: 'text-[var(--accent)]', Icono: Info, etiqueta: 'Para tu información' },
} as const;

// Avisos arriba del panel: qué pasó → por qué importa → qué hacer. Si no hay nada, lo dice.
export function AvisosBanner({ avisos, nota }: { avisos: Aviso[]; nota?: string }) {
  if (avisos.length === 0) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--verde-text)]/25 bg-[var(--chip-verde-bg)] p-4 text-[var(--verde-text)]">
        <CircleCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div>
          <p className="text-base font-bold">✅ Todo en orden este mes</p>
          {nota && <p className="mt-0.5 text-sm">{nota}</p>}
        </div>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3" aria-label="Avisos para ti">
      {avisos.map((a) => {
        const e = ESTILO_AVISO[a.nivel];
        const contenido = (
          <div className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 ${e.caja}`}>
            <e.Icono size={22} aria-hidden="true" className={`mt-0.5 shrink-0 ${e.texto}`} />
            <div className="min-w-0 text-[var(--text-primary)]">
              <p className={`text-xs font-bold uppercase tracking-wide ${e.texto}`}>{e.etiqueta}</p>
              <p className="mt-0.5 text-base font-bold">
                <span aria-hidden="true">{a.emoji} </span>
                {a.titulo}
              </p>
              <p className="mt-1 text-sm">{a.porQue}</p>
              <p className="mt-1 text-sm font-semibold">Qué hacer: {a.queHacer}</p>
            </div>
          </div>
        );
        return (
          <li key={a.id}>
            {a.href ? (
              <Link href={a.href} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                {contenido}
              </Link>
            ) : (
              contenido
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Tabla({ encabezados, children, vacio }: { encabezados: { texto: string; derecha?: boolean }[]; children: React.ReactNode; vacio?: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-[var(--surface)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            {encabezados.map((h) => (
              <th key={h.texto} scope="col" className={`whitespace-nowrap px-3 py-3 font-semibold ${h.derecha ? 'text-right' : ''}`}>
                {h.texto}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {vacio && <p className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">{vacio}</p>}
    </div>
  );
}
