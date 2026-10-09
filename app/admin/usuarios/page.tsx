// USUARIOS — quién tiene cuenta, en qué situación está, y las dos cosas que el dueño necesita poder hacer a mano:
// agregar a alguien con su correo y nombre, y activar/desactivar/reenviar acceso cuando algo falla.

import Link from 'next/link';
import { Search, UserCheck, UserX } from 'lucide-react';
import { AgregarUsuarioForm, ReenviarAcceso } from '@/components/admin/Formularios';
import { Encabezado, Insignia, Kpi, Tabla, Tarjeta } from '@/components/admin/ui';
import { cambiarEstadoUsuario } from '@/app/admin/acciones';
import { cargarUsuarios, cargarUsuariosResumen } from '@/lib/admin/datos';
import { ETIQUETA_MEMBRESIA, fechaCorta, hace } from '@/lib/admin/formato';
import { servicioConfigurado } from '@/lib/supabase/servicio';

type Params = { q?: string; estado?: string; membresia?: string; pagina?: string };

const campo =
  'min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';

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

      <section aria-label="Resumen de usuarios" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Personas con cuenta" valor={String(resumen.total)} detalle={`${resumen.nuevos_7d} nueva${resumen.nuevos_7d === 1 ? '' : 's'} en 7 días`} />
        <Kpi etiqueta="Entraron hoy" valor={String(resumen.activos_hoy)} detalle="En las últimas 24 horas" />
        <Kpi etiqueta="Entraron esta semana" valor={String(resumen.activos_7d)} detalle="Últimos 7 días" />
        <Kpi etiqueta="Entraron este mes" valor={String(resumen.activos_30d)} detalle={resumen.desactivados > 0 ? `${resumen.desactivados} cuenta${resumen.desactivados === 1 ? '' : 's'} desactivada${resumen.desactivados === 1 ? '' : 's'}` : 'Últimos 30 días'} />
      </section>

      <Tarjeta titulo="Agregar a alguien" subtitulo="Escribe su correo y su nombre. Si ya pagó en Hotmart sin tener cuenta, su membresía se ajusta sola a ese pago; si no, queda con acceso manual.">
        <AgregarUsuarioForm claveConfigurada={servicioConfigurado()} />
      </Tarjeta>

      <Tarjeta titulo="Todas las cuentas">
        <form method="get" action="/admin/usuarios" className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
          <label className="relative block">
            <span className="sr-only">Buscar por correo o nombre</span>
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input name="q" type="search" defaultValue={p.q ?? ''} placeholder="Buscar por correo o nombre" className={`${campo} pl-9`} />
          </label>
          <label>
            <span className="sr-only">Estado de la cuenta</span>
            <select name="estado" defaultValue={p.estado ?? ''} className={campo}>
              <option value="">Todas</option>
              <option value="activo">Activas</option>
              <option value="desactivado">Desactivadas</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Membresía</span>
            <select name="membresia" defaultValue={p.membresia ?? ''} className={campo}>
              <option value="">Cualquier membresía</option>
              {Object.entries(ETIQUETA_MEMBRESIA).map(([k, t]) => (
                <option key={k} value={k}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="min-h-11 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)]">
            Filtrar
          </button>
        </form>
        {hayFiltros && (
          <p className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
            Mostrando {lista.total} resultado{lista.total === 1 ? '' : 's'}.
            <Link href="/admin/usuarios" className="min-h-11 content-center font-semibold text-[var(--accent)] underline underline-offset-4">
              Quitar filtros
            </Link>
          </p>
        )}

        <Tabla
          encabezados={[{ texto: 'Persona' }, { texto: 'Cuenta' }, { texto: 'Membresía' }, { texto: 'Se unió' }, { texto: 'Última vez' }, { texto: 'Acciones' }]}
          vacio={lista.filas.length === 0 ? (hayFiltros ? 'Ninguna cuenta coincide con esos filtros.' : 'Aún no hay cuentas.') : undefined}
        >
          {lista.filas.map((u) => {
            const clave = u.membresia ?? 'sin_membresia';
            return (
              <tr key={u.id} className="border-t border-black/5 align-top">
                <th scope="row" className="px-3 py-3 text-left">
                  <span className="block font-bold">{u.nombre || '—'}</span>
                  <span className="block text-[var(--text-secondary)]">{u.email}</span>
                  {u.rol === 'admin' && <Insignia tono="azul">Dueño</Insignia>}
                </th>
                <td className="px-3 py-3">
                  <Insignia tono={u.estado === 'activo' ? 'verde' : 'rojo'}>{u.estado === 'activo' ? 'Activa' : 'Desactivada'}</Insignia>
                </td>
                <td className="px-3 py-3">
                  <Insignia tono={clave === 'active' ? 'verde' : clave === 'past_due' ? 'oro' : clave === 'refunded' || clave === 'chargeback' ? 'rojo' : clave === 'sin_membresia' ? 'gris' : 'azul'}>
                    {ETIQUETA_MEMBRESIA[clave] ?? clave}
                  </Insignia>
                  {u.ciclo && <span className="mt-1 block text-xs text-[var(--text-secondary)]">Plan {u.ciclo}</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-3">{fechaCorta(u.creado_en)}</td>
                <td className="whitespace-nowrap px-3 py-3">{hace(u.ultimo_acceso)}</td>
                <td className="px-3 py-1">
                  {u.rol === 'admin' ? (
                    <span className="text-sm text-[var(--text-secondary)]">—</span>
                  ) : (
                    <div className="flex flex-col items-start">
                      <ReenviarAcceso email={u.email} />
                      <form action={cambiarEstadoUsuario}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="estado" value={u.estado === 'activo' ? 'desactivado' : 'activo'} />
                        <button
                          type="submit"
                          aria-label={`${u.estado === 'activo' ? 'Desactivar' : 'Activar'} la cuenta de ${u.email}`}
                          className={`flex min-h-11 items-center gap-1.5 rounded-[var(--radius-button)] px-2 text-sm font-semibold underline underline-offset-4 ${u.estado === 'activo' ? 'text-[var(--rojo-text)]' : 'text-[var(--verde-text)]'}`}
                        >
                          {u.estado === 'activo' ? <UserX size={16} aria-hidden="true" /> : <UserCheck size={16} aria-hidden="true" />}
                          {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </Tabla>

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
