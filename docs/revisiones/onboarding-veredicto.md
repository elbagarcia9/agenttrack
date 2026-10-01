# VEREDICTO revisor-visual — onboarding (recorrido de inicio) — 2a revisión
Fecha: 2026-10-01 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:3 h10:2
Detalle craft: jerarquía:3 profundidad:2 identidad:2 movimiento:3 encaje:3
Detalle copy: idea:3 especificidad:3 emoción:3 oferta:2 acción:3

Gate de carga cognitiva: pasa (1 decisión por pantalla, listas de 3-5 ítems, 1 acción primaria, 6 campos en la reserva con 1 opcional). Sin sobrecarga crítica.

Verificación en código
- h3 (control y libertad): hay botón volver visible en pasos 2-8 y el estado persiste en localStorage. Fallas: el botón "volver" de la interfaz (atras) llama a ir(..., -1) sin history.back(), mientras que cada avance hace pushState; el historial se desincroniza y el atrás del navegador necesita 2 pulsaciones tras usar el botón propio. No hay salida/reinicio del flujo desde el paso 1 (sin logo ni cerrar).
- h7 (flexibilidad): Enter envía el formulario, fecha de compra por defecto hoy, "Usar datos de ejemplo", autoFocus, auto-avance en opciones. Sin saltar paso opcional ni atajos de teclado para opciones.
- Movimiento (baseline): stagger de opciones y resultado OK; transición entre pasos (AnimatePresence) OK; anillo y contador 0-100% en la carga OK; whileTap 0.97 en BotonPrincipal y 0.98 en opciones OK. Fallas: el CTA del resultado es un <a> sin whileTap ni :active (no se ve responder); no hay celebración en el hito "primera reserva vigilada"; reduced-motion solo se respeta en la transición de pasos y la carga (stagger con y:8/12, whileTap y animate-pulse siguen corriendo).
- CTA héroe vivo: falla 2 de 4. Estado tap ausente en el CTA del resultado; el botón Continuar queda disabled al 60% de opacidad sin hint cuando se abre "Otra cosa" y el texto tiene menos de 2 caracteres. Contraste (#EAEAEA sobre #226697 ≈ 5:1) y altura 56px OK.

Fidelidad a FICHA-ARTE: acento #226697, dorado solo en chip de 5 días, Sora + Inter Tight, radios 14/11: coinciden. Desvíos: --surface = #F6F8FA (la ficha dice #FFFFFF); display de los pasos 30px (la ficha define 38); el dispositivo firma "franja dorada pegada a la tarjeta héroe" aparece solo como chip dorado dentro de la tarjeta, no como franja.

Top defectos
1. [Pantalla "Cargando", cabecera vs anillo] Dos porcentajes distintos a la vez (barra superior "88%" y anillo central "52%"): se contradicen y rompen la sensación de precisión → ocultar el % de la cabecera en este paso (o igualarlo al del anillo).
2. [Pasos 1-5, fondo y composición] Pantallas casi planas: fondo #EAEAEA sin tinte visible (el radial no se percibe), un bloque arriba y 300-400px de vacío antes del CTA; identidad intercambiable con cualquier cuestionario azul/gris (solo la tarjeta héroe del resultado tiene dispositivo propio) → subir el radial/tinte a un nivel visible, dar a cada paso un detalle firma (mini-vista previa del semáforo o franja dorada en el progreso) y usar --surface #FFF según ficha.
3. [Resultado, CTA "Activar mis 14 días gratis" + microcopy] El CTA es un <a> sin estado de tap y no hay celebración del hito; la línea "Tarjeta al empezar, sin cobro hoy" no dice qué pasa al día 15 ni cuánto cuesta (eje oferta copy = 2) → añadir whileTap/:active al enlace, una micro-celebración sobria (check animado en la tarjeta héroe) y "Después $X/mes, cancelas cuando quieras" en la línea de condiciones.
4. [Paso "Otra cosa" (agencia/control/preocupación), botón Continuar] Se abre un botón disabled al 60% sin explicación y rompe el patrón de auto-avance de las otras opciones → dejar el botón habilitado y mostrar "Escribe tu respuesta para continuar" al tocar, o avanzar con Enter.
5. [Reserva con errores (6a), fila Tu comisión + USD/MXN] Con error, el selector USD/MXN queda ~20px más abajo que el campo (items-end alinea con el mensaje de error); además el chip del escudo usa rounded-3xl y el interruptor interno rounded-lg frente al radio 11/14 de la ficha; "Usar datos de ejemplo" mide ~36px de alto → alinear con items-start y h-12 fijo en el interruptor, unificar radios con tokens, py-3 en el enlace; y sincronizar el historial (history.back() en el botón volver).
