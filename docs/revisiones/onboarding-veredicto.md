# VEREDICTO revisor-visual — onboarding
Fecha: 2026-10-01 12:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 28/40
Craft: 11/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [Paso 1 "Continuar" y paso 6 "Guardar y armar mis avisos", abajo] CTA deshabilitado por defecto al 60% de opacidad (pill muerto, texto claro sobre azul lavado, sin decir qué falta). Falla el "CTA héroe vivo" -> dejarlo habilitado con opacidad plena; al tocar con campos incompletos, marcar el campo faltante con hint y foco (no disabled).
2. [Paso 2 -> Resultado (OnboardingFlow.tsx, PasoResultado/PasoCargando)] Si la usuaria elige "Otra agencia Host" u "Otra cosa", el resultado igual calcula con plazos fijos de Archer (30 días / 60 días / 18 meses), tras prometer "Así usamos tus plazos reales". Dato potencialmente falso en el momento que decide el pago -> condicionar por estado.agencia: para no-Archer mostrar "Plazos de referencia de Archer, confírmalos con tu agencia", o pedir el plazo.
3. [Resultado, CTA "Ver mi plan" + bloque de cierre] El puente a la compra está vacío: "Ver mi plan" es ambiguo (parece un plan de fechas, no un plan de pago), no hay precio/ancla, garantía nombrada ni canal de los avisos (celular/WhatsApp), y "Ninguna comisión se te va a escapar" es una promesa absoluta sin prueba. Además la respuesta del paso 3 (cómo lleva hoy sus comisiones) no se usa en ningún lado. -> CTA en 1a persona de beneficio ("Activar mis avisos"), línea bajo el botón con precio + garantía, "te avisamos por X", suavizar la promesa y usar la respuesta de control en el reconocimiento.
4. [Todas las pantallas; Resultado] Fondo plano #EAEAEA sin profundidad, sin el dispositivo ownable de la ficha (tarjeta héroe azul con degradé + franja dorada; los tokens --hero-* existen y no se usan); el resultado es una pila de 4 tarjetas blancas iguales; el paso 5 usa Sparkles genérico. Superficie #f6f8fa vs #FFFFFF de la ficha. -> convertir la fila más urgente ("Dar de alta") en tarjeta héroe azul degradé con franja dorada "Quedan 5 días", y un tinte/degradé sutil en el fondo.
5. [Movimiento + encaje] Falta stagger de entrada en opciones y tarjetas del resultado; el % de carga salta en escalones (0/24/52/78/100) en vez de contar; sin celebración en la primera victoria (resultado). Encaje: "Otra cosa (escribe la tuya)" sin chip de ícono (texto arranca en otra x que las demás opciones), la barra de progreso arranca 8px distinta en pasos 1 y 7 (por el espaciador del "volver"), y el error de fechas no marca los campos (sin borde rojo ni aria-invalid/aria-describedby) y repite "Revisa las fechas".

Verificado en código:
- H3 (control y libertad): hay "volver" (aria-label) en pasos 2-6 y 8, estado persistido en localStorage, desde el resultado vuelve a la reserva. Pendiente: sin "empezar de nuevo", los pasos no usan historial (el botón atrás de Android/navegador sale del flujo), y la carga (4.3 s) no se puede cancelar ni retroceder.
- H7 (flexibilidad): bien: autoFocus, inputMode decimal, auto-avance al elegir, "Usar datos de ejemplo", reanudar tras recarga, Archer primero. Falta: sin <form>, Enter no avanza en el nombre ni en la reserva; fecha de compra sin default de hoy.
- Robustez: track() hace JSON.parse de cg_eventos fuera de try/catch (cola corrupta rompe el efecto, también desde el catch del arranque); PasoResultado devuelve null si faltan fechas (pantalla vacía sin CTA).
- Movimiento: transición de pasos con AnimatePresence, barra animada, anillo que se dibuja, whileTap, check con spring, useReducedMotion respetado. Ausentes: stagger, conteo suave de números, celebración.

Gate de carga cognitiva: 1-2 fallas leves (paso 4 con 5 opciones; paso 6 con 7 controles de entrada y promesa de "30 segundos" optimista). No es sobrecarga crítica.
Fidelidad a la paleta de referencia: FIEL (modo claro, #226697, Sora, radios 14/11, sombras tintadas).
Sub-checks de copy: garantía nombrada cerca del CTA = NO (ausente); message-match = sin dato de anuncio.
Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:3 h8:3 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:2 movimiento:2 encaje:2
Detalle copy: idea:3 especificidad:3 emoción:3 oferta:2 acción:2
