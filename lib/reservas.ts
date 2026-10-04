// Datos y reglas de la app interna. Hoy se guardan en el navegador (localStorage) con datos de ejemplo;
// al conectar la base de datos (servicios externos) este módulo es lo único que cambia de fuente.
// Reglas de alertas definidas por el usuario (2026-09-29 / 2026-10-03):
// - Pendiente de alta: desde la compra; límite 30 días desde la compra (Archer).
// - Pendiente de pago: hasta 18 meses después de la fecha de viaje; dorado con ≤5 días, rojo si venció.
// - Salida de viajeros: 2 días antes hasta el día de salida.
// - Solicitud de revisión: desde 60 días después del viaje hasta 18 meses.
// - Pago pendiente del cliente: fecha y cantidad para completar la reserva.

import { useSyncExternalStore } from 'react';
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

// ───────────────────────── datos de ejemplo ─────────────────────────

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function rel(hoy: Date, dias: number): string {
  return iso(sumarDias(hoy, dias));
}

export function semilla(hoy: Date = new Date()): Reserva[] {
  const base = hoy.getTime();
  const mk = (i: number, r: Omit<Reserva, 'id' | 'creada'>): Reserva => ({ ...r, id: `demo-${i}`, creada: base - i * 3_600_000 });
  return [
    mk(1, { cliente: 'Marcos y Ana', contacto: '55 4402 9981', destino: 'Caribe', tipo: 'Crucero', proveedor: 'Royal Caribbean', precioVenta: 2860, comision: 286, moneda: 'USD', fechaCompra: rel(hoy, -26), fechaViaje: rel(hoy, 34), comentarios: 'Aniversario', estatus: 'pendiente_alta', pagoPendienteFecha: rel(hoy, 4), pagoPendienteMonto: 900 }),
    mk(2, { cliente: 'Luis Peña', contacto: '55 1234 5678', destino: 'Miami', tipo: 'Crucero', proveedor: 'Royal Caribbean', precioVenta: 3440, comision: 344, moneda: 'USD', fechaCompra: rel(hoy, -3), fechaViaje: rel(hoy, 20), comentarios: 'Regalo de bienvenida pendiente', estatus: 'pendiente_alta' }),
    mk(3, { cliente: 'Andrea Soto', contacto: '55 8821 0043', destino: 'Cancún', tipo: 'Paquete', proveedor: 'Apple Vacations', precioVenta: 1800, comision: 180, moneda: 'USD', fechaCompra: rel(hoy, -72), fechaViaje: rel(hoy, 2), comentarios: 'Pidió cuarto con vista al mar', estatus: 'pendiente_pago' }),
    mk(4, { cliente: 'Familia Rojas', contacto: '33 1450 7789', destino: 'Cancún', tipo: 'Paquete', proveedor: 'Apple Vacations', precioVenta: 4120, comision: 412, moneda: 'USD', fechaCompra: rel(hoy, -50), fechaViaje: rel(hoy, 11), comentarios: '4 personas', estatus: 'pendiente_pago' }),
    mk(5, { cliente: 'Sofía Delgado', contacto: '55 6600 2318', destino: 'Roma', tipo: 'Circuito', proveedor: 'Europamundo', precioVenta: 1980, comision: 198, moneda: 'USD', fechaCompra: rel(hoy, -150), fechaViaje: rel(hoy, -92), comentarios: '', estatus: 'solicitar_revision' }),
    mk(6, { cliente: 'Grupo Herrera', contacto: '222 310 4477', destino: 'Punta Cana', tipo: 'Hotel', proveedor: 'Dreams Resorts', precioVenta: 5300, comision: 530, moneda: 'USD', fechaCompra: rel(hoy, -140), fechaViaje: rel(hoy, -80), comentarios: '12 personas', estatus: 'pagado' }),
    mk(7, { cliente: 'Karina Ortiz', contacto: '81 2390 1156', destino: 'Orlando', tipo: 'Paquete', proveedor: 'Delta Vacations', precioVenta: 2150, comision: 215, moneda: 'USD', fechaCompra: rel(hoy, -620), fechaViaje: rel(hoy, -575), comentarios: '', estatus: 'pendiente_pago' }),
    mk(8, { cliente: 'Daniela Cruz', contacto: '55 7712 0090', destino: 'Los Cabos', tipo: 'Hotel', proveedor: 'Marriott', precioVenta: 18500, comision: 1850, moneda: 'MXN', fechaCompra: rel(hoy, -20), fechaViaje: rel(hoy, 75), comentarios: 'Luna de miel', estatus: 'pendiente_pago', pagoPendienteFecha: rel(hoy, 25), pagoPendienteMonto: 6000 }),
    mk(9, { cliente: 'Hugo Ramírez', contacto: '56 9904 3311', destino: 'Madrid', tipo: 'Vuelo', proveedor: 'Iberia', precioVenta: 1290, comision: 96, moneda: 'USD', fechaCompra: rel(hoy, -400), fechaViaje: rel(hoy, -330), comentarios: '', estatus: 'solicitar_revision' }),
  ];
}

