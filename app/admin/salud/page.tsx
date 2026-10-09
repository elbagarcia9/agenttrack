// SALUD Y ERRORES — ¿todo funciona?: errores agrupados por frecuencia, conexión con Hotmart y pagos sin acceso.

import Link from 'next/link';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { resolverError } from '@/app/admin/acciones';
import { Encabezado, Insignia, Kpi, SinDatos, Tabla, Tarjeta } from '@/components/admin/ui';
import { cargarSalud } from '@/lib/admin/datos';
import { fechaHora, hace } from '@/lib/admin/formato';
import { servicioConfigurado } from '@/lib/supabase/servicio';

const RESULTADO: Record<string, { texto: string; tono: 'verde' | 'rojo' | 'oro' | 'gris' }> = {
  applied: { texto: 'Registrado', tono: 'verde' },
  duplicate: { texto: 'Repetido (ignorado)', tono: 'gris' },
  illegal: { texto: 'Bloqueado: intentaba reactivar un reembolso', tono: 'oro' },
  unauthorized: { texto: 'Rechazado: clave incorrecta', tono: 'rojo' },
  error: { texto: 'Falló al registrarse', tono: 'rojo' },
  ignored: { texto: 'Tipo de aviso que aún no se usa', tono: 'gris' },
  rejected: { texto: 'Rechazado: producto ajeno o muy viejo', tono: 'oro' },
};

