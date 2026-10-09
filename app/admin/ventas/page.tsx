// VENTAS — ingresos, compras, reembolsos, bajas (voluntarias vs por pago fallido) e ingreso mensual recurrente.

import { BarraHorizontal, Encabezado, Insignia, Kpi, SelectorMes, SinDatos, Tabla, Tarjeta } from '@/components/admin/ui';
import { BarrasMensuales } from '@/components/admin/Graficos';
import { churnMensual } from '@/lib/admin/derivados';
import { cargarVentas } from '@/lib/admin/datos';
import { dinero, ETIQUETA_MEMBRESIA, etiquetaMesCorta, fechaHora, mesDeParametro, pct, rangoDeMes } from '@/lib/admin/formato';

export default async function Ventas({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const v = await cargarVentas(mes);
  const b = v.bajas;
  const bajas = b.voluntarias + b.involuntarias + b.otras;
  const churn = churnMensual(v);
  const monedas = [...new Set([...v.por_moneda.map((m) => m.moneda), ...v.serie.map((s) => s.moneda)])];

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
          const filas = v.serie.filter((s) => s.moneda === moneda);
          return (
            <section key={moneda} aria-label={`Ventas en ${moneda}`} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Insignia tono="azul">{moneda}</Insignia>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi etiqueta={`Ingresos de ${rango.etiqueta.toLowerCase()}`} valor={m ? dinero(m.ingresos, moneda) : dinero(0, moneda)} detalle={m ? `${m.ventas} cobro${m.ventas === 1 ? '' : 's'} en el mes` : 'Sin cobros este mes'} />
                <Kpi etiqueta="Compras nuevas" valor={m ? String(m.nuevas) : '0'} detalle={m ? `${m.renovaciones} renovación${m.renovaciones === 1 ? '' : 'es'} de clientes anteriores` : undefined} />
                <Kpi
                  etiqueta="Reembolsos"
                  valor={m && m.n_reembolsos > 0 ? dinero(m.reembolsos, moneda) : dinero(0, moneda)}
                  detalle={m && m.n_reembolsos > 0 ? `${m.n_reembolsos} devolución${m.n_reembolsos === 1 ? '' : 'es'} o contracargo${m.n_reembolsos === 1 ? '' : 's'}` : 'Ninguno este mes'}
                  tono={m && m.n_reembolsos > 0 ? 'mal' : 'neutro'}
                />
                <Kpi
                  etiqueta="Ingreso mensual recurrente"
                  valor={mrr ? dinero(mrr.mrr, moneda) : null}
                  detalle={mrr ? `${mrr.suscripciones} suscripción${mrr.suscripciones === 1 ? '' : 'es'} viva${mrr.suscripciones === 1 ? '' : 's'}; lo anual se reparte en 12 meses` : 'Aparece con la primera suscripción activa de ciclo conocido.'}
                />
              </div>
              {acumulado && <p className="text-sm text-[var(--text-secondary)]">Acumulado desde el inicio: <b className="text-[var(--text-primary)]">{dinero(acumulado.ingresos, moneda)}</b></p>}
              <Tarjeta titulo="Evolución de ingresos" subtitulo="Últimos 12 meses (cobrado, antes de comisiones).">
                <BarrasMensuales
                  datos={filas.map((f) => ({ mes: f.mes, etiqueta: etiquetaMesCorta(f.mes), valor: f.ingresos / 100, texto: dinero(f.ingresos, moneda).replace(` ${moneda}`, '') }))}
                  resumen={`Ingresos mensuales en ${moneda}: ${filas.map((f) => `${f.mes} ${dinero(f.ingresos, moneda)}`).join(', ')}`}
                />
              </Tarjeta>
            </section>
          );
        })
      )}
      {v.mrr_sin_ciclo > 0 && <SinDatos titulo="Hay suscripciones sin ciclo conocido" queFalta={`${v.mrr_sin_ciclo} suscripción(es) no dicen si son mensuales o anuales, así que no se incluyen en el ingreso mensual recurrente (no se adivina). Se corrige al verificar el aviso real de Hotmart.`} />}

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
              {churn !== null && <>De {b.activos_inicio} suscriptor{b.activos_inicio === 1 ? '' : 'es'} al inicio del mes, se fue el <b className="text-[var(--text-primary)]">{pct(churn * 100, 1)}</b>. </>}
              {b.involuntarias > 0 && <>Referencia de la industria: cerca de un tercio de las bajas suele ser por pago fallido; si en tu caso pesa mucho más, el problema es el cobro y no el producto.</>}
            </p>
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Personas por tipo de membresía" subtitulo="Cuántas cuentas hay en cada situación (sin contar la tuya).">
        <div className="flex flex-wrap gap-2">
          {Object.entries(v.membresias).map(([k, n]) => (
            <Insignia key={k} tono={k === 'active' ? 'verde' : k === 'past_due' ? 'oro' : k === 'refunded' || k === 'chargeback' ? 'rojo' : 'gris'}>
              {ETIQUETA_MEMBRESIA[k] ?? k}: {n}
            </Insignia>
          ))}
          {Object.keys(v.membresias).length === 0 && <span className="text-sm text-[var(--text-secondary)]">Aún no hay cuentas.</span>}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Últimos movimientos">
        <Tabla
          encabezados={[{ texto: 'Cuándo' }, { texto: 'Quién' }, { texto: 'Qué pasó' }, { texto: 'Canal' }, { texto: 'Importe', derecha: true }]}
          vacio={v.ultimas.length === 0 ? 'Aún no hay movimientos. Aparecerán con los avisos de Hotmart.' : undefined}
        >
          {v.ultimas.map((u, i) => (
            <tr key={`${u.cuando}-${i}`} className="border-t border-black/5">
              <td className="whitespace-nowrap px-3 py-3">{fechaHora(u.cuando)}</td>
              <td className="px-3 py-3">{u.email}</td>
              <td className="px-3 py-3">
                <Insignia tono={u.tipo === 'sale' ? 'verde' : 'rojo'}>{u.tipo === 'sale' ? 'Compra' : u.tipo === 'refund' ? 'Reembolso' : 'Contracargo'}</Insignia>
              </td>
              <td className="px-3 py-3">{u.canal}</td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums">{u.tipo === 'sale' ? '' : '−'}{dinero(u.monto, u.moneda)}</td>
            </tr>
          ))}
        </Tabla>
      </Tarjeta>
    </>
  );
}
