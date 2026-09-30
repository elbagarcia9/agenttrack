# ESTADO — HostAgent Commission Guard (nombre tentativo)
Última actualización: 2026-09-29 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: tour aprobado, botón principal dorado / Siguiente acción exacta: redactar docs/copy/landing.md (leer 19, 52, 55, 57) y construir la página de ventas.

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
- Estado: aún sin código (fase de definición). Ruta: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
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
