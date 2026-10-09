// NEGOCIO — ¿conseguir clientes vale la pena? Una decisión por canal, con el costo por cliente y lo que cada uno deja.

import Link from 'next/link';
import { Encabezado, Heroe, Insignia, Kpi, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { CifraDinero, CifraPorcentaje } from '@/components/admin/Cifras';
import { calcularCanales, churnMensual, type CanalCalculado } from '@/lib/admin/derivados';
import { cargarNegocio, cargarVentas } from '@/lib/admin/datos';
import { nombreCanal } from '@/lib/admin/etiquetas';
import { dinero, mesDeParametro, porcentaje, rangoDeMes } from '@/lib/admin/formato';

const VEREDICTO: Record<CanalCalculado['veredicto'], { texto: string; tono: 'verde' | 'oro' | 'rojo' | 'gris' | 'azul' }> = {
  invertir: { texto: 'Invierte más', tono: 'verde' },
  ajustar: { texto: 'Ajusta el costo', tono: 'oro' },
  pausar: { texto: 'Pausa el gasto', tono: 'rojo' },
  sin_datos: { texto: 'Aún sin datos para decidir', tono: 'gris' },
  sin_gasto: { texto: 'Sin gasto anotado', tono: 'azul' },
};

function TarjetaCanal({ c }: { c: CanalCalculado }) {
  const v = VEREDICTO[c.veredicto];
  const datos: [string, string][] = [['Clientes nuevos', String(c.nuevos)]];
  if (c.cac !== null) datos.push(['Cuesta conseguir a 1', dinero(c.cac, c.moneda)]);
  if (c.ltv !== null) datos.push(['Cada cliente deja en total', dinero(c.ltv, c.moneda)]);
  else if (c.ingreso_mensual_cliente !== null) datos.push(['Cada cliente deja al mes', dinero(c.ingreso_mensual_cliente, c.moneda)]);
  if (c.recuperaMeses !== null) datos.push(['Recuperas lo gastado en', `${c.recuperaMeses.toFixed(1)} meses`]);
  if (c.gasto > 0) datos.push(['Gastaste', dinero(c.gasto, c.moneda)]);
  return (
    <article className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold [font-family:var(--font-display)]">{nombreCanal(c.canal)}</h3>
        <Insignia tono={v.tono}>{v.texto}</Insignia>
      </div>
      <p className="mt-2 text-sm">{c.frase}</p>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
        {datos.map(([k, val]) => (
          <div key={k} className="contents">
            <dt className="text-[var(--text-secondary)]">{k}</dt>
            <dd className="text-right font-semibold tabular-nums">{val}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-black/10 pt-3">
        <span className="text-sm font-semibold">Ganancia del canal</span>
        <b className={`text-xl tabular-nums [font-family:var(--font-display)] ${c.ganancia < 0 ? 'text-[var(--rojo-text)]' : ''}`}>{dinero(c.ganancia, c.moneda)}</b>
      </p>
      {c.veredicto === 'sin_gasto' && (
        <Link href="/admin/costos" className="panel-tap mt-1 flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline underline-offset-4">
          Anotar lo que gastaste aquí
        </Link>
      )}
    </article>
  );
}

export default async function NegocioPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [negocio, ventas] = await Promise.all([cargarNegocio(mes), cargarVentas(mes)]);
  const canales = calcularCanales(negocio, ventas);
  const churn = churnMensual(ventas);
  const t = negocio.trial;
  const monedas = [...new Set(canales.map((c) => c.moneda))];

  return (
    <>
      <Encabezado titulo="Negocio" descripcion="Si cada canal te deja más de lo que cuesta. Con esto decides dónde poner más dinero y dónde parar.">
        <SelectorMes rango={rango} base="/admin/negocio" />
      </Encabezado>

      {monedas.length === 0 ? (
        <Tarjeta titulo={`Canales de ${rango.etiqueta}`}>
          <SinDatos queFalta="Se llena con las ventas que avise Hotmart (de dónde llegó cada cliente) y con el gasto que anotes en Costos." />
        </Tarjeta>
      ) : (
        monedas.map((moneda) => {
          const delaMoneda = canales.filter((c) => c.moneda === moneda).sort((x, y) => x.ganancia - y.ganancia); // primero el que más atención pide
          const total = delaMoneda.reduce((t2, c) => t2 + c.ganancia, 0);
          return (
            <section key={moneda} aria-label={`Canales en ${moneda}`} className="flex flex-col gap-4">
              <Heroe>
                <p className="text-sm font-semibold opacity-90">
                  {rango.etiqueta} · {moneda}
                </p>
                <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
                  Entre todos tus canales {total >= 0 ? 'dejaron' : 'perdieron'}{' '}
                  <span className="text-[var(--accent-on-dark)]">
                    <CifraDinero centavos={Math.abs(total)} moneda={moneda} />
                  </span>
                </p>
                <p className="mt-3 text-sm opacity-90">
                  Después de Hotmart, afiliados y lo que gastaste en conseguir clientes; antes de servidores y correos.
                </p>
              </Heroe>
              <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
                {delaMoneda.map((c) => (
                  <TarjetaCanal key={`${c.canal}-${c.moneda}`} c={c} />
                ))}
              </div>
            </section>
          );
        })
      )}

      <section aria-label="Prueba gratis y bajas" className="grid grid-cols-2 gap-3 lg:gap-4">
        <Kpi
          etiqueta="De la prueba al pago"
          valor={t.pruebas === 0 ? null : <CifraPorcentaje valor={porcentaje(t.pagaron, t.pruebas) ?? 0} />}
          detalle={t.pruebas === 0 ? 'Aún no hay pruebas gratis registradas por Hotmart.' : `${t.pagaron} de ${t.pruebas} pagaron al terminar su prueba`}
        />
        <Kpi
          etiqueta="Bajas del mes"
          valor={churn === null ? null : <CifraPorcentaje valor={churn * 100} decimales={1} />}
          detalle={churn === null ? 'Aún no hay bajas que permitan estimar cuánto dura un cliente.' : `Más o menos 1 de cada ${Math.max(1, Math.round(1 / churn))} suscriptores se va cada mes`}
          tono={churn !== null && churn > 0.1 ? 'mal' : 'neutro'}
        />
      </section>

      <p className="text-sm text-[var(--text-secondary)]">Cuánto dura un cliente se estima con las bajas del mes: con pocas bajas es solo una guía.</p>
    </>
  );
}
