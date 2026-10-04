# VEREDICTO revisor-visual — pantalla-principal (Inicio)
Fecha: 2026-10-04 12:00
Screenshot: docs/revisiones/pantalla-principal-375.png
Usabilidad: 28/40
Craft: 12/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [Boton "Registrar venta nueva", centro del celular y arriba en la barra lateral] El CTA heroe no esta vivo. Dorado #BE8C2D (arriba #D1A044) sobre fondo #EAEAEA da ~2.5:1 y ~2:1, por debajo del 3:1 exigido. Ademas en app/app/page.tsx no hay whileTap ni :active en ningun boton (solo existe en landing, onboarding y paywall). Fix: borde o sombra oscura tintada (1px #8A6417) para pasar 3:1 contra el fondo, y whileTap scale 0.97 con motion.create(Link) en ambos botones.
2. [Franja "Estas viendo datos de ejemplo" -> "Empezar con mis datos", AppShell.tsx:72] Accion destructiva sin confirmacion ni deshacer: empezarLimpio() borra TODAS las reservas, incluidas las que el usuario agrego (el flag demo sigue true tras agregar()), y restaurarEjemplo no esta expuesta en ninguna pantalla. El texto promete "mis datos" y en realidad vacia todo. Fix: confirmacion (hoja) que diga "Se borraran las reservas de ejemplo y las que agregaste", o filtrar solo las demo-*, y toast con "Deshacer" de 6 s.
3. [Cards de "Lo que sigue" y "Reservas recientes", y los 3 cuadros 3/3/2 de la tarjeta azul] Parecen tocables y no hacen nada (son li/div sin Link). Una alerta "Dar de alta · Marcos y Ana" no lleva a la reserva; el banner rojo manda a /app/alertas generico. Falla el gate de elementos interactivos falsos y la eficiencia (h3/h7). Fix: envolver cada fila en Link a la reserva o alerta (con chevron), hacer los 3 cuadros filtros hacia /app/reservas?estatus=..., y enlazar el banner a su alerta.
4. [Hierarquia y color de la parte alta, celular arriba] Compiten dos elementos de 36px ("Hola, Laura" y "$1,766") y hay mas de 3 tamanos (36/20/18/16/14/12). El dorado se usa en 5 sentidos: franja de datos de ejemplo, CTA, chips "Quedan 4 dias", insignia de la campana y borde de la tarjeta, lo que rompe la regla "dorado = alerta <=5 dias" y diluye la urgencia real. Fix: bajar el saludo a ~24px/600 y dejar el total como unico heroe, y pasar la franja de ejemplo a tono neutro hundido (--surface-2 con texto secundario).
5. [Lista "Lo que sigue", fila 2, y tarjeta azul] Texto "Pago pendiente de Marcos ..." truncado con el chip al lado, y la palabra "pago pendiente" significa dos cosas distintas: lo que el cliente debe (alerta) y el estatus "Pendiente de pago" de la comision. Los cuadros de la tarjeta usan radio 8px (rounded-lg) frente a los 11/14 del kit. Fix: renombrar la alerta a "Cobrar a Marcos y Ana" o "Cliente debe $900", permitir 2 lineas sin truncar, y usar var(--radius-button) en los cuadros.

Verificaciones en codigo:
- h3 (control): sin confirmacion ni undo en empezarLimpio (ver defecto 2). Salida y volver cubiertos por la barra inferior y la lateral.
- h7 (flexibilidad): defaults buenos (orden por severidad, nombre guardado), pero cero atajos y filas inertes (ver defecto 3).
- Estados: carga = skeleton con aria-busy y motion-reduce (OK). Vacio = "Registra tu primera venta" con 2 CTAs (OK). Sin estado de error ni de sin conexion en la pantalla; fallo de localStorage se traga en silencio.
- Reduced-motion: MotionConfig reducedMotion="user" mas Contador con useReducedMotion y motion-reduce en skeletons (OK).
- Movimiento: stagger de entrada OK, conteo del total OK; faltan tap feedback y transicion entre pestanas (no hay template ni AnimatePresence en /app).
- Fidelidad: paleta, Sora e Inter Tight, modo claro y radios 14/11 coinciden con FICHA-ARTE y la paleta del usuario. Cuadros de la tarjeta a 8px son un desvio menor. El aviso de la maqueta aprobada era dorado y de 2 lineas; aqui hay uno rojo de 3 lineas.

Gate de carga cognitiva: 1 falla (elementos que parecen interactivos y no lo son). No hay sobrecarga critica.
