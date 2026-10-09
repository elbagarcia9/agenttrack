// USO — ¿la app retiene? Activación, retención D1/D7/D30, vuelta semanal, acción principal y recorrido de inicio.

import { BarraHorizontal, Encabezado, Kpi, SelectorMes, SinDatos, Tabla, Tarjeta } from '@/components/admin/ui';
import { LineaDiaria } from '@/components/admin/Graficos';
import { cargarActividadReservas, cargarUso, cargarUsuariosResumen } from '@/lib/admin/datos';
import { fechaCorta, mesDeParametro, pct, porcentaje, rangoDeMes, rellenarDias } from '@/lib/admin/formato';

const PASOS: { clave: 'landing_vista' | 'onboarding_iniciado' | 'resultado_visto' | 'paywall_visto' | 'checkout_iniciado' | 'acceso_solicitado'; texto: string }[] = [
  { clave: 'landing_vista', texto: 'Vieron tu página de ventas' },
  { clave: 'onboarding_iniciado', texto: 'Empezaron las preguntas de inicio' },
  { clave: 'resultado_visto', texto: 'Vieron su resultado' },
  { clave: 'paywall_visto', texto: 'Vieron la pantalla de planes' },
  { clave: 'checkout_iniciado', texto: 'Fueron a pagar' },
  { clave: 'acceso_solicitado', texto: 'Pidieron su acceso' },
];

