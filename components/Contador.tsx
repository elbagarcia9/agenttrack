'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

// Número que cuenta de 0 al valor al entrar en pantalla (animación base de la app). Respeta reduced-motion.
export function Contador({ hasta, prefijo = '$' }: { hasta: number; prefijo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reducir = useReducedMotion();
  const [valor, setValor] = useState(reducir ? hasta : 0);

  useEffect(() => {
    if (!visible || reducir) return;
    const c = animate(0, hasta, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setValor(Math.round(v)) });
    return () => c.stop();
  }, [visible, reducir, hasta]);

  return (
    <span ref={ref}>
      {prefijo}
      {valor.toLocaleString('en-US')}
    </span>
  );
}
