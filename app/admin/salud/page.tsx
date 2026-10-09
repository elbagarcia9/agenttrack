// SALUD Y ERRORES — ¿todo funciona?: un resumen que dice qué revisar, y debajo el detalle en lenguaje claro.

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { BotonResolver } from '@/components/admin/Interacciones';
import { Datos, Encabezado, Heroe, Insignia, Kpi, SinDatos, Tarjeta } from '@/components/admin/ui';
import { cargarSalud } from '@/lib/admin/datos';
import { errorHumano, nombreAviso, nombrePantalla } from '@/lib/admin/etiquetas';
import { fechaHora, hace } from '@/lib/admin/formato';
import type { Salud } from '@/lib/admin/tipos';
import { servicioConfigurado } from '@/lib/supabase/servicio';

const RESULTADO: Record<string, { texto: string; tono: 'verde' | 'rojo' | 'oro' | 'gris' }> = {
  applied: { texto: 'Registrado', tono: 'verde' },
  duplicate: { texto: 'Repetido (se ignoró)', tono: 'gris' },
  illegal: { texto: 'Bloqueado: intentaba reactivar un reembolso', tono: 'oro' },
  unauthorized: { texto: 'Rechazado: clave incorrecta', tono: 'rojo' },
  error: { texto: 'Falló al registrarse', tono: 'rojo' },
  ignored: { texto: 'Aviso que aún no se usa', tono: 'gris' },
  rejected: { texto: 'Rechazado: producto ajeno o muy viejo', tono: 'oro' },
};
const LIMITE_ERRORES = 3;

function TablaAvisos({ filas }: { filas: Salud['webhook']['recientes'] }) {
  return (
    <Datos
      filas={filas}
      clave={(r, i) => `${r.cuando}-${i}`}
      columnas={[
        { titulo: 'Aviso', principal: true, celda: (r) => nombreAviso(r.tipo) },
        { titulo: 'Cuándo', celda: (r) => <span className="whitespace-nowrap">{fechaHora(r.cuando)}</span> },
        { titulo: 'Resultado', celda: (r) => <Insignia tono={RESULTADO[r.resultado]?.tono ?? 'gris'}>{RESULTADO[r.resultado]?.texto ?? r.resultado}</Insignia> },
      ]}
    />
  );
}

function TablaErrores({ errores }: { errores: Salud['errores'] }) {
  return (
    <Datos
      filas={errores}
      clave={(e) => e.mensaje}
      columnas={[
        {
          titulo: 'Qué pasó',
          principal: true,
          celda: (e) => {
            const h = errorHumano(e.mensaje);
            return (
              <>
                <span className="block font-bold">{h.titulo}</span>
                <span className="mt-0.5 block text-sm font-normal text-[var(--text-secondary)]">{h.queHacer}</span>
                <details className="mt-1 text-xs font-normal text-[var(--text-secondary)]">
                  <summary className="flex min-h-11 cursor-pointer items-center underline underline-offset-4">Ver el texto técnico</summary>
                  <code className="break-words">{e.mensaje}</code>
                </details>
              </>
            );
          },
        },
        { titulo: 'Veces', derecha: true, celda: (e) => <b>{e.n}</b> },
        { titulo: 'Personas', derecha: true, celda: (e) => e.usuarios },
        { titulo: 'Dónde', celda: (e) => nombrePantalla(e.ruta) },
        { titulo: 'Última vez', celda: (e) => <span className="whitespace-nowrap">{hace(e.ultimo)}</span> },
        { titulo: 'Marcar resuelto', acciones: true, celda: (e) => <BotonResolver mensaje={e.mensaje} /> },
      ]}
    />
  );
}