export default async function UsoPagina({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const mes = mesDeParametro((await searchParams).mes);
  const rango = rangoDeMes(mes);
  const [uso, usuarios, reservas] = await Promise.all([cargarUso(mes), cargarUsuariosResumen(), cargarActividadReservas()]);

  const activacion = porcentaje(reservas.usuarios_con_reservas, usuarios.total);
  const dias = rellenarDias(uso.dau);
  const diasReservas = rellenarDias(reservas.por_dia);
  const reservasHoy = diasReservas[diasReservas.length - 1]?.n ?? 0;
  const reservas7 = diasReservas.slice(-7).reduce((t, d) => t + d.n, 0);
  const reservas30 = diasReservas.reduce((t, d) => t + d.n, 0);
  const maxEmbudo = Math.max(1, ...PASOS.map((p) => uso.embudo[p.clave]));
  const hayEmbudo = PASOS.some((p) => uso.embudo[p.clave] > 0);
  const retencion = (['d1', 'd7', 'd30'] as const).map((k) => ({ k, texto: k === 'd1' ? 'Al día siguiente' : k === 'd7' ? 'A los 7 días' : 'A los 30 días', ...uso.retencion[k] }));

  return (
    <>
      <Encabezado titulo="Uso" descripcion="Qué tanto usa la gente la app: si la prueba y si vuelve. Son los datos que dicen si el producto engancha.">
        <SelectorMes rango={rango} base="/admin/uso" />
      </Encabezado>

      <section aria-label="Números de uso" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Activación" valor={activacion === null ? null : pct(activacion)} detalle={activacion === null ? 'Aún no hay cuentas.' : `${reservas.usuarios_con_reservas} de ${usuarios.total} ya registraron una venta`} />
        <Kpi etiqueta="Ventas registradas" valor={String(reservas.total)} detalle={`${reservasHoy} hoy · ${reservas7} en 7 días · ${reservas30} en 30 días`} />
        <Kpi etiqueta="Entraron esta semana" valor={String(usuarios.activos_7d)} detalle={`${usuarios.activos_hoy} hoy · ${usuarios.activos_30d} en 30 días`} />
        <Kpi
          etiqueta="Pagan pero no entran"
          valor={String(uso.pagadores_fantasma)}
          detalle="Suscriptores sin entrar hace 14 días o más: los más probables de cancelar."
          tono={uso.pagadores_fantasma > 0 ? 'mal' : 'neutro'}
        />
      </section>

      <Tarjeta titulo="¿Vuelven?" subtitulo="De las personas que ya cumplieron ese tiempo desde que se registraron, cuántas entraron justo ese día.">
        {retencion.every((r) => r.elegibles === 0) ? (
          <SinDatos queFalta={uso.medicion_desde ? 'Aún no hay personas registradas con suficiente tiempo para medirlo.' : 'La medición empezó apenas: se llenará con las visitas de quienes se registren de ahora en adelante.'} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {retencion.map((r) => (
              <Kpi
                key={r.k}
                etiqueta={r.texto}
                valor={r.elegibles === 0 ? null : pct(porcentaje(r.retenidos, r.elegibles))}
                detalle={r.elegibles === 0 ? 'Aún nadie cumple ese tiempo.' : `${r.retenidos} de ${r.elegibles} volvieron`}
              />
            ))}
          </div>
        )}
        {uso.medicion_desde && <p className="mt-4 text-xs text-[var(--text-secondary)]">Se mide desde {fechaCorta(uso.medicion_desde)}; antes de esa fecha no hay datos de visitas. Las pruebas internas no cuentan.</p>}
      </Tarjeta>

      <Tarjeta titulo="Vuelta semanal" subtitulo="De quienes entraron la semana anterior, cuántos volvieron esa semana. Es la medida que más pesa para saber si hay hábito.">
        {uso.curr_semanal.every((s) => s.activos_previos === 0) ? (
          <SinDatos queFalta="Se necesitan al menos dos semanas con visitas para calcularla." />
        ) : (
          <Tabla encabezados={[{ texto: 'Semana que empieza' }, { texto: 'Activos la semana anterior', derecha: true }, { texto: 'Volvieron', derecha: true }, { texto: 'Vuelta', derecha: true }]}>
            {uso.curr_semanal
              .filter((s) => s.activos_previos > 0)
              .map((s) => (
                <tr key={s.semana} className="border-t border-black/5">
                  <th scope="row" className="px-3 py-3 text-left font-medium">{fechaCorta(`${s.semana}T12:00:00-06:00`)}</th>
                  <td className="px-3 py-3 text-right tabular-nums">{s.activos_previos}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.volvieron}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums">{pct(porcentaje(s.volvieron, s.activos_previos))}</td>
                </tr>
              ))}
          </Tabla>
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Personas que entran cada día" subtitulo="Últimos 30 días.">
          {uso.dau.length === 0 ? (
            <SinDatos queFalta="Aparecerá cuando alguien con cuenta entre a la app." />
          ) : (
            <LineaDiaria datos={dias} unidad="personas" resumen={`Personas que entran por día, últimos 30 días. Total de días con actividad: ${uso.dau.length}.`} />
          )}
        </Tarjeta>
        <Tarjeta titulo="Ventas registradas por día" subtitulo="La acción principal de la app. Últimos 30 días.">
          {reservas.por_dia.length === 0 ? (
            <SinDatos queFalta="Aparecerá cuando alguien registre su primera venta." />
          ) : (
            <LineaDiaria datos={diasReservas} unidad="ventas" resumen={`Ventas registradas por día, últimos 30 días: ${reservas30} en total.`} />
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo={`Del primer vistazo al acceso (${rango.etiqueta.toLowerCase()})`} subtitulo="Personas distintas que llegaron a cada paso. Donde la barra se acorta mucho es donde se van.">
        {!hayEmbudo ? (
          <SinDatos queFalta="Aparecerá con las visitas a tu página de ventas y al recorrido de inicio de este mes." />
        ) : (
          <div className="flex flex-col gap-4">
            {PASOS.map((p, i) => {
              const n = uso.embudo[p.clave];
              const previo = i > 0 ? uso.embudo[PASOS[i - 1].clave] : 0;
              const paso = i > 0 && previo > 0 ? ` · ${pct(porcentaje(n, previo))} del paso anterior` : '';
              return <BarraHorizontal key={p.clave} etiqueta={p.texto} valor={n} max={maxEmbudo} texto={`${n}${paso}`} />;
            })}
          </div>
        )}
      </Tarjeta>
    </>
  );
}
