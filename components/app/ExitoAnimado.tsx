'use client';

// Animación de éxito (archivo del usuario: public/anim/exito.json). Se descarga solo cuando se muestra,
// se reproduce una vez y se queda en el último cuadro. Con "reducir movimiento" o si falla la carga, muestra un check fijo.

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function ExitoAnimado({ clase = 'size-48' }: { clase?: string }) {
  const reducir = useReducedMotion();
  const [datos, setDatos] = useState<object | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (reducir) return;
    let vivo = true;
    fetch('/anim/exito.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('sin animación'))))
      .then((j) => vivo && setDatos(j))
      .catch(() => vivo && setFallo(true));
    return () => {
      vivo = false;
    };
  }, [reducir]);

  if (reducir || fallo || !datos) {
    return (
      <span aria-hidden="true" className={`flex items-center justify-center rounded-full bg-[var(--chip-verde-bg)] ${clase}`}>
        <Check size={48} strokeWidth={2.5} color="var(--verde-text)" />
      </span>
    );
  }
  return (
    <div aria-hidden="true" className={clase}>
      <Lottie animationData={datos} loop={false} autoplay />
    </div>
  );
}