export default async function SaludPagina() {
  const s = await cargarSalud();
  const wh = s.webhook;
  const configurado = Boolean(process.env.HOTMART_HOTTOK && process.env.HOTMART_PRODUCT_IDS && servicioConfigurado());
  const fallos = (wh.por_resultado_7d.error ?? 0) + (wh.por_resultado_7d.unauthorized ?? 0);
  const abiertas = s.errores.length + s.pagos_sin_acceso.length;
  const todoBien = abiertas === 0 && (wh.por_resultado_7d.error ?? 0) === 0;

  return (
    <>
      <Encabezado titulo="Salud" descripcion="Si algo se rompe, aquí lo ves antes de que un cliente te lo reclame." />

      <div
        role="status"
        className={`flex items-center gap-3 rounded-[var(--radius-card)] border p-4 ${todoBien ? 'border-[var(--verde-text)]/25 bg-[var(--chip-verde-bg)] text-[var(--verde-text)]' : 'border-[var(--alerta-border)] bg-[var(--alerta-bg)] text-[var(--alerta-text)]'}`}
      >
        {todoBien ? <CircleCheck size={22} aria-hidden="true" /> : <TriangleAlert size={22} aria-hidden="true" />}
        <p className="text-base font-bold">{todoBien ? '✅ Todo bien: sin errores ni pagos atorados' : `⚠️ Hay ${abiertas} cosa${abiertas === 1 ? '' : 's'} por revisar`}</p>
      </div>

      <section aria-label="Resumen de salud" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi etiqueta="Errores en 24 horas" valor={String(s.errores_24h)} detalle={s.errores_24h === 0 ? 'Nadie vio una pantalla de error.' : 'Veces que alguien vio una pantalla de error.'} tono={s.errores_24h > 0 ? 'mal' : 'bien'} />
        <Kpi etiqueta="Pagos sin acceso" valor={String(s.pagos_sin_acceso.length)} detalle={s.pagos_sin_acceso.length === 0 ? 'Todos los que pagaron tienen cuenta.' : 'Pagaron pero no tienen cuenta en la app.'} tono={s.pagos_sin_acceso.length > 0 ? 'mal' : 'bien'} />
        <Kpi etiqueta="Último aviso de Hotmart" valor={wh.ultimo ? hace(wh.ultimo) : null} detalle={wh.ultimo ? `${fallos} con problema en 7 días` : 'Aún no ha llegado ningún aviso.'} />
      </section>

      <Tarjeta titulo="Pagos sin acceso" subtitulo="Personas que pagaron en Hotmart y todavía no tienen cuenta. Agrégalas con su correo y se les ajusta la membresía solas.">
        {s.pagos_sin_acceso.length === 0 ? (
          <SinDatos titulo="Ninguno" queFalta="Nadie ha pagado sin tener cuenta." />
        ) : (
          <Tabla encabezados={[{ texto: 'Correo' }, { texto: 'Pagó' }, { texto: 'Qué hacer' }]}>
            {s.pagos_sin_acceso.map((p) => (
              <tr key={p.email} className="border-t border-black/5">
                <th scope="row" className="px-3 py-3 text-left font-medium">{p.email}</th>
                <td className="whitespace-nowrap px-3 py-3">{fechaHora(p.cuando)}</td>
                <td className="px-3 py-3">
                  <Link href="/admin/usuarios" className="flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
                    Agregarle su acceso
                  </Link>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta titulo="Errores recientes" subtitulo="Los más repetidos primero (últimos 7 días). Marca uno como resuelto cuando ya esté arreglado.">
        {s.errores.length === 0 ? (
          <SinDatos titulo="Sin errores" queFalta="Nadie ha visto una pantalla de error en los últimos 7 días." />
        ) : (
          <Tabla encabezados={[{ texto: 'Qué pasó' }, { texto: 'Veces', derecha: true }, { texto: 'Personas', derecha: true }, { texto: 'Dónde' }, { texto: 'Última vez' }, { texto: '' }]}>
            {s.errores.map((e) => (
              <tr key={e.mensaje} className="border-t border-black/5 align-top">
                <th scope="row" className="max-w-xs px-3 py-3 text-left font-medium">{e.mensaje}</th>
                <td className="px-3 py-3 text-right font-bold tabular-nums">{e.n}</td>
                <td className="px-3 py-3 text-right tabular-nums">{e.usuarios}</td>
                <td className="px-3 py-3">{e.ruta ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-3">{hace(e.ultimo)}</td>
                <td className="px-3 py-1">
                  <form action={resolverError}>
                    <input type="hidden" name="mensaje" value={e.mensaje} />
                    <button type="submit" className="min-h-11 rounded-[var(--radius-button)] px-3 text-sm font-semibold text-[var(--accent)] underline underline-offset-4">
                      Ya está resuelto
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta titulo="Conexión con Hotmart" subtitulo="Hotmart le avisa a tu app cada compra, cancelación o reembolso. Aquí se ve si esos avisos llegan bien.">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Insignia tono={configurado ? 'verde' : 'oro'}>{configurado ? 'Configurada en el servidor' : 'Falta configurarla'}</Insignia>
          {!configurado && <span className="text-sm text-[var(--text-secondary)]">Falta la clave de Hotmart, el código de tu producto y la clave del servidor (se hace en el paso de Hotmart).</span>}
        </div>
        {wh.recientes.length === 0 ? (
          <SinDatos queFalta="Aún no llega ningún aviso. Cuando conectes Hotmart y haya la primera compra (o una prueba), aparecerá aquí con su resultado." />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(wh.por_resultado_7d).map(([k, n]) => (
                <Insignia key={k} tono={RESULTADO[k]?.tono ?? 'gris'}>
                  {RESULTADO[k]?.texto ?? k}: {n}
                </Insignia>
              ))}
            </div>
            <Tabla encabezados={[{ texto: 'Cuándo' }, { texto: 'Aviso' }, { texto: 'Resultado' }]}>
              {wh.recientes.map((r, i) => (
                <tr key={`${r.cuando}-${i}`} className="border-t border-black/5">
                  <td className="whitespace-nowrap px-3 py-3">{fechaHora(r.cuando)}</td>
                  <td className="px-3 py-3">{r.tipo ?? '—'}</td>
                  <td className="px-3 py-3">
                    <Insignia tono={RESULTADO[r.resultado]?.tono ?? 'gris'}>{RESULTADO[r.resultado]?.texto ?? r.resultado}</Insignia>
                  </td>
                </tr>
              ))}
            </Tabla>
          </>
        )}
      </Tarjeta>

      <Tarjeta titulo="Cuadre semanal con Hotmart" subtitulo="Compara las suscripciones activas en Hotmart contra las de tu app; lo sano es cero diferencias.">
        <SinDatos queFalta="Se activará al conectar la lista de suscripciones de Hotmart. Mientras tanto, revisa 'Pagos sin acceso' arriba." />
      </Tarjeta>
    </>
  );
}
