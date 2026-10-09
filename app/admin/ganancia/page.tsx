// GANANCIA — lo que de verdad te queda: ingresos − reembolsos − Hotmart − afiliados − impuestos − infraestructura − correos.

import Link from 'next/link';
import { Encabezado, Insignia, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { calcularGanancia, type Ganancia } from '@/lib/admin/derivados';
import { cargarCostos, cargarTasaImpuestos, cargarVentas } from '@/lib/admin/datos';
import { dinero, mesDeParametro, pct, rangoDeMes, SIN_DATOS } from '@/lib/admin/formato';

function Linea({ texto, valor, moneda, resta = false, fuerte = false, nota }: { texto: string; valor: number | null; moneda: string; resta?: boolean; fuerte?: boolean; nota?: string }) {
  return (
    <tr className={fuerte ? 'border-t-2 border-black/15 font-bold' : 'border-t border-black/5'}>
      <th scope="row" className="px-3 py-3 text-left font-medium">
        {resta && <span aria-hidden="true">− </span>}
        {texto}
        {nota && <span className="block text-xs font-normal text-[var(--text-secondary)]">{nota}</span>}
      </th>
      <td className={`whitespace-nowrap px-3 py-3 text-right tabular-nums ${valor === null ? 'text-[var(--text-secondary)]' : ''}`}>{valor === null ? SIN_DATOS : dinero(valor, moneda)}</td>
    </tr>
  );
}

function Desglose({ g, tasa }: { g: Ganancia; tasa: number | null }) {
  return (
    <Tarjeta titulo={`En ${g.moneda}`} subtitulo="Del cobro bruto a lo que te queda.">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Insignia tono={g.estado === 'completa' ? 'verde' : 'oro'}>{g.estado === 'completa' ? 'Con todos tus costos anotados' : 'Estimación'}</Insignia>
        <Insignia tono="gris">Pendiente de conciliar con tu liquidación de Hotmart</Insignia>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-[var(--surface)]">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Desglose de la ganancia en {g.moneda}</caption>
          <tbody>
            <Linea texto="Facturaste (cobros del mes)" valor={g.ingresosBrutos} moneda={g.moneda} />
            <Linea texto="Reembolsos y contracargos" valor={g.reembolsos} moneda={g.moneda} resta />
            <Linea texto="Ingresos netos" valor={g.ingresosNetos} moneda={g.moneda} fuerte />
            <Linea texto="Comisión de Hotmart" valor={g.hotmart} moneda={g.moneda} resta nota="Lo que Hotmart avisa que se quedó en cada venta." />
            <Linea texto="Comisión de afiliados" valor={g.afiliados} moneda={g.moneda} resta />
            <Linea texto="Impuestos" valor={g.impuestos} moneda={g.moneda} resta nota={tasa === null ? 'Falta tu tasa de impuestos (se anota en Costos).' : `Supuesto: ${pct(tasa, 1)} de tus ingresos netos.`} />
            <Linea texto="Infraestructura (Supabase, Vercel)" valor={g.infra} moneda={g.moneda} resta />
            <Linea texto="Correos (Resend)" valor={g.email} moneda={g.moneda} resta />
            <Linea texto="Dominio y otros costos" valor={g.otros} moneda={g.moneda} resta />
            <Linea texto={g.ganancia >= 0 ? 'Te quedaron limpios' : 'Perdiste este mes'} valor={g.ganancia} moneda={g.moneda} fuerte />
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-base">
        {g.margenPct !== null ? (
          <>
            Margen: <b>{pct(g.margenPct, 1)}</b>. Por cada $100 que entran, te quedan <b>${Math.round(g.margenPct)}</b>.
          </>
        ) : (
          <>Margen: {SIN_DATOS} (no hay ingresos netos este mes para calcularlo).</>
        )}
      </p>
      {g.faltantes.length > 0 && (
        <p className="mt-3 rounded-[var(--radius-button)] bg-[var(--alerta-bg)] p-3 text-sm font-medium text-[var(--alerta-text)]">
          Para dejar de ser estimación falta: {g.faltantes.join(', ')}.{' '}
          <Link href="/admin/costos" className="font-bold underline underline-offset-4">
            Anótalo en Costos
          </Link>
        </p>
      )}
    </Tarjeta>
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
        ganancias.map((g) => <Desglose key={g.moneda} g={g} tasa={tasa} />)
      )}
    </>
  );
}
