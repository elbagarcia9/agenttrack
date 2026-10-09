// USUARIOS — quién tiene cuenta, en qué situación está, y las dos cosas que el dueño necesita poder hacer a mano:
// agregar a alguien con su correo y nombre, y activar/desactivar/reenviar acceso cuando algo falla.

import Link from 'next/link';
import { Suspense } from 'react';
import { AgregarUsuarioForm, ReenviarAcceso } from '@/components/admin/Formularios';
import { BotonEstado, FiltrosUsuarios } from '@/components/admin/Interacciones';
import { Datos, Encabezado, Insignia, Kpi, Tarjeta } from '@/components/admin/ui';
import { cargarUsuarios, cargarUsuariosResumen } from '@/lib/admin/datos';
import { ETIQUETA_MEMBRESIA, fechaCorta, hace } from '@/lib/admin/formato';
import { servicioConfigurado } from '@/lib/supabase/servicio';

type Params = { q?: string; estado?: string; membresia?: string; pagina?: string };

function enlace(p: Params, cambios: Partial<Params>): string {
  const q = new URLSearchParams();
  const todo = { ...p, ...cambios };
  for (const [k, v] of Object.entries(todo)) if (v) q.set(k, String(v));
  const s = q.toString();
  return s ? `/admin/usuarios?${s}` : '/admin/usuarios';
}

export default async function Usuarios({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const [resumen, lista] = await Promise.all([
    cargarUsuariosResumen(),
    cargarUsuarios({ q: p.q, estado: p.estado, membresia: p.membresia, pagina: Number(p.pagina) || 1 }),
  ]);
  const paginas = Math.max(1, Math.ceil(lista.total / lista.porPagina));
  const hayFiltros = Boolean(p.q || p.estado || p.membresia);

  return (
    <>
      <Encabezado titulo="Usuarios" descripcion="Tus clientes y cuentas. Aquí puedes agregar a alguien a mano o resolver un acceso que no llegó." />

      <Tarjeta titulo="Agregar a alguien" subtitulo="Escribe su correo y su nombre. Si ya pagó en Hotmart sin tener cuenta, su membresía se ajusta sola a ese pago; si no, queda con acceso manual.">
        <AgregarUsuarioForm claveConfigurada={servicioConfigurado()} />
      </Tarjeta>

      <section aria-label="Resumen de usuarios" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi etiqueta="Con cuenta" valor={String(resumen.total)} detalle="Sin contar la tuya" />
        <Kpi etiqueta="Nuevas esta semana" valor={String(resumen.nuevos_7d)} detalle="Se registraron en 7 días" />
        <Kpi etiqueta="Entraron esta semana" valor={String(resumen.activos_7d)} detalle={`${resumen.activos_hoy} hoy · ${resumen.activos_30d} en el mes`} />
        <Kpi etiqueta="Sin acceso" valor={String(resumen.desactivados)} detalle="Cuentas que desactivaste" tono={resumen.desactivados > 0 ? 'alerta' : 'neutro'} />
      </section>

      <Tarjeta titulo="Todas las cuentas">
        <Suspense fallback={null}>
          <FiltrosUsuarios />
        </Suspense>
        {hayFiltros && (
          <p className="mb-3 text-sm text-[var(--text-secondary)]">
            Mostrando {lista.total} resultado{lista.total === 1 ? '' : 's'}.
          </p>
        )}

        <Datos
          filas={lista.filas}
          clave={(u) => u.id}
          vacio={hayFiltros ? 'Ninguna cuenta coincide con esos filtros.' : 'Aún no hay cuentas.'}
          columnas={[
            {
              titulo: 'Persona',
              principal: true,
              celda: (u) => (
                <>
                  <span className="block font-bold">{u.nombre || '—'}</span>
                  <span className="block break-all font-normal text-[var(--text-secondary)]">{u.email}</span>
                  {u.rol === 'admin' && <Insignia tono="azul">Dueño</Insignia>}
                </>
              ),
            },
            { titulo: 'Acceso', celda: (u) => <Insignia tono={u.estado === 'activo' ? 'verde' : 'rojo'}>{u.estado === 'activo' ? 'Con acceso' : 'Sin acceso'}</Insignia> },
            {
              titulo: 'Membresía',
              celda: (u) => {
                const clave = u.membresia ?? 'sin_membresia';
                return (
                  <span className="inline-flex flex-col items-end gap-1 md:items-start">
                    <Insignia tono={clave === 'active' ? 'azul' : clave === 'past_due' ? 'oro' : clave === 'refunded' || clave === 'chargeback' ? 'rojo' : 'gris'}>{ETIQUETA_MEMBRESIA[clave] ?? clave}</Insignia>
                    {u.ciclo && <span className="text-xs text-[var(--text-secondary)]">Plan {u.ciclo}</span>}
                  </span>
                );
              },
            },
            { titulo: 'Se unió', celda: (u) => <span className="whitespace-nowrap">{fechaCorta(u.creado_en)}</span> },
            { titulo: 'Última vez', celda: (u) => <span className="whitespace-nowrap">{u.ultimo_acceso ? hace(u.ultimo_acceso) : 'Aún no entra'}</span> },
            {
              titulo: 'Acciones',
              acciones: true,
              celda: (u) =>
                u.rol === 'admin' ? (
                  <span className="hidden text-sm text-[var(--text-secondary)] md:inline">—</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-4 md:flex-col md:items-start md:gap-x-0">
                    <ReenviarAcceso email={u.email} />
                    <BotonEstado id={u.id} estado={u.estado} email={u.email} />
                  </div>
                ),
            },
          ]}
        />

        {paginas > 1 && (
          <nav aria-label="Páginas" className="mt-4 flex items-center justify-between gap-3 text-sm">
            {lista.pagina > 1 ? (
              <Link href={enlace(p, { pagina: String(lista.pagina - 1) })} className="flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
                ← Anterior
              </Link>
            ) : (
              <span />
            )}
            <span className="text-[var(--text-secondary)]">
              Página {lista.pagina} de {paginas}
            </span>
            {lista.pagina < paginas ? (
              <Link href={enlace(p, { pagina: String(lista.pagina + 1) })} className="flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
                Siguiente →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Tarjeta>
    </>
  );
}
