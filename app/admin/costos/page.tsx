// COSTOS Y GASTOS — lo que ningún servicio le avisa solo al panel: lo que pagas por infraestructura y correos,
// tu tasa de impuestos y lo que gastas en conseguir clientes. Con esto la ganancia y el costo por cliente se calculan reales.

import { BotonBorrar, CostoForm, GastoForm, TasaForm } from '@/components/admin/Formularios';
import { Encabezado, SelectorMes, Tabla, Tarjeta } from '@/components/admin/ui';
import { cargarCostos, cargarGastos, cargarTasaImpuestos } from '@/lib/admin/datos';
import { dinero, etiquetaMes, mesDeParametro, rangoDeMes } from '@/lib/admin/formato';

const CONCEPTO: Record<string, string> = { infra: 'Infraestructura', email: 'Correos', dominio: 'Dominio', otro: 'Otro' };

export default async function CostosPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [costos, gastos, tasa] = await Promise.all([cargarCostos(mes), cargarGastos(), cargarTasaImpuestos()]);
  const hoy = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);

  return (
    <>
      <Encabezado titulo="Costos y gastos" descripcion="Anota aquí lo que pagas. Con estos datos el panel calcula tu ganancia y lo que cuesta conseguir cada cliente.">
        <SelectorMes rango={rango} base="/admin/costos" />
      </Encabezado>

      <Tarjeta titulo="Tus impuestos" subtitulo="El porcentaje que apartas de lo que cobras (por ejemplo, el que te indique tu contador). Se usa para calcular la ganancia.">
        <TasaForm actual={tasa} />
      </Tarjeta>

      <Tarjeta titulo={`Costos de ${rango.etiqueta.toLowerCase()}`} subtitulo="Lo que pagas cada mes por mantener la app funcionando.">
        <div className="flex flex-col gap-6">
          <CostoForm mes={mes} />
          <Tabla
            encabezados={[{ texto: 'Qué es' }, { texto: 'Nota' }, { texto: 'Importe', derecha: true }, { texto: '' }]}
            vacio={costos.length === 0 ? `Aún no anotas costos de ${etiquetaMes(mes).toLowerCase()}. Mientras falten, la ganancia de ese mes aparece como estimación.` : undefined}
          >
            {costos.map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <th scope="row" className="px-3 py-3 text-left font-medium">{CONCEPTO[c.concepto] ?? c.concepto}</th>
                <td className="px-3 py-3 text-[var(--text-secondary)]">{c.nota ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums">{dinero(c.monto_minor, c.moneda)}</td>
                <td className="px-1 py-1">
                  <BotonBorrar id={c.id} accion="costo" descripcion={`el costo de ${CONCEPTO[c.concepto] ?? c.concepto} por ${dinero(c.monto_minor, c.moneda)}`} />
                </td>
              </tr>
            ))}
          </Tabla>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Gasto en conseguir clientes" subtitulo="Anuncios, comisiones fuera de Hotmart, contenido pagado. Usa el mismo nombre de canal que verás en Negocio (por ejemplo ads_meta).">
        <div className="flex flex-col gap-6">
          <GastoForm hoy={hoy} />
          <Tabla
            encabezados={[{ texto: 'Canal' }, { texto: 'Periodo' }, { texto: 'Nota' }, { texto: 'Importe', derecha: true }, { texto: '' }]}
            vacio={gastos.length === 0 ? 'Aún no anotas gastos. Sin ellos no se puede calcular cuánto cuesta conseguir un cliente.' : undefined}
          >
            {gastos.map((g) => (
              <tr key={g.id} className="border-t border-black/5">
                <th scope="row" className="px-3 py-3 text-left font-medium">{g.canal}</th>
                <td className="whitespace-nowrap px-3 py-3">
                  {g.desde} → {g.hasta}
                </td>
                <td className="px-3 py-3 text-[var(--text-secondary)]">{g.nota ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums">{dinero(g.monto_minor, g.moneda)}</td>
                <td className="px-1 py-1">
                  <BotonBorrar id={g.id} accion="gasto" descripcion={`el gasto de ${g.canal} por ${dinero(g.monto_minor, g.moneda)}`} />
                </td>
              </tr>
            ))}
          </Tabla>
        </div>
      </Tarjeta>
    </>
  );
}
