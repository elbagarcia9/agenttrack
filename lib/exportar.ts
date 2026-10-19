// Exportación a Excel (el camino inverso de la importación): tus reservas se descargan en un .xlsx con los mismos
// encabezados que acepta "Importar Excel", así que lo que sacas hoy lo puedes volver a meter mañana.
// Todo se arma en el navegador: el archivo no pasa por ningún servidor.

import writeXlsxFile, { type SheetData } from 'write-excel-file/browser';
import { CAMPOS } from './importar';
import { parseFecha } from './plazos';
import { ETIQUETA_ESTATUS, type Reserva } from './reservas-reglas';

type Celda = string | number | Date | null;

// Las fechas van a las 12:00 UTC: así Excel muestra el mismo día en cualquier zona horaria (a medianoche local se corría un día)
function fechaExcel(valor: string): Date | null {
  const d = parseFecha(valor);
  return d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)) : null;
}

function valorDe(r: Reserva, campo: (typeof CAMPOS)[number]['id']): Celda {
  switch (campo) {
    case 'cliente':
      return r.cliente;
    case 'destino':
      return r.destino;
    case 'comision':
      return r.comision;
    case 'fechaViaje':
      return fechaExcel(r.fechaViaje);
    case 'fechaCompra':
      return fechaExcel(r.fechaCompra);
    case 'proveedor':
      return r.proveedor || null;
    case 'tipo':
      return r.tipo;
    case 'precioVenta':
      return r.precioVenta;
    case 'moneda':
      return r.moneda;
    case 'contacto':
      return r.contacto || null;
    case 'estatus':
      return ETIQUETA_ESTATUS[r.estatus];
    case 'pagoPendienteFecha':
      return r.pagoPendienteFecha ? fechaExcel(r.pagoPendienteFecha) : null;
    case 'pagoPendienteMonto':
      return r.pagoPendienteMonto ?? null;
    case 'comentarios':
      return r.comentarios || null;
  }
}

const ESQUINA = { fontWeight: 'bold' as const, backgroundColor: '#e6eef4' };

export async function descargarReservasExcel(reservas: Reserva[]): Promise<number> {
  // Los datos de ejemplo no son de la persona: no se exportan
  const propias = reservas.filter((r) => !r.id.startsWith('demo-'));
  const encabezados: SheetData[number] = CAMPOS.map((c) => ({ value: c.etiqueta, ...ESQUINA }));
  const filas: SheetData = propias.map((r) =>
    CAMPOS.map((c) => {
      const v = valorDe(r, c.id);
      if (v instanceof Date) return { value: v, type: Date, format: 'dd/mm/yyyy' };
      return v;
    }),
  );
  const columnas = CAMPOS.map((c) => ({ width: c.id === 'comentarios' ? 40 : c.id === 'cliente' || c.id === 'destino' ? 24 : 16 }));
  const hoy = new Date();
  const nombre = `AgentTrack-reservas-${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}.xlsx`;
  await writeXlsxFile([encabezados, ...filas], { columns: columnas, sheet: 'Reservas', stickyRowsCount: 1 }).toFile(nombre);
  return propias.length;
}
