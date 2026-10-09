'use client';

// Acciones del panel que cambian algo importante: piden confirmación (o permiten deshacer), muestran que se están
// guardando y dicen cómo terminó. Ninguna actúa al primer toque.

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, Loader2, Search, Trash2, UserCheck, UserX, X } from 'lucide-react';
import { borrarCosto, borrarGasto, cambiarEstadoUsuario, reabrirError, resolverError } from '@/app/admin/acciones';
import { ETIQUETA_MEMBRESIA } from '@/lib/admin/formato';

const boton = 'panel-tap flex min-h-11 items-center gap-1.5 rounded-[var(--radius-button)] px-2 text-sm font-semibold underline underline-offset-4 disabled:opacity-60';

// ───────── Desactivar / activar una cuenta ─────────
export function BotonEstado({ id, estado, email }: { id: string; estado: 'activo' | 'desactivado'; email: string }) {
  const [paso, setPaso] = useState<'reposo' | 'confirmar' | 'hecho'>('reposo');
  const [hecho, setHecho] = useState<'desactivada' | 'activada'>('desactivada');
  const [pendiente, empezar] = useTransition();
  const desactivar = estado === 'activo';

  const cambiar = (haciaDesactivada: boolean, alTerminar: () => void) =>
    empezar(async () => {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('estado', haciaDesactivada ? 'desactivado' : 'activo');
      await cambiarEstadoUsuario(fd);
      alTerminar();
    });

  if (paso === 'hecho') {
    return (
      <p role="status" className="flex min-h-11 flex-wrap items-center gap-2 px-2 text-sm font-semibold text-[var(--verde-text)]">
        <Check size={16} aria-hidden="true" />
        {hecho === 'desactivada' ? 'Cuenta desactivada' : 'Cuenta activada'}
        <button type="button" disabled={pendiente} onClick={() => cambiar(hecho === 'activada', () => setPaso('reposo'))} className={`${boton} text-[var(--accent)]`}>
          {pendiente ? 'Deshaciendo…' : 'Deshacer'}
        </button>
      </p>
    );
  }
  if (paso === 'confirmar') {
    return (
      <div role="alertdialog" aria-label="Confirmar" className="flex flex-wrap items-center gap-2 py-1">
        <span className="text-sm font-medium">{desactivar ? '¿Quitarle el acceso a la app?' : '¿Devolverle el acceso?'}</span>
        <button
          type="button"
          disabled={pendiente}
          onClick={() => cambiar(desactivar, () => { setHecho(desactivar ? 'desactivada' : 'activada'); setPaso('hecho'); })}
          className={`${boton} ${desactivar ? 'text-[var(--rojo-text)]' : 'text-[var(--verde-text)]'}`}
        >
          {pendiente ? <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          {pendiente ? 'Guardando…' : 'Sí, confirmar'}
        </button>
        <button type="button" disabled={pendiente} onClick={() => setPaso('reposo')} className={`${boton} text-[var(--text-secondary)]`}>
          <X size={16} aria-hidden="true" /> No
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPaso('confirmar')}
      aria-label={`${desactivar ? 'Desactivar' : 'Activar'} la cuenta de ${email}`}
      className={`${boton} ${desactivar ? 'text-[var(--rojo-text)]' : 'text-[var(--verde-text)]'}`}
    >
      {desactivar ? <UserX size={16} aria-hidden="true" /> : <UserCheck size={16} aria-hidden="true" />}
      {desactivar ? 'Desactivar' : 'Activar'}
    </button>
  );
}

// ───────── Marcar un error como resuelto (con deshacer) ─────────
export function BotonResolver({ mensaje }: { mensaje: string }) {
  const [resuelto, setResuelto] = useState(false);
  const [pendiente, empezar] = useTransition();
  const enviar = (accion: typeof resolverError, nuevo: boolean) =>
    empezar(async () => {
      const fd = new FormData();
      fd.set('mensaje', mensaje);
      await accion(fd);
      setResuelto(nuevo);
    });

  if (resuelto) {
    return (
      <p role="status" className="flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold text-[var(--verde-text)]">
        <Check size={16} aria-hidden="true" /> Marcado como resuelto
        <button type="button" disabled={pendiente} onClick={() => enviar(reabrirError, false)} className={`${boton} text-[var(--accent)]`}>
          Deshacer
        </button>
      </p>
    );
  }
  return (
    <button type="button" disabled={pendiente} onClick={() => enviar(resolverError, true)} className={`${boton} text-[var(--accent)]`}>
      {pendiente && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
      {pendiente ? 'Guardando…' : 'Ya está resuelto'}
    </button>
  );
}

// ───────── Borrar un costo o un gasto (muestra QUÉ se va a borrar) ─────────
export function BotonBorrar({ id, accion, descripcion }: { id: number; accion: 'costo' | 'gasto'; descripcion: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, empezar] = useTransition();
  const borrar = () =>
    empezar(async () => {
      const fd = new FormData();
      fd.set('id', String(id));
      await (accion === 'costo' ? borrarCosto(fd) : borrarGasto(fd));
    });

  if (confirmando) {
    return (
      <div role="alertdialog" aria-label="Confirmar borrado" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-sm font-medium">¿Borrar {descripcion}?</span>
        <button type="button" disabled={pendiente} onClick={borrar} className={`${boton} text-[var(--rojo-text)]`}>
          {pendiente ? <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
          {pendiente ? 'Borrando…' : 'Sí, borrar'}
        </button>
        <button type="button" disabled={pendiente} onClick={() => setConfirmando(false)} className={`${boton} text-[var(--text-secondary)]`}>
          No
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      aria-label={`Borrar ${descripcion}`}
      title="Borrar"
      className="panel-tap flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--chip-rojo-bg)] hover:text-[var(--rojo-text)]"
    >
      <Trash2 size={18} aria-hidden="true" />
    </button>
  );
}

// ───────── Filtros de usuarios: se aplican solos y se ven los activos ─────────
const campo =
  'min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';

export function FiltrosUsuarios() {
  const router = useRouter();
  const actual = useSearchParams();
  const [q, setQ] = useState(actual.get('q') ?? '');
  const [pendiente, empezar] = useTransition();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estado = actual.get('estado') ?? '';
  const membresia = actual.get('membresia') ?? '';

  const ir = (cambios: Record<string, string>) => {
    const p = new URLSearchParams(actual.toString());
    for (const [k, v] of Object.entries(cambios)) (v ? p.set(k, v) : p.delete(k));
    p.delete('pagina');
    empezar(() => router.push(p.toString() ? `/admin/usuarios?${p.toString()}` : '/admin/usuarios'));
  };

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const activos = [
    q.trim() && { clave: 'q', texto: `Busca: ${q.trim()}` },
    estado && { clave: 'estado', texto: estado === 'activo' ? 'Con acceso' : 'Sin acceso' },
    membresia && { clave: 'membresia', texto: ETIQUETA_MEMBRESIA[membresia] ?? membresia },
  ].filter(Boolean) as { clave: string; texto: string }[];

  return (
    <div className="mb-4 flex flex-col gap-3" role="search">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar por correo o nombre</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (temporizador.current) clearTimeout(temporizador.current);
              const valor = e.target.value;
              temporizador.current = setTimeout(() => ir({ q: valor.trim() }), 350);
            }}
            placeholder="Buscar por correo o nombre"
            className={`${campo} pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Acceso a la app</span>
          <select value={estado} onChange={(e) => ir({ estado: e.target.value })} className={campo}>
            <option value="">Todas</option>
            <option value="activo">Con acceso</option>
            <option value="desactivado">Sin acceso (desactivadas)</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Membresía</span>
          <select value={membresia} onChange={(e) => ir({ membresia: e.target.value })} className={campo}>
            <option value="">Cualquier membresía</option>
            {Object.entries(ETIQUETA_MEMBRESIA).map(([k, t]) => (
              <option key={k} value={k}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(activos.length > 0 || pendiente) && (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {pendiente && <Loader2 size={16} className="motion-safe:animate-spin text-[var(--accent)]" aria-label="Filtrando" />}
          {activos.map((a) => (
            <button
              key={a.clave}
              type="button"
              onClick={() => {
                if (a.clave === 'q') setQ('');
                ir({ [a.clave]: '' });
              }}
              aria-label={`Quitar filtro: ${a.texto}`}
              className="panel-tap flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--chip-azul-bg)] px-3 text-sm font-semibold text-[var(--accent)]"
            >
              {a.texto}
              <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
