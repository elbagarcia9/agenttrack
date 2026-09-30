# FICHA DE DIRECCIÓN DE ARTE — HostAgent Commission Guard (nombre tentativo)

## Referencia del usuario (CONTRATO)
- ¿Hay referencia?: SÍ, PARCIAL → paleta (contrato) + capturas de TravelJoy (sobrio, nav lateral, pestañas, tarjetas blancas) + set de íconos de línea con chip azul suave
- Extracción (hex medidos sobre la imagen, 2026-09-29):
  - Modo: claro · Fondo: #EAEAEA (o azul atenuado #E6EEF4) · Superficie: #FFFFFF · Texto 1º/2º: #111518 / #5B666D
  - Acento: #226697 (botones, tarjeta héroe, enlaces) · 2º color: #304A57 (encabezados/CTA secundario) · Destaque: #BE8C2D (alertas y dinero en riesgo, NUNCA botón principal)
  - Display: Sora (sans geométrica) · Body: Inter Tight · Radio: 14/11px · Espaciado: medio · Sombras: sutiles, tintadas de azul
  - Bordes: hairline translúcido · Íconos: línea 2px en chip azul al 10% · Detalle firma: franja/alerta dorada sobre tarjeta héroe azul
- Prohibiciones anti-IA que la referencia levanta: ninguna

## Personalidad compilada
- 3 adjetivos: confiable, tranquila, precisa
- Compilación (11): spring suave · 200-240ms · exclamaciones máx 0 por pantalla (dinero = tono sereno) · celebración nivel bajo (al cobrar una comisión) · radio 14px

## Brand kit final
- Fondo #EAEAEA · Superficie #FFFFFF · Hundido #E6EEF4 · Texto 1º/2º #111518 / #5B666D
- Acento #226697 (SOLO: botón principal, héroe, enlaces, ítem activo) · 2ª nota #BE8C2D (SOLO: alertas por vencer y monto en riesgo; nunca decorativo)
- Semánticos: éxito #2F9A6E · error #C4483A · aviso #BE8C2D
- Display Sora (600-700) · Body Inter Tight (400-600) · Escala: display 38 / title 21 / body 14 / label 11
- Profundidad: sombras tintadas 2 capas + hairline · Espaciado 4·8·12·16·24·32·48·64
- Dispositivo ownable: tarjeta héroe azul con degradé + franja dorada de alerta pegada a ella
- Motion signature: ease-out suave, 220ms, sin rebote

## Trazabilidad y vetos
- Ruta de diseño: referencia parcial + 3 interpretaciones fieles
- Protocolo A/B/C: elegida A (Panel claro) con la tipografía de la B (Sora + Inter Tight) · descartadas: B (alertas primero, lista densa), C (dos calendarios con cabecera pizarra) — sus ideas de aviso dorado y calendario doble pueden reaparecer como componentes · comparativa: direcciones-abc.html
- Tour de la app v2: vista-previa-app.html (móvil, 5 vistas) + vista-previa-escritorio.html (Inicio, Reservas tabla, Calendario mes) · screenshots docs/revisiones/vista-previa-app.png y vista-previa-escritorio.png · aprobado por el usuario: SÍ 2026-09-29 ("me encanta"; botón Registrar venta nueva en dorado) (feedback del 2026-09-29 aplicado: total por cobrar, botón pizarra, campos, estatus, calendario tipo Google, escritorio)
- Paleta derivada de: referencia del usuario · Dispositivo ownable: tarjeta héroe + alerta dorada
- Registro anti-repetición: paleta azul #226697/dorado #BE8C2D + Sora/Inter Tight vetados para el próximo proyecto
- Modo claro derivado por: avatar consulta el celular de noche y de día, contexto de trabajo/finanzas y referencia del usuario clara

## Idioma UI: español neutro (México primero) · Fecha: 2026-09-29 · Aprobada por el usuario: SÍ (eligió A + tipografía B; brand kit definitivo por confirmar al ver la landing)
- Regla de color (usuario 2026-09-29): dorado solo cuando faltan ≤5 días para vencer; rojo si venció; botón 'Registrar venta nueva' en dorado #BE8C2D con texto oscuro (usuario, versión final); el dorado ahora también es color de la acción principal además de alerta
