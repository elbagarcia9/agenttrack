'use client';

// Paso 3 de la secuencia maestra: pantalla de planes (paywall).
// Se personaliza con lo que la persona hizo en el onboarding; precios y prueba salen de FICHA-MERCADO.md
// (provisionales hasta confirmarlos en Hotmart). Timeline de la prueba con fechas exactas (50 → C4).

import { useEffect, useState } from 'react';
import { MotionConfig, animate, motion } from 'motion/react';
import Link from 'next/link';
import { Check, Lock, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { formatoFecha, sumarDias } from '@/lib/plazos';
import { track } from '@/lib/track';

type Plan = 'anual' | 'mensual';

const PLANES: Record<Plan, { nombre: string; precioMes: number; total: number; cobro: string }> = {
  anual: { nombre: 'Anual', precioMes: 99, total: 1190, cobro: '$1,190 MXN' },
  mensual: { nombre: 'Mensual', precioMes: 149, total: 149, cobro: '$149 MXN' },
};
const DIAS_PRUEBA = 14;

// Cuando exista el producto en Hotmart, estas variables llevan al checkout real. Sin ellas, el flujo
// sigue en modo local y termina en la pantalla de entrar (la plataforma de pago es un paso posterior).
const CHECKOUT: Record<Plan, string> = {
  anual: process.env.NEXT_PUBLIC_CHECKOUT_ANUAL ?? '/entrar?plan=anual',
  mensual: process.env.NEXT_PUBLIC_CHECKOUT_MENSUAL ?? '/entrar?plan=mensual',
};

const BENEFICIOS = [
  'Aviso antes de que venza el alta (30 días) y el reclamo (18 meses)',
  'Importa tu Excel y tu base queda lista el mismo día',
  'Tu tabla y tu calendario de cobros, en celular y computadora',
];

interface Guardado {
  nombre: string;
  comision: string;
  moneda: string;
  cliente: string;
  respuestas: number;
}

function leerGuardado(): Guardado | null {
  try {
    const crudo = window.localStorage.getItem('cg_onboarding_v1');
    if (!crudo) return null;
    const e = JSON.parse(crudo);
    if (!e?.nombre || !e?.reserva?.cliente) return null;
    const respuestas = [e.nombre, e.agencia, e.control, e.preocupacion, e.reserva.cliente].filter((x: unknown) => typeof x === 'string' && x.trim()).length;
    return { nombre: String(e.nombre).trim(), comision: String(e.reserva.comision), moneda: String(e.reserva.moneda), cliente: String(e.reserva.cliente).trim(), respuestas };
  } catch {
    return null;
  }
}

function Nodo({ lleno }: { lleno: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 mt-1 block size-3 shrink-0 rounded-full border-2 border-[var(--accent)] ${lleno ? 'bg-[var(--accent)]' : 'bg-[var(--bg)]'}`}
    />
  );
}

const HORAS = [
  { id: 'manana', texto: 'Mañana', hora: '8:00' },
  { id: 'tarde', texto: 'Tarde', hora: '14:00' },
  { id: 'noche', texto: 'Noche', hora: '20:00' },
] as const;
type Hora = (typeof HORAS)[number]['id'];

function Numero({ valor }: { valor: number }) {
  const [mostrado, setMostrado] = useState(valor);
  useEffect(() => {
    const a = animate(mostrado, valor, { duration: 0.3, ease: 'easeOut', onUpdate: (v) => setMostrado(Math.round(v)) });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);
  return <>{mostrado.toLocaleString('en-US')}</>;
}

export function PaywallFlow() {
  const [plan, setPlan] = useState<Plan>('anual');
  const [guardado, setGuardado] = useState<Guardado | null>(null);
  const [aviso, setAviso] = useState(true);
  const [hora, setHora] = useState<Hora>('manana');
  const [hoy, setHoy] = useState<Date | null>(null);
  const hidratado = hoy !== null;

  useEffect(() => {
    // lectura única del almacenamiento local al cargar (no hay servidor todavía)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuardado(leerGuardado());
    setHoy(new Date());
    track('paywall_visto');
  }, []);

  // Las fechas dependen de "hoy": se calculan en el navegador. Antes de montar se muestran los días de la prueba.
  const diaAviso = hoy ? formatoFecha(sumarDias(hoy, DIAS_PRUEBA - 2), hoy) : `Día ${DIAS_PRUEBA - 2}`;
  const diaCobro = hoy ? formatoFecha(sumarDias(hoy, DIAS_PRUEBA), hoy) : `Día ${DIAS_PRUEBA}`;
  const p = PLANES[plan];
  const horaTxt = HORAS.find((h) => h.id === hora)?.hora ?? '8:00';
  const alMoverFlecha = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setPlan('mensual');
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setPlan('anual');
  };

  const iniciar = () => {
    track('checkout_iniciado', { plan, aviso, hora });
    try {
      window.localStorage.setItem('cg_preferencias', JSON.stringify({ avisoCobro: aviso, horaAviso: hora, plan }));
    } catch {
      /* sin almacenamiento: la preferencia se pedirá de nuevo dentro de la app */
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[var(--bg)] bg-[image:radial-gradient(640px_420px_at_85%_-8%,color-mix(in_oklab,var(--accent)_24%,transparent),transparent_70%),radial-gradient(420px_300px_at_-10%_105%,color-mix(in_oklab,var(--btn-oro-to)_14%,transparent),transparent_70%)] text-[var(--text-primary)] [font-family:var(--font-body)]">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-2">
          <header className="flex h-11 items-center justify-between">
            <Link href="/" aria-label="AgentTrack, ir a la página principal" className="flex min-h-11 items-center gap-2 text-base font-semibold">
              <Logo />
              AgentTrack
            </Link>
            <Link href="/onboarding" aria-label="Cerrar y volver a mi plan" className="-mr-2 flex size-11 items-center justify-center text-[var(--text-secondary)]">
              <X size={20} />
            </Link>
          </header>

          <main className="flex flex-1 flex-col gap-6 pb-6">
            <div>
              <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]">
                {guardado ? (
                  <>
                    {guardado.nombre}, tu asistente está <span className="text-[var(--accent)]">listo para vigilar</span>
                  </>
                ) : (
                  <>
                    Protege <span className="text-[var(--accent)]">cada comisión</span> que te ganaste
                  </>
                )}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {guardado ? `Hecho con tus ${guardado.respuestas} respuestas.` : 'Empieza con 14 días gratis y decide después.'}
              </p>
            </div>

            {!hidratado && <div aria-hidden="true" className="h-[132px] animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-reduce:animate-none" />}
            {guardado && (
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="rounded-[var(--radius-card)] border-b-4 border-[var(--btn-oro-to)] bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] p-3 text-white shadow-[var(--shadow-2)]"
              >
                <p className="text-xs font-semibold opacity-90">Ya registraste</p>
                <p className="text-base font-semibold">{guardado.cliente}</p>
                <p className="mt-2 inline-flex rounded-full bg-[var(--btn-oro-to)] px-3 py-1 text-xs font-bold text-[var(--btn-oro-text)]">
                  {Number(guardado.comision).toLocaleString('en-US')} {guardado.moneda} con sus plazos vigilados
                </p>
                <p className="mt-2 text-sm opacity-90">Sin plan, esta reserva y sus avisos no se guardan.</p>
              </motion.div>
            )}

            <ul className="flex flex-col gap-3">
              {BENEFICIOS.map((b, i) => (
                <motion.li key={b} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }} className="flex items-start gap-3 text-base">
                  <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                    <Check size={12} strokeWidth={3} color="var(--accent)" />
                  </span>
                  {b}
                </motion.li>
              ))}
            </ul>

            <div role="radiogroup" aria-label="Elige tu plan" onKeyDown={alMoverFlecha} className="flex flex-col gap-4">
              {(['anual', 'mensual'] as Plan[]).map((k) => {
                const sel = plan === k;
                const d = PLANES[k];
                return (
                  <motion.button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPlan(k)}
                    tabIndex={sel ? 0 : -1}
                    className="relative flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
                  >
                    {sel && (
                      <motion.span
                        layoutId="borde-plan"
                        aria-hidden="true"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        className="pointer-events-none absolute -inset-px rounded-[var(--radius-card)] border-2 border-transparent shadow-[var(--shadow-2)]"
                        style={{
                          background:
                            'linear-gradient(color-mix(in oklab, var(--accent) 8%, var(--surface)), color-mix(in oklab, var(--accent) 8%, var(--surface))) padding-box, linear-gradient(135deg, var(--accent), var(--btn-oro-to)) border-box',
                        }}
                      />
                    )}
                    {k === 'anual' && (
                      <span className="absolute -top-3 left-4 z-20 rounded-full bg-[var(--accent)] px-3 py-0.5 text-xs font-bold tracking-wide text-[var(--on-accent)]">RECOMENDADO</span>
                    )}
                    {k === 'anual' && (
                      <span className="absolute -top-3 right-4 z-20 rounded-full bg-[var(--btn-oro-to)] px-3 py-0.5 text-xs font-bold tracking-wide text-[var(--btn-oro-text)]">AHORRAS 4 MESES</span>
                    )}
                    <div className="relative z-10">
                      <p className="font-semibold [font-family:var(--font-display)]">{d.nombre}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {k === 'anual' ? `Se cobra ${d.cobro} al año` : 'Cancelas cuando quieras'}
                      </p>
                    </div>
                    <div className="relative z-10 shrink-0 whitespace-nowrap text-right">
                      <p className="text-2xl font-bold tabular-nums [font-family:var(--font-display)]">
                        $<Numero valor={d.precioMes} />
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">MXN al mes</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <p className="-mt-2 text-center text-sm font-medium text-[var(--text-secondary)]">Una sola comisión que no dejes vencer puede pagar tu año.</p>

            <section aria-label="Cómo funciona tu prueba gratis" className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Así funciona tu prueba</h2>
              <ol className="relative mt-4 flex flex-col gap-5">
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute left-[5px] top-3 bottom-3 w-0.5 origin-top bg-[var(--accent)]"
                />
                <li className="flex gap-3">
                  <Nodo lleno />
                  <div>
                    <p className="text-base font-semibold">Hoy: acceso completo</p>
                    <p className="text-sm text-[var(--text-secondary)]">Hoy no pagas nada.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Nodo lleno />
                  <div>
                    <p className="text-base font-semibold">
                      {diaAviso}{aviso ? `, ${horaTxt}` : ''}: {aviso ? 'te avisamos' : 'sin aviso por correo'}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {aviso ? 'Un correo antes de cualquier cobro.' : 'Sin correo de aviso: tú decides cuándo cancelar.'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Nodo lleno={false} />
                  <div>
                    <p className="text-base font-semibold">
                      {diaCobro}: primer cobro de {p.cobro}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Si cancelas antes, no pagas nada.</p>
                  </div>
                </li>
              </ol>
              <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={aviso} onChange={(e) => setAviso(e.target.checked)} className="size-5 accent-[var(--accent)]" />
                Avísame por correo 2 días antes del cobro
              </label>
              {aviso && (
                <div role="radiogroup" aria-label="¿A qué hora te avisamos?" className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">¿A qué hora?</span>
                  {HORAS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      role="radio"
                      aria-checked={hora === h.id}
                      onClick={() => setHora(h.id)}
                      className={`min-h-11 rounded-full px-4 text-sm font-semibold [touch-action:manipulation] ${
                        hora === h.id
                          ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                          : 'border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface)]'
                      }`}
                    >
                      {h.texto} · {h.hora}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </main>

          <div className="sticky bottom-0 z-20 -mx-4 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-16px_rgb(34_60_80_/_0.35)]">
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={CHECKOUT[plan]}
              onClick={iniciar}
              className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)]"
            >
              Empezar mis 14 días gratis
            </motion.a>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
              Después, {p.cobro} {plan === 'anual' ? 'al año' : 'al mes'}. Cancelas cuando quieras.
            </p>
            <div className="mt-1 flex items-center justify-center gap-4">
              <Link href="/" className="flex min-h-11 items-center px-2 text-sm font-medium text-[var(--text-secondary)] underline underline-offset-4">
                Ahora no
              </Link>
              <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                <Lock size={14} aria-hidden="true" /> Pago procesado por Hotmart
              </span>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
