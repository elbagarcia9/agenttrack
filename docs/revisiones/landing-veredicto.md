# VEREDICTO revisor-visual — landing
Fecha: 2026-10-01 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 29/40
Craft: 15/20
Copy (si vende): 17/20
Copy: 17/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
Detalle craft: jerarquia:3 profundidad:3 identidad:3 movimiento:3 encaje:3
Detalle copy: idea:4 especificidad:3 emocion:4 oferta:3 accion:3
Gate de carga cognitiva: 1 falla (boton dorado muerto en el mock del hero). Menos de 4, no es sobrecarga critica.
Verificado en codigo: Contador.tsx (cuenta 0 a 1,420 al entrar, respeta reduced-motion); SemaforoVisual.tsx (las 3 tarjetas entran escalonadas con fade y 0.35s de retraso entre ellas; no hay luces animadas como tales); useReveal en ui.tsx (stagger y reduced-motion); CtaButton con whileTap 0.97 y 52px; StickyCtaMobile con 2 estados; FAQ accesible con aria-expanded; fuentes Sora e Inter Tight cargadas segun la ficha; paleta fiel a paletaColorApp1.jpg. Rutas /onboarding, /entrar, /privacidad y /terminos existen (onboarding es una pagina provisional).
Limitacion: no hubo herramienta para recortar el PNG de 7794px; se leyo en vista reducida, asi que los juicios de encaje fino a 375px se apoyan en el codigo.

Top defectos:
1. [Hero, mock del telefono, boton "Registrar venta nueva"] Es el elemento mas saturado del primer viewport (degrade dorado) y parece tocable, pero no hace nada. Compite con el CTA azul real y rompe la regla "nada interactivo que no responda" -> bajarlo a un tono neutro en el mock, o volverlo un fondo dorado plano sin forma de boton, o recortar el mock sobre ese boton.
2. [Seccion "Tus negocios, a un vistazo" a 1280px] El carrusel queda descentrado: padding izquierdo de 445px, la tercera vista se corta en el borde derecho y no hay flechas, solo puntos -> centrar la pista cuando caben las 3 vistas (justify-center) o mostrar flechas en desktop.
3. [Recap bajo el CTA final, 13px] Color bg al 65% sobre #304A57 mide aprox. 4.3:1 (menos de 4.5:1 AA) -> subir a 80% o mas de opacidad.
4. [Agitacion, cita de apertura] borde izquierdo en dorado --accent-2 como decoracion, contra la regla de FICHA-ARTE (dorado solo para menos de 5 dias o alerta y accion principal; "nunca decorativo") -> usar --accent o --slate. Lo mismo con el radial dorado de fondo del hero.
5. [Problema + Agitacion + antes/despues + FAQ "Excel"] Cuatro bloques repiten la misma idea (Excel no avisa) y las 10 filas de features de la oferta se duplican entre planes; hace larga la pagina sin sumar valor -> fusionar "Hoy/Si nada cambia" con "Antes/Despues", dejar una sola pregunta de Excel y recortar las features del plan mensual a "Todo lo del anual, mes a mes".

Otros (no TOP): "Elegir mensual" rompe el patron de CTA en 1a persona con beneficio; el bloque del Semaforo no tiene titulo propio y su linea de plazos va en 14px gris; falta prueba social (sin testimonios por ser dia 1, intencional); soporte@tu-dominio.mx es provisional (conocido).
