// Importación de Excel/CSV (Fase 1). Todo se procesa en el navegador: el archivo no se sube a ningún servidor.
// 1) leer filas · 2) detectar encabezados · 3) sugerir qué columna es cada campo · 4) convertir y validar cada fila.

import { TIPOS, type Estatus, type Moneda, type Reserva, type Tipo } from './reservas';

export type Celda = string | number | boolean | Date | null | undefined;
export type Fila = Celda[];

export type Campo =
  | 'cliente'
  | 'destino'
  | 'comision'
  | 'fechaViaje'
  | 'fechaCompra'
  | 'contacto'
  | 'tipo'
  | 'proveedor'
  | 'precioVenta'
  | 'moneda'
  | 'estatus'
  | 'pagoPendienteFecha'
  | 'pagoPendienteMonto'
  | 'comentarios';

export const CAMPOS: { id: Campo; etiqueta: string; obligatorio: boolean }[] = [
  { id: 'cliente', etiqueta: 'Cliente', obligatorio: true },
  { id: 'destino', etiqueta: 'Destino', obligatorio: true },
  { id: 'comision', etiqueta: 'Comisión', obligatorio: true },
  { id: 'fechaViaje', etiqueta: 'Fecha de viaje', obligatorio: true },
  { id: 'fechaCompra', etiqueta: 'Fecha de compra', obligatorio: false },
  { id: 'proveedor', etiqueta: 'Proveedor', obligatorio: false },
  { id: 'tipo', etiqueta: 'Tipo de reserva', obligatorio: false },
  { id: 'precioVenta', etiqueta: 'Precio de venta', obligatorio: false },
  { id: 'moneda', etiqueta: 'Moneda', obligatorio: false },
  { id: 'contacto', etiqueta: 'Contacto', obligatorio: false },
  { id: 'estatus', etiqueta: 'Estatus (pagado, pendiente…)', obligatorio: false },
  { id: 'pagoPendienteFecha', etiqueta: 'Fecha de pago pendiente', obligatorio: false },
  { id: 'pagoPendienteMonto', etiqueta: 'Cantidad de pago pendiente', obligatorio: false },
  { id: 'comentarios', etiqueta: 'Comentarios', obligatorio: false },
];

// Nombres con los que la gente suele llamar a cada columna (sin acentos, en minúsculas).
const SINONIMOS: Record<Campo, string[]> = {
  cliente: ['cliente', 'nombre', 'pasajero', 'pax', 'titular', 'viajero', 'nombre del cliente', 'nombre cliente', 'huesped'],
  destino: ['destino', 'lugar', 'ciudad', 'viaje a', 'hacia', 'destination'],
  comision: ['comision', 'comisión', 'mi comision', 'comision esperada', 'ganancia', 'commission', 'comm', 'comision usd', 'comision mxn'],
  fechaViaje: ['fecha de viaje', 'fecha viaje', 'salida', 'fecha de salida', 'inicio de viaje', 'fecha inicio', 'viaje', 'travel date', 'check in', 'fecha del viaje'],
  fechaCompra: ['fecha de compra', 'fecha compra', 'fecha de venta', 'fecha venta', 'compra', 'reservado', 'fecha de reserva', 'booking date', 'fecha reserva', 'venta'],
  contacto: ['contacto', 'telefono', 'celular', 'whatsapp', 'tel', 'correo', 'email', 'movil', 'phone'],
  tipo: ['tipo', 'tipo de reserva', 'categoria', 'servicio', 'producto'],
  proveedor: ['proveedor', 'operador', 'mayorista', 'supplier', 'vendor', 'aerolinea', 'naviera', 'hotel', 'empresa'],
  precioVenta: ['precio', 'precio de venta', 'precio venta', 'total', 'monto', 'costo', 'importe', 'venta total', 'monto total', 'price'],
  moneda: ['moneda', 'divisa', 'currency'],
  estatus: ['estatus', 'estado', 'status', 'pagado', 'pago', 'situacion'],
  pagoPendienteFecha: ['fecha pago pendiente', 'fecha de pago pendiente', 'fecha limite de pago', 'fecha de pago', 'vence pago', 'proximo pago'],
  pagoPendienteMonto: ['cantidad pago pendiente', 'cantidad de pago pendiente', 'pago pendiente', 'saldo', 'resta', 'saldo pendiente', 'por pagar', 'monto pendiente'],
  comentarios: ['comentarios', 'comentario', 'notas', 'nota', 'observaciones', 'detalles', 'remarks'],
};

export function normalizar(t: Celda): string {
  return String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ───────────────────────── lectura de CSV ─────────────────────────

export function parseCsv(texto: string): Fila[] {
  const t = texto.replace(/^﻿/, '');
  // el separador es el que más aparece en las primeras líneas (hay archivos con un título arriba)
  const muestra = t.split(/\r?\n/).slice(0, 8).join('\n');
  const conteo = (s: string) => muestra.split(s).length - 1;
  const sep = [';', '\t', ','].reduce((mejor, s) => (conteo(s) > conteo(mejor) ? s : mejor), ',');
  const filas: Fila[] = [];
  let fila: string[] = [];
  let campo = '';
  let comillas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"' && t[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += c;
  }
  if (campo !== '' || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((c) => String(c).trim() !== ''));
}

