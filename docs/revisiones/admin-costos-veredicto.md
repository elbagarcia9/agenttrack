# VEREDICTO revisor-visual — admin-costos
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-costos-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Filas de costo y gasto, ícono de papelera] Cada registro gasta una fila entera solo para un ícono suelto alineado a la izquierda, bajo una línea divisoria; se ve como hueco muerto y la acción de borrar flota sin relación con el dato. Fix: llevar la papelera a la esquina superior derecha del título de la tarjeta (misma línea que "Servidores y base de datos") y quitar la fila de acciones.
2. [Borrar costo/gasto, código Interacciones.tsx y acciones.ts] El borrado es definitivo (delete directo en base de datos): hay confirmación pero no deshacer, y el dinero anotado se pierde. Fix: tras confirmar, mostrar "Borrado · Deshacer" durante unos segundos y diferir el delete, o usar borrado lógico reversible.
3. [Cifras: héroe $480 MXN vs filas $480.00 MXN] Formato inconsistente del mismo importe en la misma pantalla (sin decimales arriba, con .00 abajo). Fix: usar un solo formato de dinero en héroe y filas (sin decimales cuando son enteros).
4. [Héroe, etiqueta "MXN" y cifras] Las cifras y la etiqueta MXN en azul claro sobre degradé azul tienen contraste justo (la etiqueta MXN pequeña probablemente queda bajo 4.5:1). Fix: subir la etiqueta MXN a blanco al 85-90% o aclarar el tono de la cifra.
5. [Formularios plegables, código Formularios.tsx] CostoForm y GastoForm no se limpian ni se cierran tras guardar con éxito, y el importe es texto libre sin validación previa en pantalla; queda el valor anterior y es fácil duplicar un registro. Fix: reset del formulario y cierre del plegable en éxito, y validar el importe al salir del campo con aviso en línea.
