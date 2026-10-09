// RESUMEN — lo primero que el dueño quiere saber: ¿hay algo que atender?, ¿cuánto facturé y cuánto me quedó?

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AvisosBanner, Encabezado, Insignia, Kpi, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { BarrasMensuales } from '@/components/admin/Graficos';
import { calcularAvisos, calcularCanales, calcularGanancia } from '@/lib/admin/derivados';
import { cargarActividadReservas, cargarCostos, cargarNegocio, cargarSalud, cargarTasaImpuestos, cargarUso, cargarUsuariosResumen, cargarVentas } from '@/lib/admin/datos';
import { dinero, etiquetaMesCorta, mesDeParametro, pct, porcentaje, rangoDeMes } from '@/lib/admin/formato';

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
  const churn = ventas.bajas.activos_inicio > 0 ? porcentaje(ventas.bajas.voluntarias + ventas.bajas.involuntarias + ventas.bajas.otras, ventas.bajas.activos_inicio) : null;

  // Evolución de ingresos: una moneda por gráfica, nunca mezcladas
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
          <section
            key={g.moneda}
            className="rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] p-6 text-[var(--on-accent)] shadow-[var(--shadow-2)] md:p-8"
            aria-label={`Ganancia de ${rango.etiqueta} en ${g.moneda}`}
          >
            <p className="text-sm font-semibold opacity-90">Este mes ({g.moneda})</p>
            <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
              Facturaste {dinero(g.ingresosBrutos, g.moneda)} y te {g.ganancia >= 0 ? 'quedaron' : 'faltaron'} <span className="text-[var(--accent-on-dark)]">{dinero(Math.abs(g.ganancia), g.moneda)}</span> {g.ganancia >= 0 ? 'limpios' : 'para cubrir tus costos'}
              {g.margenPct !== null && g.ganancia >= 0 ? ` (${pct(g.margenPct)})` : ''}.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{g.estado === 'completa' ? 'Con todos tus costos anotados' : 'Estimación'}</span>
              {g.faltantes.length > 0 && <span className="text-sm opacity-90">Falta: {g.faltantes.join(' · ')}</span>}
              <Link href="/admin/ganancia" className="ml-auto flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4">
                Ver el detalle <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        ))
      )}

      <section aria-label="Números clave" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          etiqueta="Ingreso mensual recurrente"
          valor={ventas.mrr.length ? ventas.mrr.map((m) => dinero(m.mrr, m.moneda)).join(' · ') : null}
          detalle={ventas.mrr.length ? `${suscriptores} suscripción${suscriptores === 1 ? '' : 'es'} activa${suscriptores === 1 ? '' : 's'}${ventas.mrr_sin_ciclo ? ` · ${ventas.mrr_sin_ciclo} sin ciclo conocido` : ''}` : 'Aparece con la primera suscripción activa.'}
        />
        <Kpi etiqueta="Personas con cuenta" valor={String(usuarios.total)} detalle={`${usuarios.activos_30d} entraron en 30 días · ${usuarios.nuevos_7d} nuevas esta semana`} />
        <Kpi
          etiqueta="Activación"
          valor={activacion === null ? null : pct(activacion)}
          detalle={activacion === null ? 'Aún no hay cuentas.' : `${reservas.usuarios_con_reservas} de ${usuarios.total} ya registraron una venta`}
          tono={activacion !== null && activacion >= 50 ? 'bien' : 'neutro'}
        />
        <Kpi
          etiqueta="Bajas del mes"
          valor={churn === null ? null : pct(churn, 1)}
          detalle={churn === null ? 'Aún no hay suscriptores del mes anterior para comparar.' : `${ventas.bajas.voluntarias} por decisión propia · ${ventas.bajas.involuntarias} por pago fallido`}
          tono={churn !== null && churn > 10 ? 'mal' : 'neutro'}
        />
      </section>

      <Tarjeta titulo="Ingresos de los últimos 12 meses" subtitulo="Lo que cobraste cada mes, antes de comisiones y costos.">
        {monedas.length === 0 ? (
          <SinDatos queFalta="Aparecerá con la primera venta que avise Hotmart." />
        ) : (
          <div className="flex flex-col gap-6">
            {monedas.map((moneda) => {
              const filas = ventas.serie.filter((s) => s.moneda === moneda);
              return (
                <div key={moneda}>
                  <div className="mb-1 flex items-center gap-2">
                    <Insignia tono="azul">{moneda}</Insignia>
                  </div>
                  <BarrasMensuales
                    datos={filas.map((f) => ({ mes: f.mes, etiqueta: etiquetaMesCorta(f.mes), valor: f.ingresos / 100, texto: dinero(f.ingresos, moneda).replace(` ${moneda}`, '') }))}
                    resumen={`Ingresos mensuales en ${moneda}: ${filas.map((f) => `${f.mes} ${dinero(f.ingresos, moneda)}`).join(', ')}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Tarjeta>
    </>
  );
}
