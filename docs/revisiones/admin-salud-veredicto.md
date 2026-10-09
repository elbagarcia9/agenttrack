# VEREDICTO revisor-visual — admin-salud (tercera revisión)
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-salud-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Hero + KPIs + tarjetas] El mismo dato se dice tres veces (hero "2 errores distintos / 1 pago sin acceso", KPI "Pagos sin acceso 1", y la tarjeta del mismo nombre). Fusionar: quitar el KPI de pagos o los chips del hero para que el héroe sea el único resumen.
2. [Errores recientes] Tarjeta dentro de tarjeta (cada error es una card blanca dentro de la tarjeta blanca) y filas Veces/Personas/Dónde/Última vez en 4 líneas por error: compactar en una línea de meta ("7 veces · 3 personas · Calendario · hace 5 h") para bajar el scroll y la densidad.
3. [Movimiento, código globals.css] Hay stagger, barra y tap, pero faltan conteo animado de los números héroe (5, 1) y transición entre pestañas; verificado solo stagger/barra/tap/reduced-motion. Añadir conteo de KPIs.
4. [Héroe, chips "2 errores distintos" / "1 pago sin acceso"] Parecen desplegables por el chevron abajo pero son anclas que saltan; usar ícono de flecha hacia abajo-ancla o texto "Ver" para no prometer un menú.
5. [Pagos sin acceso, "Agregarle su acceso"] Lleva a /admin/usuarios sin llevar el correo; el dueño debe recordarlo y copiarlo (h6). Pasar ?q=correo en el enlace. Además, el empty state "Cuadre semanal" es una tarjeta casi muda: dar un paso de activación concreto.
