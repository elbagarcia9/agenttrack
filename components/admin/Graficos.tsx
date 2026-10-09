'use client';

// Gráficos del panel (17-VISUALIZACION-DATOS): máximo dato, mínima tinta. Sin rejilla, sin ejes de valor,
// el número escrito sobre cada barra y el color de acento solo en el dato. Cada gráfico lleva un resumen en texto.

import { useReducedMotion } from 'motion/react';
import { Area, AreaChart, Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const TINTA = 'var(--text-secondary)';

export function BarrasMensuales({
  datos,
  resumen,
}: {
  datos: { mes: string; etiqueta: string; valor: number; texto: string }[];
  resumen: string;
}) {
  const reducir = useReducedMotion();
  return (
    <div role="img" aria-label={resumen} className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} tick={{ fill: TINTA, fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            formatter={(_v, _n, p) => [(p.payload as { texto: string }).texto, 'Ingresos']}
            labelFormatter={(_l, p) => String((p?.[0]?.payload as { mes?: string } | undefined)?.mes ?? '')}
            contentStyle={{ borderRadius: 11, border: '1px solid rgb(0 0 0 / 0.08)', fontSize: 13 }}
          />
          <Bar dataKey="valor" fill="var(--accent)" radius={[6, 6, 0, 0]} isAnimationActive={!reducir} animationDuration={700}>
            <LabelList dataKey="texto" position="top" fill="var(--text-primary)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineaDiaria({ datos, resumen, unidad }: { datos: { dia: string; etiqueta: string; n: number }[]; resumen: string; unidad: string }) {
  const reducir = useReducedMotion();
  return (
    <div role="img" aria-label={resumen} className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} tick={{ fill: TINTA, fontSize: 12 }} interval="preserveStartEnd" minTickGap={32} />
          <Tooltip
            formatter={(v) => [String(v), unidad]}
            labelFormatter={(_l, p) => String((p?.[0]?.payload as { dia?: string } | undefined)?.dia ?? '')}
            contentStyle={{ borderRadius: 11, border: '1px solid rgb(0 0 0 / 0.08)', fontSize: 13 }}
          />
          <Area type="monotone" dataKey="n" stroke="var(--accent)" strokeWidth={2} fill="var(--accent)" fillOpacity={0.12} isAnimationActive={!reducir} animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
