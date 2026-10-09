# VEREDICTO revisor-visual — admin-usuarios
Fecha: 2026-10-09 12:00
Screenshot: docs/revisiones/admin-usuarios-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Arriba, tarjeta "Agregar a alguien"] En el estado sin conexión, una tarjeta grande de 7 líneas de texto explicativo ocupa lo primero de la pantalla y empuja la lista real (lo que el dueño viene a ver). Además no tiene ningún botón ni acción. Fix: colapsarla a un aviso de 1-2 líneas (franja dorada o chip) y bajarla debajo de la lista, o mostrarla solo como un enlace "Agregar a alguien".
2. [Identidad, toda la pantalla] No hay dispositivo ownable de la ficha (tarjeta héroe azul con degradé + franja dorada). Es todo blanco sobre gris con KPIs planos, por lo que podría ser cualquier panel. Fix: convertir el KPI "Con cuenta" en tarjeta héroe azul con degradé y llevar la franja dorada a "Sin acceso".
3. [Lista "Todas las cuentas"] Cada persona es una tarjeta de 4 filas etiqueta-valor (Acceso, Membresía, Se unió, Última vez). Salen 6 tarjetas por página, más de 5 ítems antes de agrupar, y la pantalla mide unos 2900px. Fix: compactar a 2 líneas por persona (nombre + correo, y chips de Acceso y Membresía), con fechas en una sola línea gris y acciones tras tocar la fila.
4. [Filtros] Los dos selectores muestran "Todas" y "Cualquier membresía" sin etiqueta visible; "Todas" no dice qué se filtra. Fix: poner etiquetas visibles ("Acceso: Todas") o convertir el filtro en chips segmentados Todas / Con acceso / Sin acceso.
5. [KPI "Sin acceso" y acciones por fila] La tarjeta "Sin acceso" va con fondo dorado, pero la ficha reserva el dorado para vencimientos y dinero en riesgo. "Reenviar acceso" (azul) y "Desactivar" (rojo) se repiten idénticos en cada tarjeta y compiten entre sí. Fix: usar tono neutro con acento rojo solo si el número es mayor que 0 (o franja dorada según la ficha), y dejar "Desactivar" como acción secundaria discreta con el mismo peso visual que "Reenviar acceso".

Verificado en código: Desactivar/Activar con confirmación, "Guardando…", mensaje final y Deshacer (Interacciones.tsx); filtros con búsqueda diferida de 350 ms y chips quitables; entrada escalonada y conteo de cifras con reduced-motion (globals.css, Cifras.tsx); celebración en hitos no aplica. Heurística 7: sin atajos de teclado, solo defaults (casilla de enviar acceso marcada). Reenviar acceso no pide confirmación y no tiene deshacer (es de bajo riesgo). Ficha: azul #226697 y radios coinciden; tipografía Sora/Inter Tight no se pudo verificar con certeza en el screenshot.
