// Datos y reglas de la app interna. Con cuenta (Supabase configurado) las reservas viven en la tabla `reservas`
// protegida por RLS; sin Supabase (modo local) se guardan en el navegador (localStorage). Los datos de ejemplo
// (`demo-*`) NUNCA se suben a la base: solo existen en pantalla.
// Reglas de alertas definidas por el usuario (2026-09-29 / 2026-10-03):
// - Pendiente de alta: desde la compra; límite 30 días desde la compra (Archer).
// - Pendiente de pago: hasta 18 meses después de la fecha de viaje; dorado con ≤5 días, rojo si venció.
// - Salida de viajeros: 2 días antes hasta el día de salida.
// - Solicitud de revisión: desde 60 días después del viaje hasta 18 meses.
// - Pago pendiente del cliente: fecha y cantidad para completar la reserva.

import { useSyncExternalStore } from 'react';
import { AUTH_LOCAL } from './auth';
import { supabaseNavegador } from './supabase/client';
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

// ───────────────────────── almacén (local o Supabase) ─────────────────────────

const CLAVE = 'cg_reservas_v1';
const CLAVE_DEMO_OFF = 'cg_demo_off'; // con cuenta: la persona ya quitó los datos de ejemplo
const CLAVE_ONB_SUBIDA = 'cg_onb_subida'; // con cuenta: la reserva del cuestionario ya se guardó en la base
const MSG_ERROR_GUARDAR = 'No pudimos guardar el cambio. Revisa tu conexión e inténtalo de nuevo.';
const MSG_ERROR_CARGAR = 'No pudimos cargar tus reservas. Revisa tu conexión y recarga la página.';

interface Estado {
  reservas: Reserva[] | null; // null = aún no leído (servidor / primer render)
  demo: boolean;
  error: string | null;
}

let estado: Estado = { reservas: null, demo: false, error: null };
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((f) => f());
}

function leerFlag(clave: string): boolean {
  try {
    return window.localStorage.getItem(clave) === '1';
  } catch {
    return false;
  }
}
function escribirFlag(clave: string, valor: boolean) {
  try {
    window.localStorage.setItem(clave, valor ? '1' : '0');
  } catch {
    /* sin almacenamiento: solo dura esta sesión */
  }
}

function guardarLocal() {
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

// ── traducción entre la reserva de la app y la fila de la tabla ──

interface Fila {
  id: string;
  cliente: string;
  contacto: string;
  destino: string;
  tipo: Tipo;
  proveedor: string;
  precio_venta: number | string;
  comision: number | string;
  moneda: Moneda;
  fecha_compra: string;
  fecha_viaje: string;
  pago_pendiente_fecha: string | null;
  pago_pendiente_monto: number | string | null;
  comentarios: string;
  estatus: Estatus;
  creada_en: string;
}

function deFila(f: Fila): Reserva {
  return {
    id: f.id,
    cliente: f.cliente,
    contacto: f.contacto,
    destino: f.destino,
    tipo: f.tipo,
    proveedor: f.proveedor,
    precioVenta: Number(f.precio_venta),
    comision: Number(f.comision),
    moneda: f.moneda,
    fechaCompra: f.fecha_compra,
    fechaViaje: f.fecha_viaje,
    pagoPendienteFecha: f.pago_pendiente_fecha ?? undefined,
    pagoPendienteMonto: f.pago_pendiente_monto == null ? undefined : Number(f.pago_pendiente_monto),
    comentarios: f.comentarios,
    estatus: f.estatus,
    creada: new Date(f.creada_en).getTime(),
  };
}

const COLUMNAS: [keyof Reserva, string][] = [
  ['id', 'id'],
  ['cliente', 'cliente'],
  ['contacto', 'contacto'],
  ['destino', 'destino'],
  ['tipo', 'tipo'],
  ['proveedor', 'proveedor'],
  ['precioVenta', 'precio_venta'],
  ['comision', 'comision'],
  ['moneda', 'moneda'],
  ['fechaCompra', 'fecha_compra'],
  ['fechaViaje', 'fecha_viaje'],
  ['pagoPendienteFecha', 'pago_pendiente_fecha'],
  ['pagoPendienteMonto', 'pago_pendiente_monto'],
  ['comentarios', 'comentarios'],
  ['estatus', 'estatus'],
];

// Solo incluye los campos presentes; un campo en `undefined` se guarda como vacío (null).
// Las altas en lote llevan siempre las mismas columnas (así el envío múltiple no falla).
function aFila(r: Partial<Reserva>): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  for (const [campo, columna] of COLUMNAS) {
    if (campo in r) fila[columna] = r[campo] === undefined ? null : r[campo];
  }
  return fila;
}
function aFilaCompleta(r: Reserva): Record<string, unknown> {
  const fila: Record<string, unknown> = {};
  for (const [campo, columna] of COLUMNAS) fila[columna] = r[campo] === undefined ? null : r[campo];
  return fila;
}

const esEjemplo = (id: string) => id.startsWith('demo-');

