'use client';

// Cifras que cuentan de 0 al valor al aparecer (animación base de la app). Con "reducir movimiento" salen ya completas.

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { dinero } from '@/lib/admin/formato';

function useConteo(hasta: number): [React.RefObject<HTMLSpanElement | null>, number] {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reducir = useReducedMotion();
  const [valor, setValor] = useState(reducir ? hasta : 0);
  useEffect(() => {
    if (reducir) {
      setValor(hasta);
      return;
    }
    if (!visible) return;
    const c = animate(0, hasta, { duration: 0.9, ease: 'easeOut', onUpdate: (v) => setValor(v) });
    return () => c.stop();
  }, [visible, reducir, hasta]);
  return [ref, valor];
}

// Cifras grandes: pesos enteros y la moneda como sufijo pequeño pegado (nunca se parte en dos líneas).
// El detalle con centavos vive en las tablas, donde se compara fila contra fila.
export function CifraDinero({ centavos, moneda, enteros = true }: { centavos: number; moneda: string; enteros?: boolean }) {
  const [ref, v] = useConteo(centavos);
  if (!enteros) return <span ref={ref}>{dinero(Math.round(v), moneda)}</span>;
  const pesos = Math.round(v / 100);
  return (
    <span ref={ref} className="whitespace-nowrap">
      {pesos < 0 ? '−' : ''}${Math.abs(pesos).toLocaleString('en-US')}
      <span className="ml-1 text-xs font-semibold opacity-80">{moneda}</span>
    </span>
  );
}

export function CifraEntera({ valor, sufijo = '' }: { valor: number; sufijo?: string }) {
  const [ref, v] = useConteo(valor);
  return (
    <span ref={ref}>
      {Math.round(v).toLocaleString('es-MX')}
      {sufijo}
    </span>
  );
}

export function CifraPorcentaje({ valor, decimales = 0 }: { valor: number; decimales?: number }) {
  const [ref, v] = useConteo(valor);
  return <span ref={ref}>{v.toLocaleString('es-MX', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}%</span>;
}
