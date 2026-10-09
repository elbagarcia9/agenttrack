// USO — ¿la app retiene? Primero la respuesta en una frase, luego activación, retención, vuelta semanal y recorrido de inicio.

import { BarraHorizontal, Datos, Encabezado, Heroe, Insignia, Kpi, SelectorMes, SinDatos, Tarjeta } from '@/components/admin/ui';
import { CifraEntera, CifraPorcentaje } from '@/components/admin/Cifras';
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
  const promDau = Math.round((dias.reduce((t, d) => t + d.n, 0) / dias.length) * 10) / 10;
  const reservasHoy = diasReservas[diasReservas.length - 1]?.n ?? 0;
  const reservas7 = diasReservas.slice(-7).reduce((t, d) => t + d.n, 0);
  const reservas30 = diasReservas.reduce((t, d) => t + d.n, 0);
  const suma = (lista: { n: number }[]) => lista.reduce((t, d) => t + d.n, 0);
  const cambio = (ahora: number, antes: number) => (antes > 0 ? ` (${ahora >= antes ? '+' : '−'}${Math.abs(Math.round(((ahora - antes) / antes) * 100))}% frente a la semana anterior)` : '');
  const promSemana = Math.round((suma(dias.slice(-7)) / 7) * 10) / 10;
  const insightDau = `Última semana: ${promSemana.toLocaleString('es-MX')} personas al día en promedio${cambio(suma(dias.slice(-7)), suma(dias.slice(-14, -7)))}.`;
  const insightVentas = `Última semana: ${reservas7} ${reservas7 === 1 ? 'venta registrada' : 'ventas registradas'}${cambio(reservas7, suma(diasReservas.slice(-14, -7)))}.`;
  const semanaEnCurso = uso.curr_semanal[uso.curr_semanal.length - 1]?.semana;
  const maxEmbudo = Math.max(1, ...PASOS.map((p) => uso.embudo[p.clave]));
  const hayEmbudo = PASOS.some((p) => uso.embudo[p.clave] > 0);
  const retencion = (['d1', 'd7', 'd30'] as const).map((k) => ({ k, texto: k === 'd1' ? 'Al día siguiente' : k === 'd7' ? 'A los 7 días' : 'A los 30 días', ...uso.retencion[k] }));

  // La semana en curso está incompleta: la respuesta se lee de la última semana ya cerrada
  const semanas = uso.curr_semanal.filter((s) => s.activos_previos > 0);
  const cerradas = semanas.length > 1 ? semanas.slice(0, -1) : semanas;
  const ref = cerradas[cerradas.length - 1];
  const vuelta = ref ? porcentaje(ref.volvieron, ref.activos_previos) : null;
  const decada = ref && vuelta !== null ? Math.round(vuelta / 10) : null;

  return (
    <>
      <Encabezado titulo="Uso" descripcion="Qué tanto usa la gente la app: si la prueba y si vuelve. Son los datos que dicen si el producto engancha.">
        <SelectorMes rango={rango} base="/admin/uso" />
      </Encabezado>

      <Heroe franja={vuelta !== null && vuelta < 40 ? 'Vuelta baja: menos de 4 de cada 10 regresan. Revisa qué les falta para volver.' : undefined}>
        {ref && decada !== null && vuelta !== null ? (
          <>
            <p className="text-sm font-semibold opacity-90">¿La app engancha?</p>
            <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
              De cada 10 personas que entraron la semana del {fechaCorta(`${ref.semana}T12:00:00-06:00`)},{' '}
              <span className="text-[var(--accent-on-dark)]">{decada} volvieron</span> la siguiente.
            </p>
            <p className="mt-3 text-sm opacity-90">
              {ref.volvieron} de {ref.activos_previos} personas (<CifraPorcentaje valor={vuelta} />).
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold opacity-90">¿La app engancha?</p>
            <p className="mt-2 text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">Aún no hay suficientes visitas para saberlo.</p>
            <p className="mt-3 text-sm opacity-90">Se necesitan al menos dos semanas con gente entrando a la app; aparecerá solo.</p>
          </>
        )}
      </Heroe>

      <section aria-label="Números de uso" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi etiqueta="Ya usan la app" valor={activacion === null ? null : <CifraPorcentaje valor={activacion} />} detalle={activacion === null ? 'Aún no hay cuentas.' : `${reservas.usuarios_con_reservas} de ${usuarios.total} ya registraron una venta`} />
        <Kpi etiqueta="Ventas registradas" valor={<CifraEntera valor={reservas.total} />} detalle={`${reservasHoy} hoy · ${reservas7} en 7 días · ${reservas30} en 30 días`} />
        <Kpi etiqueta="Entraron esta semana" valor={<CifraEntera valor={usuarios.activos_7d} />} detalle={`${usuarios.activos_hoy} hoy · ${usuarios.activos_30d} en el mes`} />
        <Kpi
          etiqueta="Pagan pero no entran"
          valor={<CifraEntera valor={uso.pagadores_fantasma} />}
          detalle="Suscriptores sin entrar hace 14 días o más: los más probables de cancelar."
          tono={uso.pagadores_fantasma > 0 ? 'mal' : 'neutro'}
        />
      </section>

      <Tarjeta titulo="¿Vuelven?" subtitulo="De las personas que ya cumplieron ese tiempo desde que se registraron, cuántas entraron justo ese día.">
        {retencion.every((r) => r.elegibles === 0) ? (
          <SinDatos queFalta={uso.medicion_desde ? 'Aún no hay personas registradas con suficiente tiempo para medirlo.' : 'La medición empezó apenas: se llenará con las visitas de quienes se registren de ahora en adelante.'} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {retencion.map((r) => (
              <Kpi
                key={r.k}
                plano
                etiqueta={r.texto}
                valor={r.elegibles === 0 ? null : <CifraPorcentaje valor={porcentaje(r.retenidos, r.elegibles) ?? 0} />}
                detalle={r.elegibles === 0 ? 'Aún nadie cumple ese tiempo.' : `${r.retenidos} de ${r.elegibles} volvieron`}
              />
            ))}
          </div>
        )}
        {uso.medicion_desde && <p className="mt-4 text-xs text-[var(--text-secondary)]">Se mide desde {fechaCorta(uso.medicion_desde)}; antes de esa fecha no hay datos de visitas. Las pruebas internas no cuentan.</p>}
      </Tarjeta>

      <Tarjeta titulo="Vuelta semana a semana" subtitulo="De quienes entraron una semana, cuántos volvieron la siguiente. La semana en curso aún no termina.">
        {semanas.length === 0 ? (
          <SinDatos queFalta="Se necesitan al menos dos semanas con visitas para calcularla." />
        ) : (
          <Datos
            filas={semanas}
            clave={(s) => s.semana}
            columnas={[
              { titulo: 'Semana', principal: true, celda: (s) => `Semana del ${fechaCorta(`${s.semana}T12:00:00-06:00`)}` },
              { titulo: 'Venían', derecha: true, celda: (s) => s.activos_previos },
              { titulo: 'Volvieron', derecha: true, celda: (s) => s.volvieron },
              { titulo: 'Vuelta', derecha: true, celda: (s) => <b>{pct(porcentaje(s.volvieron, s.activos_previos))}</b> },
              {
                titulo: 'Lectura',
                derecha: true,
                celda: (s) => {
                  if (s.semana === semanaEnCurso) return <Insignia tono="gris">En curso</Insignia>;
                  const v = porcentaje(s.volvieron, s.activos_previos) ?? 0;
                  return <Insignia tono={v >= 50 ? 'verde' : v >= 30 ? 'oro' : 'rojo'}>{v >= 50 ? 'Buena' : v >= 30 ? 'Regular' : 'Baja'}</Insignia>;
                },
              },
            ]}
          />
        )}
      </Tarjeta>

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Personas que entran cada día" subtitulo={uso.dau.length ? `${insightDau} Promedio de 30 días: ${promDau.toLocaleString('es-MX')}.` : 'Últimos 30 días'}>
          {uso.dau.length === 0 ? (
            <SinDatos queFalta="Aparecerá cuando alguien con cuenta entre a la app." />
          ) : (
            <LineaDiaria datos={dias} unidad="personas" resumen={`Personas que entran por día, últimos 30 días. Promedio ${promDau} al día.`} />
          )}
        </Tarjeta>
        <Tarjeta titulo="Ventas registradas por día" subtitulo={reservas.por_dia.length ? `${insightVentas} ${reservas30} en 30 días.` : 'La acción principal de la app'}>
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
              const paso = i > 0 && previo > 0 ? ` · ${pct(porcentaje(n, previo))}` : '';
              return <BarraHorizontal key={p.clave} etiqueta={p.texto} valor={n} max={maxEmbudo} texto={`${n}${paso}`} />;
            })}
          </div>
        )}
      </Tarjeta>
    </>
  );
}
