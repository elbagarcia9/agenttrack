import { describe, expect, it } from 'vitest';
import { fechaDe, indiceEncabezado, numeroDe, parseCsv, sugerirMapeo } from '@/lib/importar';

describe('importar Excel y CSV', () => {
  it('lee un CSV con comas, comillas y saltos de línea', () => {
    const filas = parseCsv('Cliente,Destino,Comisión\n"Pérez, Ana",Cancún,180\nLuis,Miami,"1,200.50"');
    expect(filas[1][0]).toBe('Pérez, Ana');
    expect(filas[2][2]).toBe('1,200.50');
  });

  it('detecta los encabezados y adivina qué columna es cada campo', () => {
    const filas = parseCsv('Nombre del cliente,Destino,Fecha de viaje,Comisión\nAna,Cancún,15/12/2026,180');
    const idx = indiceEncabezado(filas);
    const mapeo = sugerirMapeo(filas, idx);
    expect(mapeo.cliente).toBe(0);
    expect(mapeo.destino).toBe(1);
    expect(mapeo.fechaViaje).toBe(2);
    expect(mapeo.comision).toBe(3);
  });

  it('fechas: día/mes/año de México y mes/día/año de EE. UU., sin correrse', () => {
    expect(fechaDe('02/12/2026', 'dmy')).toBe('2026-12-02');
    expect(fechaDe('02/12/2026', 'mdy')).toBe('2026-02-12');
    expect(fechaDe('basura', 'dmy')).toBeNull();
  });

  it('números con formato de dinero', () => {
    expect(numeroDe('$1,200.50')).toBe(1200.5);
    expect(numeroDe('344')).toBe(344);
    expect(numeroDe('abc')).toBeNull();
  });
});
