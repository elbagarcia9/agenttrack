// GANANCIA — lo que de verdad te queda: ingresos − reembolsos − Hotmart − afiliados − impuestos − infraestructura − correos.

import Link from 'next/link';
import { Encabezado, Heroe, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { CifraDinero, CifraPorcentaje } from '@/components/admin/Cifras';
import { calcularGanancia, type Ganancia } from '@/lib/admin/derivados';
import { cargarCostos, cargarTasaImpuestos, cargarVentas } from '@/lib/admin/datos';
import { dinero, mesDeParametro, pct, rangoDeMes } from '@/lib/admin/formato';

function Linea({ texto, valor, moneda, resta = false, fuerte = false, nota, vacio }: { texto: string; valor: number | null; moneda: string; resta?: boolean; fuerte?: boolean; nota?: string; vacio?: string }) {
  return (
    <tr className={fuerte ? 'border-t-2 border-black/15 font-bold' : 'border-t border-black/5'}>
      <th scope="row" className="px-3 py-3 text-left font-medium">
        {resta && <span aria-hidden="true">− </span>}
        {texto}
        {nota && <span className="block text-xs font-normal text-[var(--text-secondary)]">{nota}</span>}
      </th>
      <td className={`whitespace-nowrap px-3 py-3 text-right tabular-nums ${valor === null ? 'text-[var(--text-secondary)]' : ''}`}>{valor === null ? (vacio ?? 'Sin datos') : dinero(valor, moneda)}</td>
    </tr>
  );
}

// A dónde se va cada $100 que entran: la parte azul es lo que te queda
function DondeSeVa({ g }: { g: Ganancia }) {
  if (g.ingresosNetos <= 0) return null;
  const partes = [
    { n: 'Hotmart', v: g.hotmart, c: 'bg-[var(--slate)]' },
    { n: 'Afiliados', v: g.afiliados, c: 'bg-[var(--text-secondary)]' },
    { n: 'Impuestos', v: g.impuestos ?? 0, c: 'bg-[color-mix(in_oklab,var(--accent)_45%,var(--surface))]' },
    { n: 'Servidores', v: g.infra ?? 0, c: 'bg-[color-mix(in_oklab,var(--accent)_25%,var(--surface))]' },
    { n: 'Correos y otros', v: (g.email ?? 0) + (g.otros ?? 0), c: 'bg-[var(--surface-2)] ring-1 ring-black/15' },
  ].filter((p) => p.v > 0);
  const quedan = Math.max(g.ganancia, 0);
  const pctDe = (v: number) => Math.round((v / g.ingresosNetos) * 100);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">De cada $100 que entran…</p>
      <div className="panel-barra flex h-4 overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={`Te quedan $${pctDe(quedan)} de cada $100; el resto se va en costos`}>
        {partes.map((p) => (
          <div key={p.n} className={p.c} style={{ width: `${(p.v / g.ingresosNetos) * 100}%` }} />
        ))}
        <div className="bg-[var(--accent)]" style={{ width: `${(quedan / g.ingresosNetos) * 100}%` }} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {partes.map((p) => (
          <li key={p.n} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-full ${p.c}`} aria-hidden="true" />
            {p.n}: ${pctDe(p.v)}
          </li>
        ))}
        <li className="flex items-center gap-1.5 font-bold">
          <span className="size-3 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          Te quedan: ${pctDe(quedan)}
        </li>
      </ul>
    </div>
  );
}

function Desglose({ g, tasa, etiquetaMes }: { g: Ganancia; tasa: number | null; etiquetaMes: string }) {
  return (
    <section aria-label={`Ganancia en ${g.moneda}`} className="flex flex-col gap-4">
      <Heroe franja={g.faltantes.length > 0 ? 'Estimación: faltan costos por anotar' : undefined} href={g.faltantes.length > 0 ? '/admin/costos' : undefined}>
        <p className="text-sm font-semibold opacity-90">{etiquetaMes}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-90">Facturaste</p>
            <p className="text-3xl font-bold tabular-nums [font-family:var(--font-display)] md:text-4xl">
              <CifraDinero centavos={g.ingresosBrutos} moneda={g.moneda} />
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">{g.ganancia >= 0 ? 'Te quedaron limpios' : 'Perdiste este mes'}</p>
            <p className="text-3xl font-bold tabular-nums text-[var(--accent-on-dark)] [font-family:var(--font-display)] md:text-4xl">
              <CifraDinero centavos={Math.abs(g.ganancia)} moneda={g.moneda} />
            </p>
            {g.margenPct !== null && g.ganancia >= 0 && (
              <p className="mt-1 text-sm opacity-90">
                Margen: <CifraPorcentaje valor={g.margenPct} decimales={1} />
              </p>
            )}
          </div>
        </div>
      </Heroe>

      <Tarjeta titulo="Cómo se calcula" subtitulo="Del cobro bruto a lo que te queda. Aún no se compara con el depósito real que te hace Hotmart.">
        <div className="flex flex-col gap-6">
          <DondeSeVa g={g} />
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-[var(--surface)]">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Desglose de la ganancia en {g.moneda}</caption>
              <tbody>
                <Linea texto="Facturaste" valor={g.ingresosBrutos} moneda={g.moneda} />
                <Linea texto="Reembolsos" valor={g.reembolsos} moneda={g.moneda} resta />
                <Linea texto="Ingresos netos" valor={g.ingresosNetos} moneda={g.moneda} fuerte />
                <Linea texto="Comisión de Hotmart" valor={g.hotmart} moneda={g.moneda} resta nota="Lo que Hotmart avisa que se quedó en cada venta." />
                <Linea texto="Comisión de afiliados" valor={g.afiliados} moneda={g.moneda} resta />
                <Linea texto="Impuestos" valor={g.impuestos} moneda={g.moneda} resta nota={tasa === null ? 'Falta tu tasa de impuestos (se anota en Costos).' : `Supuesto: ${pct(tasa, 1)} de tus ingresos netos.`} />
                <Linea texto="Servidores" valor={g.infra} moneda={g.moneda} resta />
                <Linea texto="Correos" valor={g.email} moneda={g.moneda} resta />
                <Linea texto="Dominio y otros" valor={g.otros} moneda={g.moneda} resta vacio="No anotado" />
                <Linea texto="Resultado del mes" valor={g.ganancia} moneda={g.moneda} fuerte />
              </tbody>
            </table>
          </div>
          {g.faltantes.length > 0 && (
            <p className="rounded-[var(--radius-button)] bg-[var(--alerta-bg)] p-3 text-sm font-medium text-[var(--alerta-text)]">
              Para dejar de ser estimación falta: {g.faltantes.join(', ')}.{' '}
              <Link href="/admin/costos" className="font-bold underline underline-offset-4">
                Anótalo en Costos
              </Link>
            </p>
          )}
        </div>
      </Tarjeta>
    </section>
  );
}

export default async function GananciaPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [ventas, costos, tasa] = await Promise.all([cargarVentas(mes), cargarCostos(mes), cargarTasaImpuestos()]);
  const ganancias = calcularGanancia(ventas, costos, tasa);

  return (
    <>
      <Encabezado titulo="Ganancia" descripcion='Facturar no es ganar: aquí ves lo que queda después de todos los costos. Si falta un dato, se marca como "Estimación" en vez de inventarlo.'>
        <SelectorMes rango={rango} base="/admin/ganancia" />
      </Encabezado>
      {ganancias.length === 0 ? (
        <Tarjeta titulo={`Ganancia de ${rango.etiqueta}`}>
          <SinDatos queFalta="No hay ventas ni costos este mes. Se llenará con las ventas que avise Hotmart y con los costos que anotes en Costos." />
        </Tarjeta>
      ) : (
        ganancias.map((g) => <Desglose key={g.moneda} g={g} tasa={tasa} etiquetaMes={rango.etiqueta} />)
      )}
    </>
  );
}
