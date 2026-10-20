# VEREDICTO revisor-visual — paywall (pantalla de planes)
Fecha: 2026-10-20 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 16/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:2 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:2 h10:3
Detalle craft: jerarquia:3 profundidad:3 identidad:3 movimiento:3 encaje:2
Detalle copy: idea:3 especificidad:3 emocion:3 oferta:3 accion:4

Gate carga cognitiva: 2 fallas (la pantalla pide mas de un viewport de lectura antes del segundo plan; la barra fija mezcla CTA + 2 bloques legales + fila de 2 enlaces, 5 elementos compitiendo). Sin sobrecarga critica (<4).
CTA heroe vivo: cumple los 4 (contraste #226697 con texto claro ~6:1, whileTap 0.97, nunca disabled, h-14 ancho completo). Falta estado "enviando/redirigiendo" al tocarlo (es un <a> a checkout externo: sin feedback entre el tap y la carga de Hotmart).
Anclas de conversion: titular con enfasis (bold + "listo para vigilar" en acento) OK; hairline degradé en plan seleccionado OK; chips SVG en beneficios OK (check dentro de chip 20px, sin emojis); secciones adyacentes distinguibles OK (tarjeta blanca de la linea de tiempo sobre fondo gris).
Verificado en codigo: h3 (X a /onboarding, "Ahora no" a /, ambos visibles) OK; h7 (plan anual preseleccionado, hora 8:00 y aviso por defecto, flechas de teclado en radiogroup) OK; role=status en aviso de acceso; MotionConfig reducedMotion="user" OK. NO verificado: aria-live de errores de checkout (no existe manejo de error de checkout).
Fidelidad a FICHA-ARTE: paleta (#226697, #BE8C2D), radios y tarjeta heroe azul con franja dorada coinciden. Titular y precios NO se leen claramente como Sora en el screenshot (parecen grotesca neutra similar al cuerpo): verificar carga de la fuente. Escala del codigo (text-base 16 / text-xs 12) se aparta de la ficha (body 14 / label 11) sin consecuencia visible.
Sub-checks copy: garantia nombrada FALLA (intencional: no se promete garantia; mitigado con "Si cancelas antes, no pagas nada" y renovacion automatica explicita, lo cual es correcto y honesto); message-match N/A (sin dato de anuncio). Sin testimonios (aun no existen clientas): eje especificidad queda en 3, no sube.
Limitacion de captura: la captura de pagina completa pinta la barra sticky sobre el plan Mensual y el titulo "Asi funciona tu prueba" y muestra la insignia "N" de Next dev sobre "Ahora no"; ambos son artefactos, no se puntuaron como defecto salvo la altura real de la barra (abajo).

Top defectos:
1. [ALTA - Barra fija inferior, CTA + legales] La barra sticky mide ~220-230px (CTA 56 + 2 lineas de renovacion + 2-3 lineas de aceptacion legal + fila "Ahora no / Pago procesado por Hotmart"): en un movil de 667px ocupa ~1/3 de la pantalla, tapa el plan Mensual y la linea de tiempo mientras se lee, y rompe "1 accion primaria, cada elemento se gana su lugar" (h8) -> dejar en la barra solo CTA + una linea ("Despues $1,190 MXN al año. Cancelas desde Hotmart."), mover el parrafo de terminos/privacidad/reembolsos y "Ahora no / Hotmart" al final del contenido scrolleable.
2. [ALTA - CTA, estado al tocar] El CTA es un <a> a un checkout externo sin feedback tras el tap (h1: >100ms de espera sin respuesta visible; riesgo de doble tap y de "se colgo") -> al onClick pasar a estado "Abriendo tu pago seguro..." con spinner inline y pointer-events-none, y revertirlo si la pagina se restaura (pageshow).
3. [MEDIA - Encaje, fila de horas del aviso] "¿A qué hora?" y los 3 chips (min-h-11, px-4) se parten en dos lineas: "Mañana · 8:00" arriba y "Tarde"/"Noche" abajo, dejando la etiqueta huerfana y un hueco derecho; ademas el cuadro de aviso pesa tanto como la oferta (h8) -> poner los 3 chips en grid de 3 columnas iguales bajo la etiqueta (texto en 2 lineas: "Mañana" / "8:00") o convertirlo en un selector compacto.
4. [MEDIA - Hero/tarjeta y badges, FICHA-ARTE] Dorado como adorno: "AHORRAS 4 MESES", borde degradado azul-dorado del plan, borde inferior grueso y pildora "344 USD" de la tarjeta heroe, contra la regla de la ficha (dorado solo alerta/monto en riesgo/accion). Tarjeta heroe con p-3 (12px) frente a p-4 (16px) del resto; pildoras RECOMENDADO/AHORRAS a 12px -> badge de ahorro en azul/neutro (dorado solo el monto en riesgo de la tarjeta), degradé del borde tonal azul, p-4 en la tarjeta, texto de badges a 13px+.
5. [MEDIA - Titular y precios, tipografia] Titular h1 y "$99" no se perciben como Sora 700 (misma textura que el cuerpo): el dispositivo tipografico de la ficha no se ve -> verificar que Sora cargue (font-display) y que var(--font-display) apunte a ella; el titular queda en 30px frente a los 38px de la ficha, subir a text-4xl para que el héroe domine sobre el precio.
