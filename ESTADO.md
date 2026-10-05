# ESTADO — HostAgent Commission Guard (nombre tentativo)
Última actualización: 2026-09-29 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: app interna (Inicio, Reservas, Calendario, Alertas, Nueva, Importar Excel) construida y probada con datos de ejemplo / Siguiente acción exacta: veredicto de Inicio; luego servicios externos (cuentas, base de datos, correos, Hotmart, dominio) guiados paso a paso; pulido final con las imágenes del usuario.

## Qué es esta app
Asistente móvil ligero para agentes de viajes independientes afiliados a agencias Host (Archer, Evolution, InteleTravel, Nexion): audita, rastrea y avisa para cobrar el 100% de sus comisiones (alerta de alta en el portal dentro de 30 días; alerta de revisión y de reclamo hasta 18 meses después del viaje). Suscripción SaaS.

## Promesa central
"Ayudo a agentes de viajes independientes afiliados a agencias Host a garantizar el cobro del 100% de sus comisiones sin perder cientos de dólares por olvidar registrar ventas o confiar en Excel pasivo."

## Idea validada (contexto base, viene de RESUMEN FINAL-HubTravel assistant.docx — NO revalidar)
- Nombre: HostAgent Commission Guard · alt: CommisSentry, TravelPay Tracker
- Usuario: agente independiente afiliado a Host, 3-20 reservas/mes, Excel+WhatsApp, sensible a precio (<$10/mes)
- Dolores núcleo: comisión se paga en 60-90 días; hay que dar de alta la venta en el portal dentro de 30 días de la compra; el reclamo caduca a los 18 meses de la fecha de inicio del viaje (datos oficiales de Archer México/LatAm dados por el usuario, 2026-09-29); Excel ilegible en móvil; CRMs a $35-59/mes
- Primera victoria (<5 min): registrar 1ª reserva en <2 min y ver el cronograma de alertas generarse solo
- MVP núcleo: tabla rápida de reservas, motor de alertas (24h hub, recordatorio pago cliente, viaje mañana, 90 días), calendario doble (viajes vs cobros), filtros, etiquetas
- NO construir: itinerarios PDF, cobros con tarjeta, APIs complejas, email masivo
- Competidores: Travefy ($39-59), Tern ($35-39), TravelJoy ($19-39)
- Precio propuesto en el resumen: $8.99/mes · $69/año · trial 14 días · plan gratis 5 reservas (a contrastar con matriz 02C y gate del 40)
- Canal #1: comunidad de agentes afiliados. Ángulo ganador: "seguro anti-pérdida de comisiones". Objeción clave: "Excel es gratis" y doble carga de datos.
- Otros insumos: ANALISIS CLIENTE IDEAL.docx (avatar Laura, 35), PROPUESTA DE VALOR.docx (Versión 1 ganadora; 3 razones: ganar dinero, escapar del dolor mental, ahorrar tiempo)

## Secuencia maestra
- Estado: landing construida (ver sección Página de ventas); siguiente: onboarding. Ruta: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- FICHA-AVATAR.md: APROBADA 2026-09-29 (Laura, 35) · FICHA-MODELO.md: BORRADOR (falta 2ª señal de revenue) · FICHA-ARTE: APROBADA (brand kit por confirmar con la landing) · FICHA-MERCADO: BORRADOR MX (2026-09-29)
- Avatar: Laura, 35, agente independiente Host · dolor #1: no saber si su comisión cayó / se venció a 90 días · deseo #1: que el celular le avise antes de perder una comisión · consciencia alta, sofisticación media-baja
- Propuesta de valor ganadora (V1): garantizar el cobro del 100% de comisiones · razones dominantes: ganar dinero, escapar del dolor mental, ahorrar tiempo

## Dirección de arte
- Ruta de diseño: referencia PARCIAL del usuario (paleta = contrato + capturas TravelJoy + set de íconos de línea) + pidió 3 propuestas propias → 3 interpretaciones fieles en direcciones-abc.html (2026-09-29)
- Paleta del usuario: principal #226697 · fondo #EAEAEA · secundario #304A57 · destaque #BE8C2D · texto negro. Azul atenuado permitido para fondos.
- Decisión del agente: MANTENER el azul (familiaridad en herramientas de negocio de viajes/finanzas, confianza) y diferenciar con el dorado como color de alerta+dinero y con la forma de mostrar los cobros. Elección del usuario: opción A (Panel claro) con la tipografía de la B (Sora + Inter Tight), 2026-09-29.