// ───────────────────────── encabezados y mapeo ─────────────────────────

export function indiceEncabezado(filas: Fila[]): number {
  // la primera fila (de las 10 primeras) con varias celdas de texto que no son fechas ni números
  for (let i = 0; i < Math.min(10, filas.length); i++) {
    const textos = filas[i].filter((c) => typeof c === 'string' && c.trim() !== '' && Number.isNaN(Number(c.replace(/[$,]/g, ''))) && !fechaDe(c, 'dmy')).length;
    if (textos >= 3) return i;
  }
  return 0;
}

export type Mapeo = Partial<Record<Campo, number>>;

function puntuarEncabezado(campo: Campo, encabezado: string): number {
  const h = normalizar(encabezado);
  if (!h) return 0;
  let mejor = 0;
  for (const s of SINONIMOS[campo]) {
    const n = normalizar(s);
    if (h === n) return 100;
    if (h.includes(n) || n.includes(h)) mejor = Math.max(mejor, 70 - Math.abs(h.length - n.length));
  }
  return mejor;
}

function puntuarContenido(campo: Campo, muestra: Celda[], orden: 'dmy' | 'mdy'): number {
  const vals = muestra.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
  if (vals.length === 0) return 0;
  const frac = (f: (v: Celda) => boolean) => vals.filter(f).length / vals.length;
  switch (campo) {
    case 'fechaViaje':
    case 'fechaCompra':
    case 'pagoPendienteFecha':
      return frac((v) => Boolean(fechaDe(v, orden))) * 40;
    case 'comision':
    case 'precioVenta':
    case 'pagoPendienteMonto':
      return frac((v) => numeroDe(v) !== null && !fechaDe(v, orden)) * 25;
    case 'moneda':
      return frac((v) => /^(usd|mxn|us\$?|mx\$?|dolares?|pesos?)$/i.test(String(v).trim())) * 60;
    case 'contacto':
      return frac((v) => /(@|\d{7,})/.test(String(v))) * 35;
    default:
      return 0;
  }
}

export function sugerirMapeo(filas: Fila[], encabezadoIdx: number, orden: 'dmy' | 'mdy' = 'dmy'): Mapeo {
  const enc = filas[encabezadoIdx] ?? [];
  const datos = filas.slice(encabezadoIdx + 1, encabezadoIdx + 12);
  const candidatos: { campo: Campo; col: number; pts: number }[] = [];
  for (const { id } of CAMPOS) {
    enc.forEach((e, col) => {
      const muestra = datos.map((f) => f[col]);
      const pts = puntuarEncabezado(id, String(e ?? '')) + puntuarContenido(id, muestra, orden);
      if (pts >= 35) candidatos.push({ campo: id, col, pts });
    });
  }
  candidatos.sort((a, b) => b.pts - a.pts);
  const mapeo: Mapeo = {};
  const usadas = new Set<number>();
  for (const c of candidatos) {
    if (mapeo[c.campo] !== undefined || usadas.has(c.col)) continue;
    mapeo[c.campo] = c.col;
    usadas.add(c.col);
  }
  return mapeo;
}

// ───────────────────────── valores ─────────────────────────

const MESES: Record<string, number> = { ene: 0, enero: 0, feb: 1, febrero: 1, mar: 2, marzo: 2, abr: 3, abril: 3, may: 4, mayo: 4, jun: 5, junio: 5, jul: 6, julio: 6, ago: 7, agosto: 7, sep: 8, sept: 8, septiembre: 8, oct: 9, octubre: 9, nov: 10, noviembre: 10, dic: 11, diciembre: 11 };

