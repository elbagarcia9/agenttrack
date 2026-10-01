// Contrato mínimo de eventos del camino de venta (36). Sin servidor todavía: los eventos se guardan en una
// cola local con una sesión anónima. Al conectar los servicios externos, esta cola se envía al backend.
// Nunca incluye datos personales (nombre, cliente, contacto): solo identificadores de paso y respuestas de segmento.

export type Evento = 'onboarding_iniciado' | 'onboarding_paso_completado' | 'resultado_visto' | 'paywall_visto' | 'checkout_iniciado' | 'acceso_solicitado';

function leer(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: el evento se pierde, la experiencia no se rompe */
  }
}

export function sesionAnonima(): string {
  const existente = leer('cg_sesion');
  if (existente) return existente;
  const nueva = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  escribir('cg_sesion', nueva);
  return nueva;
}

export function track(evento: Evento, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  let cola: unknown[] = [];
  try {
    const previa = JSON.parse(leer('cg_eventos') ?? '[]');
    if (Array.isArray(previa)) cola = previa;
  } catch {
    cola = []; // cola corrupta: se reinicia, nunca rompe el flujo
  }
  cola.push({ evento, props, sesion: sesionAnonima(), t: Date.now() });
  escribir('cg_eventos', JSON.stringify(cola.slice(-200)));
}
