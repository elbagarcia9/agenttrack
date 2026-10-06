'use client';

// Paso 4 de la secuencia maestra: acceso a la cuenta. Sin contraseñas: enlace de un solo uso + código de 6 dígitos.
// Estados diseñados: escribiendo · enviando · enviado (con reenvío a los 60 s) · error · límite de solicitudes.
// Anti-enumeración: el mensaje de "enviado" es idéntico exista o no la cuenta.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { Loader2, MailCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { AUTH_GOOGLE, AUTH_LOCAL, correoValido, solicitarAcceso, verificarCodigo } from '@/lib/auth';
import { track } from '@/lib/track';

type Fase = 'escribiendo' | 'enviando' | 'enviado';
const ESPERA_REENVIO = 60;

const entrada = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
});

export function EntrarForm({ plan, enlaceFallido = false }: { plan: string | null; enlaceFallido?: boolean }) {
  const [fase, setFase] = useState<Fase>('escribiendo');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState(
    enlaceFallido ? 'Ese enlace ya no sirve (vence en pocos minutos o se abrió en otro navegador). Pide uno nuevo o usa el código de 6 dígitos.' : '',
  );
  const [intento, setIntento] = useState(false);
  const [espera, setEspera] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) window.clearInterval(temporizador.current);
    };
  }, []);

  const iniciarCuenta = () => {
    setEspera(ESPERA_REENVIO);
    if (temporizador.current) window.clearInterval(temporizador.current);
    temporizador.current = window.setInterval(() => {
      setEspera((s) => {
        if (s <= 1 && temporizador.current) window.clearInterval(temporizador.current);
        return Math.max(0, s - 1);
      });
    }, 1000);
  };

  const enviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIntento(true);
    setError('');
    if (!correoValido(correo)) return;
    setFase('enviando');
    const r = await solicitarAcceso(correo);
    if (r.ok) {
      track('acceso_solicitado', { plan: plan ?? 'ninguno' });
      setFase('enviado');
      iniciarCuenta();
    } else {
      setFase('escribiendo');
      setError(
        r.motivo === 'limite'
          ? 'Pediste varios enlaces seguidos. Espera unos minutos y vuelve a intentarlo.'
          : 'No pudimos enviar el enlace. Revisa el correo e intenta de nuevo.',
      );
    }
  };

  const validarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCodigo('');
    setVerificando(true);
    const r = await verificarCodigo(correo, codigo);
    if (r.ok) {
      // Navegación completa: el servidor lee la sesión recién creada para abrir /app
      window.location.assign('/app');
      return;
    }
    setVerificando(false);
    setErrorCodigo(
      r.motivo === 'no_disponible'
        ? 'Aún no podemos validar códigos: falta conectar el servicio de cuentas.'
        : 'El código no es válido o ya venció. Pide uno nuevo.',
    );
  };

  const errCorreo = intento && !correoValido(correo) ? 'Escribe un correo válido, como nombre@correo.com.' : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[var(--bg)] bg-[image:radial-gradient(520px_320px_at_85%_-8%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)] text-[var(--text-primary)] [font-family:var(--font-body)]">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-4">
          <motion.div {...entrada(0)}>
            <Link href="/" className="flex h-11 items-center gap-2 text-base font-semibold">
              <Logo />
              AgentTrack
            </Link>
          </motion.div>

          <main className="flex flex-1 flex-col justify-start gap-6 pb-8 pt-16" aria-live="polite">
            {fase !== 'enviado' ? (
              <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
                <motion.div {...entrada(1)}>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]">Entra a tu plan</h1>
                  <p className="mt-2 text-base text-[var(--text-secondary)]">
                    {plan
                      ? 'Para guardar tu plan, tus reservas y tus avisos, y verlos en cualquier dispositivo.'
                      : 'Usa el correo con el que compraste o creaste tu plan.'}
                  </p>
                </motion.div>

                <motion.label {...entrada(2)} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Tu correo</span>
                  <input
                    type="email"
                    value={correo}
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="nombre@correo.com"
                    aria-invalid={errCorreo ? true : undefined}
                    onChange={(e) => setCorreo(e.target.value)}
                    className={`mt-1 h-14 w-full rounded-[var(--radius-button)] border bg-[var(--surface)] px-4 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)] ${errCorreo ? 'border-2 border-[var(--rojo-text)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]'}`}
                  />
                  {errCorreo && (
                    <span role="alert" className="mt-1 block text-sm font-medium text-[var(--rojo-text)]">
                      {errCorreo}
                    </span>
                  )}
                </motion.label>

                {error && (
                  <p role="alert" className="rounded-[var(--radius-card)] bg-[var(--chip-rojo-bg)] p-3 text-sm font-medium text-[var(--rojo-text)]">
                    {error}
                  </p>
                )}

                <motion.div {...entrada(3)} className="flex flex-col gap-3">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={fase === 'enviando'}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)] disabled:opacity-80 [touch-action:manipulation]"
                  >
                    {fase === 'enviando' ? (
                      <>
                        <Loader2 size={20} className="motion-safe:animate-spin" aria-hidden="true" />
                        Enviando…
                      </>
                    ) : (
                      'Enviarme mi enlace de acceso'
                    )}
                  </motion.button>
                  {AUTH_GOOGLE && (
                    <button
                      type="button"
                      className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-8 text-base font-semibold"
                    >
                      Continuar con Google
                    </button>
                  )}
                  <p className="text-center text-sm text-[var(--text-secondary)]">Sin contraseñas: te llega un enlace de un solo uso.</p>
                </motion.div>
              </form>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start gap-3">
                  <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-[var(--radius-card)] bg-[var(--chip-bg)]">
                    <MailCheck size={28} color="var(--accent)" />
                  </span>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]">Revisa tu correo</h1>
                  <p className="text-base text-[var(--text-secondary)]">
                    Si hay una cuenta con <b className="text-[var(--text-primary)]">{correo.trim()}</b>, te enviamos un enlace y un código de 6 dígitos. Vence en pocos minutos.
                  </p>
                  {AUTH_LOCAL && (
                    <p className="rounded-[var(--radius-card)] bg-[var(--alerta-bg)] p-3 text-sm font-medium text-[var(--alerta-text)]">
                      Modo de prueba: todavía no se envían correos reales. Se activarán al conectar el servicio de cuentas.
                    </p>
                  )}
                </div>

                <form onSubmit={validarCodigo} noValidate className="flex flex-col gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">¿Prefieres escribir el código?</span>
                    <input
                      type="text"
                      value={codigo}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="123456"
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                      className="mt-1 h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 text-center text-xl tabular-nums tracking-[0.4em] outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
                    />
                  </label>
                  {errorCodigo && (
                    <p role="alert" className="text-sm font-medium text-[var(--rojo-text)]">
                      {errorCodigo}
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={verificando}
                    className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)] disabled:opacity-80 [touch-action:manipulation]"
                  >
                    {verificando ? 'Verificando…' : 'Entrar con mi código'}
                  </motion.button>
                </form>

                <div className="flex flex-col items-start gap-1 text-sm">
                  <button
                    type="button"
                    disabled={espera > 0}
                    onClick={() => enviar()}
                    className="min-h-11 font-semibold text-[var(--accent)] underline underline-offset-4 disabled:text-[var(--text-secondary)] disabled:no-underline"
                  >
                    {espera > 0 ? `Reenviar en ${espera} s` : 'Reenviar el enlace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFase('escribiendo');
                      setCodigo('');
                      setErrorCodigo('');
                    }}
                    className="min-h-11 font-semibold text-[var(--text-secondary)] underline underline-offset-4"
                  >
                    Usar otro correo
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] pt-4">
              <button
                type="button"
                aria-expanded={ayuda}
                aria-controls="ayuda-acceso"
                onClick={() => setAyuda((v) => !v)}
                className="min-h-11 text-sm font-semibold text-[var(--accent)] underline underline-offset-4"
              >
                ¿Compraste y no te llega el acceso?
              </button>
              {ayuda && (
                <ul id="ayuda-acceso" className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-[var(--text-secondary)]">
                  <li>Usa el mismo correo con el que hiciste la compra.</li>
                  <li>Revisa la carpeta de spam o promociones.</li>
                  <li>Pide un enlace nuevo: el anterior vence en pocos minutos.</li>
                  <li>Si sigue sin llegar, escríbenos y lo resolvemos el mismo día (el correo de soporte se publicará aquí).</li>
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
