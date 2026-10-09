# VEREDICTO revisor-visual — admin-ventas
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-ventas-375.png
Usabilidad: 31/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Gráfica "Evolución de ingresos", mitad izquierda] 5 de 12 meses (nov-mar) son vacío sin barra ni cifra: se lee como gráfica rota o medio vacía -> recortar la serie al primer mes con datos (mínimo 6 meses) o dibujar un tope "$0" tenue y nota "Sin cobros antes de mayo".
2. [Franja dorada + héroe] la devolución usa el dorado (reservado a alertas por vencer/dinero en riesgo) con texto oscuro sobre dorado, y el héroe repite $ y detalle en 3 líneas apretadas -> mantener, pero partir la línea de 'acumulado' a su propia fila de label para que no se parta "MXN" en dos líneas.
3. [KPIs "Entra cada mes" / "Suscripciones activas"] el detalle "24 suscripciones activas" repite el KPI vecino y las etiquetas en mayúsculas se rompen a 2 líneas en la segunda tarjeta, desalineando valores -> acortar a "Suscripciones" y quitar el conteo del detalle de la primera.
4. [Bajas] subtítulo de 3 líneas y párrafo final de 3 líneas: demasiado texto explicativo para un dueño que ya sabe leer la barra -> dejar una frase en cada uno.
5. [Personas por membresía] "22 activa / 4 cancelada / 3 en prueba" concuerdan mal en número y los chips son diminutos y grises sin jerarquía -> pluralizar ("22 activas", "4 canceladas") y dar peso al chip de activas.
Verificado en código: conteo animado (Cifras.tsx), barras que crecen y reduced-motion (Graficos.tsx), entrada escalonada solo bajo prefers-reduced-motion: no-preference (globals.css). Colores acento/dorado coinciden con FICHA-ARTE. Sin tap-scale ni transición de tabs verificados en esta pantalla. No se verificó loading.tsx ni el CTA (pantalla de solo lectura).