async function cargarRemoto() {
  const sb = supabaseNavegador();
  const { data, error } = await sb.from('reservas').select('*').order('creada_en', { ascending: false });
  if (error) {
    estado = { reservas: [], demo: false, error: MSG_ERROR_CARGAR };
    emitir();
    return;
  }
  let filas = (data ?? []) as Fila[];
  // Primera vez: la reserva que la persona escribió en el cuestionario pasa a su cuenta
  const propia = reservaDelOnboarding();
  if (filas.length === 0 && propia && !leerFlag(CLAVE_ONB_SUBIDA)) {
    const nueva = { ...propia, id: crypto.randomUUID() };
    const { data: subida, error: errSubida } = await sb.from('reservas').insert(aFilaCompleta(nueva)).select('*');
    if (!errSubida && subida) {
      filas = subida as Fila[];
      escribirFlag(CLAVE_ONB_SUBIDA, true);
    }
  }
  const mostrarEjemplo = !leerFlag(CLAVE_DEMO_OFF);
  estado = { reservas: [...filas.map(deFila), ...(mostrarEjemplo ? semilla() : [])], demo: mostrarEjemplo, error: null };
  emitir();
}

export function cargarInicial() {
  if (estado.reservas !== null || typeof window === 'undefined') return;
  if (!AUTH_LOCAL) {
    void cargarRemoto();
    return;
  }
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const p = JSON.parse(crudo);
      if (Array.isArray(p.reservas)) {
        estado = { reservas: p.reservas, demo: Boolean(p.demo), error: null };
        emitir();
        return;
      }
    }
  } catch {
    /* datos dañados: se reinicia con la semilla */
  }
  const propia = reservaDelOnboarding();
  estado = { reservas: [...(propia ? [propia] : []), ...semilla()], demo: true, error: null };
  guardarLocal();
  emitir();
}

const snapshotServidor: Estado = { reservas: null, demo: false, error: null };

let cargaIniciada = false;
function suscribir(f: () => void) {
  oyentes.add(f);
  if (AUTH_LOCAL || !cargaIniciada) {
    cargaIniciada = true;
    cargarInicial();
  }
  return () => oyentes.delete(f);
}

// Altas con cuenta: se juntan unos milisegundos y se mandan en un solo envío (una importación de Excel no hace cientos de pedidos)
let pendientes: Reserva[] = [];
let temporizador: ReturnType<typeof setTimeout> | null = null;

function encolar(r: Reserva) {
  pendientes.push(r);
  if (!temporizador) temporizador = setTimeout(vaciarPendientes, 60);
}

async function vaciarPendientes() {
  temporizador = null;
  const lote = pendientes;
  pendientes = [];
  if (lote.length === 0) return;
  const { error } = await supabaseNavegador().from('reservas').insert(lote.map(aFilaCompleta));
  if (error) {
    const ids = new Set(lote.map((r) => r.id));
    estado = { ...estado, reservas: (estado.reservas ?? []).filter((r) => !ids.has(r.id)), error: MSG_ERROR_GUARDAR };
    emitir();
  }
}

export function useReservas() {
  const s = useSyncExternalStore(suscribir, () => estado, () => snapshotServidor);
  return {
    listo: s.reservas !== null,
    reservas: s.reservas ?? [],
    esDemo: (s.reservas ?? []).some((r) => esEjemplo(r.id)),
    error: s.error,
    descartarError() {
      estado = { ...estado, error: null };
      emitir();
    },
    agregar(r: Omit<Reserva, 'id' | 'creada'>) {
      const nueva: Reserva = AUTH_LOCAL
        ? { ...r, id: `r-${Date.now().toString(36)}`, creada: Date.now() }
        : { ...r, id: crypto.randomUUID(), creada: Date.now() };
      estado = { ...estado, reservas: [nueva, ...(estado.reservas ?? [])] };
      if (AUTH_LOCAL) guardarLocal();
      else encolar(nueva);
      emitir();
      return nueva;
    },
    actualizar(id: string, parcial: Partial<Reserva>) {
      const antes = (estado.reservas ?? []).find((r) => r.id === id);
      estado = { ...estado, reservas: (estado.reservas ?? []).map((r) => (r.id === id ? { ...r, ...parcial } : r)) };
      emitir();
      if (AUTH_LOCAL) {
        guardarLocal();
        return;
      }
      if (esEjemplo(id) || !antes) return;
      void (async () => {
        const { error } = await supabaseNavegador().from('reservas').update(aFila(parcial)).eq('id', id);
        if (error) {
          estado = { ...estado, reservas: (estado.reservas ?? []).map((r) => (r.id === id ? antes : r)), error: MSG_ERROR_GUARDAR };
          emitir();
        }
      })();
    },
    empezarLimpio() {
      // quita solo los datos de ejemplo: las reservas que registró o importó la persona se conservan
      if (!AUTH_LOCAL) escribirFlag(CLAVE_DEMO_OFF, true);
      estado = { ...estado, reservas: (estado.reservas ?? []).filter((r) => !esEjemplo(r.id)), demo: false };
      if (AUTH_LOCAL) guardarLocal();
      emitir();
    },
    restaurarEjemplo() {
      if (AUTH_LOCAL) {
        estado = { ...estado, reservas: semilla(), demo: true };
        guardarLocal();
      } else {
        escribirFlag(CLAVE_DEMO_OFF, false);
        const reales = (estado.reservas ?? []).filter((r) => !esEjemplo(r.id));
        estado = { ...estado, reservas: [...reales, ...semilla()], demo: true };
      }
      emitir();
    },
  };
}
