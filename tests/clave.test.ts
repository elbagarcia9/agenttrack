import { describe, expect, it } from 'vitest';
import { revisarClave } from '@/lib/clave';

describe('contraseña', () => {
  it('cualquier persona: 8 caracteres con letras y números', () => {
    expect(revisarClave('abc1234', false)).not.toBeNull();
    expect(revisarClave('abcdefgh', false)).toBe('Combina letras y números.');
    expect(revisarClave('abcd1234', false)).toBeNull();
  });

  it('dueña: 10 caracteres con mayúscula, minúscula, número y símbolo', () => {
    expect(revisarClave('abcd1234', true)).toBe('Usa al menos 10 caracteres.');
    expect(revisarClave('abcdefg1234', true)).toBe('Agrega una letra mayúscula.');
    expect(revisarClave('ABCDEFG1234', true)).toBe('Agrega una letra minúscula.');
    expect(revisarClave('Abcdefg1234', true)).toBe('Agrega un símbolo (por ejemplo ! ? # $ %).');
    expect(revisarClave('Abcdefg123!', true)).toBeNull();
  });
});
