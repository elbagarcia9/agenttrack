import { beforeAll, describe, expect, it } from 'vitest';
import { hottokValido, interpretarEvento } from '@/lib/hotmart';
import { firmar, verificarFirma } from '@/lib/avisos';

beforeAll(() => {
  process.env.SUPABASE_SECRET_KEY = 'clave-de-prueba-solo-para-tests';
});

const base = (evento: string, data: Record<string, unknown>) => ({ id: `${evento}-1`, event: evento, creation_date: Date.now(), data });

describe('lectura de avisos de Hotmart', () => {
  it('inicio de prueba gratis (cobro 0): membresía en prueba y sin pago registrado', () => {
    const ev = interpretarEvento(
      base('PURCHASE_APPROVED', {
        product: { id: 8763881 },
        buyer: { email: 'Ana@Correo.com', name: 'Ana' },
        purchase: { transaction: 'HP1', price: { value: 0, currency_value: 'MXN' } },
        subscription: { plan: { name: 'Plan mensual' }, subscriber: { code: 'S1' } },
      }),
    );
    expect(ev?.nuevaMembresia).toBe('trialing');
    expect(ev?.tx).toBeNull();
    expect(ev?.email).toBe('ana@correo.com');
    expect(ev?.ciclo).toBe('mensual');
  });

  it('primer cobro: membresía activa con el pago registrado en centavos', () => {
    const ev = interpretarEvento(
      base('PURCHASE_APPROVED', {
        product: { id: 8763881 },
        buyer: { email: 'ana@correo.com' },
        purchase: { transaction: 'HP2', price: { value: 149, currency_value: 'MXN' }, approved_date: 1792000000000 },
        subscription: { plan: { name: 'Plan anual' } },
      }),
    );
    expect(ev?.nuevaMembresia).toBe('active');
    expect(ev?.tx?.amount_minor).toBe(14900);
    expect(ev?.tx?.currency).toBe('MXN');
    expect(ev?.ciclo).toBe('anual');
  });

  it('cancelación: lee al suscriptor aunque no venga como comprador', () => {
    const ev = interpretarEvento(base('SUBSCRIPTION_CANCELLATION', { product: { id: 8763881 }, subscriber: { code: 'ABC', email: 'ana@correo.com', name: 'Ana' } }));
    expect(ev?.nuevaMembresia).toBe('cancelled');
    expect(ev?.churnTipo).toBe('voluntario');
    expect(ev?.subscriberCode).toBe('ABC');
  });

  it('reembolso y contracargo registran el pago como devolución', () => {
    const datos = { product: { id: 1 }, buyer: { email: 'a@b.co' }, purchase: { transaction: 'HP3', price: { value: 10, currency_value: 'MXN' } } };
    expect(interpretarEvento(base('PURCHASE_REFUNDED', datos))?.tx?.economic_kind).toBe('refund');
    expect(interpretarEvento(base('PURCHASE_CHARGEBACK', datos))?.nuevaMembresia).toBe('chargeback');
  });

  it('un aviso sin correo no se interpreta', () => {
    expect(interpretarEvento(base('PURCHASE_APPROVED', { product: { id: 1 } }))).toBeNull();
  });
});

describe('autenticidad', () => {
  it('compara el HOTTOK sin aceptar nada parecido', () => {
    expect(hottokValido('secreto', 'secreto')).toBe(true);
    expect(hottokValido('secreto ', 'secreto')).toBe(false);
    expect(hottokValido(null, 'secreto')).toBe(false);
    expect(hottokValido('', 'secreto')).toBe(false);
  });

  it('los enlaces firmados (baja y encuesta) solo sirven para lo suyo y no se pueden alterar', () => {
    const id = '11111111-1111-1111-1111-111111111111';
    const t = firmar(id, 'baja');
    expect(verificarFirma(t, 'baja')).toBe(id);
    expect(verificarFirma(t, 'encuesta')).toBeNull();
    expect(verificarFirma(t + 'x', 'baja')).toBeNull();
    expect(verificarFirma(t.replace(id, '22222222-2222-2222-2222-222222222222'), 'baja')).toBeNull();
    expect(verificarFirma('basura', 'baja')).toBeNull();
  });
});
