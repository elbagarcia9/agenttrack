// Formato de números, fechas y periodos del panel. Todo en español de México y hora de Ciudad de México
// (UTC-6 fijo desde que México eliminó el horario de verano en 2022).

export const SIN_DATOS = 'Sin datos';
const OFFSET = '-06:00';

export function dinero(centavos: number, moneda: string): string {
  const v = centavos / 100;
  const decimales = Number.isInteger(v) ? 0 : 2;
  return `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: 2 })} ${moneda}`;
}

export function porcentaje(parte: number, total: number): number | null {
  return total > 0 ? (parte / total) * 100 : null;
}

export function pct(v: number | null, decimales = 0): string {
  return v === null ? SIN_DATOS : `${v.toLocaleString('es-MX', { maximumFractionDigits: decimales })}%`;
}

export function mesActual(): string {
  return new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 7);
}

export function esMesValido(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

function sumarMes(mes: string, n: number): string {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function etiquetaMes(mes: string): string {
  const [a, m] = mes.split('-').map(Number);
  const t = new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function etiquetaMesCorta(mes: string): string {
  const [a, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString('es-MX', { month: 'short', timeZone: 'UTC' }).replace('.', '');
}

export interface RangoMes {
  mes: string;
  desde: string; // inicio del mes (incluido)
  hasta: string; // inicio del mes siguiente (excluido)
  etiqueta: string;
  anterior: string;
  siguiente: string | null; // null si ya es el mes actual
  esActual: boolean;
}

export function rangoDeMes(mes: string): RangoMes {
  const actual = mesActual();
  const siguiente = sumarMes(mes, 1);
  return {
    mes,
    desde: `${mes}-01T00:00:00${OFFSET}`,
    hasta: `${siguiente}-01T00:00:00${OFFSET}`,
    etiqueta: etiquetaMes(mes),
    anterior: sumarMes(mes, -1),
    siguiente: siguiente > actual ? null : siguiente,
    esActual: mes === actual,
  };
}

export function mesDeParametro(v: unknown): string {
  const crudo = Array.isArray(v) ? v[0] : v;
  const m = esMesValido(crudo) ? crudo : mesActual();
  return m > mesActual() ? mesActual() : m;
}

export function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' });
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' });
}

export function hace(iso: string | null): string {
  if (!iso) return SIN_DATOS;
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

// "1500.5" o "1,500.50" → 150050 centavos; null si no es un importe válido
export function aCentavos(texto: string): number | null {
  const limpio = texto.replace(/[\s,$]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  return Math.round(Number(limpio) * 100);
}

// Serie diaria de los últimos N días con ceros donde no hubo actividad (hora de Ciudad de México)
export function rellenarDias(serie: { dia: string; n: number }[], dias = 30): { dia: string; etiqueta: string; n: number }[] {
  const porDia = new Map(serie.map((s) => [s.dia, s.n]));
  const hoy = new Date(Date.now() - 6 * 3600_000);
  const salida: { dia: string; etiqueta: string; n: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - i));
    const iso = d.toISOString().slice(0, 10);
    salida.push({ dia: iso, etiqueta: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }), n: porDia.get(iso) ?? 0 });
  }
  return salida;
}

export const ETIQUETA_MEMBRESIA: Record<string, string> = {
  active: 'Activa',
  trialing: 'En prueba',
  past_due: 'Pago atrasado',
  cancelled: 'Cancelada',
  expired: 'Vencida',
  refunded: 'Reembolsada',
  chargeback: 'Contracargo',
  manual: 'Acceso manual',
  sin_membresia: 'Sin membresía',
};
