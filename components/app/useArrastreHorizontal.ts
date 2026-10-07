'use client';

// Permite mover un contenedor con scroll horizontal arrastrando con el mouse (el dedo ya lo hace con el scroll nativo).
// No estorba a botones, enlaces ni campos: el arrastre solo empieza sobre zonas "vacías" y hasta que el mouse se mueve unos píxeles.

import { useRef, useState } from 'react';

const INTERACTIVOS = 'button, a, select, input, textarea, label, summary';
const UMBRAL_PX = 4;

export function useArrastreHorizontal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const est = useRef({ presionado: false, x: 0, scroll: 0, movido: false, suprimirClic: false, pointerId: 0 });

  const alPresionar = (e: React.PointerEvent<T>): void => {
    est.current.suprimirClic = false; // un toque nuevo siempre empieza limpio
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest(INTERACTIVOS)) return;
    const el = ref.current;
    if (!el) return;
    est.current = { presionado: true, x: e.clientX, scroll: el.scrollLeft, movido: false, suprimirClic: false, pointerId: e.pointerId };
  };

  const alMover = (e: React.PointerEvent<T>): void => {
    const a = est.current;
    const el = ref.current;
    if (!a.presionado || !el) return;
    const dx = e.clientX - a.x;
    if (!a.movido && Math.abs(dx) > UMBRAL_PX) {
      a.movido = true;
      setArrastrando(true);
      el.setPointerCapture(a.pointerId);
    }
    if (a.movido) el.scrollLeft = a.scroll - dx;
  };

  const terminar = (): void => {
    const a = est.current;
    const el = ref.current;
    if (!a.presionado) return;
    a.presionado = false;
    if (a.movido) {
      a.suprimirClic = true; // el clic que sigue a un arrastre no debe abrir nada
      setArrastrando(false);
      if (el?.hasPointerCapture(a.pointerId)) el.releasePointerCapture(a.pointerId);
    }
  };

  return {
    ref,
    arrastrando,
    props: {
      onPointerDown: alPresionar,
      onPointerMove: alMover,
      onPointerUp: terminar,
      onPointerCancel: terminar,
      // Evita seleccionar texto mientras se arrastra (los botones y campos conservan su comportamiento)
      onMouseDown: (e: React.MouseEvent<T>) => {
        if (!(e.target as HTMLElement).closest(INTERACTIVOS)) e.preventDefault();
      },
      onClickCapture: (e: React.MouseEvent<T>) => {
        if (est.current.suprimirClic) {
          est.current.suprimirClic = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
  };
}
