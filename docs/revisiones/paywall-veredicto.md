# VEREDICTO revisor-visual — paywall (pantalla de planes)
Fecha: 2026-10-01 12:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 11/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [Código PaywallFlow.tsx línea 93, primer frame] Mientras no hidrata devuelve un div vacío (aria-busy): el HTML inicial no trae ni la X de cierre ni contenido; en celular lento hay pantalla en blanco sin salida (viola C1/C5 "X visible desde el frame 1" y heurística 1) -> renderizar el shell completo en servidor (X, titular genérico, planes, CTA) y solo personalizar nombre/tarjeta tras leer localStorage, sin condicionar el primer render.
2. [Copy de toda la pantalla; beneficios + hero card] Cero dolor ni costo de inacción de FICHA-AVATAR (trabajar "de a gratis", comisión que caduca) y no se usa la objeción #5 ("una sola comisión rescatada paga el año"); los 3 beneficios son features genéricas ("Funciona en tu celular y en tu computadora") y no nombran plazos concretos (30 días de alta, 18 meses de reclamo) -> reemplazar bullets por resultado en lenguaje literal del avatar y añadir bajo los planes "Una sola comisión rescatada paga tu año".
3. [Código: sin entrada escalonada, sin transiciones; clases de la card de plan] El movimiento casi no existe: sin stagger de entrada, el borde de selección salta en seco entre Anual y Mensual, el precio del timeline/CTA cambia sin conteo, el badge no entra con spring; solo hay tap-scale y el dibujado de la línea del timeline (eje movimiento 1/4) -> stagger 60-80 ms headline-tarjeta-beneficios-planes-CTA, borde deslizante con layoutId 200 ms y conteo 300 ms en el monto del timeline.
4. [Timeline + casilla "Avísame por correo 2 días antes del cobro"] Contradicción y promesa sin respaldo: el timeline siempre dice "13 de octubre: te avisamos / Un correo antes de cualquier cobro" aunque la casilla esté desmarcada, y en ningún punto se pide el correo; además el timeline convive con la lista de beneficios (50-C4 dice que el timeline sustituye al value stack cuando hay prueba) -> que el nodo reaccione a la casilla (texto "No te avisaremos" si se desmarca), pedir el correo en este paso o en /entrar, y recortar beneficios a 1-2 líneas o eliminarlos.
5. [Tarjetas de plan, zona de precio y primer viewport] Desencajes visibles: en Anual la etiqueta "MXN al / mes" se parte en 2 líneas y en Mensual no; la descripción anual deja "meses" huérfano; el ahorro ("ahorras 4 meses") es texto gris pequeño en vez de badge ruidoso (50-C2 punto 4); en el primer viewport la tarjeta Mensual queda cortada bajo el CTA fijo; no hay hairline degradé en ningún elemento (anclaje de conversión, baja identidad) -> forzar whitespace-nowrap y reservar ancho al bloque de precio, acortar el copy anual ("Ahorras 4 meses" como badge junto a RECOMENDADO), reducir el hero card para que ambas tarjetas queden sobre el CTA y añadir hairline degradé en la tarjeta seleccionada o el CTA.

Notas de verificación (código):
- Heurística 3: X (Link a "/") y "Ahora no" existen y miden 44 px, pero ambos mandan a la página de ventas, no al resultado del onboarding; el CTA aterriza en /entrar, que dice "se habilita muy pronto" (callejón sin salida; intencional por modo local, pero el usuario lo vive como falla). Sin undo necesario (acciones reversibles). No hay confirmshaming.
- Heurística 7: defaults buenos (Anual preseleccionado, aviso marcado, preferencias guardadas, nombre personalizado); radiogroup sin navegación por flechas.
- CTA héroe vivo: contraste ~5:1, whileTap 0.97, nunca deshabilitado, 56 px de alto y ancho completo: cumple los 4.
- Anti-patrones C5: sin urgencia falsa, sin confirmshaming, total anual visible, mensual comprable, plan recomendado honesto (ahorro real 4,01 meses). Fallan: texto de confianza a 12 px; sin garantía nombrada (omitida a propósito, se anota como pendiente, no se penaliza de fondo); sin fecha de message-match (no hay dato de anuncio).
- Gate de carga cognitiva: 0-1 fallas (pasa), aunque el primer viewport apila 6 bloques.
- Reduced-motion: MotionConfig reducedMotion="user" presente.
- Fuentes Sora/Inter Tight cargadas en layout.tsx; paleta y radios 14/11 coinciden con FICHA-ARTE y con la referencia (azul #226697, fondo gris, dorado en chip).
- Anti-clon: no coincide con Capítulo ni Umbral.
