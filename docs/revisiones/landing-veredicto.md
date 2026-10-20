# VEREDICTO revisor-visual — landing (ronda 4)
Fecha: 2026-10-20 15:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) el subtítulo del hero sale cortado ("reclamo a 18…") por el tope de 14 palabras; 2) el CTA final es azul claro con texto oscuro, fuera de la paleta de la ficha y distinto a los otros 5 CTAs, con texto de apoyo de contraste dudoso; 3) el mecanismo "Guardián de ventas" se repite 3 veces en 120px en Solución y se diluye en "asistente/AgentTrack/tu sistema" en el resto de la página; 4) página de 9.7k px con 4 secciones que dicen "te avisa antes del plazo" en 3 patrones de tarjeta distintos y alineación de títulos mezclada; 5) el dispositivo ownable (tarjeta azul + franja dorada) no existe como elemento de la landing y hay 3 tratamientos de imagen distintos.

Detalle (sobre captura completa de 7 partes y código de app/page.tsx + components/landing/* + AvisosAsistente + ImportarExcel):
- Usabilidad: h1:3 h2:3 h3:3 h4:2 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
- Craft: jerarquía:3 profundidad:3 identidad:2 movimiento:3 encaje:3
- Copy: idea:3 especificidad:3 emoción:3 oferta:3 acción:3 (15/20, bajo el piso 16)
- Gate de carga cognitiva: 1 falla (la ficha de "Sube tu Excel o CSV" con ícono de subir y los chips grises del Problema parecen tapables y no lo son) -> no es sobrecarga crítica.
- CTA héroe vivo: hero, carrusel y plan anual cumplen los 4 (52px, whileTap 0.97, nunca disabled, contraste blanco sobre #226697 ~6:1). El CTA final falla la consistencia (otro color y texto oscuro).
- Anclas de conversión: titular con énfasis OK, hairline degradé en plan anual OK, chips SVG y checks custom OK, secciones adyacentes distinguibles OK.
- FICHA-ARTE: #EAEAEA/#226697/Sora/Inter Tight/radios 14-11 coinciden. Desvíos: azul claro del CTA final y de "nada se vence" no existe en la ficha; el dorado #BE8C2D no aparece en la landing (solo dentro de imágenes de la usuaria); sección Problema y banda puente usan el acento como fondo a pantalla completa (la ficha lo limita a botón/héroe/enlaces/activo).
- Movimiento (código): reveal escalonado con reduced-motion en Solución/Oferta/Faq/AppPorDentro/Avisos/Banda, whileTap en CTAs y plan mensual, sticky con entrada/salida, FAQ con altura animada. Faltan: conteo animado del precio héroe, stagger en el hero (solo fade del bloque), ImportarExcel sin movimiento alguno.
- Heurísticas 3/7 (código): sin acciones destructivas; control = Entrar, enlaces legales, FAQ colapsable, dots 44px; flexibilidad = sticky de 2 estados (ver precios -> CTA comercial), ?plan=anual|mensual, anual por defecto, primer FAQ abierto. El sticky no aparece en la captura de página completa: verificado solo en código.
- Contraste: no medido con herramienta; el recap "14 días gratis · cancela cuando quieras" y la cita en cursiva sobre el slate del cierre lucen ~3.5-4:1 a 13px (probable fallo AA).
- Sub-checks de copy: message-match N/A (sin dato de anuncio); garantía nombrada: no existe por decisión deliberada, no penalizada.
- Notas de archivos de imagen de la usuaria (no penalizadas): burbujas del ANTES, alertas del CON y pantalla del celular del hero/Excel tienen texto muy chico a 375px; el mock del carrusel tiene un hueco gris grande entre la lista y el botón "Ver mi plan".

TOP DEFECTOS
1. [Hero, subtítulo, parte 01 y≈300] ALTA — el subtítulo se corta a media promesa: "alta a 30 días, reclamo a 18…" (falta "meses"); truncarMarcado(…,14) del Hero recorta la frase en la primera pantalla, lo ve cualquiera. Fix: acortar a <=13 palabras ("Tu Guardián de ventas avisa: alta a 30 días, reclamo a 18 meses") o subir el tope del kit a 16 y verificar sin "…".
2. [CtaFinal, parte 07 y≈175-260] MEDIA — botón celeste con texto oscuro (otro azul fuera de la ficha, distinto a los 5 CTAs blancos sobre #226697), "nada se vence" en el mismo celeste y recap/cita en gris sobre slate de contraste dudoso. Fix: un solo CTA (--accent + --on-accent) sobre un fondo de cierre donde mantenga >=3:1 (p. ej. superficie clara o slate más oscuro con hairline), y subir recap/cita a text-primary del modo oscuro (>=4.5:1).
3. [Solución, parte 02 y≈960-1190; resto de la página] MEDIA — "Tu Guardián de ventas" aparece en el h2, de nuevo en la barra azul "Guardián de ventas" y de nuevo en "su guardián" en <120px; en cambio la escena, Avisos, "Dale un vistazo a tu próximo asistente", FAQ y cierre dicen "asistente", "AgentTrack" o "tu sistema", así que el nombre propio no se sostiene. Fix: convertir la barra en un chip con escudo + definición de una línea ("vigila alta, pago y reclamo de cada venta") y reemplazar "asistente" por "Guardián" en todos los textos.
4. [Solución -> Antes/Con -> Avisos -> Excel -> carrusel, partes 02-05] MEDIA — 9.7k px; cuatro secciones repiten "te avisa antes de cada plazo" con tres patrones distintos (pasos con chip numérico, tarjetas blancas con chip azul, pasos con contorno e íconos) y títulos que saltan entre izquierda (Problema, Solución, Avisos, FAQ) y centro (Excel, Oferta, App); Avisos y Excel siguen fuera de SectionShell/Kicker. Fix: fusionar Avisos en el paso 3 de Solución (los 4 avisos como sub-lista), pasar Excel y Avisos por SectionShell + Kicker y fijar una sola alineación de títulos; el chip del icono de subir en el paso 1 de Excel quitarlo (parece botón).
5. [Identidad, partes 01-05] MEDIA — el dispositivo firma de la ficha (tarjeta héroe azul + franja dorada de alerta) no existe como componente de la landing (solo vive dentro de capturas); Avisos dice "se pinta en dorado" sin mostrarlo; 3 tratamientos de imagen sin unir (recorte 3D del hero, foto oscura de desvelo, recortes con mancha azul). Fix: construir un componente "aviso Guardián" (tarjeta azul + franja #BE8C2D con fecha real, p. ej. "Marcos y Ana: quedan 4 días") y usarlo en Solución/Avisos; unificar fotos con el mismo velo azul/slate.
