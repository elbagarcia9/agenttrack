'use client';

// Formularios del panel. Cada uno muestra qué pasó (éxito o error con qué hacer) y bloquea el doble clic.

import { useActionState, useEffect, useRef, useState } from 'react';
import { Loader2, MailPlus, Plus, Send } from 'lucide-react';
import { OPCIONES_CANAL } from '@/lib/admin/etiquetas';
import { agregarUsuario, guardarCosto, guardarGasto, guardarTasa, reenviarAcceso, type Resultado } from '@/app/admin/acciones';

const campo =
  'mt-1 min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';
const etiqueta = 'text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]';
const botonPrimario =
  'flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)] shadow-[var(--shadow-1)] disabled:opacity-70 panel-tap [touch-action:manipulation]';

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
  if (!claveConfigurada) {
    return (
      <p className="rounded-[var(--radius-button)] bg-[var(--surface-2)] p-4 text-sm">
        Todavía no se pueden crear cuentas desde aquí: falta una conexión que haremos juntos cuando conectemos Hotmart. Mientras tanto, la persona puede entrar sola escribiendo su correo en la pantalla de acceso.
      </p>
    );
  }
  return (
    <form ref={form} action={accion} className="flex flex-col gap-4">
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
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (res?.ok) form.current?.reset();
  }, [res]);
  return (
    <form ref={form} action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="mes" value={mes} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={etiqueta}>Qué es</span>
          <select name="concepto" required defaultValue="infra" className={campo}>
            <option value="infra">Servidores y base de datos</option>
            <option value="email">Envío de correos</option>
            <option value="dominio">Dominio</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="block">
          <span className={etiqueta}>Importe (solo números)</span>
          <input name="monto" type="text" inputMode="decimal" required placeholder="Ejemplo: 480" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Moneda</span>
          <select name="moneda" defaultValue="MXN" className={campo}>
            <option>MXN</option>
            <option>USD</option>
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
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (res?.ok) {
      form.current?.reset();
      setDesde(hoy);
      setHasta(hoy);
    }
  }, [res, hoy]);
  return (
    <form ref={form} action={accion} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className={etiqueta}>Canal</span>
          <select name="canal" required defaultValue="ads_meta" className={campo}>
            {OPCIONES_CANAL.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={etiqueta}>Importe gastado (solo números)</span>
          <input name="monto" type="text" inputMode="decimal" required placeholder="Ejemplo: 1500" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Moneda</span>
          <select name="moneda" defaultValue="MXN" className={campo}>
            <option>MXN</option>
            <option>USD</option>
          </select>
        </label>
        <label className="block">
          <span className={etiqueta}>Desde</span>
          <input
            name="desde"
            type="date"
            required
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              if (hasta < e.target.value) setHasta(e.target.value);
            }}
            className={campo}
          />
        </label>
        <label className="block">
          <span className={etiqueta}>Hasta</span>
          <input name="hasta" type="date" required value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} className={campo} />
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
