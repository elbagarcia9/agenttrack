// Reglas de la contraseña (opcional). Para todas: mínimo 8, con letras y números. Para la cuenta del dueño, que abre el panel
// y controla accesos: mínimo 10, con mayúscula, minúscula, número y símbolo.

export function reglaDeClave(esAdmin: boolean): string {
  return esAdmin
    ? 'Mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo (por ejemplo ! ? # $ %).'
    : 'Mínimo 8 caracteres, con letras y números.';
}

// Devuelve qué falta (en lenguaje simple) o null si la contraseña cumple.
export function revisarClave(clave: string, esAdmin: boolean): string | null {
  const minimo = esAdmin ? 10 : 8;
  if (clave.length < minimo) return `Usa al menos ${minimo} caracteres.`;
  if (!/[a-zA-Z]/.test(clave) || !/\d/.test(clave)) return 'Combina letras y números.';
  if (esAdmin) {
    if (!/[a-z]/.test(clave)) return 'Agrega una letra minúscula.';
    if (!/[A-Z]/.test(clave)) return 'Agrega una letra mayúscula.';
    if (!/[^a-zA-Z0-9]/.test(clave)) return 'Agrega un símbolo (por ejemplo ! ? # $ %).';
  }
  return null;
}
