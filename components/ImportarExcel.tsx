import Image from 'next/image';
import { ChevronsRight, CircleCheckBig, ShieldCheck, Upload } from 'lucide-react';

// Banda de importación: responde el miedo nº 1 antes de animarse ("¿tengo que pasar todo a mano?").
// Fase 1 (Excel y CSV) es obligatoria antes de vender: ver ESTADO.md.
// Orden en celular: texto → imagen (Excel → celular) → pasos. En computadora: texto y pasos a la izquierda, imagen a la derecha.
// PENDIENTE (ESTADO.md): el logo de Excel y el celular en círculo salen de recortes de la imagen anterior (478 px, poca
// resolución); reemplazar por las piezas originales de la usuaria (PNG con fondo transparente) cuando las entregue.

function IconoColumnas() {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-14 items-center justify-center">
      <span className="absolute left-1 top-1.5 h-3 w-10 rounded-sm bg-[color-mix(in_oklab,var(--accent)_16%,var(--surface))]" />
      <span className="absolute bottom-1.5 right-1 h-3 w-10 rounded-sm bg-[color-mix(in_oklab,var(--accent)_16%,var(--surface))]" />
      <CircleCheckBig size={34} strokeWidth={1.8} color="var(--slate)" className="relative" />
    </span>
  );
}

const PASOS = [
  {
    clave: 'subir',
    titulo: 'Sube tu Excel o CSV',
    detalle: null,
    icono: (
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <Image src="/img/excel-logo-temporal.png" alt="" width={40} height={43} className="h-10 w-auto" />
        <span className="flex size-9 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-azul-bg)]">
          <Upload size={20} strokeWidth={1.8} color="var(--slate)" />
        </span>
      </span>
    ),
  },
  { clave: 'confirmar', titulo: 'Confirmas qué es cada columna', detalle: null, icono: <IconoColumnas /> },
  {
    clave: 'listo',
    titulo: '¡Tu sistema listo!',
    detalle: 'Portable y con alertas',
    icono: <ShieldCheck aria-hidden="true" size={36} strokeWidth={1.6} color="var(--slate)" />,
  },
] as const;

// Dos flechas grandes de contorno (la idea es "de aquí, a allá")
function FlechasGrandes({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 132 130" fill="none" className={className}>
      <g className="stroke-[var(--text-tertiary)] opacity-70" strokeWidth="5" strokeLinejoin="round">
        <path d="M6 6H38L76 65L38 124H6L44 65Z" />
        <path d="M56 6H88L126 65L88 124H56L94 65Z" />
      </g>
    </svg>
  );
}

export function ImportarExcel() {
  return (
    <section aria-label="Importa tu Excel" className="bg-[var(--surface-2)] py-12 md:py-16">
      <div className="mx-auto grid w-full max-w-[1140px] gap-8 px-5 md:grid-cols-[1fr_auto] md:gap-x-10 md:gap-y-8">
        {/* 1 · Texto */}
        <div className="text-center md:col-start-1 md:row-start-1 md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">¿Ya tienes todo en Excel?</p>
          <h2 className="mt-2 text-balance text-[28px] font-bold leading-[1.15] [font-family:var(--font-display)] md:text-[34px]">
            Importa todos los datos de tu Excel <span className="text-[var(--accent)]">en segundos</span>
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-secondary)]">
            Transforma tu administración en un sistema <b className="text-[var(--text-primary)]">portable y con alertas</b>. No tienes que pasar nada a mano.
          </p>
        </div>

        {/* 2 · Imagen: de Excel al celular. En celular va ANTES de los pasos */}
        <div
          role="img"
          aria-label="De una hoja de Excel a tu asistente en el celular"
          className="flex items-center justify-center md:col-start-2 md:row-span-2 md:row-start-1"
        >
          <Image src="/img/excel-logo-temporal.png" alt="" width={140} height={152} className="h-auto w-20 md:w-[110px]" />
          <FlechasGrandes className="mx-3 h-auto w-20 md:mx-5 md:w-28" />
          <Image src="/img/celular-circulo-temporal.png" alt="" width={202} height={240} className="h-auto w-36 md:w-[190px]" />
        </div>

        {/* 3 · Pasos como botones unidos por flechas (en celular, uno bajo otro) */}
        <ol className="flex flex-col items-center gap-1 md:col-start-1 md:row-start-2 md:flex-row md:items-stretch md:justify-start md:gap-2">
          {PASOS.map((p, i) => (
            <li key={p.clave} className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
              <div className="tarjeta-suave flex w-full min-w-0 flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] px-4 py-3 text-center md:h-full md:w-40">
                <span className="flex h-10 items-center justify-center">{p.icono}</span>
                <span className="text-[15px] leading-snug text-[var(--text-primary)]">
                  {p.detalle ? <b className="block font-semibold">{p.titulo}</b> : p.titulo}
                  {p.detalle && <span className="block text-[var(--text-secondary)]">{p.detalle}</span>}
                </span>
              </div>
              {i < PASOS.length - 1 && <ChevronsRight aria-hidden="true" size={26} strokeWidth={2.2} color="var(--accent)" className="shrink-0 rotate-90 md:rotate-0" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