## Decisiones técnicas
- Monetización (02C, matriz nicho Finanzas + tie-breaker, decidido 2026-09-29): Modelo 2 = onboarding con primera victoria (registrar 1 reserva y ver el cronograma de alertas) → paywall → prueba 14 días con tarjeta → mensual + anual; SIN plan gratis al inicio (baja conversión y menos caja; el resumen lo proponía, lo dejo para revisar con datos). Garantía 30 días si Hotmart lo permite.
- Pendientes: framework (regla del stack), auth, modelo de datos+RLS, plazos reales de Hotmart, gate de unit economics (40)

## Pendientes del usuario
- [ ] Confirmar: lanzar solo México + Archer primero (decisión del agente)

- [ ] Confirmar el plazo real de reclamo y el nombre del portal de cada agencia Host (Archer primero), antes de anunciarlos en la venta

## Notas
- ⚠️ El resumen no indica país/idioma del agente (nombres en inglés, textos en español). Verificar en FICHA-MERCADO antes de fijar precio y pasarela (Hotmart).
- ⚠️ El formato del resumen no es idéntico a los 20 campos del SO; se tomó como contexto base.

## Problemas conocidos ⚠️
- FICHA-MODELO pendiente (aplazada a propósito): aún no hay código; se elige la app modelo y se crea FICHA-MODELO.md justo después de la pregunta de diseño, antes de escribir código.
- veredicto onboarding: 3 revisiones independientes (2026-10-01/04): 28/40, 11/20, copy 13 → 29, 13, 14 → 29, 13, 15. NO LISTA (piso 36/16/16). Tras la 3ª se corrigió: la fecha de salida mostraba el día del aviso (ahora muestra la salida real y "te aviso el X") y con datos de ejemplo ya no dice "ya está vigilada". Pendientes del revisor: fondo más perceptible y nivel hundido --surface-2, titular de 2 líneas, identidad más propia en pasos 1-6, tracking del display, nombrar el canal de aviso, conteo de números héroe.
- veredicto paywall: 2 revisiones independientes (2026-10-01/04): 29/40, 11/20, copy 14 → 28, 14, 14. NO LISTA (piso 36/16/16). Tras la 2ª se reservó el alto de la tarjeta (sin salto al hidratar) y precio/confianza a 14px. Pendientes: el aviso por correo con fecha y hora debe ser REAL antes de vender (Resend, servicios externos; gate 61) · escena de dolor y voz de la ficha en los beneficios · profundidad del fondo y --surface-2 · dorado decorativo vs ficha · X arriba a la izquierda · estado de envío en el CTA.
- veredicto pantalla-principal: 1 revisión independiente (2026-10-04): 28/40, 12/20. NO LISTA (piso 36/16). Tras la revisión se corrigió sin re-puntuar: "Empezar con mis datos" ya NO borra las reservas del usuario (solo quita las de ejemplo) y pide confirmación; filas de "Lo que sigue" y "Reservas recientes" son enlaces; botones con respuesta al toque y borde para contraste del dorado; saludo a 24px; la alerta "Pago del cliente" se renombró. Pendientes del revisor: dorado con muchos sentidos (diluye la urgencia), estado de error/sin conexión, cuadros 3/3/2 que filtren Reservas, deshacer. Se re-puntúa en el pulido final.
- veredicto landing: 4 revisiones independientes (2026-09-29/10-01): 28/40 y 14/20 → 31 y 14 → 31, 15, copy 17 → 29/40, 15/20, copy 17. NO LISTA (piso: usabilidad 36, craft 16). Pendientes del revisor: botón del mock del hero compite con el CTA real, carrusel descentrado en escritorio, texto 13px del cierre a 4.3:1, dorado decorativo en cita/hero, contenido repetido sobre Excel, plan mensual repetido, sin título en el bloque Semáforo. La usabilidad se estanca en 29-31 (la mayoría de criterios en 3, no 4). Decisión del usuario pendiente: seguir a onboarding con la landing anotada como pendiente.
- Mercado (2026-09-29): usuario en México; hay agentes Archer en LatAm, EE.UU. y España. Decisión del agente: lanzar México + Archer primero; construir listo para ampliar (moneda por reserva, plazos y nombre del portal configurables por agencia, textos sin regionalismos).
- ⚠️ Claims de integridad (61): "90 días" y "Commissions Hub" salen del resumen del usuario; verificar por agencia Host antes de usarlos en la página de ventas. FICHA-MERCADO pendiente.
- direcciones-abc: la auditoría automática marca >80% de similitud de DOM entre A/B/C porque comparten chasis, barra de estado, tab bar y hero de landing; en escala de grises las 3 composiciones se ven distintas (panel con héroe, lista con aviso, calendario con cabecera). El usuario ya eligió A; no se rehace.
- Auditoría de conversión (scripts/audit-conversion.sh): sus críticos actuales vienen de las plantillas del SO en plantillas-codigo/ (aún no hay landing propia); se re-corre al construir la landing.

