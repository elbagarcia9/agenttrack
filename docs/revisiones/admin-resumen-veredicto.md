# VEREDICTO revisor-visual — admin-resumen
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-resumen-375.png
Usabilidad: 30/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [KPIs, 2 filas de 2 tarjetas] etiquetas de 1 y 2 líneas hacen que los valores no queden alineados en la misma fila ($3,100 vs 36; 75% vs 25.0%) -> reservar alto de 2 líneas en la etiqueta (min-h) o anclar el valor al fondo de la tarjeta.
2. [Tarjeta héroe, cifra "$3,574"] el azul claro --accent-on-dark sobre el degradé #226697 tiene contraste estimado <4.5:1 en la cifra clave, y el sufijo MXN al 80% de opacidad es aún más débil -> aclarar el tono (blanco o azul muy claro medido >=4.5:1) y subir opacidad del sufijo.
3. [Gráfica de 12 meses] 5 de 12 meses vacíos dejan el 40% izquierdo como hueco sin línea base ni "$0" (se leen como roto), y el eje no tiene base -> dibujar línea base con ticks y barra mínima o "$0" en meses vacíos; considerar mostrar solo meses desde la primera venta.
4. [Pestañas del celular, "Resumen"] la píldora activa queda pegada y recortada al borde izquierdo (x=0) tras centrarse, y la 4ª pestaña se desvanece con máscara -> mantener padding izquierdo con scroll-padding-inline/scroll-margin en las píldoras.
5. [KPI "Bajas del mes" / Heroe] decimales inconsistentes (25.0% junto a 75%) y 3 bloques de alerta/estimación previos al dato (alerta roja + enlace "3 avisos más" + franja dorada) empujan las cifras bajo el pliegue -> mismo formato de porcentaje y compactar avisos en una sola tarjeta.

Verificado en código: loading.tsx con skeleton (reduce-motion respetado), conteo de cifras con useReducedMotion, entrada escalonada 60ms y tap scale 0.97/120ms con reduced-motion, aria-label en gráficas. Atajos del experto (h7) limitados al selector de mes con flechas; sin teclado ni recuerdo de preferencia. Hay un "l" de Sora que se lee como "1" en "los" del título de la gráfica (menor).
