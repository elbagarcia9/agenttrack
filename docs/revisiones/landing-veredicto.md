# VEREDICTO revisor-visual — landing
Fecha: 2026-10-20 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [ALTA - verificacion] Partes 04-07 del screenshot: AppPorDentro, Oferta (planes y precios), Garantia, FAQ y CtaFinal salen en blanco o como bloque oscuro vacio (~35% de la pagina, justo las secciones que cobran). Los reveals whileInView no se dispararon en la captura de pagina completa, asi que NO se pudo verificar nada visual de ahi. Fix: recapturar haciendo scroll por toda la pagina (o forzando los reveals) y volver a pasar al revisor.
2. [ALTA - copy] Eje especificidad = 2 (copy 14/20, bajo el piso 16 y con un eje <=2). El hero y la solucion no dan ni un plazo ni una cifra: "en segundos", "con anticipacion", "cada plazo". Los plazos reales (30 dias para dar de alta, pago a 60-90 dias, reclamo a 18 meses) solo aparecen como "60 dias" en AvisosAsistente. Fix: poner los plazos concretos en el subtitulo del hero y en los 3 pasos de Solucion (ej. "te avisa a los 30 dias para dar de alta y a los 60 para reclamar").
3. [MEDIA - encaje] Footer (parte 07): los separadores "·" quedan huerfanos al inicio de linea ("· Términos y Condiciones", "· Cancelación y reembolsos"), el bloque va alineado a la izquierda mientras el resto de la pagina esta centrado. Fix: quitar los puntos separadores y poner los 3 enlaces en columna o con gap, no con "·" inline.
4. [MEDIA - encaje/consistencia] Chip "tu asistente de comisiones" (parte 02, Solucion) parece boton y no hace nada; en las tarjetas de pasos 01/02/03 el chip numerico y la tarjeta quedan desalineados con la linea guia. Fix: quitar el aspecto de pildura clicable del mecanismo (convertirlo en texto con subrayado sutil o integrarlo al titular).
5. [MEDIA - identidad/movimiento] El dispositivo firma de la ficha (tarjeta heroe azul con franja dorada) solo vive dentro de las imagenes raster; en la pagina el dorado casi no aparece y todo lo demas son tarjetas grises/blancas planas (Problema = 5 tarjetas identicas). Ademas Antes/Con usa imagenes con texto incrustado de ~8px ilegible a 375px, y no hay conteo de numeros ni dibujado de nada (movimiento solo reveals + tap). Fix: reproducir la tarjeta azul + franja dorada como componente HTML en la seccion Solucion/Avisos, y sacar el texto de las burbujas de la imagen a HTML legible (>=13px).

Otros (menores): badge "N" del indicador de desarrollo de Next.js sobre la tarjeta de BandaPuente (parte 01; comprobar que la captura final se haga en build de produccion); "Tarjeta al empezar, sin cobro hoy" se repite 5+ veces (hero, bajo planes, garantia, FAQ, CTA final) = ruido; "¡Tu sistema listo!" rompe la regla de 0 exclamaciones de la ficha; "Hub" aparece sin explicar ("Dar de alta en el Hub"); CTA mensual "Elegir mensual" no esta en primera persona y el sticky dice "Ver plan y precios" (dos acciones distintas).

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
Detalle craft: jerarquia:3 profundidad:3 identidad:3 movimiento:2 encaje:2
Detalle copy: idea:3 especificidad:2 emocion:3 oferta:3 accion:3
Gate de carga cognitiva: 1 falla (acciones/avisos repetidos). Paleta, familia tipografica display (Sora) y radios coinciden con FICHA-ARTE (#226697, #EAEAEA, #BE8C2D en imagenes). Anti-clon: no coincide con Capitulo ni Umbral. Codigo verificado: reduced-motion (useReducedMotion), whileTap 0.97, stagger de reveal y sticky CTA de dos estados presentes; CTA >=52px y contraste correcto. Sin garantia de reembolso ni testimonios: aceptado por contexto, no penalizado.
