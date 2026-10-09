# VEREDICTO revisor-visual — admin-ganancia (tercera revisión)
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-ganancia-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Tabla "Cómo se calcula", valores] Cada fila repite ".00 MXN" (ej. $5,360.00 MXN) mientras el héroe usa pesos enteros: 10 sufijos de moneda y centavos que ensucian la comparación columna contra columna. Fix: poner la moneda una sola vez en el encabezado de la tabla y mostrar pesos enteros (centavos solo en "Resultado del mes").
2. [Tabla, filas Correos y Dominio y otros] Dos textos distintos para el mismo problema ("Sin datos" vs "No anotado"), y ninguno es tocable. Fix: unificar en "Sin anotar" y volverlo enlace a /admin/costos.
3. [Héroe y franja de estimación + caja beige final] La misma acción (ir a Costos) aparece dos veces, y "Octubre de 2026" se repite justo debajo del selector de mes. Fix: quitar la etiqueta de mes del héroe (o del selector) y dejar un solo aviso de estimación.
4. [Leyenda de la barra "De cada $100"] Los ítems se parten en 3 líneas desiguales, y "Te quedan: $69" queda solo y huérfano. Fix: grilla de 2 columnas con la fila "Te quedan" a todo el ancho, o un texto corto como "Te quedan $69" al lado de la barra.
5. [app/admin/loading.tsx] El esqueleto es genérico (4 tarjetas pequeñas y un bloque) y no tiene la forma de Ganancia (título, selector, héroe azul, tarjeta con tabla). Fix: un esqueleto específico de Ganancia con el héroe a h-48 y filas de tabla.

Notas: gate de carga cognitiva sin fallas críticas. Hay una sola acción primaria (la franja dorada). Verificado en código: conteo de cifras, barra que se dibuja (panel-barra), entrada escalonada y reduced-motion implementados. Los atajos y el undo no aplican a una pantalla de solo lectura. No hay transición entre meses ni celebración (celebración no aplica). Los colores y fuentes coinciden con FICHA-ARTE (#226697, franja #BE8C2D, Sora).
