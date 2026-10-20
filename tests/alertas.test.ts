import { describe, expect, it } from 'vitest';
import { alertasDe, totales, type Reserva } from '@/lib/reservas-reglas';
import { avisosDeHoy, claveDia, hoyMexico, resumenPush } from '@/lib/avisos';

const d = (a: number, m: number, dia: number) => new Date(a, m - 1, dia);
const iso = (x: Date) => claveDia(x);

function reserva(extra: Partial<Reserva> = {}): Reserva {
  return {
    id: 'r1',
    cliente: 'Ana Pérez',
    contacto: '',
    destino: 'Cancún',
    tipo: 'Paquete',
    proveedor: '',
    precioVenta: 1800,
    comision: 180,
    moneda: 'USD',
    fechaCompra: '2026-10-01',
    fechaViaje: '2026-12-20',
    comentarios: '',
    estatus: 'pendiente_alta',
    creada: 0,
    ...extra,
  };
}

describe('alertas de una reserva', () => {
  it('pendiente de alta: límite a 30 días desde la compra y urgente con 5 días o menos', () => {
    const [a] = alertasDe(reserva(), d(2026, 10, 27)); // quedan 4 días (límite 31 oct)
    expect(a.tipo).toBe('alta');
    expect(iso(a.fecha)).toBe('2026-10-31');
    expect(a.severidad).toBe('urgente');
  });

  it('alta ya hecha: no avisa del alta', () => {
    const tipos = alertasDe(reserva({ estatus: 'pendiente_pago' }), d(2026, 10, 27)).map((x) => x.tipo);
    expect(tipos).not.toContain('alta');
  });

  it('pago pendiente del cliente aparece con su fecha', () => {
    const al = alertasDe(reserva({ pagoPendienteFecha: '2026-11-10', pagoPendienteMonto: 500 }), d(2026, 11, 8));
    const p = al.find((x) => x.tipo === 'pago_cliente');
    expect(p?.severidad).toBe('urgente');
  });

  it('salida: avisa desde 2 días antes del viaje', () => {
    expect(alertasDe(reserva({ fechaViaje: '2026-12-20' }), d(2026, 12, 18)).some((x) => x.tipo === 'salida')).toBe(true);
    expect(alertasDe(reserva({ fechaViaje: '2026-12-20' }), d(2026, 12, 17)).some((x) => x.tipo === 'salida')).toBe(false);
  });

  it('reclamo: vence a los 18 meses del viaje y una reserva pagada no avisa', () => {
    const vencida = alertasDe(reserva({ estatus: 'pendiente_pago', fechaViaje: '2025-01-10' }), d(2026, 10, 15));
    expect(vencida.some((x) => x.tipo === 'reclamo' && x.severidad === 'vencido')).toBe(true);
    expect(alertasDe(reserva({ estatus: 'pagado', fechaViaje: '2025-01-10' }), d(2026, 10, 15))).toHaveLength(0);
  });
});

describe('totales', () => {
  it('suma comisiones por cobrar por moneda y cuenta por estatus', () => {
    const hoy = d(2026, 10, 15);
    const t = totales(
      [
        reserva({ id: 'a', comision: 100, estatus: 'pendiente_alta' }),
        reserva({ id: 'b', comision: 50, moneda: 'MXN', estatus: 'pendiente_pago' }),
        reserva({ id: 'c', comision: 999, estatus: 'pagado' }),
      ],
      hoy,
    );
    expect(t.porCobrar.USD).toBe(100);
    expect(t.porCobrar.MXN).toBe(50);
    expect(t.porDarDeAlta).toBe(1);
    expect(t.porCobrarN).toBe(1);
  });
});

describe('avisos del día (correo y celular)', () => {
  const hoy = d(2026, 10, 27);
  it('lo urgente avisa a diario', () => {
    const av = avisosDeHoy([reserva()], hoy);
    expect(av.map((x) => x.tipo)).toContain('alta');
  });
  it('lo vencido avisa solo el día que vence', () => {
    const r = reserva({ fechaCompra: '2026-09-27' }); // alta venció el 27 oct
    expect(avisosDeHoy([r], d(2026, 10, 28)).some((x) => x.tipo === 'alta')).toBe(true); // ayer venció (-1)
    expect(avisosDeHoy([r], d(2026, 11, 5)).some((x) => x.tipo === 'alta')).toBe(false); // hace días: ya no insiste
  });
  it('arma el texto corto del celular', () => {
    const texto = resumenPush(avisosDeHoy([reserva()], hoy), hoy);
    expect(texto.titulo).toMatch(/plazo/);
    expect(texto.cuerpo).toContain('Ana Pérez');
  });
  it('la fecha de hoy en México no depende de la zona del servidor', () => {
    const h = hoyMexico(new Date('2026-10-21T03:30:00Z')); // 21:30 del 20 de octubre en México
    expect(iso(h)).toBe('2026-10-20');
  });
});
