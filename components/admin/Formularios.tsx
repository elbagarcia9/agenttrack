'use client';

// Formularios del panel. Cada uno muestra qué pasó (éxito o error con qué hacer) y bloquea el doble clic.

import { useActionState, useEffect, useRef } from 'react';
import { Loader2, MailPlus, Plus, Send, Trash2 } from 'lucide-react';
import { agregarUsuario, borrarCosto, borrarGasto, guardarCosto, guardarGasto, guardarTasa, reenviarAcceso, type Resultado } from '@/app/admin/acciones';

const campo =
  'mt-1 min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';
const etiqueta = 'text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]';
const botonPrimario =
  'flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)] shadow-[var(--shadow-1)] disabled:opacity-70 [touch-action:manipulation]';

function Mensaje({ r }: { r: Resultado }) {
  if (!r) return null;
  return (
    <p
      role={r.ok ? 'status' : 'alert'}
      className={`rounded-[var(--radius-button)] p-3 text-sm font-medium ${r.ok ? 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]' : 'bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]'}`}
    >
      {r.mensaje}
    </p>
  );
}

function Enviar({ pendiente, texto, Icono = Plus }: { pendiente: boolean; texto: string; Icono?: typeof Plus }) {
  return (
    <button type="submit" disabled={pendiente} className={botonPrimario}>
      {pendiente ? <Loader2 size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <Icono size={18} aria-hidden="true" />}
      {pendiente ? 'Guardando…' : texto}
    </button>
  );
}

export function AgregarUsuarioForm({ claveConfigurada }: { claveConfigurada: boolean }) {
  const [res, accion, pendiente] = useActionState(agregarUsuario, null);
  const form = useRef<HTMLFormElement>(null);
  // Tras un alta exitosa se vacía el formulario para poder agregar a la siguiente persona
  useEffect(() => {
    if (res?.ok) form.current?.reset();
  }, [res]);
  return (
    <form ref={form} action={accion} className="flex flex-col gap-4">
      {!claveConfigurada && (
        <p className="rounded-[var(--radius-button)] bg-[var(--alerta-bg)] p-3 text-sm font-medium text-[var(--alerta-text)]">
          Para crear cuentas a mano falta conectar la clave del servidor. Mientras tanto la persona puede entrar sola con su correo desde la pantalla de acceso.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={etiqueta}>Correo</span>
          <input name="email" type="email" required autoComplete="off" inputMode="email" placeholder="nombre@correo.com" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Nombre</span>
          <input name="nombre" type="text" required minLength={2} maxLength={80} autoComplete="off" placeholder="Ana Pérez" className={campo} />
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input name="enviar" type="checkbox" defaultChecked className="size-5 accent-[var(--accent)]" />
        Enviarle ahora el enlace de acceso por correo
      </label>
      <Mensaje r={res} />
      <div>
        <Enviar pendiente={pendiente} texto="Agregar usuario" Icono={MailPlus} />
      </div>
    </form>
  );
}

export function ReenviarAcceso({ email }: { email: string }) {
  const [res, accion, pendiente] = useActionState(reenviarAcceso, null);
  return (
    <form action={accion} className="flex flex-col items-start gap-1">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pendiente}
        aria-label={`Reenviar acceso a ${email}`}
        className="flex min-h-11 items-center gap-1.5 rounded-[var(--radius-button)] px-2 text-sm font-semibold text-[var(--accent)] underline underline-offset-4 disabled:opacity-60"
      >
        {pendiente ? <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        Reenviar acceso
      </button>
      {res && (
        <span role={res.ok ? 'status' : 'alert'} className={`text-xs font-medium ${res.ok ? 'text-[var(--verde-text)]' : 'text-[var(--rojo-text)]'}`}>
          {res.mensaje}
        </span>
      )}
    </form>
  );
}

export function CostoForm({ mes }: { mes: string }) {
  const [res, accion, pendiente] = useActionState(guardarCosto, null);
  return (
    <form action={accion} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={etiqueta}>Mes</span>
          <input name="mes" type="month" required defaultValue={mes} className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Qué es</span>
          <select name="concepto" required defaultValue="infra" className={campo}>
            <option value="infra">Infraestructura (Supabase, Vercel)</option>
            <option value="email">Correos (Resend)</option>
            <option value="dominio">Dominio</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="block">
          <span className={etiqueta}>Importe</span>
          <input name="monto" type="text" inputMode="decimal" required placeholder="25" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Moneda</span>
          <select name="moneda" defaultValue="USD" className={campo}>
            <option>USD</option>
            <option>MXN</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className={etiqueta}>Nota (opcional)</span>
        <input name="nota" type="text" maxLength={200} placeholder="Plan Pro de Vercel" className={campo} />
      </label>
      <Mensaje r={res} />
      <div>
        <Enviar pendiente={pendiente} texto="Guardar costo" />
      </div>
    </form>
  );
}

export function GastoForm({ hoy }: { hoy: string }) {
  const [res, accion, pendiente] = useActionState(guardarGasto, null);
  return (
    <form action={accion} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className={etiqueta}>Canal</span>
          <input name="canal" type="text" required maxLength={40} list="canales" placeholder="ads_meta" className={campo} />
          <datalist id="canales">
            <option value="ads_meta" />
            <option value="afiliado" />
            <option value="organico" />
            <option value="email" />
            <option value="directo" />
          </datalist>
        </label>
        <label className="block">
          <span className={etiqueta}>Importe gastado</span>
          <input name="monto" type="text" inputMode="decimal" required placeholder="500" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Moneda</span>
          <select name="moneda" defaultValue="USD" className={campo}>
            <option>USD</option>
            <option>MXN</option>
          </select>
        </label>
        <label className="block">
          <span className={etiqueta}>Desde</span>
          <input name="desde" type="date" required defaultValue={hoy} className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Hasta</span>
          <input name="hasta" type="date" required defaultValue={hoy} className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Nota (opcional)</span>
          <input name="nota" type="text" maxLength={200} placeholder="Campaña de octubre" className={campo} />
        </label>
      </div>
      <Mensaje r={res} />
      <div>
        <Enviar pendiente={pendiente} texto="Guardar gasto" />
      </div>
    </form>
  );
}

export function TasaForm({ actual }: { actual: number | null }) {
  const [res, accion, pendiente] = useActionState(guardarTasa, null);
  return (
    <form action={accion} className="flex flex-col gap-4">
      <label className="block max-w-xs">
        <span className={etiqueta}>Impuestos sobre tus ingresos (%)</span>
        <input name="tasa" type="text" inputMode="decimal" required defaultValue={actual ?? ''} placeholder="16" className={campo} />
      </label>
      <Mensaje r={res} />
      <div>
        <Enviar pendiente={pendiente} texto="Guardar tasa" />
      </div>
    </form>
  );
}

// Botón de borrar con su propia mini-forma (acción de servidor directa)
export function BotonBorrar({ id, accion, descripcion }: { id: number; accion: 'costo' | 'gasto'; descripcion: string }) {
  return (
    <form action={accion === 'costo' ? borrarCosto : borrarGasto}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Borrar ${descripcion}`}
        className="flex size-11 items-center justify-center rounded-full text-[var(--rojo-text)] hover:bg-[var(--chip-rojo-bg)] [touch-action:manipulation]"
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
