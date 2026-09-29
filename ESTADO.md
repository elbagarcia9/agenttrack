# ESTADO — HostAgent Commission Guard (nombre tentativo)
Última actualización: 2026-09-29 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: usuario eligió A + tipografía B; mercado inicial México / Siguiente acción exacta: FICHA-ARTE.md, FICHA-MERCADO (MX), monetización 02C, luego página de ventas.

## Qué es esta app
Asistente móvil ligero para agentes de viajes independientes afiliados a agencias Host (Archer, Evolution, InteleTravel, Nexion): audita, rastrea y avisa para cobrar el 100% de sus comisiones (alerta de carga en Commissions Hub a las 24h; alerta anti-pérdida a los 90 días). Suscripción SaaS.

## Promesa central
"Ayudo a agentes de viajes independientes afiliados a agencias Host a garantizar el cobro del 100% de sus comisiones sin perder cientos de dólares por olvidar registrar ventas o confiar en Excel pasivo."

## Idea validada (contexto base, viene de RESUMEN FINAL-HubTravel assistant.docx — NO revalidar)
- Nombre: HostAgent Commission Guard · alt: CommisSentry, TravelPay Tracker
- Usuario: agente independiente afiliado a Host, 3-20 reservas/mes, Excel+WhatsApp, sensible a precio (<$10/mes)
- Dolores núcleo: comisión se paga a 30-90 días; olvido de registro en Commissions Hub frena el pago; caducidad de reclamo a 90 días; Excel ilegible en móvil; CRMs a $35-59/mes
- Primera victoria (<5 min): registrar 1ª reserva en <2 min y ver el cronograma de alertas generarse solo
- MVP núcleo: tabla rápida de reservas, motor de alertas (24h hub, recordatorio pago cliente, viaje mañana, 90 días), calendario doble (viajes vs cobros), filtros, etiquetas
- NO construir: itinerarios PDF, cobros con tarjeta, APIs complejas, email masivo
- Competidores: Travefy ($39-59), Tern ($35-39), TravelJoy ($19-39)
- Precio propuesto en el resumen: $8.99/mes · $69/año · trial 14 días · plan gratis 5 reservas (a contrastar con matriz 02C y gate del 40)
- Canal #1: comunidad de agentes afiliados. Ángulo ganador: "seguro anti-pérdida de comisiones". Objeción clave: "Excel es gratis" y doble carga de datos.
- Otros insumos: ANALISIS CLIENTE IDEAL.docx (avatar Laura, 35), PROPUESTA DE VALOR.docx (Versión 1 ganadora; 3 razones: ganar dinero, escapar del dolor mental, ahorrar tiempo)

## Secuencia maestra
- Estado: aún sin código (fase de definición). Ruta: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- FICHA-AVATAR.md: APROBADA 2026-09-29 (Laura, 35) · FICHA-MODELO.md: BORRADOR (falta 2ª señal de revenue) · FICHA-MERCADO y FICHA-ARTE: pendientes
- Avatar: Laura, 35, agente independiente Host · dolor #1: no saber si su comisión cayó / se venció a 90 días · deseo #1: que el celular le avise antes de perder una comisión · consciencia alta, sofisticación media-baja
- Propuesta de valor ganadora (V1): garantizar el cobro del 100% de comisiones · razones dominantes: ganar dinero, escapar del dolor mental, ahorrar tiempo

## Dirección de arte
- Ruta de diseño: referencia PARCIAL del usuario (paleta = contrato + capturas TravelJoy + set de íconos de línea) + pidió 3 propuestas propias → 3 interpretaciones fieles en direcciones-abc.html (2026-09-29)
- Paleta del usuario: principal #226697 · fondo #EAEAEA · secundario #304A57 · destaque #BE8C2D · texto negro. Azul atenuado permitido para fondos.
- Decisión del agente: MANTENER el azul (familiaridad en herramientas de negocio de viajes/finanzas, confianza) y diferenciar con el dorado como color de alerta+dinero y con la forma de mostrar los cobros. Elección del usuario: opción A (Panel claro) con la tipografía de la B (Sora + Inter Tight), 2026-09-29.

## Decisiones técnicas
- Pendientes (framework, monetización con matriz 02C, auth, modelo de datos+RLS)

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
