// Datos legales en UN solo lugar: las páginas, el pie de la landing y los correos leen de aquí para que nunca se contradigan.
// Si cambia el responsable, el correo, los precios o el texto de un documento, se cambia aquí y se sube la versión.

export const RESPONSABLE = 'Elba Alicia García Ochoa';
export const UBICACION = 'Zapopan, Jalisco, México';
export const SOPORTE_EMAIL = 'soporte@agenttrack.app';
export const SITIO_WEB = 'agenttrack.app';

// Versión de los documentos que la persona acepta al entrar. Si un texto cambia en lo importante, se sube
// la versión y se vuelve a pedir la aceptación.
export const VERSION_LEGAL = '2026-10-16';
export const FECHA_LEGAL = '16 de octubre de 2026';

export const PRECIOS = {
  mensual: '$149 MXN al mes',
  anual: '$1,190 MXN al año',
  prueba: '14 días',
};

// Quiénes procesan datos por cuenta de la app (se listan por nombre en el aviso de privacidad)
export const PROVEEDORES = [
  { nombre: 'Supabase', funcion: 'Base de datos y acceso a las cuentas', pais: 'Estados Unidos' },
  { nombre: 'Vercel', funcion: 'Alojamiento de la app y del sitio', pais: 'Estados Unidos' },
  { nombre: 'Resend', funcion: 'Envío de correos (acceso, avisos y encuesta)', pais: 'Estados Unidos' },
  { nombre: 'Hotmart', funcion: 'Cobro de la suscripción y comprobantes', pais: 'Brasil' },
] as const;
