// COSTOS Y GASTOS — lo que ningún servicio le avisa solo al panel: lo que pagas por servidores y correos,
// tu tasa de impuestos y lo que gastas en conseguir clientes. Con esto la ganancia y el costo por cliente se calculan reales.

import { CostoForm, GastoForm, TasaForm } from '@/components/admin/Formularios';
import { BotonBorrar } from '@/components/admin/Interacciones';
import { Datos, Encabezado, Heroe, SelectorMes, Tarjeta } from '@/components/admin/ui';
import { CifraDinero } from '@/components/admin/Cifras';
import { cargarCostos, cargarGastos, cargarTasaImpuestos } from '@/lib/admin/datos';
import { nombreCanal } from '@/lib/admin/etiquetas';
import { dinero, etiquetaMes, mesDeParametro, periodo, pct, rangoDeMes } from '@/lib/admin/formato';

const CONCEPTO: Record<string, string> = { infra: 'Servidores y base de datos', email: 'Envío de correos', dominio: 'Dominio', otro: 'Otro' };

function Plegable({ titulo, abierto = false, children }: { titulo: string; abierto?: boolean; children: React.ReactNode }) {
  return (
    <details open={abierto} className="group rounded-[var(--radius-card)] bg-[var(--surface-2)] px-4 py-1">
      <summary className="panel-tap flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[var(--accent)] [&::-webkit-details-marker]:hidden">
        {titulo}
        <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-4 pt-2">{children}</div>
    </details>
  );
}

export default async function CostosPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [costos, todosLosGastos, tasa] = await Promise.all([cargarCostos(mes), cargarGastos(), cargarTasaImpuestos()]);
  const [a, m] = mes.split('-').map(Number);
  const inicio = `${mes}-01`;
  const fin = `${mes}-${String(new Date(Date.UTC(a, m, 0)).getUTCDate()).padStart(2, '0')}`;
  const gastos = todosLosGastos.filter((g) => g.hasta >= inicio && g.desde <= fin);
  const hoy = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);

  const monedas = [...new Set([...costos.map((c) => c.moneda), ...gastos.map((g) => g.moneda)])];
  const faltan = [!costos.some((c) => c.concepto === 'infra') && 'servidores', !costos.some((c) => c.concepto === 'email') && 'correos'].filter(Boolean) as string[];

  return (
    <>
      <Encabezado titulo="Costos y gastos" descripcion="Anota aquí lo que pagas. Con estos datos el panel calcula tu ganancia y lo que cuesta conseguir cada cliente.">
        <SelectorMes rango={rango} base="/admin/costos" />
      </Encabezado>

      <Heroe franja={faltan.length > 0 ? `Falta anotar este mes: ${faltan.join(' y ')}` : undefined}>
        <p className="text-sm font-semibold opacity-90">{rango.etiqueta}</p>
        {monedas.length === 0 ? (
          <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">Aún no anotas nada este mes.</p>
        ) : (
          monedas.map((moneda) => {
            const totalCostos = costos.filter((c) => c.moneda === moneda).reduce((t, c) => t + c.monto_minor, 0);
            const totalGasto = gastos.filter((g) => g.moneda === moneda).reduce((t, g) => t + g.monto_minor, 0);
            return (
              <div key={moneda} className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-3xl font-bold tabular-nums text-[var(--accent-on-dark)] [font-family:var(--font-display)] md:text-4xl">
                    <CifraDinero centavos={totalCostos} moneda={moneda} />
                  </p>
                  <p className="text-sm opacity-90">en costos de operar la app</p>
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums text-[var(--accent-on-dark)] [font-family:var(--font-display)] md:text-4xl">
                    <CifraDinero centavos={totalGasto} moneda={moneda} />
                  </p>
                  <p className="text-sm opacity-90">para conseguir clientes</p>
                </div>
              </div>
            );
          })
        )}
      </Heroe>

      <Tarjeta titulo={`Costos de ${etiquetaMes(mes).toLowerCase()}`} subtitulo="Lo que pagas cada mes por mantener la app funcionando.">
        <div className="flex flex-col gap-4">
          <Datos
            filas={costos}
            clave={(c) => String(c.id)}
            vacio={`Aún no anotas costos de ${etiquetaMes(mes).toLowerCase()}. Mientras falten, la ganancia de ese mes aparece como estimación.`}
            columnas={[
              { titulo: 'Qué es', principal: true, celda: (c) => CONCEPTO[c.concepto] ?? c.concepto },
              { titulo: 'Nota', celda: (c) => <span className="text-[var(--text-secondary)]">{c.nota ?? '—'}</span> },
              { titulo: 'Importe', derecha: true, celda: (c) => <b className="whitespace-nowrap">{dinero(c.monto_minor, c.moneda)}</b> },
              { titulo: 'Borrar', acciones: true, celda: (c) => <BotonBorrar id={c.id} accion="costo" descripcion={`el costo de ${(CONCEPTO[c.concepto] ?? c.concepto).toLowerCase()} por ${dinero(c.monto_minor, c.moneda)}`} /> },
            ]}
          />
          <Plegable titulo="Anotar un costo" abierto={costos.length === 0}>
            <CostoForm mes={mes} />
          </Plegable>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Gasto en conseguir clientes" subtitulo={`Anuncios, comisiones fuera de Hotmart, contenido pagado. Se muestran los de ${etiquetaMes(mes).toLowerCase()}.`}>
        <div className="flex flex-col gap-4">
          <Datos
            filas={gastos}
            clave={(g) => String(g.id)}
            vacio="Aún no anotas gastos de este mes. Sin ellos no se puede calcular cuánto cuesta conseguir un cliente."
            columnas={[
              { titulo: 'Canal', principal: true, celda: (g) => nombreCanal(g.canal) },
              { titulo: 'Periodo', celda: (g) => <span className="whitespace-nowrap">{periodo(g.desde, g.hasta)}</span> },
              { titulo: 'Nota', celda: (g) => <span className="text-[var(--text-secondary)]">{g.nota ?? '—'}</span> },
              { titulo: 'Importe', derecha: true, celda: (g) => <b className="whitespace-nowrap">{dinero(g.monto_minor, g.moneda)}</b> },
              { titulo: 'Borrar', acciones: true, celda: (g) => <BotonBorrar id={g.id} accion="gasto" descripcion={`el gasto de ${nombreCanal(g.canal)} por ${dinero(g.monto_minor, g.moneda)}`} /> },
            ]}
          />
          <Plegable titulo="Anotar un gasto" abierto={gastos.length === 0}>
            <GastoForm hoy={hoy} />
          </Plegable>
        </div>
      </Tarjeta>

      <Plegable titulo={tasa === null ? 'Anotar mi tasa de impuestos' : `Mi tasa de impuestos: ${pct(tasa, 1)} · Cambiar`} abierto={tasa === null}>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">El porcentaje que apartas de lo que cobras (el que te indique tu contador). Se usa para calcular la ganancia.</p>
        <TasaForm actual={tasa} />
      </Plegable>
    </>
  );
}