function iso(y: number, m: number, d: number): string | null {
  const f = new Date(y, m, d);
  if (f.getFullYear() !== y || f.getMonth() !== m || f.getDate() !== d) return null;
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function fechaDe(v: Celda, orden: 'dmy' | 'mdy'): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : iso(v.getFullYear(), v.getMonth(), v.getDate());
  if (typeof v === 'number') {
    // número de serie de Excel (días desde 1899-12-30)
    if (v > 20000 && v < 80000) {
      const f = new Date(Math.round((v - 25569) * 86400000));
      return iso(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
    }
    return null;
  }
  const t = String(v).trim().toLowerCase();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(t);
  if (m) return iso(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(t);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return orden === 'dmy' ? iso(y, b - 1, a) : iso(y, a - 1, b);
  }
  m = /^(\d{1,2})\s*(?:de\s+)?([a-z]+)\.?\s*(?:de\s+)?(\d{2,4})?$/.exec(t.normalize('NFD').replace(/[̀-ͯ]/g, ''));
  if (m && MESES[m[2]] !== undefined) {
    let y = m[3] ? Number(m[3]) : new Date().getFullYear();
    if (y < 100) y += 2000;
    return iso(y, MESES[m[2]], Number(m[1]));
  }
  return null;
}

export function numeroDe(v: Celda): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (v === null || v === undefined) return null;
  const t = String(v).replace(/[^\d.,-]/g, '');
  if (!t) return null;
  // 1,234.50 (coma de miles) o 1.234,50 (formato europeo)
  const limpio = /,\d{1,2}$/.test(t) && !/\.\d{1,2}$/.test(t) ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function monedaDe(v: Celda, porDefecto: Moneda): Moneda {
  const t = normalizar(v);
  if (/mxn|mx|peso/.test(t)) return 'MXN';
  if (/usd|us|dolar/.test(t)) return 'USD';
  return porDefecto;
}

function estatusDe(v: Celda): Estatus {
  const t = normalizar(v);
  if (/pagad|cobrad|liquidad|^si$/.test(t)) return 'pagado';
  if (/alta|subir|hub/.test(t)) return 'pendiente_alta';
  if (/revis|reclam/.test(t)) return 'solicitar_revision';
  return 'pendiente_pago';
}

function tipoDe(v: Celda): Tipo {
  const t = normalizar(v);
  const hallado = TIPOS.find((x) => normalizar(x) === t || (t && normalizar(x).startsWith(t.slice(0, 4))));
  return hallado ?? 'Otro';
}

// ───────────────────────── conversión de filas ─────────────────────────

export interface FilaConvertida {
  fila: number; // número de fila en el archivo (1 = primera)
  reserva: Omit<Reserva, 'id' | 'creada'> | null;
  errores: string[];
  avisos: string[];
  duplicada: boolean;
}

export function convertirFilas(
  filas: Fila[],
  encabezadoIdx: number,
  mapeo: Mapeo,
  opciones: { orden: 'dmy' | 'mdy'; monedaPorDefecto: Moneda; existentes: { cliente: string; destino: string; fechaViaje: string }[] },
): FilaConvertida[] {
  const vistas = new Set(opciones.existentes.map((e) => `${normalizar(e.cliente)}|${normalizar(e.destino)}|${e.fechaViaje}`));
  const salida: FilaConvertida[] = [];
  const dato = (f: Fila, c: Campo): Celda => (mapeo[c] === undefined ? undefined : f[mapeo[c] as number]);

  filas.slice(encabezadoIdx + 1).forEach((f, i) => {
    if (!f.some((c) => c !== null && c !== undefined && String(c).trim() !== '')) return;
    const errores: string[] = [];
    const avisos: string[] = [];
    const cliente = String(dato(f, 'cliente') ?? '').trim();
    const destino = String(dato(f, 'destino') ?? '').trim();
    const comision = numeroDe(dato(f, 'comision'));
    const viaje = fechaDe(dato(f, 'fechaViaje'), opciones.orden);
    const compra = fechaDe(dato(f, 'fechaCompra'), opciones.orden);
    if (!cliente) errores.push('Falta el cliente');
    if (!destino) errores.push('Falta el destino');
    if (comision === null || comision <= 0) errores.push('Falta la comisión');
    if (!viaje) errores.push('Fecha de viaje no válida');
    if (!compra) avisos.push('Sin fecha de compra: no habrá aviso de alta');
    if (compra && viaje && viaje < compra) avisos.push('El viaje es antes de la compra');
    const pagoF = fechaDe(dato(f, 'pagoPendienteFecha'), opciones.orden);
    const pagoM = numeroDe(dato(f, 'pagoPendienteMonto'));
    const clave = `${normalizar(cliente)}|${normalizar(destino)}|${viaje ?? ''}`;
    const duplicada = errores.length === 0 && vistas.has(clave);
    if (errores.length === 0) vistas.add(clave);
    salida.push({
      fila: encabezadoIdx + 2 + i,
      errores,
      avisos,
      duplicada,
      reserva:
        errores.length > 0
          ? null
          : {
              cliente,
              contacto: String(dato(f, 'contacto') ?? '').trim(),
              destino,
              tipo: tipoDe(dato(f, 'tipo')),
              proveedor: String(dato(f, 'proveedor') ?? '').trim(),
              precioVenta: numeroDe(dato(f, 'precioVenta')) ?? 0,
              comision: comision as number,
              moneda: monedaDe(dato(f, 'moneda'), opciones.monedaPorDefecto),
              fechaCompra: compra ?? '',
              fechaViaje: viaje as string,
              pagoPendienteFecha: pagoF && pagoM && pagoM > 0 ? pagoF : undefined,
              pagoPendienteMonto: pagoF && pagoM && pagoM > 0 ? pagoM : undefined,
              comentarios: [String(dato(f, 'comentarios') ?? '').trim(), compra ? '' : '[Faltan datos: fecha de compra]'].filter(Boolean).join(' '),
              estatus: mapeo.estatus === undefined ? 'pendiente_pago' : estatusDe(dato(f, 'estatus')),
            },
    });
  });
  return salida;
}
