import { TriangleAlert, Wifi, BatteryFull, House, FileText, CalendarDays, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Mock realista de la pantalla de Inicio (datos de ejemplo). NO es una captura de la app real:
// se reemplaza por screenshots reales al cerrar la app interna (pendiente anotado en ESTADO.md).
const CONTEOS = [
  ['2', 'por dar de alta'],
  ['2', 'por cobrar'],
  ['1', 'en revisión'],
];
const RESERVAS = [
  { n: 'Marcos y Ana · Crucero', s: 'Compra 3 sep', m: '$286', e: 'Alta · 4 días', oro: true },
  { n: 'Luis Peña · Miami', s: 'Compra 29 sep', m: '$344', e: 'Pendiente de alta', oro: false },
];
const TABS: { Icon: LucideIcon; l: string; on: boolean }[] = [
  { Icon: House, l: 'Inicio', on: true },
  { Icon: FileText, l: 'Reservas', on: false },
  { Icon: CalendarDays, l: 'Calendario', on: false },
  { Icon: Bell, l: 'Alertas', on: false },
];

export function AppMockInicio() {
  return (
    <div
      role="img"
      aria-label="Vista de ejemplo de la pantalla de inicio: comisiones por cobrar y un aviso de plazo"
      className="mx-auto w-72 rounded-4xl text-left border-8 border-[var(--device-bezel)] bg-[var(--bg)] shadow-[var(--shadow-2)]"
    >
      <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <Wifi size={12} />
          <BatteryFull size={16} />
        </span>
      </div>
      <div className="px-4 pb-2">
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Martes 29 de septiembre</p>
        <p className="text-xl font-bold leading-tight [font-family:var(--font-display)]">Hola, Laura</p>

        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[var(--alerta-border)] bg-[var(--alerta-bg)] px-2 py-2 text-xs font-semibold text-[var(--alerta-text)]">
          <TriangleAlert size={16} aria-hidden="true" className="mt-px shrink-0" />
          <span>Marcos y Ana: te quedan 4 días para dar de alta la venta.</span>
        </div>

        <div className="mt-3 rounded-2xl bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] p-3 text-white shadow-[var(--shadow-2)]">
          <p className="text-xs font-semibold opacity-90">Comisiones por cobrar</p>
          <p className="text-3xl font-extrabold leading-none tabular-nums [font-family:var(--font-display)]">
            $1,420 <span className="text-xs font-semibold opacity-80">USD</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {CONTEOS.map(([n, l]) => (
              <div key={l} className="rounded-lg bg-white/15 px-2 py-1">
                <b className="block text-base leading-none [font-family:var(--font-display)]">{n}</b>
                <span className="mt-1 block text-xs leading-tight opacity-90">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex h-10 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] text-sm font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-1)]">
          Registrar venta nueva
        </div>

        <div className="mt-3 space-y-2">
          {RESERVAS.map((r) => (
            <div key={r.n} className="flex items-center justify-between rounded-xl bg-white px-2 py-2 shadow-[var(--shadow-1)]">
              <div>
                <p className="text-xs font-bold">{r.n}</p>
                <p className="text-xs text-[var(--text-secondary)]">{r.s}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold tabular-nums [font-family:var(--font-display)]">{r.m}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-px text-xs font-bold ${
                    r.oro ? 'bg-[var(--chip-oro-bg)] text-[var(--alerta-text)]' : 'bg-[var(--chip-azul-bg)] text-[var(--accent)]'
                  }`}
                >
                  {r.e}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="flex justify-around rounded-b-3xl border-t border-black/10 bg-white/80 px-2 pb-3 pt-2 text-xs font-semibold text-[var(--text-secondary)]"
        aria-hidden="true"
      >
        {TABS.map(({ Icon, l, on }) => (
          <span key={l} className={`flex flex-col items-center gap-1 ${on ? 'text-[var(--accent)]' : ''}`}>
            <Icon size={16} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