## REGLAS DE NEGOCIO VERIFICADAS (usuario, Travel Café Archer MX/LatAm, 2026-09-29) — CORRIGEN el RESUMEN FINAL
- Plazo para subir (dar de alta) una venta: 30 días desde la compra (NO 24 h)
- Comisiones: se pagan en 60-90 días
- Plazo para reclamar: 18 meses desde la fecha de inicio del viaje (NO 90 días)
- NO mostrar "por cobrar este mes": la comisión puede llegar meses después → mostrar TOTAL por cobrar general
- Campos de reserva: Cliente, Contacto, Destino, Tipo de reserva, Proveedor, Precio venta, Comisión, Fecha de compra, Fecha de viaje, Comentarios
- Estatus (botón al final de cada reserva): Pagado · Pendiente de alta · Pendiente de pago · Solicitar revisión
- Alertas: Pendiente de alta (desde la compra; límite 30 días) · Pendiente de pago (desde la compra hasta 18 meses tras el viaje) · Salida de viajeros (2 días antes hasta el día de salida) · Solicitud de revisión (desde 60 días hasta 18 meses tras la fecha de viaje)
- Color: dorado SOLO cuando faltan ≤5 días para vencer alta/pago/revisión · rojo cuando el plazo venció ("Plazo vencido")
- Vistas: Reservas = tabla tipo Excel (filtros por fecha, rango, cliente, proveedor, comisiones pendientes; orden A-Z o fecha de creación) · Calendario tipo Google Calendar (mes con eventos por día; clic → lista del día)
- Escritorio importa: la app es web responsive (móvil + computadora)
- Botón "Registrar venta nueva": DORADO #BE8C2D con texto oscuro (decisión final del usuario 2026-09-29, reemplaza el pizarra)
- Decisiones del agente 2026-09-29: producto = web app responsive (celular + computadora), instalable; avisos por notificación y correo. Texto para plazo vencido: "Plazo vencido" + "Consulta con tu agencia si aún puedes gestionarla" (no afirmar "perdiste tu comisión": la app no sabe si la agencia aún la acepta). Dudas abiertas: cuál es el plazo límite exacto de "Pendiente de alta" tras los 30 días y cuándo cuenta "60 días" de revisión (desde fecha de viaje o de regreso).
- 🔔 RECORDAR AL USUARIO (antes de construir alertas/app interna): confirmar si "Pendiente de alta" sigue vivo tras los 30 días hasta 18 meses después del viaje, y qué pasa en esa etapa. Respuesta parcial: la revisión cuenta 60 días desde el REGRESO del viaje; como no se registra el regreso, la app usa la fecha de salida (más conservador); reclamo posible hasta 18 meses.

