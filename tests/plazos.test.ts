import { describe, expect, it } from 'vitest';
import { diasRestantes, estadoSemaforo, parseFecha, sumarDias, sumarMeses } from '@/lib/plazos';

const d = (a: number, m: number, dia: number) => new Date(a, m - 1, dia);

describe('plazos', () => {
  it('suma días y meses sin correr el día', () => {
    expect(sumarDias(d(2026, 10, 1), 30).getTime()).toBe(d(2026, 10, 31).getTime());
    expect(sumarMeses(d(2026, 10, 15), 18).getTime()).toBe(d(2028, 4, 15).getTime());
  });

  it('cuenta los días que faltan ignorando la hora', () => {
    expect(diasRestantes(d(2026, 10, 20), d(2026, 10, 15))).toBe(5);
    expect(diasRestantes(d(2026, 10, 15), d(2026, 10, 15))).toBe(0);
    expect(diasRestantes(d(2026, 10, 14), d(2026, 10, 15))).toBe(-1);
  });

  it('semáforo: dorado con 5 días o menos, rojo si venció', () => {
    const hoy = d(2026, 10, 15);
    expect(estadoSemaforo(d(2026, 10, 21), hoy)).toBe('enPlazo');
    expect(estadoSemaforo(d(2026, 10, 20), hoy)).toBe('urgente');
    expect(estadoSemaforo(d(2026, 10, 15), hoy)).toBe('urgente');
    expect(estadoSemaforo(d(2026, 10, 14), hoy)).toBe('vencido');
  });

  it('lee fechas AAAA-MM-DD y rechaza lo demás', () => {
    expect(parseFecha('2026-12-02')?.getTime()).toBe(d(2026, 12, 2).getTime());
    expect(parseFecha('02/12/2026')).toBeNull();
    expect(parseFecha('')).toBeNull();
  });
});
