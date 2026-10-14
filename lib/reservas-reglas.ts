// Reglas puras de reservas y alertas (sin nada del navegador): las usan la app y los correos del servidor.
// Reglas de alertas definidas por el usuario (2026-09-29 / 2026-10-03):
// - Pendiente de alta: desde la compra; límite 30 días desde la compra (Archer).
// - Pendiente de pago: hasta 18 meses después de la fecha de viaje; dorado con ≤5 días, rojo si venció.
// - Salida de viajeros: 2 días antes hasta el día de salida.
// - Solicitud de revisión: desde 60 días después del viaje hasta 18 meses.
// - Pago pendiente del cliente: fecha y cantidad para completar la reserva.

import { diasRestantes, estadoSemaforo, parseFecha, sumarDias, sumarMeses, type EstadoSemaforo } from './plazos';

export type Estatus = 'pagado' | 'pendiente_alta' | 'pendiente_pago' | 'solicitar_revision';
export type Moneda = 'USD' | 'MXN';
export const TIPOS = ['Paquete', 'Crucero', 'Hotel', 'Vuelo', 'Circuito', 'Otro'] as const;
export type Tipo = (typeof TIPOS)[number];

export const ETIQUETA_ESTATUS: Record<Estatus, string> = {
  pagado: 'Pagado',
  pendiente_alta: 'Pendiente de alta',
  pendiente_pago: 'Pendiente de pago',
  solicitar_revision: 'Solicitar revisión',
};

export interface Reserva {
  id: string;
  cliente: string;
  contacto: string;
  destino: string;
  tipo: Tipo;
  proveedor: string;
  precioVenta: number;
  comision: number;
  moneda: Moneda;
  fechaCompra: string; // YYYY-MM-DD
  fechaViaje: string; // YYYY-MM-DD
  pagoPendienteFecha?: string;
  pagoPendienteMonto?: number;
  comentarios: string;
  estatus: Estatus;
  creada: number;
}

export type TipoAlerta = 'alta' | 'pago_cliente' | 'salida' | 'revision' | 'reclamo';
export type Severidad = 'vencido' | 'urgente' | 'normal' | 'info';

export interface Alerta {
  id: string;
  reservaId: string;
  tipo: TipoAlerta;
  titulo: string;
  detalle: string;
  fecha: Date;
  severidad: Severidad;
}

// ───────────────────────── alertas ─────────────────────────

function severidadPlazo(limite: Date, hoy: Date): Severidad {
  const e: EstadoSemaforo = estadoSemaforo(limite, hoy);
  return e === 'vencido' ? 'vencido' : e === 'urgente' ? 'urgente' : 'normal';
}

