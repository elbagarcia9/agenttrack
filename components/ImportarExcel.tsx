import Image from 'next/image';
import { FileSpreadsheet, ListChecks, Smartphone } from 'lucide-react';

// Banda de importación: responde el miedo nº 1 antes de animarse ("¿tengo que pasar todo a mano?").
// Fase 1 (Excel y CSV) es obligatoria antes de vender: ver ESTADO.md.
const PUNTOS = [
  { Icon: FileSpreadsheet, texto: 'Sube tu Excel o CSV' },
  { Icon: ListChecks, texto: 'Confirmas qué es cada columna' },
  { Icon: Smartphone, texto: 'Tu base, portable y con alertas' },
];

export function ImportarExcel() {
  return (
    <section aria-label="Importa tu Excel" className="bg-[var(--surface-2)] py-12">
      <div className="mx-auto flex w-full max-w-[1140px] flex-col items-center gap-6 px-5 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">¿Ya tienes todo en Excel?</p>
          <h2 className="mt-2 text-balance text-[28px] font-bold leading-[1.15] [font-family:var(--font-display)] md:text-[34px]">
            Importa todos los datos de tu Excel <span className="text-[var(--accent)]">en segundos</span>
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-secondary)]">
            Transforma tu administración en un sistema <b className="text-[var(--text-primary)]">portable y con alertas</b>. No tienes que pasar nada a mano.
          </p>
          <ul className="mt-5 flex flex-col gap-3 text-left">
            {PUNTOS.map(({ Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-base font-medium">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]">
                  <Icon size={22} strokeWidth={1.8} color="var(--accent)" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/img/excel-a-app.jpg"
          alt="De una hoja de Excel a tu asistente en el celular"
          width={478}
          height={250}
          className="h-auto w-full max-w-[478px] rounded-[var(--radius-card)] mix-blend-multiply"
        />
      </div>
    </section>
  );
}
