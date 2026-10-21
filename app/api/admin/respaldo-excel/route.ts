// RESPALDO EN EXCEL: tus clientas, sus pagos y sus reservas en un .xlsx fácil de leer. Solo lo puede pedir la dueña.
// (El respaldo completo para restaurar es el .json; este es para mirar los datos.)

import { NextResponse } from 'next/server';
import writeXlsxFile, { type SheetData } from 'write-excel-file/node';
import { dentroDelLimite } from '@/lib/eventos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { exigirAdmin } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Fila = Record<string, unknown>;
type Celda = string | number | Date | null;

const ENCABEZADO = { fontWeight: 'bold' as const, backgroundColor: '#e6eef4' };

async function leerTodo(tabla: string, orden: string): Promise<Fila[]> {
  const sb = supabaseServicio();
  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from(tabla).select('*').order(orden, { ascending: true }).range(desde, desde + 999);
    if (error) throw new Error(tabla);
    filas.push(...((data ?? []) as Fila[]));
    if (!data || data.length < 1000) break;
  }
  return filas;
}

const texto = (v: unknown): Celda => (v === null || v === undefined || v === '' ? null : String(v));
const numero = (v: unknown): Celda => (v === null || v === undefined || v === '' ? null : Number(v));
function fecha(v: unknown): Celda {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function hoja(nombre: string, encabezados: string[], filas: Celda[][], anchos: number[]) {
  const cabecera: SheetData[number] = encabezados.map((value) => ({ value, ...ENCABEZADO }));
  const cuerpo: SheetData = filas.map((fila) => fila.map((v) => (v instanceof Date ? { value: v, type: Date, format: 'dd/mm/yyyy' } : v)));
  return { data: [cabecera, ...cuerpo], sheet: nombre, columns: anchos.map((width) => ({ width })), stickyRowsCount: 1 };
}

export async function GET() {
  const { user } = await exigirAdmin(); // 404 para quien no sea la dueña
  if (!servicioConfigurado()) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  if (!dentroDelLimite(`respaldo:${user.id}`, 5)) return NextResponse.json({ error: 'Muchas descargas seguidas. Espera un minuto.' }, { status: 429 });

  let perfiles: Fila[], pagos: Fila[], reservas: Fila[];
  try {
    [perfiles, pagos, reservas] = await Promise.all([leerTodo('perfiles', 'creado_en'), leerTodo('payment_transactions', 'occurred_at'), leerTodo('reservas', 'creada_en')]);
  } catch {
    return NextResponse.json({ error: 'No pudimos leer los datos. Inténtalo de nuevo.' }, { status: 500 });
  }
  const correoDe = new Map(perfiles.map((p) => [String(p.id), String(p.email ?? '')]));

  const clientas = hoja(
    'Clientas',
    ['Correo', 'Nombre', 'Rol', 'Cuenta', 'Membresía', 'Ciclo', 'Origen', 'Se registró', 'Último acceso', 'Primer pago', 'Fin de prueba', 'Cancelada', 'Acceso regalado', 'Regalo hasta'],
    perfiles.map((p) => [texto(p.email), texto(p.nombre), texto(p.rol), p.estado === 'activo' ? 'encendida' : p.estado === 'desactivado' ? 'apagada' : texto(p.estado), texto(p.membresia), texto(p.ciclo), texto(p.fuente), fecha(p.creado_en), fecha(p.ultimo_acceso), fecha(p.first_paid_at), fecha(p.trial_ends_at), fecha(p.cancelado_en), texto(p.acceso_tipo), fecha(p.acceso_hasta)]),
    [30, 22, 10, 12, 14, 10, 12, 14, 14, 14, 14, 14, 16, 14],
  );
  const pagosHoja = hoja(
    'Pagos',
    ['Fecha', 'Correo del comprador', 'Tipo', 'Ciclo', 'Monto', 'Moneda', 'Comisión Hotmart', 'Impuestos', 'Origen', 'Transacción'],
    pagos.map((t) => [fecha(t.occurred_at), texto(t.buyer_email), texto(t.economic_kind), texto(t.ciclo), numero(t.amount_minor) === null ? null : Number(t.amount_minor) / 100, texto(t.currency), numero(t.provider_fee_minor) === null ? null : Number(t.provider_fee_minor) / 100, numero(t.tax_minor) === null ? null : Number(t.tax_minor) / 100, texto(t.source), texto(t.transaction_id)]),
    [14, 30, 12, 10, 12, 10, 16, 12, 12, 26],
  );
  const reservasHoja = hoja(
    'Reservas',
    ['Agente (correo)', 'Cliente', 'Destino', 'Tipo', 'Proveedor', 'Precio de venta', 'Comisión', 'Moneda', 'Compra', 'Viaje', 'Pago pendiente (fecha)', 'Pago pendiente (monto)', 'Estatus', 'Comentarios'],
    reservas.map((r) => [correoDe.get(String(r.user_id)) ?? null, texto(r.cliente), texto(r.destino), texto(r.tipo), texto(r.proveedor), numero(r.precio_venta), numero(r.comision), texto(r.moneda), fecha(r.fecha_compra), fecha(r.fecha_viaje), fecha(r.pago_pendiente_fecha), numero(r.pago_pendiente_monto), texto(r.estatus), texto(r.comentarios)]),
    [28, 22, 18, 14, 18, 14, 12, 10, 14, 14, 18, 18, 18, 36],
  );

  const buffer = await writeXlsxFile([clientas, pagosHoja, reservasHoja]).toBuffer();
  const dia = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="AgentTrack-datos-${dia}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
