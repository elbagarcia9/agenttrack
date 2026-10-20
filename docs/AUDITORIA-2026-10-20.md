# AUDITORÍA 10/10 — AgentTrack (2026-10-20)

> Fase 1 (explorar) y Fase 2 (auditar) hechas SOLO LECTURA. Nada de la app se cambió. Esperando aprobación para la Fase 4.
> Evidencia usada: base de datos real (políticas, funciones, advisors de Supabase), `npm audit`, cabeceras reales de `agenttrack.app`,
> lectura del código (webhook, proxy, acciones del panel, cron, push), recorrido de pantallas a 375px (`docs/revisiones/auditoria/`) y los
> veredictos del `revisor-visual` de hoy (`docs/revisiones/*-veredicto.md`). Dimensión 6 (IA): no aplica, la app no usa IA.

## Lo que ya está bien (verificado)
- RLS activa en las 16 tablas; funciones con `search_path` fijo; las 3 funciones expuestas a usuarios (`mi_acceso`, `registrar_actividad`, `admin_actividad_reservas`) son intencionales y la de admin verifica que seas dueña.
- Clave secreta de Supabase solo en servidor; ningún secreto en el repositorio; `.env` ignorado por git.
- Webhook de Hotmart: HOTTOK comparado en tiempo constante, rechaza sin configurar (fail-secure), producto permitido por lista, ventana de frescura, idempotencia y máquina de estados.
- Candado de acceso con una sola regla en la base (15 casos probados). Pago atómico por RPC.
- Panel del dueño: 404 para cualquiera que no sea administrador, en layout y en cada acción.
- Derechos de datos: exportar a Excel, eliminar cuenta, baja de correos, consentimiento registrado con versión.
- Avisos (correo + celular), cron protegido con secreto, textos legales publicados.

## Reporte priorizado

