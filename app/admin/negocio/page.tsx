// NEGOCIO — ¿conseguir clientes vale la pena? CAC, LTV, relación entre ambos, recuperación y ganancia por canal.

import Link from 'next/link';
import { Encabezado, Insignia, Kpi, SelectorMes, SinDatos, Tabla, Tarjeta } from '@/components/admin/ui';
import { calcularCanales, churnMensual } from '@/lib/admin/derivados';
import { cargarNegocio, cargarVentas } from '@/lib/admin/datos';
import { dinero, mesDeParametro, pct, porcentaje, rangoDeMes, SIN_DATOS } from '@/lib/admin/formato';

export default async function NegocioPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [negocio, ventas] = await Promise.all([cargarNegocio(mes), cargarVentas(mes)]);
  const canales = calcularCanales(negocio, ventas);
  const churn = churnMensual(ventas);
  const t = negocio.trial;

  return (
    <>
      <Encabezado titulo="Negocio" descripcion="Si cada canal te deja más de lo que cuesta. Con esto decides dónde poner más dinero y dónde parar.">
        <SelectorMes rango={rango} base="/admin/negocio" />
      </Encabezado>

      <section aria-label="Números del negocio" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          etiqueta="De la prueba gratis al pago"
          valor={t.pruebas === 0 ? null : pct(porcentaje(t.pagaron, t.pruebas))}
          detalle={t.pruebas === 0 ? 'Aún no hay pruebas gratis registradas por Hotmart.' : `${t.pagaron} de ${t.pruebas} pagaron al terminar su prueba`}
        />
        <Kpi
          etiqueta="Bajas del mes"
          valor={churn === null ? null : pct(churn * 100, 1)}
          detalle={churn === null ? 'Aún no hay bajas que permitan estimar cuánto dura un cliente.' : 'De los suscriptores que había al empezar el mes'}
        />
        <Kpi etiqueta="Canales con datos" valor={String(canales.length)} detalle={canales.length === 0 ? 'Aparecen con la primera venta o al anotar un gasto.' : 'Con ventas o con gasto en el mes'} />
      </section>

      <Tarjeta titulo="Canal por canal" subtitulo={`${rango.etiqueta}. Cada moneda por separado. La ganancia del canal es antes de tus costos fijos (infraestructura y correos).`}>
        {canales.length === 0 ? (
          <SinDatos queFalta="Se llena con las ventas que avise Hotmart (de dónde llegó cada cliente) y con el gasto que anotes en Costos." />
        ) : (
          <Tabla
            encabezados={[
              { texto: 'Canal' },
              { texto: 'Clientes nuevos', derecha: true },
              { texto: 'Gastaste', derecha: true },
              { texto: 'Cuesta conseguir 1', derecha: true },
              { texto: 'Cada cliente deja', derecha: true },
              { texto: 'Relación', derecha: true },
              { texto: 'Recuperas en', derecha: true },
              { texto: 'Ganancia del canal', derecha: true },
            ]}
          >
            {canales.map((c) => (
              <tr key={`${c.canal}-${c.moneda}`} className="border-t border-black/5">
                <th scope="row" className="px-3 py-3 text-left font-bold">
                  {c.canal} <Insignia tono="gris">{c.moneda}</Insignia>
                </th>
                <td className="px-3 py-3 text-right tabular-nums">{c.nuevos}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{c.gasto > 0 ? dinero(c.gasto, c.moneda) : 'Sin gasto anotado'}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{c.cac !== null ? dinero(c.cac, c.moneda) : SIN_DATOS}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                  {c.ltv !== null ? `${dinero(c.ltv, c.moneda)} en total` : c.ingreso_mensual_cliente !== null ? `${dinero(c.ingreso_mensual_cliente, c.moneda)} al mes` : SIN_DATOS}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums">
                  {c.ratio !== null ? (
                    <Insignia tono={c.ratio >= 3 ? 'verde' : c.ratio >= 1 ? 'oro' : 'rojo'}>{c.ratio.toFixed(1)} a 1</Insignia>
                  ) : (
                    SIN_DATOS
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{c.recuperaMeses !== null ? `${c.recuperaMeses.toFixed(1)} meses` : SIN_DATOS}</td>
                <td className={`whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums ${c.ganancia < 0 ? 'text-[var(--rojo-text)]' : ''}`}>{dinero(c.ganancia, c.moneda)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Tarjeta>

      {canales.some((c) => c.ratio !== null) && (
        <Tarjeta titulo="Qué significa">
          <ul className="flex flex-col gap-3 text-base">
            {canales
              .filter((c) => c.ratio !== null)
              .map((c) => (
                <li key={`${c.canal}-${c.moneda}`}>
                  <b>{c.canal}:</b> por cada $1 que gastas en conseguir un cliente, recuperas <b>${c.ratio!.toFixed(2)}</b> en toda su vida.{' '}
                  {c.ratio! >= 3 ? 'Está sano (3 a 1 o más): podrías invertir más.' : c.ratio! >= 1 ? 'Gana, pero por debajo del 3 a 1 sano: revisa cómo bajar el costo.' : 'Pierde dinero: pausa el gasto aquí.'}
                </li>
              ))}
          </ul>
        </Tarjeta>
      )}

      <p className="text-sm text-[var(--text-secondary)]">
        Cuánto dura un cliente se estima con las bajas de este mes, igual para todos los canales; mientras haya pocas bajas es solo una guía. Anota lo que gastas en anuncios, afiliados o contenido en{' '}
        <Link href="/admin/costos" className="font-semibold text-[var(--accent)] underline underline-offset-4">
          Costos
        </Link>{' '}
        para ver el costo por cliente.
      </p>
    </>
  );
}
