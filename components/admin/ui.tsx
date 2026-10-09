// Piezas visuales compartidas del panel del dueño. Mismo lenguaje que la app (tarjeta suave, azul de marca, dorado
// solo para urgencia) y una regla fija: si un dato no existe, se dice "Sin datos" y se explica qué lo llenará.

import { Fragment } from 'react';
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
  const clase = 'flex size-11 items-center justify-center rounded-[var(--radius-button)] border border-black/10 bg-[var(--surface)] text-[var(--text-primary)] panel-tap';
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

export function Tarjeta({ titulo, subtitulo, children, className = '', hundida = false }: { titulo?: string; subtitulo?: string; children: React.ReactNode; className?: string; hundida?: boolean }) {
  return (
    <section className={`rounded-[var(--radius-card)] p-4 md:p-6 ${hundida ? 'bg-[var(--surface-2)]' : 'tarjeta-suave'} ${className}`}>
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
export function Kpi({ etiqueta, valor, detalle, tono = 'neutro', plano = false }: { etiqueta: string; valor: React.ReactNode | null; detalle?: string; tono?: 'neutro' | 'bien' | 'mal' | 'alerta'; plano?: boolean }) {
  const color = tono === 'bien' ? 'text-[var(--verde-text)]' : tono === 'mal' ? 'text-[var(--rojo-text)]' : 'text-[var(--text-primary)]';
  const fondo = tono === 'mal' ? 'bg-[var(--chip-rojo-bg)]' : tono === 'alerta' ? 'bg-[var(--alerta-bg)]' : plano ? 'bg-[var(--surface-2)]' : 'tarjeta-suave';
  return (
    <div className={`rounded-[var(--radius-card)] p-4 ${fondo}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{etiqueta}</p>
      {valor === null ? (
        <p className="mt-2 text-lg font-semibold text-[var(--text-secondary)]">{SIN_DATOS}</p>
      ) : (
        <p className={`mt-2 text-2xl font-bold leading-none tabular-nums [font-family:var(--font-display)] sm:text-3xl ${color}`}>{valor}</p>
      )}
      {detalle && <p className="mt-2 text-xs text-[var(--text-secondary)] sm:text-sm">{detalle}</p>}
    </div>
  );
}

// Tarjeta principal de cada pantalla: el dato que más importa, grande, sobre el azul de marca.
// La franja dorada de arriba (detalle firma de la ficha de arte) avisa de lo que pide atención.
export function Heroe({ franja, href, children }: { franja?: React.ReactNode; href?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] text-[var(--on-accent)] shadow-[var(--shadow-2)]">
      {franja &&
        (href ? (
          <Link href={href} className="panel-tap flex min-h-11 items-center justify-between gap-3 bg-[var(--accent-2)] px-6 py-2 text-sm font-bold text-[var(--btn-oro-text)] md:px-8">
            {franja}
            <ChevronRight size={18} aria-hidden="true" className="shrink-0" />
          </Link>
        ) : (
          <div className="bg-[var(--accent-2)] px-6 py-2 text-sm font-bold text-[var(--btn-oro-text)] md:px-8">{franja}</div>
        ))}
      <div className="p-6 md:p-8">{children}</div>
    </section>
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
        <div className={`panel-barra h-full rounded-full ${fondo}`} style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

const ESTILO_AVISO = {
  critico: { caja: 'border-[var(--rojo-text)]/30 bg-[var(--chip-rojo-bg)]', texto: 'text-[var(--rojo-text)]', Icono: OctagonAlert, etiqueta: 'Urgente' },
  atencion: { caja: 'border-[var(--alerta-border)] bg-[var(--alerta-bg)]', texto: 'text-[var(--alerta-text)]', Icono: TriangleAlert, etiqueta: 'Atención' },
  info: { caja: 'border-[var(--accent)]/25 bg-[var(--chip-azul-bg)]', texto: 'text-[var(--accent)]', Icono: Info, etiqueta: 'Para tu información' },
} as const;

function TarjetaAviso({ a }: { a: Aviso }) {
  const e = ESTILO_AVISO[a.nivel];
  const contenido = (
    <div className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 ${e.caja}`}>
      <e.Icono size={22} aria-hidden="true" className={`mt-0.5 shrink-0 ${e.texto}`} />
      <div className="min-w-0 text-[var(--text-primary)]">
        <p className={`text-xs font-bold uppercase tracking-wide ${e.texto}`}>{e.etiqueta}</p>
        <p className="mt-0.5 text-base font-bold">{a.titulo}</p>
        <p className="mt-1 text-sm">{a.porQue}</p>
        <p className="mt-1 text-sm font-semibold">Qué hacer: {a.queHacer}</p>
      </div>
    </div>
  );
  return a.href ? (
    <Link href={a.href} className="panel-tap block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}

// Avisos arriba del panel: qué pasó → por qué importa → qué hacer. El más grave va completo y el resto se pliega
// para que la pantalla no empiece con una pared de alertas. Si no hay nada, lo dice.
export function AvisosBanner({ avisos, nota }: { avisos: Aviso[]; nota?: string }) {
  if (avisos.length === 0) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--verde-text)]/25 bg-[var(--chip-verde-bg)] p-4 text-[var(--verde-text)]">
        <CircleCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div>
          <p className="text-base font-bold">Todo en orden este mes</p>
          {nota && <p className="mt-0.5 text-sm">{nota}</p>}
        </div>
      </div>
    );
  }
  const [primero, ...resto] = avisos;
  return (
    <section aria-label="Avisos para ti" className="flex flex-col gap-3">
      <TarjetaAviso a={primero} />
      {resto.length > 0 && (
        <details className="group rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--accent)] [&::-webkit-details-marker]:hidden">
            <span>
              Ver {resto.length} aviso{resto.length === 1 ? '' : 's'} más
            </span>
            <ChevronRight size={18} aria-hidden="true" className="transition-transform group-open:rotate-90" />
          </summary>
          <ul className="flex flex-col gap-3 pb-3 pt-1">
            {resto.map((a) => (
              <li key={a.id}>
                <TarjetaAviso a={a} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export interface Columna<T> {
  titulo: string;
  /** Columna que identifica la fila: es el título de la tarjeta en celular. */
  principal?: boolean;
  derecha?: boolean;
  /** Botones o enlaces de la fila: en celular van al pie de la tarjeta, sin etiqueta. */
  acciones?: boolean;
  celda: (fila: T) => React.ReactNode;
}

// Tabla en computadora, lista de tarjetas en celular: nada se corta ni obliga a deslizar de lado.
export function Datos<T>({ columnas, filas, clave, vacio }: { columnas: Columna<T>[]; filas: T[]; clave: (fila: T, i: number) => string; vacio?: string }) {
  if (filas.length === 0) {
    return vacio ? <p className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4 text-center text-sm text-[var(--text-secondary)]">{vacio}</p> : null;
  }
  const principal = columnas.find((c) => c.principal) ?? columnas[0];
  const datos = columnas.filter((c) => c !== principal && !c.acciones);
  const acciones = columnas.filter((c) => c.acciones);
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-[var(--surface)] md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              {columnas.map((c) => (
                <th key={c.titulo} scope="col" className={`whitespace-nowrap px-3 py-3 font-semibold ${c.derecha ? 'text-right' : ''}`}>
                  {c.acciones ? <span className="sr-only">{c.titulo}</span> : c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={clave(f, i)} className="border-t border-black/5 align-top">
                {columnas.map((c) =>
                  c === principal ? (
                    <th key={c.titulo} scope="row" className="px-3 py-3 text-left font-medium">
                      {c.celda(f)}
                    </th>
                  ) : (
                    <td key={c.titulo} className={`px-3 ${c.acciones ? 'py-1' : 'py-3'} ${c.derecha ? 'text-right tabular-nums' : ''}`}>
                      {c.celda(f)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {filas.map((f, i) => (
          <li key={clave(f, i)} className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--surface)] p-4">
            <div className="text-base font-bold">{principal.celda(f)}</div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 text-sm">
              {datos.map((c) => (
                <Fragment key={c.titulo}>
                  <dt className="text-[var(--text-secondary)]">{c.titulo}</dt>
                  <dd className="min-w-0 text-right font-medium">{c.celda(f)}</dd>
                </Fragment>
              ))}
            </dl>
            {acciones.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-x-4 border-t border-black/5 pt-2">{acciones.map((c) => <Fragment key={c.titulo}>{c.celda(f)}</Fragment>)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
