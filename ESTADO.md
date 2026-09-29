# ESTADO — HostAgent Commission Guard (nombre tentativo)
Última actualización: 2026-09-29 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: SO instalado, idea validada leída y guardada / Siguiente acción exacta: pregunta de referencia visual (54 PASO 0), luego FICHA-AVATAR, FICHA-MERCADO, FICHA-MODELO, FICHA-ARTE y nombre final.

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
- Otros insumos: ANALISIS CLIENTE IDEAL.docx (avatar Laura, 38), PROPUESTA DE VALOR.docx (Versión 1 ganadora; 3 razones: ganar dinero, escapar del dolor mental, ahorrar tiempo)

## Secuencia maestra
- Estado: nada construido aún. Ruta: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Ficha-avatar / mercado / modelo / arte: pendientes

## Dirección de arte
- Ruta de diseño: pendiente de respuesta del usuario (propuesta propia vs réplica de referencia)

## Decisiones técnicas
- Pendientes (framework, monetización con matriz 02C, auth, modelo de datos+RLS)

## Pendientes del usuario
- [ ] Elegir ruta de diseño (1 o 2)
- [ ] Confirmar el mercado/país objetivo (ver notas)

## Notas
- ⚠️ El resumen no indica país/idioma del agente (nombres en inglés, textos en español). Verificar en FICHA-MERCADO antes de fijar precio y pasarela (Hotmart).
- ⚠️ El formato del resumen no es idéntico a los 20 campos del SO; se tomó como contexto base.
