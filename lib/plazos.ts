// Reglas de plazos de Archer México y Latinoamérica (dadas por el usuario, 2026-09-29).
// Alta: 30 días desde la compra · Salida: aviso 2 días antes · Revisión: desde 60 días tras el viaje
// (el regreso no se registra, se usa la salida) · Reclamo: hasta 18 meses desde el inicio del viaje.
// Los plazos son configurables por agencia en la app interna; aquí viven los valores de Archer.

export type EstadoSemaforo = 'enPlazo' | 'urgente' | 'vencido';

export interface Plazos {
  alta: Date;
  salidaAviso: Date;
  revisionDesde: Date;
  reclamo: Date;
}

const DIA_MS = 86_400_000;

export function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

export function sumarMeses(fecha: Date, meses: number): Date {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d;
}

export function calcularPlazos(compra: Date, viaje: Date): Plazos {
  return {
    alta: sumarDias(compra, 30),
    salidaAviso: sumarDias(viaje, -2),
    revisionDesde: sumarDias(viaje, 60),
    reclamo: sumarMeses(viaje, 18),
  };
}

export function inicioDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function diasRestantes(limite: Date, hoy: Date = new Date()): number {
  return Math.round((inicioDelDia(limite).getTime() - inicioDelDia(hoy).getTime()) / DIA_MS);
}

// Dorado solo con 5 días o menos para vencer; rojo si ya venció (regla del usuario, FICHA-ARTE).
export function estadoSemaforo(limite: Date, hoy: Date = new Date()): EstadoSemaforo {
  const dias = diasRestantes(limite, hoy);
  if (dias < 0) return 'vencido';
  if (dias <= 5) return 'urgente';
  return 'enPlazo';
}

export function parseFecha(valor: string): Date | null {
  // valor 'YYYY-MM-DD' de <input type="date">; se interpreta en hora local para no correr el día
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatoFecha(d: Date, hoy: Date = new Date()): string {
  const opciones: Intl.DateTimeFormatOptions =
    d.getFullYear() === hoy.getFullYear() ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('es-MX', opciones).format(d);
}
