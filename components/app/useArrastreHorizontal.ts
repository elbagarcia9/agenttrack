'use client';

// Permite mover un contenedor con scroll horizontal arrastrando con el mouse (el dedo ya lo hace con el scroll nativo).
// No estorba a botones, enlaces ni campos: el arrastre solo empieza sobre zonas "vacías" y hasta que el mouse se mueve unos píxeles.
// Se engancha con eventos nativos una vez que el contenedor existe (así no se lee ninguna referencia mientras se dibuja la pantalla).

import { useEffect, useState } from 'react';

const INTERACTIVOS = 'button, a, select, input, textarea, label, summary';
const UMBRAL_PX = 4;

export function useArrastreHorizontal<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    if (!el) return;
    let presionado = false;
    let movido = false;
    let suprimirClic = false;
    let x = 0;
    let scroll = 0;
    let pointerId = 0;

    const alPresionar = (e: PointerEvent) => {
      suprimirClic = false; // un toque nuevo siempre empieza limpio
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if ((e.target as HTMLElement).closest(INTERACTIVOS)) return;
      presionado = true;
      movido = false;
      x = e.clientX;
      scroll = el.scrollLeft;
      pointerId = e.pointerId;
    };
    const alMover = (e: PointerEvent) => {
      if (!presionado) return;
      const dx = e.clientX - x;
      if (!movido && Math.abs(dx) > UMBRAL_PX) {
        movido = true;
        setArrastrando(true);
        el.setPointerCapture(pointerId);
      }
      if (movido) el.scrollLeft = scroll - dx;
    };
    const terminar = () => {
      if (!presionado) return;
      presionado = false;
      if (movido) {
        suprimirClic = true; // el clic que sigue a un arrastre no debe abrir nada
        setArrastrando(false);
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      }
    };
    // Evita seleccionar texto mientras se arrastra (los botones y campos conservan su comportamiento)
    const alBajarMouse = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(INTERACTIVOS)) e.preventDefault();
    };
    const alHacerClic = (e: MouseEvent) => {
      if (suprimirClic) {
        suprimirClic = false;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('pointerdown', alPresionar);
    el.addEventListener('pointermove', alMover);
    el.addEventListener('pointerup', terminar);
    el.addEventListener('pointercancel', terminar);
    el.addEventListener('mousedown', alBajarMouse);
    el.addEventListener('click', alHacerClic, true);
    return () => {
      el.removeEventListener('pointerdown', alPresionar);
      el.removeEventListener('pointermove', alMover);
      el.removeEventListener('pointerup', terminar);
      el.removeEventListener('pointercancel', terminar);
      el.removeEventListener('mousedown', alBajarMouse);
      el.removeEventListener('click', alHacerClic, true);
    };
  }, [el]);

  return { enganchar: setEl, arrastrando };
}
