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
  return (
    <section aria-label="Cómo funciona el semáforo" className="bg-[var(--bg)] pb-12">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="grid gap-3 md:grid-cols-3">
          {ESTADOS.map(({ Icon, titulo, detalle, clase }) => (
            <div key={titulo} className={`flex items-start gap-3 rounded-[var(--radius-card)] p-4 ${clase}`}>
              <Icon size={24} aria-hidden="true" className="mt-px shrink-0" />
              <div>
                <p className="font-bold [font-family:var(--font-display)]">{titulo}</p>
                <p className="text-sm">{detalle}</p>
              </div>
            </div>
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
