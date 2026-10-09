# VEREDICTO revisor-visual — admin-uso
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-uso-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: (1) Vuelta semana a semana: 5 tarjetas de 5 filas cada una (~25 filas) a 375px, bloque más largo de la pantalla; convertir en lista compacta de 1 línea por semana o gráfica de barras con la semana en curso atenuada. (2) Las dos gráficas de área no tienen escala de valores ni etiquetas de valor, y la de ventas oscila con ruido; añadir etiqueta directa en el último punto y el pico, y marcar el promedio con una línea. (3) Movimiento: solo conteo de cifras y dibujado de gráficas; no hay stagger de entrada, ni whileTap/active verificado en componentes admin, ni transición de pantalla; añadir stagger 50-80ms en tarjetas y whileTap 0.97 en chips/selector de mes. (4) Cuatro tarjetas KPI con el mismo peso y la etiqueta "Entraron esta semana" se parte en dos líneas y desalinea el número respecto a su vecino; acortar etiquetas ("Activos 7 días") y alinear cifras. (5) Identidad: la franja dorada firma de la ficha solo aparece con vuelta <40%, así que en este estado la pantalla es azul plano sin dispositivo firma más allá del héroe; mostrar siempre un detalle dorado sutil o ajustar. Heurística 9 sin estados de error verificables en la pantalla; h7 sin atajos más allá del selector de mes.
