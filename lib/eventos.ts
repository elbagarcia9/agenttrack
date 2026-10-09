// Lista cerrada de eventos que acepta el servidor (la misma que la restricción de la tabla event_log).
// Nombres y propiedades según el diccionario de 36-ANALITICA-Y-EVENTOS. Sin datos personales.

export const EVENTOS_VALIDOS = [
  'landing_vista',
  'onboarding_iniciado',
  'onboarding_paso_completado',
  'onboarding_completado',
  'resultado_visto',
  'paywall_visto',
  'checkout_iniciado',
  'acceso_solicitado',
  'app_abierta',
  'sesion_iniciada',
  'reserva_creada',
  'reserva_importada',
] as const;

export type Evento = (typeof EVENTOS_VALIDOS)[number];

export function esEventoValido(v: unknown): v is Evento {
  return typeof v === 'string' && (EVENTOS_VALIDOS as readonly string[]).includes(v);
}

// Deja solo claves cortas con valores simples: texto corto, número o sí/no (nada de objetos ni textos largos)
export function limpiarProps(crudo: unknown): Record<string, string | number | boolean> {
  const salida: Record<string, string | number | boolean> = {};
  if (!crudo || typeof crudo !== 'object' || Array.isArray(crudo)) return salida;
  for (const [k, v] of Object.entries(crudo as Record<string, unknown>).slice(0, 10)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(k)) continue;
    if (typeof v === 'string') salida[k] = v.slice(0, 100);
    else if (typeof v === 'number' && Number.isFinite(v)) salida[k] = v;
    else if (typeof v === 'boolean') salida[k] = v;
  }
  return salida;
}

// Límite simple por IP (en memoria de cada instancia: frena abusos básicos, no es una defensa total)
const ventanas = new Map<string, { desde: number; n: number }>();
export function dentroDelLimite(clave: string, max = 60, ventanaMs = 60_000): boolean {
  const ahora = Date.now();
  if (ventanas.size > 5000) ventanas.clear();
  const v = ventanas.get(clave);
  if (!v || ahora - v.desde > ventanaMs) {
    ventanas.set(clave, { desde: ahora, n: 1 });
    return true;
  }
  v.n += 1;
  return v.n <= max;
}