| Severidad | Hallazgo | Dónde | Mejora propuesta |
|---|---|---|---|
| Crítico | Infraestructura en planes gratuitos para un producto que cobra: Vercel Hobby es de uso no comercial; Supabase Free no trae copias de seguridad diarias ni recuperación a un punto en el tiempo y pausa el proyecto tras una semana sin uso; Resend Free limita a ~100 correos/día | Vercel, Supabase, Resend | Antes del primer cobro real: Vercel Pro, Supabase Pro (respaldos diarios) y revisar el límite de Resend. Probar una restauración. |
| Crítico | Next.js 16.3.7 tiene 6 avisos de seguridad altos (corrección menor disponible: 16.4.2); además `source-map-js` | `package.json` | Actualizar Next a 16.4.2 y `npm audit fix`; compilar y probar. |
| Crítico | Sin cabeceras de seguridad (solo HSTS): sin protección contra incrustar la página en otro sitio (clickjacking, incluido el panel), sin `nosniff`, sin política de referencia ni de permisos, sin CSP | `next.config.ts` | Agregar cabeceras (frame-ancestors, nosniff, referrer-policy, permissions-policy) y una CSP probada con Supabase, Hotmart y las fuentes. |
| Importante | La cuenta del dueño entra solo con correo/código/contraseña: si la roban, controlan accesos y cuentas | Supabase Auth, `exigirAdmin` | Activar verificación en dos pasos (TOTP) y exigirla en `/admin`. |
| Importante | Contraseñas: el servidor acepta mínimo 6 (la app pide 8) y la protección contra contraseñas filtradas está apagada (requiere plan Pro) | Panel de Supabase → Auth | Subir mínimo a 8 con letras y números; activar protección de contraseñas filtradas con el plan Pro. |
| Importante | Límite de intentos solo en la memoria de cada servidor (en Vercel cada instancia tiene la suya): protección débil en entrada, eventos, errores, encuesta y baja | `lib/eventos.ts` y rutas `/api/*` | Contador compartido (base de datos o Vercel KV) y captcha (Turnstile) en la pantalla de entrada. |
| Importante | Registro abierto: cualquiera puede pedir códigos a cualquier correo (molesta a terceros y gasta tu cuota de Resend) | `lib/auth.ts` (`shouldCreateUser`) | Captcha + límite por IP/correo; luego hacer que el webhook cree la cuenta al comprar y cerrar el registro abierto. |
| Importante | Sin pruebas automáticas ni integración continua: un cambio puede romper cobro, candado o avisos sin que nadie se entere | proyecto | Pruebas mínimas (reglas de plazos y de acceso; flujo entrar→planes) + GitHub Actions (tsc, lint, build). |
| Importante | Nadie te avisa si algo falla (webhook con error, cron que no corrió, correos rechazados): solo lo ves si entras a `/admin/salud` | operación | Alerta al dueño (correo/push) por errores del webhook y falla del cron; monitor externo gratuito de disponibilidad. |
| Importante | Sin manual del dueño: qué hacer si falla un cobro, si un cliente no recibe el acceso, cómo reembolsar, cómo dar tiempo gratis | `docs/` | Escribir `MANUAL-DEL-DUEÑO.md` (procedimientos de soporte y emergencia). |
| Importante | Sin plan de adquisición: hoy no hay quién llegue a la página (Instagram recién creado, sin audiencia ni lote de primeras clientas) | distribución | Plan de las primeras 10 clientas (grupos de agentes, WhatsApp, afiliados de Hotmart) y medir con `/admin`. |
| Importante | Sin retención de ingresos propia: no hay correo de pago atrasado, de cancelación con oferta ni de reactivación | cobranza | 3 correos (pago atrasado, "te extrañamos" a los 30 días, oferta anual) coordinados con los de Hotmart. |
| Importante | Pantallas del dinero en NO LISTA: ventas 28/40·14/20, inicio 29/40·13/20, planes 31/40·15/20, principal 29/40·15/20 (pisos 36/40 y 16/20) | `docs/revisiones/` | Salida suave a pocas personas y pulido con datos reales (ya anotado en `ESTADO.md`). |
| Importante | Correos de acceso caen a spam en Hotmail/Outlook (dominio nuevo; DMARC en `p=none`) | DNS, plantillas | Pedir "No es spam" a las primeras clientas, impulsar la contraseña, pasar DMARC a `quarantine` tras unas semanas, plantilla de texto simple. |
| Importante | Falta confirmar con un cobro real: desde cuándo corre la garantía de 7 días de Hotmart y cómo llega el evento de primer cobro | Hotmart | Primer cobro real de una clienta (o prueba pagada y reembolsada) y revisar `webhook_log`. |
| Importante | Ajustes de Supabase Auth que no puedo ver desde aquí | Panel de Supabase | Revisar: vigencia del código, Site URL y Redirect URLs, límites de correos, política de contraseñas y copias de seguridad. |
| Importante | Estado vacío del Inicio: ~400px de vacío y solo dos botones (no enseña valor) | `app/app/page.tsx` | Tarjeta "así funciona" con 3 pasos o un ejemplo precargado. |
| Importante | Sin pantalla "sin conexión": la app instalada sin internet muestra el error del navegador | `public/sw.js` | Página offline simple desde el service worker. |
| Importante | El cron diario recorre a todas las personas en serie con `maxDuration=300` (en el plan gratis el tope real es menor) | `app/api/cron/avisos/route.ts` | Con Vercel Pro basta; con más de ~500 cuentas, procesar por lotes. |
| Importante | Bitácoras sin purga (`event_log`, `error_log`, `webhook_log`, `avisos_enviados`): crecen sin límite | base de datos | Tarea programada que borre lo de más de 12 meses. |
| Pulido | Políticas duplicadas (consentimientos, push) y falta índice en `error_log.user_id` | base de datos | Unir políticas y crear el índice. |
| Pulido | Sin `robots.txt`, `sitemap.xml` ni imagen para compartir en redes | `app/` | Agregarlos (visibilidad y vista previa al compartir el enlace). |
| Pulido | Banner de "datos de ejemplo" ocupa ~90px en cada pantalla; pasos de "Importar" parecen botones; selector nativo de "Tipo de reserva" sin estilo | app interna | Banner de una línea, pasos solo contorno, selector con el estilo de la app. |
| Pulido | 4 errores de lint heredados en el panel (`set-state-in-effect`) y avisos de `window.location.assign` | `components/admin`, `app/admin/costos` | Corregir la causa (no silenciar). |
| Pulido | Textos legales redactados con IA, no por abogado | `/terminos`, `/privacidad`, `/reembolsos` | Revisión de un abogado en México cuando haya ingresos relevantes. |

## Puntaje actual: 6/10
Producto y cobro: 8. Seguridad de datos: 7. Infraestructura para vender: 4. Diseño/conversión: 6. Distribución: 3.

## Las 3 mejoras de mayor impacto para llegar a 10/10
1. **Infraestructura y endurecimiento antes del primer cobro**: planes Pro (respaldos), Next actualizado, cabeceras de seguridad, verificación en dos pasos del dueño y límites/captcha en la entrada.
2. **Red de seguridad operativa**: pruebas automáticas + integración continua + alertas + manual del dueño + una prueba real de punta a punta (compra, acceso, cancelación y primer cobro).
3. **Conversión con datos reales**: salida suave a 5–10 agentes, plan de adquisición y pulido de las 4 pantallas guiado por lo que muestre `/admin`.
