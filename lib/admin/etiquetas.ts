// Nombres humanos para lo que el sistema guarda con códigos. El dueño nunca debe leer "ads_meta" ni "PURCHASE_APPROVED".

export const CANALES: Record<string, string> = {
  ads_meta: 'Anuncios en Meta',
  afiliado: 'Afiliados',
  organico: 'Orgánico',
  directo: 'Directo',
  email: 'Correo',
  manual: 'Alta manual',
};

export const OPCIONES_CANAL = [
  { valor: 'ads_meta', texto: 'Anuncios en Meta' },
  { valor: 'afiliado', texto: 'Afiliados' },
  { valor: 'organico', texto: 'Orgánico (contenido sin pagar)' },
  { valor: 'email', texto: 'Correo' },
  { valor: 'directo', texto: 'Directo' },
];

export const nombreCanal = (c: string): string => CANALES[c] ?? c.replace(/[_-]/g, ' ');

const AVISOS_HOTMART: Record<string, string> = {
  PURCHASE_APPROVED: 'Compra aprobada',
  PURCHASE_COMPLETE: 'Compra completada',
  PURCHASE_DELAYED: 'Pago atrasado',
  PURCHASE_EXPIRED: 'Suscripción vencida',
  PURCHASE_REFUNDED: 'Reembolso',
  PURCHASE_CHARGEBACK: 'Devolución del banco',
  SUBSCRIPTION_CANCELLATION: 'Cancelación',
  SWITCH_PLAN: 'Cambio de plan',
};

export const nombreAviso = (tipo: string | null): string => (tipo ? (AVISOS_HOTMART[tipo] ?? 'Aviso de otro tipo') : 'Aviso sin identificar');

// Convierte un error técnico en una frase clara; el texto original queda disponible para quien lo necesite
export function errorHumano(mensaje: string): { titulo: string; queHacer: string } {
  if (/fetch|network|conexi|timeout/i.test(mensaje)) {
    return { titulo: 'Se perdió la conexión mientras alguien usaba la app', queHacer: 'Suele ser su internet; solo avísame si se repite mucho.' };
  }
  if (/undefined|null|cannot read|is not a function/i.test(mensaje)) {
    return { titulo: 'Una pantalla falló al mostrar unos datos', queHacer: 'Pásame el nombre de la pantalla (la columna "Dónde") para corregirlo.' };
  }
  if (/chunk|loading|import/i.test(mensaje)) {
    return { titulo: 'Una pantalla no terminó de cargar', queHacer: 'Suele resolverse solo al recargar; avísame si se repite.' };
  }
  return { titulo: 'Algo falló dentro de la app', queHacer: 'Pásame el nombre de la pantalla (la columna "Dónde") para revisarlo.' };
}

const PANTALLAS: Record<string, string> = {
  '/app': 'Inicio',
  '/app/reservas': 'Reservas',
  '/app/calendario': 'Calendario',
  '/app/alertas': 'Alertas',
  '/app/nueva': 'Registrar venta',
  '/app/importar': 'Importar Excel',
  '/entrar': 'Acceso',
  '/onboarding': 'Preguntas de inicio',
  '/paywall': 'Pantalla de planes',
};
export const nombrePantalla = (ruta: string | null): string => (ruta ? (PANTALLAS[ruta] ?? 'Otra pantalla') : '—');
