# VEREDICTO revisor-visual — landing (ronda 3)
Fecha: 2026-10-20 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) el mecanismo bautizado es una etiqueta genérica y no está en el hero; 2) la banda Excel tiene tarjetas con aspecto de botón que no hacen nada, de anchos desiguales y con un ícono defectuoso; 3) la promesa de prueba sin riesgo se repite 4 veces con un bloque grande de relleno; 4) AvisosAsistente e ImportarExcel rompen el sistema de secciones (h2, alineación, tarjetas); 5) la pantalla que vende (el aviso dorado) no se muestra en ningún sitio y el carrusel abre con un formulario.

Detalle (sobre captura completa de 7 partes y código de app/page.tsx + components/landing/*):
- Usabilidad: h1:3 h2:3 h3:3 h4:2 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
- Craft: jerarquía:3 profundidad:3 identidad:2 movimiento:3 encaje:3
- Copy: idea:3 especificidad:3 emoción:3 oferta:3 acción:3
- Gate de carga cognitiva: 1 falla (elemento que parece interactivo y no actúa: pasos de ImportarExcel) → no es sobrecarga crítica.
- CTA héroe vivo: cumple los 4 (contraste ~6.1:1, whileTap 0.97, nunca disabled, 52px ancho completo). Menor: el sticky usa var(--bg) como color de texto y el kit usa --on-accent (token distinto para lo mismo).
- Anclas de conversión: titular con énfasis OK, hairline degradé en plan anual OK, chips SVG y checks custom OK, secciones adyacentes distinguibles OK.
- Ficha-arte: paleta #226697 sobre #EAEAEA/blanco, Sora + Inter Tight, radios 14/11 coinciden. El dorado #BE8C2D (dispositivo ownable) NO aparece en la UI de la landing, solo dentro de imágenes de la usuaria.
- Movimiento (código): reveal escalonado con reduced-motion en Solución/Oferta/Faq/AppPorDentro/Banda/Avisos, whileTap en CTAs, FAQ con altura animada, sticky con entrada. Sin conteo de números, sin dibujado (no aplican mucho a landing); Hero solo fade; AntesDespues/ImportarExcel estáticos.
- Heurísticas 3/7 (código): sin undo aplicable; control = Entrar, enlaces legales, FAQ colapsable, dots tocables 44px; flexibilidad = sticky CTA de 2 estados, deep links ?plan=anual|mensual, /entrar.
- Notas de archivos de imagen de la usuaria (no penalizadas como decisión, solo legibilidad): burbujas del ANTES y alertas del CON, y la pantalla del celular del hero y de la banda Excel, son ilegibles a 375px (texto ~7-9px efectivos).

TOP DEFECTOS
1. [Solución + hero, partes 01-02] ALTA — el "mecanismo bautizado" es "tu asistente de comisiones" (etiqueta genérica en barra azul), no aparece en el hero, y la misma idea se explica 3 veces (3 pasos, 4 avisos, Antes/Con). Fix: bautizar con nombre propio (p.ej. "Alarma de plazos") y repetirlo en subtítulo del hero, chip de Solución y features de ambos planes; fusionar Avisos dentro de los pasos.
2. [ImportarExcel, parte 04 y 03-04 y≈870-1270] ALTA — los 3 pasos son tarjetas con sombra e ícono de subir que parecen botones y no hacen nada; anchos desiguales (≈165/240/175px); el ícono del paso 2 muestra barras grises fantasma detrás del check (parece un glitch); además repite los 3 pasos de Solución. Fix: pasos planos en lista numerada de ancho completo (sin sombra ni upload), quitar IconoColumnas o dejar solo el check, o reducir la banda a imagen + una línea.
3. [Oferta/Garantía/Faq/CtaFinal, partes 05-07] MEDIA — "14 días, cancelas antes y no pagas nada" aparece en la línea bajo los planes, en la tarjeta grande "Prueba de 14 días sin riesgo" (con escudo que simula garantía), en la FAQ y en el recap final, además de los 2 badges. Fix: borrar la línea suelta y reducir la tarjeta a una línea dentro de la card anual; usar ese espacio para mostrar el aviso real; dejar el texto honesto de que es prueba, no garantía.
4. [AvisosAsistente y ImportarExcel vs kit, partes 03-04] MEDIA — rompen el sistema: h2 28px sin kicker (Avisos) vs 30px con kicker (Solución/Oferta), alineación que salta izquierda/centro entre secciones, y 3 variantes de tarjeta (Problema gris, tarjeta-suave centrada, Avisos con borde y texto a la izquierda); token de texto del sticky distinto al del CTA. Fix: pasarlos por SectionShell + Kicker + h2 30/40 y un solo componente de tarjeta; usar --on-accent en el sticky.
5. [Identidad y prueba visual, partes 02-05] MEDIA — Avisos dice "se pinta en dorado" pero no hay ninguna tarjeta en dorado; el dorado #BE8C2D (firma de la ficha) no existe en la landing; el carrusel abre con "Nueva reserva" (un formulario) y las vistas 2-3 no se ven a 375px (solo una astilla), así que lo que vende (el aviso) nunca se ve en la UI; 3 tratamientos de imagen distintos (recorte 3D, foto oscura, recortes con mancha azul). Fix: pintar la 1ª tarjeta de Avisos con franja dorada, reordenar el carrusel con "resultado/avisos" primero y mostrar la 2ª vista asomando con más margen.