// ───────────────────────── almacén local ─────────────────────────

const CLAVE = 'cg_reservas_v1';
interface Estado {
  reservas: Reserva[] | null; // null = aún no leído (servidor / primer render)
  demo: boolean;
}

let estado: Estado = { reservas: null, demo: false };
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((f) => f());
}

function guardar() {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ reservas: estado.reservas, demo: estado.demo }));
  } catch {
    /* sin almacenamiento: queda en memoria durante la sesión */
  }
}

function reservaDelOnboarding(): Reserva | null {
  try {
    const crudo = window.localStorage.getItem('cg_onboarding_v1');
    if (!crudo) return null;
    const e = JSON.parse(crudo);
    const r = e?.reserva;
    if (!r?.cliente || !r?.compra || !r?.viaje || r.cliente === 'Cliente de ejemplo') return null;
    return {
      id: 'onboarding-1',
      cliente: r.cliente,
      contacto: '',
      destino: r.destino,
      tipo: 'Otro',
      proveedor: r.proveedor ?? '',
      precioVenta: 0,
      comision: Number(r.comision) || 0,
      moneda: r.moneda === 'MXN' ? 'MXN' : 'USD',
      fechaCompra: r.compra,
      fechaViaje: r.viaje,
      comentarios: 'Registrada en el cuestionario',
      estatus: 'pendiente_alta',
      creada: Date.now(),
    };
  } catch {
    return null;
  }
}

export function cargarInicial() {
  if (estado.reservas !== null || typeof window === 'undefined') return;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const p = JSON.parse(crudo);
      if (Array.isArray(p.reservas)) {
        estado = { reservas: p.reservas, demo: Boolean(p.demo) };
        emitir();
        return;
      }
    }
  } catch {
    /* datos dañados: se reinicia con la semilla */
  }
  const propia = reservaDelOnboarding();
  estado = { reservas: [...(propia ? [propia] : []), ...semilla()], demo: true };
  guardar();
  emitir();
}

const snapshotServidor: Estado = { reservas: null, demo: false };

function suscribir(f: () => void) {
  oyentes.add(f);
  cargarInicial();
  return () => oyentes.delete(f);
}

export function useReservas() {
  const s = useSyncExternalStore(suscribir, () => estado, () => snapshotServidor);
  return {
    listo: s.reservas !== null,
    reservas: s.reservas ?? [],
    esDemo: (s.reservas ?? []).some((r) => r.id.startsWith('demo-')),
    agregar(r: Omit<Reserva, 'id' | 'creada'>) {
      const nueva: Reserva = { ...r, id: `r-${Date.now().toString(36)}`, creada: Date.now() };
      estado = { ...estado, reservas: [nueva, ...(estado.reservas ?? [])] };
      guardar();
      emitir();
      return nueva;
    },
    actualizar(id: string, parcial: Partial<Reserva>) {
      estado = { ...estado, reservas: (estado.reservas ?? []).map((r) => (r.id === id ? { ...r, ...parcial } : r)) };
      guardar();
      emitir();
    },
    empezarLimpio() {
      // quita solo los datos de ejemplo: las reservas que registró o importó la persona se conservan
      estado = { reservas: (estado.reservas ?? []).filter((r) => !r.id.startsWith('demo-')), demo: false };
      guardar();
      emitir();
    },
    restaurarEjemplo() {
      estado = { reservas: semilla(), demo: true };
      guardar();
      emitir();
    },
  };
}