export function alertasDe(r: Reserva, hoy: Date = new Date()): Alerta[] {
  const compra = parseFecha(r.fechaCompra);
  const viaje = parseFecha(r.fechaViaje);
  if (!compra || !viaje) return [];
  const salida: Alerta[] = [];
  const reclamo = sumarMeses(viaje, 18);

  if (r.estatus === 'pendiente_alta') {
    const limite = sumarDias(compra, 30);
    salida.push({
      id: `${r.id}-alta`,
      reservaId: r.id,
      tipo: 'alta',
      titulo: `Dar de alta · ${r.cliente}`,
      detalle: 'Súbela al portal de tu agencia: 30 días desde la compra.',
      fecha: limite,
      severidad: severidadPlazo(limite, hoy),
    });
  }

  if (r.pagoPendienteFecha && r.pagoPendienteMonto) {
    const f = parseFecha(r.pagoPendienteFecha);
    if (f) {
      salida.push({
        id: `${r.id}-pago_cliente`,
        reservaId: r.id,
        tipo: 'pago_cliente',
        titulo: `Pago del cliente · ${r.cliente}`,
        detalle: `Debe completar ${r.pagoPendienteMonto.toLocaleString('en-US')} ${r.moneda} para la reserva.`,
        fecha: f,
        severidad: severidadPlazo(f, hoy),
      });
    }
  }

  const diasParaViaje = diasRestantes(viaje, hoy);
  if (diasParaViaje >= 0 && diasParaViaje <= 2) {
    salida.push({
      id: `${r.id}-salida`,
      reservaId: r.id,
      tipo: 'salida',
      titulo: `${r.cliente} ${diasParaViaje === 0 ? 'sale hoy' : diasParaViaje === 1 ? 'sale mañana' : 'sale en 2 días'}`,
      detalle: `${r.destino}. Está al pendiente y acompáñalo.`,
      fecha: viaje,
      severidad: 'info',
    });
  }

  if (r.estatus !== 'pagado') {
    const inicioRevision = sumarDias(viaje, 60);
    const enVentanaRevision = hoy.getTime() >= inicioRevision.getTime() && diasRestantes(reclamo, hoy) >= 0;
    const sev = severidadPlazo(reclamo, hoy);
    if (sev === 'vencido') {
      salida.push({
        id: `${r.id}-reclamo`,
        reservaId: r.id,
        tipo: 'reclamo',
        titulo: `Plazo vencido · ${r.cliente}`,
        detalle: 'Pasaron 18 meses del viaje. Consulta con tu agencia si aún puedes gestionarla.',
        fecha: reclamo,
        severidad: 'vencido',
      });
    } else if (enVentanaRevision) {
      salida.push({
        id: `${r.id}-revision`,
        reservaId: r.id,
        tipo: 'revision',
        titulo: `Pregunta por tu pago · ${r.cliente}`,
        detalle: sev === 'urgente' ? 'Quedan pocos días del plazo de 18 meses para reclamar.' : 'Ya pasaron 60 días del viaje: puedes pedir revisión.',
        fecha: reclamo,
        severidad: sev,
      });
    } else if (sev === 'urgente') {
      salida.push({
        id: `${r.id}-reclamo`,
        reservaId: r.id,
        tipo: 'reclamo',
        titulo: `Último plazo para reclamar · ${r.cliente}`,
        detalle: 'Quedan pocos días del plazo de 18 meses.',
        fecha: reclamo,
        severidad: 'urgente',
      });
    }
  }
  return salida;
}

const ORDEN: Record<Severidad, number> = { vencido: 0, urgente: 1, normal: 2, info: 3 };

export function todasLasAlertas(reservas: Reserva[], hoy: Date = new Date()): Alerta[] {
  return reservas
    .flatMap((r) => alertasDe(r, hoy))
    .sort((a, b) => ORDEN[a.severidad] - ORDEN[b.severidad] || a.fecha.getTime() - b.fecha.getTime());
}

// ───────────────────────── totales ─────────────────────────

export interface Totales {
  porCobrar: Record<Moneda, number>;
  porDarDeAlta: number;
  porCobrarN: number;
  enRevision: number;
  activas: number;
}

export function totales(reservas: Reserva[], hoy: Date = new Date()): Totales {
  const t: Totales = { porCobrar: { USD: 0, MXN: 0 }, porDarDeAlta: 0, porCobrarN: 0, enRevision: 0, activas: 0 };
  for (const r of reservas) {
    if (r.estatus === 'pagado') continue;
    const viaje = parseFecha(r.fechaViaje);
    if (viaje && diasRestantes(sumarMeses(viaje, 18), hoy) < 0) continue; // plazo vencido: ya no cuenta como por cobrar
    t.porCobrar[r.moneda] += r.comision;
    t.activas += 1;
    if (r.estatus === 'pendiente_alta') t.porDarDeAlta += 1;
    if (r.estatus === 'pendiente_pago') t.porCobrarN += 1;
    if (r.estatus === 'solicitar_revision') t.enRevision += 1;
  }
  return t;
}

export function formatoDinero(valor: number, moneda: Moneda): string {
  return `$${valor.toLocaleString('en-US')} ${moneda}`;
}

