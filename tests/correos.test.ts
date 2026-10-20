import { beforeAll, describe, expect, it } from 'vitest';
import { correoCancelacion, correoPagoAtrasado, correoReactivar } from '@/lib/avisos';

beforeAll(() => {
  process.env.SUPABASE_SECRET_KEY = 'clave-de-prueba-solo-para-tests';
});

const hoy = new Date(2026, 9, 20);
const id = '11111111-1111-1111-1111-111111111111';

describe('correos de cobro', () => {
  it('pago atrasado: dice qué hacer y lleva a la compra en Hotmart; no ofrece "dejar de recibir"', () => {
    const c = correoPagoAtrasado('Ana María');
    expect(c.html).toContain('consumer.hotmart.com');
    expect(c.html).toContain('Hola, Ana.');
    expect(c.html).not.toContain('Dejar de recibir');
  });

  it('cancelación: confirma que no habrá más cobros, hasta cuándo tiene acceso y enlaza la encuesta firmada', () => {
    const c = correoCancelacion('Ana', id, new Date(2026, 10, 3), hoy);
    expect(c.html).toContain('No habrá más cobros');
    expect(c.html).toContain('3 de noviembre');
    expect(c.html).toMatch(/\/encuesta\?t=/);
    expect(c.html).toContain('/app/cuenta');
  });

  it('cancelación sin acceso vigente: lo dice sin inventar fecha', () => {
    const c = correoCancelacion(null, id, new Date(2026, 9, 1), hoy);
    expect(c.html).toContain('Tu acceso termina ahora');
  });

  it('volver a mi plan: sí lleva baja firmada y el enlace a los planes', () => {
    const c = correoReactivar('Ana', id);
    expect(c.html).toContain('/paywall');
    expect(c.baja).toMatch(/\/baja\?t=/);
    expect(c.html).toContain('Dejar de recibir avisos');
  });

  it('escapa el nombre para que nadie meta código en el correo', () => {
    const c = correoPagoAtrasado('<script>alert(1)</script>');
    expect(c.html).not.toContain('<script>');
  });
});
