'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { eliminarMiCuenta, guardarAvisosCorreo, type Resultado } from '@/app/app/cuenta/acciones';
import { AUTH_LOCAL, guardarContrasena } from '@/lib/auth';
import { AvisosCelular } from '@/components/app/AvisosCelular';
import { descargarReservasExcel } from '@/lib/exportar';
import { SOPORTE_EMAIL } from '@/lib/legal';
import { useReservas } from '@/lib/reservas';

const enlace = 'font-semibold text-[var(--accent)] underline underline-offset-4';

export function CuentaPanel({ correo, avisosInicial }: { correo: string | null; avisosInicial: boolean }) {
  const [avisos, setAvisos] = useState(avisosInicial);
  const [msgAvisos, setMsgAvisos] = useState<Resultado>(null);
  const [guardando, empezar] = useTransition();
  const { reservas, listo } = useReservas();
  const propias = reservas.filter((r) => !r.id.startsWith('demo-')).length;
  const [clave1, setClave1] = useState('');
  const [clave2, setClave2] = useState('');
  const [msgClave, setMsgClave] = useState<Resultado>(null);
  const [guardandoClave, setGuardandoClave] = useState(false);
  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clave1.length < 8) return setMsgClave({ ok: false, mensaje: 'Usa al menos 8 caracteres.' });
    if (clave1 !== clave2) return setMsgClave({ ok: false, mensaje: 'Las dos contraseñas no coinciden.' });
    setGuardandoClave(true);
    const r = await guardarContrasena(clave1);
    setGuardandoClave(false);
    if (r.ok) {
      setClave1('');
      setClave2('');
      setMsgClave({ ok: true, mensaje: 'Listo: ya puedes entrar con tu correo y esta contraseña.' });
    } else {
      setMsgClave({ ok: false, mensaje: 'No pudimos guardarla. Inténtalo de nuevo.' });
    }
  };
  const [exportando, setExportando] = useState(false);
  const [msgExcel, setMsgExcel] = useState('');
  const exportar = async () => {
    setExportando(true);
    setMsgExcel('');
    try {
      const n = await descargarReservasExcel(reservas);
      setMsgExcel(`Listo: descargaste ${n} ${n === 1 ? 'reserva' : 'reservas'} en Excel.`);
    } catch {
      setMsgExcel('No pudimos crear el archivo. Inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };
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

      <AvisosCelular />

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

      <section aria-label="Mi contraseña" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
        <h2 className="text-lg font-bold [font-family:var(--font-display)]">Mi contraseña (opcional)</h2>
        <p className="mt-1 text-base text-[var(--text-secondary)]">
          Con una contraseña entras con tu correo sin pedir un código cada vez. Si la olvidas, pides un código por correo y creas otra aquí.
        </p>
        <form onSubmit={cambiarClave} className="mt-3 flex flex-col gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nueva contraseña</span>
            <input
              type="password"
              value={clave1}
              autoComplete="new-password"
              disabled={AUTH_LOCAL}
              placeholder="Mínimo 8 caracteres"
              onChange={(e) => setClave1(e.target.value)}
              className="mt-1 h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Repítela</span>
            <input
              type="password"
              value={clave2}
              autoComplete="new-password"
              disabled={AUTH_LOCAL}
              onChange={(e) => setClave2(e.target.value)}
              className="mt-1 h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
            />
          </label>
          {msgClave && (
            <p role={msgClave.ok ? 'status' : 'alert'} className={`text-sm font-medium ${msgClave.ok ? 'text-[var(--verde-text)]' : 'text-[var(--rojo-text)]'}`}>
              {msgClave.mensaje}
            </p>
          )}
          <button
            type="submit"
            disabled={guardandoClave || AUTH_LOCAL}
            className="flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--on-accent)] disabled:opacity-60"
          >
            {guardandoClave ? 'Guardando…' : 'Guardar mi contraseña'}
          </button>
        </form>
      </section>

      <section aria-label="Mis datos" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
        <h2 className="text-lg font-bold [font-family:var(--font-display)]">Mis datos</h2>
        <p className="mt-1 text-base">Descarga todas tus reservas en un Excel. Son tuyas: te las puedes llevar cuando quieras, y el mismo archivo se puede volver a importar en AgentTrack.</p>
        <button
          type="button"
          onClick={exportar}
          disabled={exportando || !listo || propias === 0}
          className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {exportando ? <Loader2 size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
          {exportando ? 'Creando tu Excel…' : 'Descargar mis reservas en Excel'}
        </button>
        {listo && propias === 0 && <p className="mt-2 text-sm text-[var(--text-secondary)]">Aún no tienes reservas propias para descargar.</p>}
        {msgExcel && (
          <p role="status" className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
            {msgExcel}
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
          Antes de eliminarla, cancela tu suscripción en Hotmart (borrar la cuenta no detiene los cobros) y descarga tus reservas en Excel si quieres conservarlas.
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