export default async function SaludPagina() {
  const s = await cargarSalud();
  const wh = s.webhook;
  const configurado = Boolean(process.env.HOTMART_HOTTOK && process.env.HOTMART_PRODUCT_IDS && servicioConfigurado());
  const fallosHotmart = (wh.por_resultado_7d.error ?? 0) + (wh.por_resultado_7d.unauthorized ?? 0);
  const nErrores = s.errores.length;
  const nPagos = s.pagos_sin_acceso.length;
  const hayAvisoGrave = (wh.por_resultado_7d.error ?? 0) > 0;
  const todoBien = nErrores === 0 && nPagos === 0 && !hayAvisoGrave;
  const pendientes = [
    nErrores > 0 && { texto: `${nErrores} ${nErrores === 1 ? 'error distinto' : 'errores distintos'}`, href: '#errores' },
    nPagos > 0 && { texto: `${nPagos} ${nPagos === 1 ? 'pago sin acceso' : 'pagos sin acceso'}`, href: '#pagos' },
    hayAvisoGrave && { texto: 'avisos de Hotmart que fallaron', href: '#hotmart' },
  ].filter(Boolean) as { texto: string; href: string }[];
  const estadoHotmart = wh.ultimo ? { texto: 'Recibiendo avisos', tono: 'verde' as const } : configurado ? { texto: 'Lista, esperando el primer aviso', tono: 'azul' as const } : { texto: 'Falta configurarla', tono: 'oro' as const };
  const resumen7d = Object.entries(wh.por_resultado_7d)
    .map(([k, n]) => `${n} ${(RESULTADO[k]?.texto ?? k).toLowerCase()}`)
    .join(' · ');

  return (
    <>
      <Encabezado titulo="Salud" descripcion="Si algo se rompe, aquí lo ves antes de que un cliente te lo reclame." />

      <Heroe franja={todoBien ? undefined : 'Para revisar hoy'}>
        <p className="text-balance text-2xl font-bold leading-snug [font-family:var(--font-display)] md:text-3xl">
          {todoBien ? 'Todo bien: sin errores ni pagos atorados.' : `Hay ${pendientes.length} ${pendientes.length === 1 ? 'cosa' : 'cosas'} por revisar.`}
        </p>
        {!todoBien && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {pendientes.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="panel-tap flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold">
                  {p.texto}
                  <ChevronDown size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Heroe>

      <section aria-label="Resumen de salud" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <Kpi etiqueta="Errores en 24 horas" valor={String(s.errores_24h)} detalle={s.errores_24h === 0 ? 'Nadie vio una pantalla de error.' : 'Veces que alguien vio una pantalla de error.'} tono={s.errores_24h > 0 ? 'mal' : 'bien'} />
        <Kpi etiqueta="Pagos sin acceso" valor={String(nPagos)} detalle={nPagos === 0 ? 'Todos los que pagaron tienen cuenta.' : 'Pagaron pero no tienen cuenta en la app.'} tono={nPagos > 0 ? 'mal' : 'bien'} />
        <div className="col-span-2 lg:col-span-1">
          <Kpi etiqueta="Último aviso de Hotmart" valor={wh.ultimo ? hace(wh.ultimo) : null} detalle={wh.ultimo ? `${fallosHotmart} con problema en 7 días` : 'Aún no ha llegado ningún aviso.'} />
        </div>
      </section>

      <div id="pagos" className="scroll-mt-20">
        <Tarjeta titulo="Pagos sin acceso" subtitulo="Personas que pagaron en Hotmart y todavía no tienen cuenta. Agrégalas con su correo y se les ajusta la membresía sola.">
          {nPagos === 0 ? (
            <SinDatos titulo="Ninguno" queFalta="Nadie ha pagado sin tener cuenta." />
          ) : (
            <Datos
              filas={s.pagos_sin_acceso}
              clave={(p) => p.email}
              columnas={[
                { titulo: 'Correo', principal: true, celda: (p) => <span className="break-all">{p.email}</span> },
                { titulo: 'Pagó', celda: (p) => <span className="whitespace-nowrap">{fechaHora(p.cuando)}</span> },
                {
                  titulo: 'Qué hacer',
                  acciones: true,
                  celda: (p) => (
                    <Link href={`/admin/usuarios?q=${encodeURIComponent(p.email)}`} className="panel-tap flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
                      Agregarle su acceso
                    </Link>
                  ),
                },
              ]}
            />
          )}
        </Tarjeta>
      </div>

      <div id="errores" className="scroll-mt-20">
        <Tarjeta titulo="Errores recientes" subtitulo="Los más repetidos primero (últimos 7 días). Marca uno como resuelto cuando ya esté arreglado.">
          {nErrores === 0 ? (
            <SinDatos titulo="Sin errores" queFalta="Nadie ha visto una pantalla de error en los últimos 7 días." />
          ) : (
            <div className="flex flex-col gap-3">
              <TablaErrores errores={s.errores.slice(0, LIMITE_ERRORES)} />
              {nErrores > LIMITE_ERRORES && (
                <details className="rounded-[var(--radius-card)] bg-[var(--surface-2)] px-4 py-1">
                  <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--accent)]">Ver los {nErrores - LIMITE_ERRORES} restantes</summary>
                  <div className="pb-3 pt-1">
                    <TablaErrores errores={s.errores.slice(LIMITE_ERRORES)} />
                  </div>
                </details>
              )}
            </div>
          )}
        </Tarjeta>
      </div>

      <div id="hotmart" className="scroll-mt-20">
        <Tarjeta titulo="Conexión con Hotmart" subtitulo="Hotmart le avisa a tu app cada compra, cancelación o reembolso. Aquí se ve si esos avisos llegan bien.">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Insignia tono={estadoHotmart.tono}>{estadoHotmart.texto}</Insignia>
            {!configurado && !wh.ultimo && <span className="text-sm text-[var(--text-secondary)]">Falta un paso técnico que haremos juntos cuando conectes Hotmart.</span>}
          </div>
          {wh.recientes.length === 0 ? (
            <SinDatos queFalta="Aún no llega ningún aviso. Cuando conectes Hotmart y haya la primera compra (o una prueba), aparecerá aquí con su resultado." />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--text-secondary)]">En los últimos 7 días: {resumen7d}.</p>
              <TablaAvisos filas={wh.recientes.slice(0, 3)} />
              {wh.recientes.length > 3 && (
                <details className="rounded-[var(--radius-card)] bg-[var(--surface-2)] px-4 py-1">
                  <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--accent)]">Ver los {wh.recientes.length - 3} avisos anteriores</summary>
                  <div className="pb-3 pt-1">
                    <TablaAvisos filas={wh.recientes.slice(3)} />
                  </div>
                </details>
              )}
            </div>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Cuadre semanal con Hotmart" subtitulo="Compara las suscripciones activas en Hotmart contra las de tu app; lo sano es cero diferencias." hundida>
        <SinDatos queFalta="Se activará al conectar la lista de suscripciones de Hotmart. Mientras tanto, revisa 'Pagos sin acceso' arriba." />
      </Tarjeta>
    </>
  );
}
