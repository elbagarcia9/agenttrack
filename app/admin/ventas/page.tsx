// VENTAS — cuánto cobraste, cuánta gente compró, cuánta se fue y por qué.

import { BarraHorizontal, Encabezado, Heroe, Insignia, Kpi, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { CifraDinero, CifraEntera } from '@/components/admin/Cifras';
import { BarrasMensuales } from '@/components/admin/Graficos';
import { churnMensual } from '@/lib/admin/derivados';
import { cargarVentas } from '@/lib/admin/datos';
import { nombreCanal } from '@/lib/admin/etiquetas';
import { dinero, etiquetaMesCorta, fechaHora, mesDeParametro, pct, pesosCortos, rangoDeMes, serie12 } from '@/lib/admin/formato';

const SINGULAR: Record<string, string> = { active: 'activa', trialing: 'en prueba', past_due: 'con pago atrasado', cancelled: 'cancelada', expired: 'vencida', refunded: 'reembolsada', chargeback: 'con devolución del banco', manual: 'con acceso manual', sin_membresia: 'sin membresía' };
const ETIQUETA_PLURAL: Record<string, string> = { active: 'activas', trialing: 'en prueba', past_due: 'con pago atrasado', cancelled: 'canceladas', expired: 'vencidas', refunded: 'reembolsadas', chargeback: 'con devolución del banco', manual: 'con acceso manual', sin_membresia: 'sin membresía' };

export default async function Ventas({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const v = await cargarVentas(mes);
  const b = v.bajas;
  const bajas = b.voluntarias + b.involuntarias + b.otras;
  const churn = churnMensual(v);
  const monedas = [...new Set([...v.por_moneda.map((m) => m.moneda), ...v.serie.map((s) => s.moneda)])];
  // Las 3 más grandes y el resto agrupado en "Otras": menos chips, misma información
  const ordenadas = Object.entries(v.membresias).sort((x, y) => y[1] - x[1]);
  const otras = ordenadas.slice(3).reduce((t, [, n]) => t + n, 0);
  const chipsMembresia: [string, number][] = [...ordenadas.slice(0, 3), ...(otras > 0 ? ([['otras', otras]] as [string, number][]) : [])];

  return (
    <>
      <Encabezado titulo="Ventas" descripcion="Cuánto cobraste, cuánta gente compró y cuánta se fue. Cada moneda va por separado: nunca se suman.">
        <SelectorMes rango={rango} base="/admin/ventas" />
      </Encabezado>

      {monedas.length === 0 ? (
        <Tarjeta titulo={`Ventas de ${rango.etiqueta}`}>
          <SinDatos queFalta="Todavía no hay ventas. Aparecerán solas cuando Hotmart avise la primera compra (hay que conectar el aviso de Hotmart con tu app)." />
        </Tarjeta>
      ) : (
        monedas.map((moneda) => {
          const m = v.por_moneda.find((x) => x.moneda === moneda);
          const mrr = v.mrr.find((x) => x.moneda === moneda);
          const acumulado = v.acumulado.find((x) => x.moneda === moneda);
          const filas = serie12(v.serie.filter((s) => s.moneda === moneda), (mes) => ({ mes, moneda, ingresos: 0, reembolsos: 0 }));
          return (
            <section key={moneda} aria-label={`Ventas en ${moneda}`} className="flex flex-col gap-4">
              <Heroe franja={m && m.n_reembolsos > 0 ? `${m.n_reembolsos} ${m.n_reembolsos === 1 ? 'devolución' : 'devoluciones'} este mes por ${dinero(m.reembolsos, moneda)}` : undefined}>
                <p className="text-sm font-semibold opacity-90">
                  {rango.etiqueta} · {moneda}
                </p>
                <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
                  Cobraste{' '}
                  <span className="text-[var(--accent-on-dark)]">
                    <CifraDinero centavos={m?.ingresos ?? 0} moneda={moneda} />
                  </span>{' '}
                  este mes
                </p>
                <p className="mt-3 text-sm opacity-90">
                  {m ? `${m.nuevas} ${m.nuevas === 1 ? 'compra nueva' : 'compras nuevas'} · ${m.renovaciones} ${m.renovaciones === 1 ? 'renovación' : 'renovaciones'}` : 'Sin cobros este mes'}
                  {acumulado && <> · {dinero(acumulado.ingresos, moneda)} acumulado desde el inicio</>}
                </p>
              </Heroe>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <Kpi
                  etiqueta="Entra cada mes"
                  valor={mrr ? <CifraDinero centavos={mrr.mrr} moneda={moneda} /> : null}
                  detalle={mrr ? `${mrr.suscripciones} ${mrr.suscripciones === 1 ? 'suscripción activa' : 'suscripciones activas'}; lo anual se reparte en 12 meses` : 'Aparece con la primera suscripción activa.'}
                />
                <Kpi etiqueta="Suscripciones activas" valor={mrr ? <CifraEntera valor={mrr.suscripciones} /> : null} detalle="Pagando ahora mismo" />
              </div>
              <Tarjeta titulo={`Evolución de ingresos (${moneda})`} subtitulo="Últimos 12 meses, lo cobrado antes de comisiones.">
                <BarrasMensuales
                  datos={filas.map((f) => ({ mes: f.mes, etiqueta: etiquetaMesCorta(f.mes), valor: f.ingresos / 100, texto: pesosCortos(f.ingresos) }))}
                  resumen={`Ingresos mensuales en ${moneda}: ${filas.map((f) => `${f.mes} ${dinero(f.ingresos, moneda)}`).join(', ')}`}
                />
              </Tarjeta>
            </section>
          );
        })
      )}
      {v.mrr_sin_ciclo > 0 && <SinDatos titulo="Hay suscripciones sin ciclo conocido" queFalta={`${v.mrr_sin_ciclo} suscripción(es) no dicen si son mensuales o anuales, así que no se incluyen en lo que entra cada mes (no se adivina). Se corrige al verificar el aviso real de Hotmart.`} />}

      <Tarjeta titulo="Bajas" subtitulo={`Quién se fue en ${rango.etiqueta.toLowerCase()} y por qué. Se arreglan distinto: unas con retención, otras con recordatorios de pago.`}>
        {bajas === 0 ? (
          <SinDatos titulo="Sin bajas este mes" queFalta={b.activos_inicio === 0 ? 'Aún no había suscriptores al inicio del mes para medir bajas.' : 'Nadie canceló ni dejó de pagar este mes.'} />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <BarraHorizontal etiqueta="Decidieron irse (cancelaron)" valor={b.voluntarias} max={bajas} texto={`${b.voluntarias}`} />
              <BarraHorizontal etiqueta="Se fueron por pago fallido" valor={b.involuntarias} max={bajas} texto={`${b.involuntarias}`} tono="rojo" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {churn !== null && (
                <>
                  De {b.activos_inicio} {b.activos_inicio === 1 ? 'suscriptor' : 'suscriptores'} al inicio del mes, se fue el <b className="text-[var(--text-primary)]">{pct(churn * 100, 1)}</b>.{' '}
                </>
              )}
              {b.involuntarias > 0 && <>Normal: ~1 de cada 3 bajas es por pago fallido. Si pesa más, el problema es el cobro.</>}
            </p>
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Últimos movimientos" hundida>
        {v.ultimas.length === 0 ? (
          <SinDatos queFalta="Aún no hay movimientos. Aparecerán con los avisos de Hotmart." />
        ) : (
          <ul className="flex flex-col divide-y divide-black/10">
            {v.ultimas.map((u, i) => (
              <li key={`${u.cuando}-${i}`} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{u.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {fechaHora(u.cuando)} · {nombreCanal(u.canal)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums">
                    {u.tipo === 'sale' ? '' : '−'}
                    {dinero(u.monto, u.moneda)}
                  </p>
                  <Insignia tono={u.tipo === 'sale' ? 'verde' : 'rojo'}>{u.tipo === 'sale' ? 'Compra' : u.tipo === 'refund' ? 'Reembolso' : 'Devolución del banco'}</Insignia>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta titulo="Personas por membresía" subtitulo="Sin contar tu cuenta." hundida>
        <ul className="flex flex-wrap gap-2">
          {chipsMembresia.map(([k, n]) => (
            <li key={k}>
              <Insignia tono={k === 'active' ? 'verde' : k === 'past_due' ? 'oro' : 'gris'}>
                {n} {n === 1 ? (SINGULAR[k] ?? 'otra') : (ETIQUETA_PLURAL[k] ?? 'otras')}
              </Insignia>
            </li>
          ))}
          {chipsMembresia.length === 0 && <li className="text-sm text-[var(--text-secondary)]">Aún no hay cuentas.</li>}
        </ul>
      </Tarjeta>
    </>
  );
}
