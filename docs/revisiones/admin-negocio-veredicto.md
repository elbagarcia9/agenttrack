# VEREDICTO revisor-visual — admin-negocio (3a revisión)
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-negocio-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Tarjetas de canal, párrafo bajo el nombre] La frase repite lo que ya dicen la insignia y las filas (nombre del canal otra vez, "-$560.00", "1.4 meses", "Sin gasto anotado" en insignia y en frase) -> borrar la frase en canales sin_gasto y recortar la de Meta a una sola instrucción ("Baja el costo por cliente"), sin repetir cifras.
2. [Hero vs tarjetas] Formato de dinero inconsistente: hero "$2,136 MXN" en enteros, tarjetas "$560.00 MXN" con centavos y moneda repetida en cada fila -> usar enteros en tarjetas (centavos solo en Costos/Ventas) y mostrar la moneda una sola vez en la cabecera.
3. [Identidad, hero] Al quitar la franja dorada se pierde el dispositivo ownable de la ficha (héroe azul + franja dorada), quedando solo un degradé azul genérico -> reinstalar la franja solo cuando haya canal en pérdida ("1 canal pide atención: Anuncios en Meta") con enlace a esa tarjeta.
4. [Tres tarjetas de canal] Mismo peso, fondo hundido y misma altura; solo la insignia y el color del número las distinguen, el de pérdida no destaca -> dar a la tarjeta que pide atención borde o fondo de aviso y comprimir las de "Sin gasto anotado" a una fila con enlace.
5. [Fila de pestañas arriba, "Costo" cortado; insignia "Sin gasto anotado"] Pestaña cortada sin pista clara y insignia azul pequeña (12px) de bajo contraste, que además parece un botón -> aumentar el degradado/indicador de scroll y pasar la insignia a texto secundario sin pastilla.

Verificado en código: sin deshacer (solo lectura, h3 sin riesgo); Cifras con reduced-motion; stagger .panel-entrada y .panel-tap definidos; loading.tsx con skeleton; aria-current en pestañas. Gate de carga cognitiva: sin fallas críticas (3 tarjetas + 2 KPI, sin CTA primaria compitiendo). Ficha: paleta, Sora/Inter Tight y radios coinciden; desvío solo en la franja dorada ausente.
