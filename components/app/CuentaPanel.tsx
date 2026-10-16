'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Trash2 } from 'lucide-react';
import { eliminarMiCuenta, guardarAvisosCorreo, type Resultado } from '@/app/app/cuenta/acciones';
import { AUTH_LOCAL } from '@/lib/auth';
import { SOPORTE_EMAIL } from '@/lib/legal';

const enlace = 'font-semibold text-[var(--accent)] underline underline-offset-4';

export function CuentaPanel({ correo, avisosInicial }: { correo: string | null; avisosInicial: boolean }) {
  const [avisos, setAvisos] = useState(avisosInicial);
  const [msgAvisos, setMsgAvisos] = useState<Resultado>(null);
  const [guardando, empezar] = useTransition();
  const [res, accion, eliminando] = useActionState(async (previo: Resultado, fd: FormData) => {
    const r = await eliminarMiCuenta(previo, fd);
    // Cuenta borrada: navegación completa a la página principal (la sesión ya no existe)
    if (r?.ok) window.location.assign('/');
    return r;
  }, null);

  const cambiarAvisos = (activar: boolean) => {
    setAvisos(activar);
    empezar(async () => {
      const r = await guardarAvisosCorreo(activar);
      setMsgAvisos(r);
      if (r && !r.ok) setAvisos(!activar);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">Mi cuenta</h1>
        <p className="mt-1 break-all text-sm text-[var(--text-secondary)]">{correo ?? 'Modo de prueba: aún sin cuenta conectada'}</p>
      </div>

      <section aria-label="Avisos por correo" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
        <h2 className="text-lg font-bold [font-family:var(--font-display)]">Avisos por correo</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Un resumen cada mañana cuando tienes plazos por atender, y el aviso de que tu prueba está por terminar.</p>
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium">
          <input type="checkbox" checked={avisos} disabled={AUTH_LOCAL || guardando} onChange={(e) => cambiarAvisos(e.target.checked)} className="size-5 accent-[var(--accent)]" />
          Quiero recibir avisos por correo
        </label>
        {msgAvisos && (
          <p role={msgAvisos.ok ? 'status' : 'alert'} className={`mt-1 text-sm font-medium ${msgAvisos.ok ? 'text-[var(--verde-text)]' : 'text-[var(--rojo-text)]'}`}>
            {msgAvisos.mensaje}
          </p>
        )}
      </section>

      <section aria-label="Suscripción" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
        <h2 className="text-lg font-bold [font-family:var(--font-display)]">Mi suscripción</h2>
        <p className="mt-1 text-base">
          Cancelas cuando quieras, desde Hotmart (quien procesa tu cobro), en unos minutos y sin llamar a nadie. Conservas el acceso hasta el final del periodo que ya pagaste.
        </p>
        <Link href="/reembolsos" className={`${enlace} mt-2 flex min-h-11 items-center`}>
          Ver cómo cancelar, paso a paso
        </Link>
      </section>

      <section aria-label="Documentos" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
        <h2 className="text-lg font-bold [font-family:var(--font-display)]">Documentos</h2>
        <ul className="mt-1 flex flex-col">
          {[
            ['/terminos', 'Términos y condiciones'],
            ['/privacidad', 'Aviso de privacidad'],
            ['/reembolsos', 'Cancelación y reembolsos'],
          ].map(([href, texto]) => (
            <li key={href}>
              <Link href={href} className={`${enlace} flex min-h-11 items-center`}>
                {texto}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Dudas o quieres ver, corregir u oponerte al uso de tus datos? Escríbenos a{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className={enlace}>
            {SOPORTE_EMAIL}
          </a>
          .
        </p>
      </section>

      <section aria-label="Eliminar mi cuenta" className="rounded-[var(--radius-card)] border border-[var(--rojo-text)]/30 bg-[var(--surface)] p-4">
        <h2 className="text-lg font-bold text-[var(--rojo-text)] [font-family:var(--font-display)]">Eliminar mi cuenta</h2>
        <p className="mt-1 text-base">
          Borra tu cuenta y todo lo que registraste: tus reservas, tus preferencias y tus avisos. <b>No se puede deshacer.</b>
        </p>
        <p className="mt-2 rounded-[var(--radius-button)] bg-[var(--alerta-bg)] p-3 text-sm font-medium text-[var(--alerta-text)]">
          Antes de eliminarla, cancela tu suscripción en Hotmart: borrar la cuenta no detiene los cobros.
        </p>
        <form action={accion} className="mt-3 flex flex-col gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Para confirmar, escribe ELIMINAR</span>
            <input
              name="confirmo"
              type="text"
              autoComplete="off"
              disabled={AUTH_LOCAL}
              placeholder="ELIMINAR"
              className="mt-1 h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
            />
          </label>
          {res && !res.ok && (
            <p role="alert" className="text-sm font-medium text-[var(--rojo-text)]">
              {res.mensaje}
            </p>
          )}
          <button
            type="submit"
            disabled={eliminando || AUTH_LOCAL}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--rojo-text)] px-5 text-base font-semibold text-white disabled:opacity-60"
          >
            {eliminando ? <Loader2 size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <Trash2 size={18} aria-hidden="true" />}
            {eliminando ? 'Eliminando…' : 'Eliminar mi cuenta para siempre'}
          </button>
        </form>
      </section>
    </div>
  );
}
