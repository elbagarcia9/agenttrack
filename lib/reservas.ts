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
import { semilla } from './reservas-reglas';
import { TIPOS, type Estatus, type Moneda, type Reserva, type Tipo } from './reservas-reglas';

export * from './reservas-reglas';

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
      contacto: r.contacto ?? '',
      destino: r.destino,
      tipo: (TIPOS as readonly string[]).includes(r.tipo) ? (r.tipo as Tipo) : 'Otro',
      proveedor: r.proveedor ?? '',
      precioVenta: Number(r.precioVenta) || 0,
      comision: Number(r.comision) || 0,
      moneda: r.moneda === 'MXN' ? 'MXN' : 'USD',
      fechaCompra: r.compra,
      fechaViaje: r.viaje,
      ...(r.pagoFecha && Number(r.pagoMonto) > 0 ? { pagoPendienteFecha: r.pagoFecha, pagoPendienteMonto: Number(r.pagoMonto) } : {}),
      comentarios: r.comentarios?.trim() || 'Registrada en el cuestionario',
      estatus: ['pagado', 'pendiente_alta', 'pendiente_pago', 'solicitar_revision'].includes(r.estatus) ? (r.estatus as Estatus) : 'pendiente_alta',
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
