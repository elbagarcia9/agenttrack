# VEREDICTO revisor-visual — onboarding
Fecha: 2026-10-04 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Resultado, tarjeta 2 "Salida de tu cliente"] Muestra 22 de octubre, pero el cliente viaja el 24 (dato capturado en la reserva). El título dice "salida" y la fecha es la del aviso (viaje - 2 días); la usuaria ve un dato que no coincide con el suyo. Fix: titular "Aviso de salida de tu cliente" con detalle "Tu cliente sale el 24 de octubre", o mostrar 24 con "Te aviso el 22".
2. [Resultado, titular y subtítulo; paso reserva] La promesa es "te avisa antes de que venzan", pero en ningún paso se pide ni se nombra el canal de aviso (WhatsApp, correo, notificación). La promesa única no se puede comprobar. "Usar datos de ejemplo" también termina en "Tu primera reserva ya está vigilada" con un cliente inventado. Fix: añadir una línea o chip de canal en el resultado ("Te aviso por WhatsApp o correo, tú eliges") y, si se usan datos de ejemplo, un resultado que diga "Así se verá con tu primera reserva real".
3. [Fondo de todas las pantallas] Se ve como fill plano #EAEAEA. Los dos radiales (azul y dorado) no se perciben en el screenshot; los inputs, la lista de la pantalla de carga y los bloques no usan el nivel hundido (--surface-2). Profundidad = 2 niveles apenas. Fix: subir el radial azul a 36-40% y su tamaño, usar --surface-2 para los wells (toggle de moneda, lista de carga) y un hairline degradé en la tarjeta héroe.
4. [Resultado, arriba y abajo] Sobrecarga. El eyebrow "Tu primera reserva está lista" repite el titular de 3 líneas a 36px. Ese titular empuja las tarjetas, y la tarjeta "Último día para reclamar" queda cortada por la barra pegada. La comisión en juego (el dato de dinero del avatar) queda bajo el pliegue. Fix: titular de 2 líneas a 30-32px ("Laura, tu reserva ya está vigilada"), quitar el eyebrow o fusionarlo con el check, y llevar la comisión a la tarjeta héroe o justo bajo el titular.
5. [Pasos 1-6 y titulares] Identidad: salvo el borde dorado de la tarjeta héroe, que además solo aparece si faltan 5 días o menos (con compra = hoy nunca sale), todo es lista de tarjetas blancas con chip azul, intercambiable con cualquier SaaS sobrio. Además tracking-tight en Sora 36px hace que las "ll" de "llamas" y "llevas" se peguen. Fix: llevar el motivo azul+franja dorada a un elemento fijo (por ejemplo, cabecera de la barra de progreso o la tarjeta de Reconocimiento) y usar tracking normal o -0.01em en el display.

Notas de verificación en código:
- h3 Control y libertad: hay Volver sincronizado con el historial (history.back o fallback), "Saltar este paso" solo en el paso de control, persistencia en localStorage, el flujo restaura el estado al recargar. Falta: no hay Volver ni cancelar durante "cargando" (4.3 s sin salida); al recargar en un paso restaurado, el botón atrás del navegador salta al paso 1 (el historial no se reconstruye). Nota 3.
- h7 Flexibilidad: defaults buenos (fecha de compra = hoy, datos de ejemplo, Enter envía formularios, autoFocus, auto-avance en opciones). No hay atajos de teclado ni edición rápida desde el resultado. Nota 3.
- CTA héroe vivo: contraste ~5.1:1, whileTap 0.97, 56px de alto, ancho completo y nunca disabled por defecto (valida al enviar con errores por campo). Cumple los 4.
- Movimiento (código): stagger de entrada, anillo y conteo en la carga, barra de progreso animada, tap, transición entre pasos, spring de check y reduced-motion global (MotionConfig + useReducedMotion) verificados. Faltan conteo de números héroe en el resultado y una celebración más allá de un check de 24px.
- Gate de carga cognitiva: 0-1 fallas (reserva con 6 campos en el límite; resultado con 4 tarjetas + 2 bloques). Sin sobrecarga crítica.
- Fidelidad a FICHA-ARTE: paleta, radios 14/11, Sora + Inter Tight y --surface #FFFFFF coinciden. Escala de ficha display 38/body 14/label 11: los titulares usan 36px y el label 12px (desvío menor).
- Copy: sin garantía nombrada ni prueba social (decisión del usuario). El único respaldo es "sin cobro hoy, cancelas cuando quieras". La traza del copy a FICHA-AVATAR es buena (dolores 1, 2, 4, 7 y objeción 4). Falta el léxico del avatar ("de a gratis", "que no se te escape ninguna comisión") y "desde $99 MXN" no dice qué incluye.
