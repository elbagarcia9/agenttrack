// Contrato de eventos del camino de venta y de uso (36). Cada evento se guarda en una cola local (respaldo)
// y se envía al servidor (/api/evento → tabla event_log), que alimenta el panel del dueño.
// Nunca incluye datos personales (nombre, cliente, contacto): solo identificadores de paso y respuestas de segmento.
// ?qa=1 en cualquier dirección marca ese navegador como "pruebas" y sus eventos no cuentan en las métricas.

import { esEventoValido, type Evento } from './eventos';

export type { Evento };

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

function esModoPruebas(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('qa') === '1') escribir('cg_qa', '1');
  } catch {
    /* sin URL legible: se usa lo guardado */
  }
  return leer('cg_qa') === '1';
}

export function track(evento: Evento, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || !esEventoValido(evento)) return;
  const sesion = sesionAnonima();
  const qa = esModoPruebas();
  let cola: unknown[] = [];
  try {
    const previa = JSON.parse(leer('cg_eventos') ?? '[]');
    if (Array.isArray(previa)) cola = previa;
  } catch {
    cola = []; // cola corrupta: se reinicia, nunca rompe el flujo
  }
  cola.push({ evento, props, sesion, t: Date.now() });
  escribir('cg_eventos', JSON.stringify(cola.slice(-200)));
  try {
    void fetch('/api/evento', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tipo: evento, sesion, props, qa }),
    }).catch(() => undefined);
  } catch {
    /* medir nunca rompe nada */
  }
}

// Una vez por día activo (base de la retención D1/D7/D30) y una sola vez en la vida (activación)
export function trackSesionDiaria() {
  if (typeof window === 'undefined') return;
  const hoy = new Date().toISOString().slice(0, 10);
  if (leer('cg_ultima_sesion') !== hoy) {
    escribir('cg_ultima_sesion', hoy);
    track('sesion_iniciada');
  }
  if (!leer('cg_app_abierta')) {
    escribir('cg_app_abierta', '1');
    track('app_abierta');
  }
}
