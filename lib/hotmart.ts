import 'server-only';

// Lectura segura de los avisos (webhook) de Hotmart — doctrina de 18-VENTA-HOTMART.
// ⚠️ Los nombres exactos de eventos y campos DEBEN verificarse con un evento de prueba real de TU cuenta de
// Hotmart antes de vender (18: "Los nombres EXACTOS de los eventos se VERIFICAN"). Hasta entonces lo que no se
// reconoce se registra como "ignorado" en el panel, nunca se inventa.

import crypto from 'node:crypto';

// Comparación en tiempo constante (anti timing-attack): ambos lados pasan por SHA-256 (misma longitud)
export function hottokValido(recibido: string | null | undefined, esperado: string): boolean {
  if (!recibido) return false;
  const a = crypto.createHash('sha256').update(recibido).digest();
  const b = crypto.createHash('sha256').update(esperado).digest();
  return crypto.timingSafeEqual(a, b);
}

type Membresia = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

export interface EventoInterpretado {
  eventId: string;
  evento: string;
  email: string;
  nombre: string;
  subscriberCode: string | null;
  productId: string | null;
  nuevaMembresia: Membresia | null;
  churnTipo: 'voluntario' | 'involuntario' | null;
  ciclo: 'mensual' | 'anual' | null;
  recurrencia: number | null;
  tx: {
    transaction_id: string;
    economic_kind: 'sale' | 'refund' | 'chargeback';
    product_id: string;
    offer_id: string | null;
    amount_minor: number;
    currency: string;
    provider_fee_minor: number | null;
    affiliate_fee_minor: number | null;
    tax_minor: null;
    occurred_at: string;
    source: string;
  } | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const aMenor = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) : null);

function limpiarFuente(v: unknown): string {
  if (typeof v !== 'string') return 'directo';
  const s = v.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return s || 'directo';
}

function aIso(ms: unknown): string {
  const n = typeof ms === 'number' ? ms : Number(ms);
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : new Date().toISOString();
}

export function interpretarEvento(payload: any): EventoInterpretado | null {
  const evento: unknown = payload?.event;
  const email: unknown = payload?.data?.buyer?.email;
  if (typeof evento !== 'string' || typeof email !== 'string' || !email.includes('@')) return null;

  const compra = payload?.data?.purchase ?? {};
  const transaccion: string | null = typeof compra.transaction === 'string' ? compra.transaction : null;
  const productId = payload?.data?.product?.id != null ? String(payload.data.product.id) : null;
  const comisiones: any[] = Array.isArray(payload?.data?.commissions) ? payload.data.commissions : [];
  const suma = (fuente: string) => {
    const filas = comisiones.filter((c) => c?.source === fuente && typeof c?.value === 'number');
    return filas.length ? Math.round(filas.reduce((t, c) => t + c.value, 0) * 100) : null;
  };
  const afiliado = suma('AFFILIATE');
  const monto = aMenor(compra?.price?.value);
  const moneda: string = typeof compra?.price?.currency_value === 'string' ? compra.price.currency_value.toUpperCase() : '';
  const nombrePlan = String(payload?.data?.subscription?.plan?.name ?? '').toLowerCase();
  const ciclo = /anual|annual|year|año/.test(nombrePlan) ? 'anual' : /mensual|monthly|month|mes/.test(nombrePlan) ? 'mensual' : null;
  const origen = compra?.origin ?? {};

  const base = {
    eventId: String(payload?.id ?? `${evento}:${transaccion ?? email}`),
    evento,
    email: email.trim().toLowerCase(),
    nombre: typeof payload?.data?.buyer?.name === 'string' ? payload.data.buyer.name.slice(0, 120) : '',
    subscriberCode: payload?.data?.subscription?.subscriber?.code ? String(payload.data.subscription.subscriber.code) : null,
    productId,
    ciclo: ciclo as 'mensual' | 'anual' | null,
    recurrencia: Number.isInteger(compra?.recurrence_number) ? (compra.recurrence_number as number) : null,
  };

  const tx = (kind: 'sale' | 'refund' | 'chargeback') =>
    transaccion && productId && monto !== null && /^[A-Z]{3}$/.test(moneda)
      ? {
          transaction_id: transaccion,
          economic_kind: kind,
          product_id: productId,
          offer_id: compra?.offer?.code ? String(compra.offer.code) : null,
          amount_minor: monto,
          currency: moneda,
          provider_fee_minor: suma('MARKETPLACE'),
          affiliate_fee_minor: afiliado,
          tax_minor: null,
          occurred_at: aIso(compra.approved_date ?? compra.order_date ?? payload?.creation_date),
          source: afiliado ? 'afiliado' : limpiarFuente(origen.src ?? origen.sck),
        }
      : null;

  switch (evento) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE':
      // Un cobro de 0 es el inicio de la prueba gratis (18: "plausible"; se confirma con un evento real)
      return monto === 0
        ? { ...base, nuevaMembresia: 'trialing', churnTipo: null, tx: null }
        : { ...base, nuevaMembresia: 'active', churnTipo: null, tx: tx('sale') };
    case 'PURCHASE_DELAYED':
      return { ...base, nuevaMembresia: 'past_due', churnTipo: null, tx: null };
    case 'SUBSCRIPTION_CANCELLATION':
      return { ...base, nuevaMembresia: 'cancelled', churnTipo: 'voluntario', tx: null };
    case 'PURCHASE_EXPIRED':
      return { ...base, nuevaMembresia: 'expired', churnTipo: 'involuntario', tx: null };
    case 'PURCHASE_REFUNDED':
      return { ...base, nuevaMembresia: 'refunded', churnTipo: null, tx: tx('refund') };
    case 'PURCHASE_CHARGEBACK':
      return { ...base, nuevaMembresia: 'chargeback', churnTipo: null, tx: tx('chargeback') };
    default:
      return { ...base, nuevaMembresia: null, churnTipo: null, tx: null }; // se registra como "ignorado"
  }
}
