# VEREDICTO revisor-visual — Landing de venta (Commission Guard)
Fecha: 2026-09-29 21:59
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [CRITICO, CTA final, bloque oscuro] El acento #226697 sobre el fondo casi negro (~#131F28) mide ~2.7:1. El boton "Empezar mis 14 dias gratis" pierde borde contra su fondo (falla el ancla de CTA vivo >=3:1), el texto "nada se vence" no llega a 3:1 (titular grande) y la barra del PS tampoco. Es el CTA de cierre. FIX: en CtaFinal.tsx usar boton --bg con texto oscuro, o un azul aclarado para este bloque (p. ej. #4A9BD1, >=4.5:1) en el H2 acentuado y en la barra del PS.
2. [COPY eje 2/4, secciones Solucion, Oferta y Agitacion] El mecanismo "Semaforo" solo existe como texto: no se ve el semaforo (verde/dorado/rojo, y el verde ni se menciona). No se dice COMO llega el aviso (push, WhatsApp, correo), y esa es la promesa central. Los plazos verificados (30 dias alta, 60-90 pago, 18 meses reclamo) no aparecen, asi que "tres relojes" y "antes de que venzan" quedan sin numero. La lista de features de Oferta no incluye los avisos. FIX: agregar una tira visual de 3 estados (verde/dorado/rojo) con los plazos reales en Solucion, decir el canal del aviso y anadir "Avisos antes de cada plazo" como primer item de features.
3. [USABILIDAD h5/h7, app/page.tsx L102 y L116, Oferta] "Elegir mensual" y el CTA anual apuntan al mismo /onboarding sin parametro: la eleccion de plan se pierde. Tampoco hay "Entrar" para quien ya tiene cuenta (Hero admite loginHref y no se pasa). FIX: ctaHref '/onboarding?plan=anual' y '/onboarding?plan=mensual', y pasar loginHref al Hero.
4. [COPY eje 4/2, Oferta y FAQ] Falta anclaje de valor y la objecion #5 de la ficha ("no gano para otro software"): el ahorro anual no se cuantifica ($149x12 vs $1,190) y nada compara el precio con una comision rescatada. No se aclara si la prueba de 14 dias pide tarjeta ("cancelas antes" lo insinua). La Garantia esta bien como Prueba de 14 dias, pero su titular sale como "la Prueba de 14 Dias" con "la" en minuscula y parece un bug. FIX: linea "Ahorras $598 al ano vs mensual", FAQ "Cuanto cuesta vs lo que puedo perder", frase explicita sobre tarjeta, y capitalizar el titular ("La Prueba de 14 Dias").
5. [FOOTER + Hero, encaje y confianza] El email visible es soporte@tu-dominio.mx (placeholder); el logo del header es un cuadrado azul vacio y el del footer es gris (inconsistente); el mock del hero (Laura, $1,420 USD, precios en MXN) no lleva rotulo visible de "Vista de ejemplo", solo aria-label; el subtitulo de prueba social queda con "hoy" huerfano en una linea. FIX: correo real o quitarlo hasta tenerlo, mismo logo/tratamiento en ambos, rotulo "Vista de ejemplo, datos ficticios" bajo el mock, y acortar la linea de prueba social a una sola linea.

Otros defectos menores (no bloquean solos):
- [Agitacion + Solucion] Dos pares de tarjetas que repiten el mismo recurso de contraste (Hoy / Si nada cambia y luego Antes / Despues): redundancia que alarga la pagina y baja h8. Fusionar en una.
- [Profundidad] Fondo #EAEAEA vs superficie #F6F8FA: la alternancia entre secciones casi no se nota (sobre todo hero a Problema). El dorado #BE8C2D y el pizarra #304A57 de la referencia no aparecen en la pagina fuera del mock (identidad del kit generica salvo el mock). Subir el contraste de superficies y usar el dorado en un detalle firma de la landing (p. ej. cinta o acento de "Dorado a 5 dias").
- [Movimiento] El visual del hero solo hace fade: el "$1,420" no cuenta, la tarjeta no se dibuja. Reveal y stagger, tap y reduced-motion sí estan en el kit.
- [Fidelidad a la ficha, desvios leves] --surface #F6F8FA (ficha #FFFFFF) y texto secundario #46535A (ficha #5B666D); radios del mock (12/16/8px) fuera de 14/11. La referencia del usuario resulta FIEL (0 de 6 fallos).
- [Contexto intencional, no penalizado como defecto de fondo] Carrusel con placeholders honestos, sin promesa de reembolso, precios y nombre provisionales. Aun así, el carrusel ocupa ~1000px de marcos vacios con solo el nombre de la pantalla; un rotulo "Proximamente: capturas reales" evitaria que se lea como imagen rota.

Detalle de puntajes:
- Usabilidad: h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:3 h8:2 h9:3 h10:3 (h3, h5 y h7 verificadas en codigo; el resto en render). Gate de carga cognitiva: 1 falla leve (elementos que parecen interactivos y no lo son: chip "el Semaforo de Comisiones", pildoras "14 dias gratis", tab bar del mock), sin sobrecarga critica.
- Craft: jerarquia:3 profundidad:3 identidad:3 movimiento:3 encaje:2. Anclas de conversion: titular con enfasis PASA; hairline degrade (annual, garantia, chip mecanismo) y chips SVG sin emojis PASA; secciones adyacentes distinguibles: PASA en el limite (contraste debil).
- Copy: idea:3 especificidad:2 emocion:3 oferta:3 accion:3. Sub-checks: message-match N/A (sin anuncio de origen); garantia nombrada cerca del CTA PASA (Prueba de 14 Dias, justo bajo las tarjetas, y badge de 14 dias en ambas); enfasis PASA. Presupuesto de copy (subtitulo <=14 palabras, cards de problema <=12, FAQ <=40): PASA. Eje 2 <=2 obliga a corregir aunque el total pasara.
- Gate doble: Usabilidad 28 (<36) y Craft 14 (<16); Copy 14 (<16) con un eje <=2. NO LISTA.