## Página de ventas (2026-09-29)
- Framework: Next.js 16 (App Router, TS, Tailwind v4) — decidido porque la landing necesita SEO. Kit copiado a components/landing/, tokens tematizados con FICHA-ARTE (tokens.css).
- Landing construida en app/page.tsx con copy de docs/copy/landing.md. Rutas: / · /onboarding (stub) · /privacidad y /terminos (stubs "en redacción").
- Big Idea + mecanismo bautizado: "el Semáforo de Comisiones" (verde en plazo · dorado ≤5 días · rojo vencido).
- Decisiones: sin garantía de reembolso hasta verificar Hotmart (solo "Prueba de 14 días"); sin stack de valor tachado (sin precios falsos); carrusel con placeholders honestos hasta tener la app; hero con mock realista (AppMockInicio) rotulado como ejemplo.
- Pendientes de la landing: nombre final de marca (provisional "Commission Guard") · email de soporte real (hoy soporte@tu-dominio.mx) · precios MXN a confirmar en Hotmart · screenshots reales al cerrar la app · textos legales reales (privacidad/términos) · analítica (landing_vista, atribución, ?qa=1) · verificar claim "Archer México y Latinoamérica" y los 3 plazos con el usuario · veredicto del revisor: docs/revisiones/landing-veredicto.md
- Screenshots: docs/revisiones/landing-375.png y landing-1280.png
- Desviaciones menores del kit (justificadas por el revisor 2026-09-29): Hero sin marco doble alrededor del visual · Solucion antes/después con tratamiento invertido · Oferta total anual a 14px · CtaFinal con --accent-on-dark y --on-accent · SemaforoVisual añadido entre Solución y La app por dentro (el kit no muestra el mecanismo visualmente) · carrusel con vistas de ejemplo (public/mock/*.png, mockups de diseño rotulados como ejemplo).
- H1 cambiado (revisor): "Ninguna comisión se te vence sin que lo sepas" (la app avisa plazos, no cobra por el agente).
- Ronda 4 de la landing (2026-10-01, OK del usuario al ángulo): Agitación con cita + íconos; carrusel sin pantalla repetida (3 vistas); contador animado en el mock; luces del semáforo en secuencia; FAQ a 6; aviso de no afiliación dentro de FooterLegal; CTA final sobre pizarra #304A57 con --accent-on-dark #7dbdea; nota "tarjeta al empezar, sin cobro hoy" bajo los planes. Revisión 4 en curso.

## Recorrido de inicio / onboarding (2026-10-01)
- Construido en app/onboarding/ (OnboardingFlow.tsx) + lib/plazos.ts (reglas Archer, verificadas con fechas de ejemplo) + lib/track.ts (cola local de eventos: onboarding_iniciado, onboarding_paso_completado, resultado_visto). Ruta: / → /onboarding → /paywall (stub) → /entrar (stub).
- Diseño: 8 pasos con barra de progreso: nombre · agencia · cómo lleva hoy sus comisiones · qué le preocupa (ecoan dolores de la ficha) · reconocimiento · PRIMERA ACCIÓN (registrar una reserva real, con "usar datos de ejemplo") · "Armando tus avisos" (≈4.5 s, líneas con sus datos) · resultado con los 4 plazos, lo que más le preocupa primero, semáforo (dorado ≤5 días, rojo vencido). Estado persistente en localStorage; atrás disponible; sin garantía ni cifras inventadas.
- Prueba end-to-end con Playwright OK (sin errores de consola, recarga conserva datos, validaciones, eventos). Capturas: docs/revisiones/onboarding-375.png y docs/revisiones/onboarding/*.png.
- Pendiente: veredicto del revisor (docs/revisiones/onboarding-veredicto.md) · pregunta de anclaje de hora de aviso (02B: ¿a qué hora quieres que te avise?) se agrega en la app interna al configurar notificaciones · analítica real al conectar backend.

## Pantalla de planes / paywall (2026-10-01)
- Construida en app/paywall/ (PaywallFlow.tsx): titular personalizado con el nombre y "Hecho con tus 5 respuestas" (inversión visible), tarjeta héroe con la reserva registrada, 3 beneficios, plan anual recomendado preseleccionado ($99 MXN/mes, se cobra $1,190 MXN/año, ahorra 4 meses) y mensual ($149 MXN), timeline de la prueba con fechas exactas (hoy → aviso día 12 → primer cobro día 14) con opt-in de aviso por correo, CTA fijo abajo "Empezar mis 14 días gratis" con precio y reversibilidad, salida limpia "Ahora no", X de cierre visible. Sin garantía de reembolso, sin urgencia falsa.
- Checkout: modo local (CTA → /entrar?plan=…) hasta crear el producto en Hotmart; variables NEXT_PUBLIC_CHECKOUT_ANUAL / NEXT_PUBLIC_CHECKOUT_MENSUAL lo activan. Eventos: paywall_visto, checkout_iniciado (cola local). Preferencia de aviso en localStorage cg_preferencias.
- Probado con Playwright: cambia el timeline al cambiar de plan, CTA lleva con el plan correcto, sin errores de consola, funciona sin datos de onboarding. Capturas: docs/revisiones/paywall-375.png.
- Pendiente: veredicto del revisor · precios/prueba/medios de pago a confirmar en Hotmart (FICHA-MERCADO §3-4) · el correo del día 12 se envía con Resend en servicios externos · login/auth siguiente.

## Función: importar el Excel de la usuaria (decidida 2026-10-01, idea del usuario)
- Por qué: quien ya tiene una base grande no migra a mano; es la mayor barrera de adopción (Excel es la alternativa actual del avatar). Pasa el filtro de feature (apoya la promesa, la usaría >50%, quita fricción de activación).
- Fase 1 (dentro de la app interna, junto a la tabla de Reservas): importar Excel/CSV. Se lee en el navegador (sin subir el archivo). Pasos: elegir archivo → mapeo de columnas con sugerencia automática (diccionario de sinónimos + parecido de texto + detección por contenido: fechas, montos, monedas) → pantalla de confirmación de columnas → vista previa con errores marcados y corregibles → importar. El mapeo se guarda para la próxima vez.
- Reglas: fechas dd/mm/aaaa por defecto en México (se confirma en la vista previa); moneda por fila (USD/MXN); si falta fecha de compra o de viaje la reserva entra marcada "faltan datos" y sin alertas hasta completarla; detectar duplicados (cliente + destino + fecha de viaje); estatus inicial por defecto "Pendiente de pago", con columna opcional para mapear "pagado"; nunca importar sin que la usuaria revise.
- Fase 2: PDF e imagen (fotos de libretas o estados de cuenta) con lectura por IA (costo por uso, cupo por plan; revisión obligatoria porque puede equivocarse). Evaluar con el gate de unit economics (40) antes de construir.
- Opcional tras Fase 1: en el onboarding, junto a "registrar una reserva", la opción "Importar mi Excel".
- Privacidad: datos de clientes de terceros; si se usa IA para sugerir el mapeo, enviar solo los encabezados y 3-5 filas de ejemplo, sin contactos (aviso en la política de privacidad).

- Claim "importa tu Excel / base lista el mismo día" agregado a landing (FAQ + oferta) y paywall (2026-10-01): DEBE ser verdad al lanzar → Fase 1 de importación obligatoria antes de vender; verificarlo en el gate 61. Ideas de diseño con más gráficos e imágenes: las aporta el usuario en la pasada de pulido final.

## Acceso a la cuenta / login (2026-10-01)
- Decisión técnica (26, Hotmart-first): método primario = enlace mágico + código de 6 dígitos por correo, sin contraseñas; Google solo si NEXT_PUBLIC_AUTH_GOOGLE=1 (evita botón muerto); passkeys después de la primera victoria. Verificación contra nuestra base (el webhook crea al usuario), nunca consultando a Hotmart en vivo. Anti-enumeración (mensaje idéntico exista o no la cuenta), límite 3 solicitudes / 5 min en cliente (el límite real lo aplica el proveedor), reenvío a los 60 s.
- Construida en app/entrar/ (EntrarForm.tsx) + lib/auth.ts. Estados: escribiendo, enviando, enviado, error de correo, límite, ayuda "compré y no me llega". MODO LOCAL (sin NEXT_PUBLIC_SUPABASE_URL): no envía correos ni valida códigos y la pantalla lo avisa; se conecta en servicios externos sin cambiar la pantalla.
- Probada con Playwright (todos los estados, sin errores de consola). Captura: docs/revisiones/entrar-375.png. Sin revisor (pantalla secundaria): medición + checklist.
- Pendiente: correo de soporte real en la ayuda · conectar Supabase Auth, plantilla del correo con enlace + código · rutas protegidas (middleware) y sesión · validar el aviso de privacidad.

## Rescate de onboarding y paywall — R1/R2/R3 (2026-10-01, a petición del usuario; pendiente aprobación "procede")
- R1: onboarding actual = 8 pasos (nombre · agencia · cómo lleva hoy · qué le preocupa · reconocimiento · primera reserva real · "armando tus avisos" ~4.5 s · resultado con 4 plazos) → paywall (planes anual/mensual + timeline de prueba + CTA fijo) → /entrar. Modelo 2 (onboarding-first, nicho Finanzas/alertas de 02C), trial 14 días con tarjeta. Micro-compromisos: 4 respuestas + 1 reserva real (inversión visible "Hecho con tus 5 respuestas"). Sin prueba social ni garantía (a propósito). Sin datos de conversión: no está en producción → todo lo de impacto son HIPÓTESIS a medir con los eventos ya instrumentados.
- R2 (fallas): sin logo/nombre y regreso en el paywall · falta "qué pierdo si no sigo" honesto · sin "saltar" en pasos accesorios · sin pregunta de anclaje (hora del aviso) · sin celebración ni movimiento fino (borde deslizante, conteo) · sin hairline degradé · fondo y titular distintos de la ficha · sin prueba social día-1 (demo/garantía/fundador) · garantía sin verificar en Hotmart. Revisor: onboarding 29/13/14, paywall 29/11/14.
- R3 (propuesta, sin features nuevas): ver mensaje al usuario; se ejecuta por capas tras el "procede".

## Cambios de concepto y copy pedidos por el usuario (2026-10-03)
- El "Semáforo de Comisiones" se reemplaza por "tu asistente vigilando cada comisión" en landing, onboarding, paywall y metadatos (el color dorado a 5 días o menos y rojo vencido se mantienen en la app). Big Idea nueva: cada venta tiene su asistente que avisa antes de que venza cada plazo. Promesa única real: recordar dar de alta, hacer pagos y reclamar a tiempo; la app NO sabe si una comisión ya cayó.
- Landing: Problema a 5 preguntas con las frases del usuario; Agitación con la escena "Nadie se va a parar a prender la compu…" (slot de imagen pendiente: la usuaria acostada que se acuerda de pendientes) y cierre "Puedes estar tranquila: Commission Guard te avisará con anticipación"; Solución "¿Cómo funciona?"; 4 avisos por venta; banda de importación con la imagen Excel→celular; carrusel "Dale un vistazo a tu próximo asistente". Se quitó SemaforoVisual.
- NUEVOS CAMPOS Y AVISO para la app interna: reserva con "Fecha de pago pendiente" y "Cantidad de pago pendiente" (pago del cliente para completar la reserva) → columna "Pago pendiente" en la tabla de Reservas y aviso "Pago pendiente de tu cliente". Añadir también al formulario de nueva reserva y al importador de Excel.
- Pendientes del usuario: imagen de la mujer acostada, más gráficos e imágenes (pulido final). Aprobación explícita del "procede" del plan de rescate de onboarding/paywall aún no dada: lo ya hecho aquí es solo lo que pidió el usuario sobre la landing y los textos.

## Rescate de onboarding y paywall — R5 ejecutado (2026-10-04, "procede" del usuario)
- Capa 1-2 (cuestionario): Saltar en el paso accesorio · celebración (check spring) en el resultado · fondo con doble radial (azul + dorado) · --surface #FFFFFF según la ficha · titulares 36px · franja dorada pegada a la tarjeta héroe si urge · inicio de sesión de volver sincronizado.
- Capa 3-4 (paywall): barra de marca con regreso a / y X que vuelve al plan · "Sin plan, esta reserva y sus avisos no se guardan" · hora del aviso (mañana 8:00 / tarde 14:00 / noche 20:00) guardada en cg_preferencias · borde de plan con degradé que se desliza + precio que cuenta + flechas de teclado · pop de la tarjeta héroe · titular del paywall se queda en 30px para que ambos planes queden sobre el botón fijo en 375px.
- Prueba social y garantía: NO se muestran (el usuario no tiene agentes beta; garantía sin verificar en Hotmart). Única promesa real: recordar alta, pagos y reclamo.
- Revisiones independientes en curso (onboarding 3ª, paywall 2ª).

## App interna (2026-10-04) — Inicio, Reservas, Calendario, Alertas, Nueva reserva, Importar Excel
- Rutas: /app (Inicio) · /app/reservas · /app/calendario · /app/alertas · /app/nueva · /app/importar. Barra lateral en computadora, pestañas abajo en celular (3-5 secciones, un protagonista cada una). Código: app/app/**, components/app/*, lib/reservas.ts (datos y alertas), lib/importar.ts (lectura y mapeo de columnas).
- Decisión técnica: por ahora los datos viven en el navegador (localStorage cg_reservas_v1) con datos de ejemplo y la reserva del cuestionario; al conectar la base de datos, lib/reservas.ts es lo único que cambia de fuente. Banner "Estás viendo datos de ejemplo" con "Empezar con mis datos". Sin rutas protegidas aún (se agregan con las cuentas reales).
- Reglas implementadas (usuario): campos de la reserva (cliente, contacto, destino, tipo, proveedor, precio venta, comisión, fecha de compra, fecha de viaje, comentarios) + fecha y cantidad de pago pendiente; estatus Pagado / Pendiente de alta / Pendiente de pago / Solicitar revisión con selector al final de cada reserva; alertas: alta (30 días desde la compra), pago pendiente del cliente, salida de viajeros (2 días antes hasta la salida), revisión (desde 60 días tras el viaje hasta 18 meses) y plazo vencido; dorado ≤5 días, rojo vencido. "Comisiones por cobrar" es un total general (nunca "este mes"), por moneda.
- Reservas: tabla tipo Excel con filtros (búsqueda, proveedor, rango de fechas de viaje o compra, solo pendientes) y orden (más recientes, A-Z, fecha de viaje); en celular, tarjetas con filtros plegables. Calendario tipo Google (mes con eventos por día, toque abre la lista del día). Alertas agrupadas por urgencia con acciones ("Ya la di de alta", "Ya me pagaron", "Ya completó su pago").
- Importar Excel Fase 1 (.xlsx y .csv; se lee en el navegador): detecta la fila de encabezados, adivina las columnas por nombre y por contenido (fechas, montos, monedas, teléfonos), confirmación de columnas, formato de fechas día/mes/año o mes/día/año, vista previa con errores y repetidas, y guarda el mapeo de la misma hoja. Probado con CSV y XLSX desordenados (encabezados distintos: Pax, Lugar, Mayorista, Mi comisión…). Pendiente: .xls antiguo (se pide guardar como .xlsx/.csv); PDF e imagen (Fase 2).
- Pruebas con Playwright: navegación, cambio de estatus, filtros, calendario, acción de alerta, nueva reserva con validación, importación CSV y XLSX; sin errores de consola. Capturas: docs/revisiones/app-375.png y docs/revisiones/pantalla-principal-375.png.
- Pendiente: veredicto del revisor de la pantalla principal (Inicio) · conectar base de datos y cuentas · aviso real por correo/notificación (Resend) · rutas protegidas · configuración de plazos por agencia.
- Estilo de interfaz (usuario, 2026-10-04): menú de abajo en CÁPSULA flotante (item activo = píldora con el ícono en círculo azul) y "tarjeta suave" (ligero degradado + luz arriba + sombra en dos capas) en tarjetas, filas y campos de la app interna. Clases en components/landing/tokens.css: .tarjeta-suave · .campo-suave · .capsula-menu. Pendiente de decidir con el usuario: extenderlo a landing, cuestionario y planes en el pulido final.
- Animación de éxito (usuario, 2026-10-05): archivo Success.json → public/anim/exito.json, componente components/app/ExitoAnimado.tsx (lottie-react fijado en 2.4.1; se descarga solo al mostrarse, se reproduce una vez, con "reducir movimiento" muestra un check fijo). Se muestra al registrar la PRIMERA venta propia (pantalla completa "¡Tu primera venta quedó registrada!"; las de ejemplo no cuentan y la segunda venta no la repite) y al terminar de importar un Excel/CSV.
- Corrección de causa raíz (2026-10-05): los fondos con "doble radial" no se dibujaban (la clase de Tailwind mezclaba imagen y color en una sola regla y el navegador la descartaba). Ahora el color y las imágenes van por separado (bg-[var(--bg)] bg-[image:radial-gradient(...)]) en cuestionario, planes, acceso, app interna y pantalla de éxito: el tinte azul/dorado ya se ve. Es una de las quejas del revisor ("fondo plano").

## Servicios externos (inicio 2026-10-05)
- Orden: 1 GitHub (repo privado) → 2 Vercel (publicar, auto-deploy) → 3 Supabase (base de datos + cuentas, con RLS) → 4 Resend (correos) → 5 Hotmart (producto y webhook) → 6 dominio. Cero secretos en el chat: las claves las pega el usuario directo en el panel de cada servicio.
- Preflight local hecho: .gitignore cubre .env*, node_modules, .vercel; sin secretos en el código (las coincidencias de "service_role" son texto de documentación del SO).
- ⚠️ A confirmar antes de pagar/publicar: el plan gratis de Vercel (Hobby) es para uso NO comercial; vender una app exige plan Pro (≈ $20 USD/mes) o elegir otro alojamiento. Decidir antes del paso 2.
- Pendientes del usuario: crear cuenta de GitHub y repositorio privado vacío (paso 1).
