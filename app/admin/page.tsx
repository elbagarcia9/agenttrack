// RESUMEN — lo primero que el dueño quiere saber: ¿hay algo que atender?, ¿cuánto facturé y cuánto me quedó?

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AvisosBanner, Encabezado, Heroe, Kpi, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { CifraDinero, CifraEntera, CifraPorcentaje } from '@/components/admin/Cifras';
import { BarrasMensuales } from '@/components/admin/Graficos';
import { calcularAvisos, calcularCanales, calcularGanancia } from '@/lib/admin/derivados';
import { cargarActividadReservas, cargarCostos, cargarNegocio, cargarSalud, cargarTasaImpuestos, cargarUso, cargarUsuariosResumen, cargarVentas } from '@/lib/admin/datos';
import { dinero, etiquetaMesCorta, mesDeParametro, pesosCortos, porcentaje, rangoDeMes, serie12 } from '@/lib/admin/formato';

export default async function Resumen({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [ventas, uso, negocio, salud, usuarios, reservas, costos, tasa] = await Promise.all([
    cargarVentas(mes),
    cargarUso(mes),
    cargarNegocio(mes),
    cargarSalud(),
    cargarUsuariosResumen(),
    cargarActividadReservas(),
    cargarCostos(mes),
    cargarTasaImpuestos(),
  ]);

  const ganancias = calcularGanancia(ventas, costos, tasa);
  const canales = calcularCanales(negocio, ventas);
  const avisos = calcularAvisos({ ventas, ganancias, salud, uso, canales });
  const sinVentasAun = ventas.acumulado.length === 0;

  const suscriptores = (ventas.membresias.active ?? 0) + (ventas.membresias.past_due ?? 0);
  const activacion = porcentaje(reservas.usuarios_con_reservas, usuarios.total);
  const b = ventas.bajas;
  const bajas = b.voluntarias + b.involuntarias + b.otras;
  const churn = b.activos_inicio > 0 ? porcentaje(bajas, b.activos_inicio) : null;
  const monedas = [...new Set(ventas.serie.map((s) => s.moneda))];

  return (
    <>
      <Encabezado titulo="Resumen" descripcion="Lo importante de tu negocio en un vistazo: avisos, dinero y gente.">
        <SelectorMes rango={rango} base="/admin" />
      </Encabezado>

      <AvisosBanner avisos={avisos} nota={sinVentasAun ? 'Aún no hay ventas registradas: los avisos de dinero aparecerán cuando llegue la primera.' : undefined} />

      {ganancias.length === 0 ? (
        <Tarjeta titulo={`Dinero de ${rango.etiqueta}`}>
          <SinDatos queFalta="No hay ventas ni costos este mes. Se llenará con las ventas que Hotmart avise y con los costos que anotes en Costos." />
        </Tarjeta>
      ) : (
        ganancias.map((g) => (
          <Heroe key={g.moneda} franja={g.faltantes.length > 0 ? `Estimación · falta: ${g.faltantes.join(', ')}` : undefined}>
            <p className="text-sm font-semibold opacity-90">
              {rango.etiqueta} · {g.moneda}
            </p>
            <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
              Facturaste <CifraDinero centavos={g.ingresosBrutos} moneda={g.moneda} /> y te {g.ganancia >= 0 ? 'quedaron' : 'faltaron'}{' '}
              <span className="text-[var(--accent-on-dark)]">
                <CifraDinero centavos={Math.abs(g.ganancia)} moneda={g.moneda} />
              </span>{' '}
              {g.ganancia >= 0 ? 'limpios' : 'para cubrir tus costos'}
              {g.margenPct !== null && g.ganancia >= 0 && (
                <>
                  {' '}
                  (<CifraPorcentaje valor={g.margenPct} />)
                </>
              )}
              .
            </p>
            <Link href="/admin/ganancia" className="panel-tap mt-4 flex min-h-11 w-fit items-center gap-1 text-sm font-semibold underline underline-offset-4">
              Ver cómo se calcula <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Heroe>
        ))
      )}

      <section aria-label="Números clave" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi
          etiqueta="Entra cada mes"
          valor={ventas.mrr.length ? ventas.mrr.map((m) => <CifraDinero key={m.moneda} centavos={m.mrr} moneda={m.moneda} />) : null}
          detalle={ventas.mrr.length ? `${suscriptores} ${suscriptores === 1 ? 'suscripción activa' : 'suscripciones activas'}${ventas.mrr_sin_ciclo ? ` · ${ventas.mrr_sin_ciclo} sin ciclo conocido` : ''}` : 'Aparece con la primera suscripción activa.'}
        />
        <Kpi etiqueta="Personas con cuenta" valor={<CifraEntera valor={usuarios.total} />} detalle={`${usuarios.activos_30d} entraron en 30 días · ${usuarios.nuevos_7d} nuevas esta semana`} />
        <Kpi
          etiqueta="Ya registraron una venta"
          valor={activacion === null ? null : <CifraPorcentaje valor={activacion} />}
          detalle={activacion === null ? 'Aún no hay cuentas.' : `${reservas.usuarios_con_reservas} de ${usuarios.total} personas ya usan la app`}
          tono={activacion !== null && activacion >= 50 ? 'bien' : 'neutro'}
        />
        <Kpi
          etiqueta="Bajas del mes"
          valor={churn === null ? null : <CifraPorcentaje valor={churn} decimales={1} />}
          detalle={churn === null ? 'Aún no hay suscriptores del mes anterior para comparar.' : `${bajas} de ${b.activos_inicio} se ${bajas === 1 ? 'fue' : 'fueron'}: ${b.voluntarias} por decisión propia, ${b.involuntarias} por pago fallido`}
          tono={churn !== null && churn > 10 ? 'mal' : 'neutro'}
        />
      </section>

      {monedas.length === 0 ? (
        <Tarjeta titulo="Ingresos de los últimos 12 meses" subtitulo="Lo que cobraste cada mes, antes de comisiones y costos.">
          <SinDatos queFalta="Aparecerá con la primera venta que avise Hotmart." />
        </Tarjeta>
      ) : (
        monedas.map((moneda) => {
          const filas = serie12(ventas.serie.filter((s) => s.moneda === moneda), (mes) => ({ mes, moneda, ingresos: 0, reembolsos: 0 }));
          return (
            <Tarjeta key={moneda} titulo={`Ingresos de los últimos 12 meses (${moneda})`} subtitulo="Lo que cobraste cada mes, antes de comisiones y costos.">
              <BarrasMensuales
                datos={filas.map((f) => ({ mes: f.mes, etiqueta: etiquetaMesCorta(f.mes), valor: f.ingresos / 100, texto: pesosCortos(f.ingresos) }))}
                resumen={`Ingresos mensuales en ${moneda}: ${filas.map((f) => `${f.mes} ${dinero(f.ingresos, moneda)}`).join(', ')}`}
              />
            </Tarjeta>
          );
        })
      )}
    </>
  );
}
