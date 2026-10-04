# VEREDICTO revisor-visual — paywall (pantalla de planes)
Fecha: 2026-10-04 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:2 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:2 h10:3
Detalle craft: jerarquia:3 profundidad:2 identidad:3 movimiento:3 encaje:3
Detalle copy: idea:3 especificidad:3 emocion:2 oferta:3 accion:3

Gate carga cognitiva: 1 falla (densidad: hero + 3 beneficios + 2 planes + linea de objecion + linea de tiempo + checkbox + 3 horas + CTA, ~1.9 pantallas a 375px). Sin sobrecarga critica.
CTA heroe vivo: cumple los 4 (contraste ~5:1, whileTap 0.97, nunca disabled, h-14 ancho completo). Falta estado de "enviando" al tocarlo.
Anti-patrones C5: X visible desde el HTML inicial (cumple; esta arriba a la derecha, no a la izquierda como el blueprint C1); salida "Ahora no" neutra; plan recomendado real preseleccionado; total anual visible; sin urgencia falsa. Falla: precio critico a 12px ("MXN al mes"). Riesgo C4bis/C5: el aviso por correo se promete pero nada lo consume todavia.
Fidelidad a FICHA-ARTE: paleta, radios 14/11 y tokens coinciden. Sora/Inter Tight cargados en layout; en el screenshot el titular y los precios no se leen como Sora (parecen la misma grotesca del cuerpo) -> verificar fallback. Dorado usado como decoracion en "AHORRAS 4 MESES" y en el borde degradado del plan, contra la regla "nunca decorativo".
Sub-checks copy: garantia nombrada FALLA (intencional, sin garantia verificada); message-match N/A (sin dato de anuncio).

Top defectos:
1. [Titular + tarjeta heroe, arriba] SSR y primer paint muestran "Protege cada comisión que te ganaste" y luego, al montar, cambia a "Laura, tu asistente..." y aparece la tarjeta héroe empujando todo (parpadeo + salto de layout) en el flujo principal -> leer cg_onboarding_v1 de forma síncrona antes del primer paint (useSyncExternalStore o useLayoutEffect con contenedor invisible hasta leer) o reservar el alto de la tarjeta; lo mismo con "Día 12" que cambia a la fecha real.
2. [Copy, toda la pantalla] Sin escena de dolor ni voz del avatar: ningún "trabajar de a gratis", ni la angustia de "¿ya cayó mi comisión?"; los 3 beneficios son funciones, y la única pérdida es la línea chica dentro de la tarjeta -> reescribir el beneficio 1 y la línea bajo los planes con el dolor literal de FICHA-AVATAR (dolor 1/2) y subir "Sin plan, esta reserva y sus avisos no se guardan" a jerarquía visible fuera de la tarjeta.
3. [Línea de tiempo, nodo "primer cobro" y checkbox de aviso] El aviso por correo (y la hora elegida) solo se guarda en localStorage y nada lo envía; la pantalla promete "te avisamos" con fecha y hora exactas -> conectar el envío (o la lista de pendientes en servidor) antes de vender, o rotular "Te avisaremos" sin hora hasta que exista; además la línea vertical sobresale por debajo del último nodo (acortar `bottom` hasta el centro del nodo hueco).
4. [Planes y precio] "MXN al mes" y "Pago procesado por Hotmart" a 12px (text-xs), contra C5 (mínimo 14px en precio/legal), y el segundo plan queda cortado bajo la barra fija en el primer viewport -> subir a text-sm y reducir la altura del bloque héroe/beneficios para que ambos planes se vean sin scroll.
5. [Identidad/profundidad y color] Fondo casi plano (los radiales no se perciben, no hay nivel hundido --surface-2) y el dorado se usa como adorno ("AHORRAS 4 MESES", borde degradado) contra la FICHA-ARTE; padding de la tarjeta héroe 12px vs 16px del resto; titular y precios no se ven en Sora -> usar --surface-2 en la zona de la línea de tiempo, dorado solo en monto en riesgo (badge de ahorro en azul), p-4 en la tarjeta héroe y comprobar la carga de Sora.
