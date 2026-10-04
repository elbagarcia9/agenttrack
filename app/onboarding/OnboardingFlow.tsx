'use client';

// Paso 2 de la secuencia maestra: recorrido de inicio (onboarding).
// Una decisión por pantalla · barra de progreso · cada pregunta ecoa un dolor de FICHA-AVATAR.md ·
// primera acción real (registrar una reserva) · resultado personalizado con los plazos reales de Archer.

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useReducedMotion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  CircleHelp,
  CalendarX,
  FileSpreadsheet,
  FileWarning,
  MessageCircle,
  NotebookPen,
  Globe,
  Building2,
  ShieldCheck,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import { calcularPlazos, diasRestantes, estadoSemaforo, formatoFecha, parseFecha, type EstadoSemaforo } from '@/lib/plazos';
import { track } from '@/lib/track';

type Paso = 'nombre' | 'agencia' | 'control' | 'preocupacion' | 'reconocimiento' | 'reserva' | 'cargando' | 'resultado';
const PASOS: Paso[] = ['nombre', 'agencia', 'control', 'preocupacion', 'reconocimiento', 'reserva', 'cargando', 'resultado'];

interface Reserva {
  cliente: string;
  destino: string;
  proveedor: string;
  moneda: 'USD' | 'MXN';
  comision: string;
  compra: string;
  viaje: string;
}
interface Estado {
  paso: Paso;
  direccion: 1 | -1;
  nombre: string;
  agencia: string;
  control: string;
  preocupacion: string;
  reserva: Reserva;
  /** true cuando ya se leyó el almacenamiento local (evita parpadeo y errores de hidratación). */
  hidratado: boolean;
}

const RESERVA_VACIA: Reserva = { cliente: '', destino: '', proveedor: '', moneda: 'USD', comision: '', compra: '', viaje: '' };
const INICIAL: Estado = { paso: 'nombre', direccion: 1, nombre: '', agencia: '', control: '', preocupacion: '', reserva: RESERVA_VACIA, hidratado: false };
const CLAVE = 'cg_onboarding_v1';

type Accion =
  | { tipo: 'campo'; campo: 'nombre' | 'agencia' | 'control' | 'preocupacion'; valor: string }
  | { tipo: 'reserva'; reserva: Reserva }
  | { tipo: 'ir'; paso: Paso; direccion: 1 | -1 }
  | { tipo: 'restaurar'; estado: Estado };

function reductor(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'campo':
      return { ...e, [a.campo]: a.valor };
    case 'reserva':
      return { ...e, reserva: a.reserva };
    case 'ir':
      return { ...e, paso: a.paso, direccion: a.direccion };
    case 'restaurar':
      return { ...a.estado, hidratado: true };
  }
}

const AGENCIAS = ['Archer México y Latinoamérica', 'Otra agencia Host'];
const CONTROLES: { texto: string; Icon: LucideIcon }[] = [
  { texto: 'Excel o Google Sheets', Icon: FileSpreadsheet },
  { texto: 'WhatsApp y notas', Icon: MessageCircle },
  { texto: 'Solo el portal de mi agencia', Icon: Globe },
  { texto: 'Libreta o mi memoria', Icon: NotebookPen },
];
const PREOCUPACIONES: { texto: string; Icon: LucideIcon; clave: 'alta' | 'pago' | 'reclamo' | 'fechas' }[] = [
  { texto: 'Que se me pase dar de alta una venta', Icon: FileWarning, clave: 'alta' },
  { texto: 'No saber si ya me pagaron', Icon: CircleHelp, clave: 'pago' },
  { texto: 'Que venza el plazo de reclamo', Icon: CalendarX, clave: 'reclamo' },
  { texto: 'Tener fechas de viaje y de cobro revueltas', Icon: FileSpreadsheet, clave: 'fechas' },
];
const RECONOCIMIENTO: Record<string, string> = {
  alta: 'Dar de alta se olvida porque vive en otro portal, no en tu agenda. No es descuido tuyo: lo vamos a recordar nosotros.',
  pago: 'Es normal olvidarlo: el pago llega semanas después del viaje. Tu asistente te recordará cuándo preguntar por él.',
  reclamo: 'El plazo de reclamo es largo, y por eso se olvida. Lo vamos a contar por ti y te avisaremos a tiempo.',
  otra: 'Gracias por contármelo. Vamos a vigilar cada plazo por ti para que no dependa de tu memoria.',
  fechas: 'Mezclar viajes y cobros es lo más común con Excel. Aquí cada uno tiene su propio calendario.',
};

function claveDe(texto: string) {
  return PREOCUPACIONES.find((p) => p.texto === texto)?.clave ?? 'otra';
}

// ───────────────────────── piezas de interfaz ─────────────────────────

function Progreso({ valor }: { valor: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valor)}
      aria-label="Avance del cuestionario"
      className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
    >
      <motion.div
        className="h-full rounded-full bg-[var(--accent)]"
        initial={false}
        animate={{ width: `${valor}%` }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

function Opcion({
  texto,
  Icon,
  seleccionada,
  onElegir,
  bloqueada,
}: {
  texto: string;
  Icon?: LucideIcon;
  seleccionada: boolean;
  onElegir: () => void;
  bloqueada: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      disabled={bloqueada}
      onClick={onElegir}
      aria-pressed={seleccionada}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-button)] border px-4 py-3 text-left text-base font-medium transition-colors duration-200 [touch-action:manipulation] ${
        seleccionada
          ? 'border-2 border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,var(--surface))]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]"
        >
          <Icon size={20} strokeWidth={1.8} color="var(--accent)" />
        </span>
      )}
      <span className="flex-1">{texto}</span>
      {seleccionada && (
        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
          <Check size={20} color="var(--accent)" aria-hidden="true" />
        </motion.span>
      )}
    </motion.button>
  );
}

function BotonPrincipal({ children, onClick, deshabilitado, enviar }: { children: React.ReactNode; onClick?: () => void; deshabilitado?: boolean; enviar?: boolean }) {
  return (
    <motion.button
      type={enviar ? 'submit' : 'button'}
      whileTap={deshabilitado ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={deshabilitado}
      className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)] transition-opacity duration-200 disabled:opacity-60 [touch-action:manipulation]"
    >
      {children}
    </motion.button>
  );
}

function Pregunta({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]">{titulo}</h1>
      {ayuda && <p className="mt-2 text-sm text-[var(--text-secondary)]">{ayuda}</p>}
      <motion.div
        className="mt-6 flex flex-col gap-3"
        initial="oculto"
        animate="visible"
        variants={{ oculto: {}, visible: { transition: { staggerChildren: 0.055 } } }}
      >
        {React.Children.map(children, (h, i) =>
          h ? (
            <motion.div key={i} variants={{ oculto: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
              {h}
            </motion.div>
          ) : null,
        )}
      </motion.div>
    </div>
  );
}

function Campo({
  error,
  etiqueta,
  valor,
  onCambio,
  tipo = 'text',
  placeholder,
  autoFocus,
  inputMode,
  min,
}: {
  error?: string;
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  tipo?: string;
  placeholder?: string;
  autoFocus?: boolean;
  inputMode?: 'text' | 'decimal';
  min?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{etiqueta}</span>
      <input
        type={tipo}
        aria-invalid={error ? true : undefined}
        value={valor}
        min={min}
        inputMode={inputMode}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value)}
        className={`mt-1 h-12 w-full rounded-[var(--radius-button)] border bg-[var(--surface)] px-4 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)] ${error ? 'border-2 border-[var(--rojo-text)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]'}`}
      />
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-[var(--rojo-text)]">{error}</span>}
    </label>
  );
}

// ───────────────────────── pantallas ─────────────────────────

function PasoNombre({ estado, dispatch, avanzar }: PantallaProps) {
  const listo = estado.nombre.trim().length >= 2;
  const [intento, setIntento] = useState(false);
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (listo) avanzar();
    else setIntento(true);
  };
  return (
    <form onSubmit={enviar} noValidate className="flex flex-1 flex-col">
      <Pregunta titulo="¿Cómo te llamas?" ayuda="Así tu plan se siente tuyo desde el primer día.">
        <Campo etiqueta="Tu nombre" valor={estado.nombre} autoFocus placeholder="Laura" error={intento && !listo ? 'Escribe tu nombre para continuar.' : undefined} onCambio={(v) => dispatch({ tipo: 'campo', campo: 'nombre', valor: v })} />
      </Pregunta>
      <div className="sticky bottom-0 -mx-4 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <BotonPrincipal enviar>Continuar</BotonPrincipal>
      </div>
    </form>
  );
}

function PasoUnica({
  titulo,
  ayuda,
  opciones,
  valor,
  campo,
  dispatch,
  avanzar,
  conOtra,
}: PantallaProps & {
  titulo: string;
  ayuda?: string;
  opciones: { texto: string; Icon?: LucideIcon }[];
  valor: string;
  campo: 'agencia' | 'control' | 'preocupacion';
  conOtra?: boolean;
}) {
  const [bloqueada, setBloqueada] = useState(false);
  const esOtra = valor !== '' && !opciones.some((o) => o.texto === valor);
  const [otraAbierta, setOtraAbierta] = useState(esOtra);
  const [otraTexto, setOtraTexto] = useState(esOtra ? valor : '');
  const [otraIntento, setOtraIntento] = useState(false);

  const elegir = (texto: string) => {
    if (bloqueada) return;
    setOtraAbierta(false);
    dispatch({ tipo: 'campo', campo, valor: texto });
    setBloqueada(true);
    window.setTimeout(avanzar, 300); // pausa breve para ver la elección confirmada
  };

  return (
    <>
      <Pregunta titulo={titulo} ayuda={ayuda}>
        {opciones.map((o) => (
          <Opcion key={o.texto} texto={o.texto} Icon={o.Icon} seleccionada={valor === o.texto} bloqueada={bloqueada} onElegir={() => elegir(o.texto)} />
        ))}
        {conOtra && (
          <>
            <Opcion
              texto="Otra cosa (escribe la tuya)"
              Icon={PenLine}
              seleccionada={otraAbierta}
              bloqueada={bloqueada}
              onElegir={() => setOtraAbierta(true)}
            />
            {otraAbierta && (
              <Campo
                etiqueta="Escríbelo con tus palabras"
                error={otraIntento && otraTexto.trim().length < 2 ? 'Escribe tu respuesta para continuar.' : undefined}
                valor={otraTexto}
                autoFocus
                onCambio={(v) => {
                  setOtraTexto(v);
                  dispatch({ tipo: 'campo', campo, valor: v });
                }}
              />
            )}
          </>
        )}
      </Pregunta>
      {otraAbierta && (
        <div className="sticky bottom-0 -mx-4 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <BotonPrincipal
            onClick={() => {
              if (otraTexto.trim().length < 2) setOtraIntento(true);
              else avanzar();
            }}
          >
            Continuar
          </BotonPrincipal>
        </div>
      )}
    </>
  );
}

function PasoReconocimiento({ estado, avanzar }: PantallaProps) {
  const nombre = estado.nombre.trim();
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-[var(--radius-card)] bg-[var(--chip-bg)]">
          <ShieldCheck size={40} strokeWidth={1.6} color="var(--accent)" />
        </span>
        <h1 className="text-balance text-3xl font-bold leading-[1.1] [font-family:var(--font-display)]">Te entiendo, {nombre}</h1>
        <p className="max-w-[34ch] text-base leading-relaxed text-[var(--text-secondary)]">{RECONOCIMIENTO[claveDe(estado.preocupacion)]}</p>
      </div>
      <div className="sticky bottom-0 -mx-4 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <BotonPrincipal onClick={avanzar}>Continuar</BotonPrincipal>
      </div>
    </div>
  );
}

function hoyISO(d: Date = new Date()) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function PasoReserva({ estado, dispatch, avanzar }: PantallaProps) {
  const r = estado.reserva;
  const set = (parcial: Partial<Reserva>) => dispatch({ tipo: 'reserva', reserva: { ...r, ...parcial } });
  const compra = parseFecha(r.compra);
  const viaje = parseFecha(r.viaje);
  const comision = Number(r.comision);
  const fechasOk = compra && viaje && viaje.getTime() >= compra.getTime();
  const listo = r.cliente.trim().length >= 2 && r.destino.trim().length >= 2 && comision > 0 && Boolean(fechasOk);
  const [intento, setIntento] = useState(false);
  const errFechas = compra && viaje && !fechasOk ? 'El viaje no puede ser antes de la compra.' : '';
  const eCliente = intento && r.cliente.trim().length < 2 ? 'Escribe el cliente.' : undefined;
  const eDestino = intento && r.destino.trim().length < 2 ? 'Escribe el destino.' : undefined;
  const eComision = intento && !(comision > 0) ? 'Escribe tu comisión.' : undefined;
  const eCompra = intento && !compra ? 'Elige la fecha.' : undefined;
  const eViaje = errFechas || (intento && !viaje ? 'Elige la fecha.' : undefined);
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (listo) avanzar();
    else setIntento(true);
  };
  useEffect(() => {
    if (!r.compra) dispatch({ tipo: 'reserva', reserva: { ...r, compra: hoyISO() } });
    // solo al montar: la fecha de compra arranca en hoy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usarEjemplo = () => {
    const base = new Date();
    const viajeEj = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 21);
    set({ cliente: 'Cliente de ejemplo', destino: 'Cancún', proveedor: 'Apple Vacations', moneda: 'USD', comision: '320', compra: hoyISO(base), viaje: hoyISO(viajeEj) });
  };

  return (
    <form onSubmit={enviar} noValidate className="flex flex-1 flex-col">
      <Pregunta titulo="Registra tu primera reserva" ayuda="Son unos 30 segundos. Con esto armamos tus avisos.">
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Cliente" error={eCliente} valor={r.cliente} placeholder="Luis Peña" autoFocus onCambio={(v) => set({ cliente: v })} />
          <Campo etiqueta="Destino" error={eDestino} valor={r.destino} placeholder="Miami" onCambio={(v) => set({ destino: v })} />
        </div>
        <Campo etiqueta="Proveedor (opcional)" valor={r.proveedor} placeholder="Royal Caribbean" onCambio={(v) => set({ proveedor: v })} />
        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
          <Campo etiqueta="Tu comisión" error={eComision} valor={r.comision} inputMode="decimal" tipo="number" placeholder="344" onCambio={(v) => set({ comision: v })} />
          <div role="group" aria-label="Moneda" className="mt-5 grid h-12 grid-cols-2 rounded-[var(--radius-button)] bg-[color-mix(in_oklab,var(--text-primary)_8%,transparent)] p-1">
            {(['USD', 'MXN'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={r.moneda === m}
                onClick={() => set({ moneda: m })}
                className={`rounded-[var(--radius-button)] px-3 text-sm font-semibold ${r.moneda === m ? 'bg-[var(--surface)] shadow-[var(--shadow-1)]' : 'text-[var(--text-secondary)]'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha de compra" error={eCompra} valor={r.compra} tipo="date" onCambio={(v) => set({ compra: v })} />
          <Campo etiqueta="Fecha de viaje" error={eViaje} valor={r.viaje} tipo="date" min={r.compra || undefined} onCambio={(v) => set({ viaje: v })} />
        </div>
        <button type="button" onClick={usarEjemplo} className="self-start py-3 text-sm font-semibold text-[var(--accent)] underline underline-offset-4">
          Usar datos de ejemplo
        </button>
      </Pregunta>
      <div className="sticky bottom-0 -mx-4 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <BotonPrincipal enviar>Guardar y armar mis avisos</BotonPrincipal>
      </div>
    </form>
  );
}

function PasoCargando({ estado, avanzar }: PantallaProps) {
  const reducir = useReducedMotion();
  const r = estado.reserva;
  const plazos = useMemo(() => {
    const c = parseFecha(r.compra);
    const v = parseFecha(r.viaje);
    return c && v ? calcularPlazos(c, v) : null;
  }, [r.compra, r.viaje]);
  const lineas = useMemo(
    () => [
      `Analizando tu reserva: ${r.cliente.trim()} · ${r.destino.trim()}`,
      plazos ? `Contando 30 días para dar de alta: ${formatoFecha(plazos.alta)}` : 'Contando tus plazos',
      plazos ? `Programando el aviso de salida: ${formatoFecha(plazos.salidaAviso)}` : 'Programando tus avisos',
      plazos ? `Calculando tu plazo de reclamo: ${formatoFecha(plazos.reclamo)}` : 'Calculando tu plazo de reclamo',
    ],
    [r.cliente, r.destino, plazos],
  );
  const [activa, setActiva] = useState(reducir ? lineas.length : 0);
  const [meta, setMeta] = useState(reducir ? 100 : 0);
  const [pct, setPct] = useState(reducir ? 100 : 0);
  const avanzarRef = useRef(avanzar);
  useEffect(() => {
    const anim = animate(pct, meta, { duration: reducir ? 0 : 0.6, ease: 'easeOut', onUpdate: (v) => setPct(Math.round(v)) });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, reducir]);

  useEffect(() => {
    avanzarRef.current = avanzar;
  }, [avanzar]);

  useEffect(() => {
    // Pausas irregulares: el avance se siente como trabajo real. Total ≈ 4.5 s.
    const tiempos = [900, 1700, 2600, 3500];
    const metas = [24, 52, 78, 100];
    const ids = tiempos.map((t, i) =>
      window.setTimeout(() => {
        setActiva(i + 1);
        setMeta(metas[i]);
      }, reducir ? 0 : t),
    );
    const fin = window.setTimeout(() => avanzarRef.current(), reducir ? 600 : 4300);
    return () => {
      ids.forEach(window.clearTimeout);
      window.clearTimeout(fin);
    };
  }, [reducir]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8" aria-live="polite" aria-busy="true">
      <div className="relative size-28">
        <svg viewBox="0 0 112 112" className="size-28 -rotate-90" aria-hidden="true">
          <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" stroke="color-mix(in oklab, var(--accent) 14%, transparent)" />
          <motion.circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            strokeWidth="8"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeDasharray={301.6}
            initial={false}
            animate={{ strokeDashoffset: 301.6 * (1 - pct / 100) }}
            transition={{ duration: 0 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums [font-family:var(--font-display)]">{pct}%</span>
      </div>
      <h1 className="text-xl font-bold [font-family:var(--font-display)]">Armando tus avisos…</h1>
      <ul className="flex w-full flex-col gap-3">
        {lineas.map((l, i) => {
          const hecha = i < activa;
          const actual = i === activa;
          return (
            <li key={l} className={`flex items-start gap-3 text-base transition-opacity duration-300 ${hecha || actual ? 'opacity-100' : 'opacity-40'}`}>
              <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                {hecha ? (
                  <Check size={20} color="var(--accent)" />
                ) : actual ? (
                  <span className="size-3 motion-safe:animate-pulse rounded-full bg-[var(--accent)]" />
                ) : (
                  <span className="size-3 rounded-full border-2 border-[var(--text-tertiary)]" />
                )}
              </span>
              <span>{l}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const ESTILO_ESTADO: Record<EstadoSemaforo, { clase: string; texto: (dias: number) => string }> = {
  enPlazo: { clase: 'bg-[var(--chip-verde-bg)] text-[var(--verde-text)]', texto: (d) => `En plazo · ${d} días` },
  urgente: { clase: 'bg-[var(--chip-oro-bg)] text-[var(--alerta-text)]', texto: (d) => `Quedan ${d} días` },
  vencido: { clase: 'bg-[var(--chip-rojo-bg)] text-[var(--rojo-text)]', texto: () => 'Plazo vencido' },
};

const NO_DEPENDE: Record<string, string> = {
  'Excel o Google Sheets': 'Ya no dependes de tu Excel',
  'WhatsApp y notas': 'Ya no dependes de tus mensajes',
  'Solo el portal de mi agencia': 'Ya no dependes de acordarte de revisar el portal',
  'Libreta o mi memoria': 'Ya no dependes de tu memoria',
};

const lista = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fila = {
  oculto: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

function PasoResultado({ estado, dispatch }: PantallaProps) {
  const r = estado.reserva;
  const c = parseFecha(r.compra);
  const v = parseFecha(r.viaje);
  const plazos = c && v ? calcularPlazos(c, v) : null;
  const clave = claveDe(estado.preocupacion);
  const hoy = new Date();
  const esArcher = estado.agencia.startsWith('Archer');

  useEffect(() => {
    track('resultado_visto', { preocupacion: clave, archer: esArcher });
  }, [clave, esArcher]);

  if (!plazos) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold [font-family:var(--font-display)]">Falta una fecha para armar tus avisos</h1>
        <p className="text-[var(--text-secondary)]">Vuelve a tu reserva y revisa las fechas de compra y de viaje.</p>
        <BotonPrincipal onClick={() => dispatch({ tipo: 'ir', paso: 'reserva', direccion: -1 })}>Revisar mi reserva</BotonPrincipal>
      </div>
    );
  }

  const filas: { id: string; titulo: string; detalle: string; fecha: Date; semaforo: boolean; destacada: boolean }[] = [
    { id: 'alta', titulo: 'Dar de alta en el portal', detalle: '30 días desde la compra', fecha: plazos.alta, semaforo: true, destacada: clave === 'alta' || clave === 'fechas' || clave === 'otra' },
    { id: 'salida', titulo: 'Salida de tu cliente', detalle: 'Aviso 2 días antes', fecha: plazos.salidaAviso, semaforo: false, destacada: false },
    { id: 'revision', titulo: 'Solicitar revisión', detalle: 'Desde 60 días tras el viaje', fecha: plazos.revisionDesde, semaforo: false, destacada: clave === 'pago' },
    { id: 'reclamo', titulo: 'Último día para reclamar', detalle: '18 meses desde el viaje', fecha: plazos.reclamo, semaforo: true, destacada: clave === 'reclamo' },
  ];
  // Lo que más le preocupa va primero y es la tarjeta héroe.
  filas.sort((a, b) => Number(b.destacada) - Number(a.destacada));
  const frase = NO_DEPENDE[estado.control] ?? 'Ya no dependes de acordarte';

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Tu primera reserva está lista</p>
      <h1 className="mt-1 text-balance text-3xl font-bold leading-[1.1] [font-family:var(--font-display)]">Tu primera reserva ya está vigilada, {estado.nombre.trim()}</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {frase}: tu asistente cuenta los plazos de {r.cliente.trim()} en {r.destino.trim()} y te avisa antes de que venzan.
      </p>
      <motion.ul variants={lista} initial="oculto" animate="visible" className="mt-6 flex flex-col gap-3">
        {filas.map((f, i) => {
          const estadoF = estadoSemaforo(f.fecha, hoy);
          const e = ESTILO_ESTADO[estadoF];
          const heroe = i === 0;
          return (
            <motion.li
              key={f.id}
              variants={fila}
              className={`flex items-center justify-between gap-3 rounded-[var(--radius-card)] p-4 ${
                heroe
                  ? 'bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-mid)] to-[var(--hero-to)] text-white shadow-[var(--shadow-2)]'
                  : 'border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] shadow-[var(--shadow-1)]'
              }`}
            >
              <div>
                <p className="font-semibold">{f.titulo}</p>
                <p className={`text-sm ${heroe ? 'opacity-90' : 'text-[var(--text-secondary)]'}`}>{f.detalle}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">{formatoFecha(f.fecha, hoy)}</p>
                {f.semaforo && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${e.clase}`}>{e.texto(diasRestantes(f.fecha, hoy))}</span>}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
      {!esArcher && (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--alerta-border)] bg-[var(--alerta-bg)] p-4 text-sm font-medium text-[var(--alerta-text)]">
          Estos plazos son los de Archer, como referencia. Podrás ajustarlos a los de tu agencia dentro de la app.
        </p>
      )}
      <p className="mt-4 rounded-[var(--radius-card)] bg-[var(--chip-bg)] p-4 text-sm font-medium">
        <b>
          {Number(r.comision).toLocaleString('en-US')} {r.moneda}
        </b>{' '}
        de comisión con sus plazos vigilados desde hoy.
      </p>
      <div className="sticky bottom-0 -mx-4 mt-auto bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <motion.a
          whileTap={{ scale: 0.97 }}
          href="/paywall"
          className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-8 text-base font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)]"
        >
          Activar mis 14 días gratis
        </motion.a>
        <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">Tarjeta al empezar, sin cobro hoy. Después, desde $99 MXN al mes; cancelas cuando quieras.</p>
      </div>
    </div>
  );
}

interface PantallaProps {
  estado: Estado;
  dispatch: React.Dispatch<Accion>;
  avanzar: () => void;
}

// ───────────────────────── flujo ─────────────────────────

export function OnboardingFlow() {
  const [estado, dispatch] = useReducer(reductor, INICIAL);
  const listo = estado.hidratado;
  const reducir = useReducedMotion();

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado) {
        const e = JSON.parse(guardado) as Estado;
        // si recarga a mitad de la carga, vuelve a la reserva para no quedarse en una pantalla sin datos
        if (e.paso === 'cargando') e.paso = 'reserva';
        dispatch({ tipo: 'restaurar', estado: e });
      } else {
        track('onboarding_iniciado');
        dispatch({ tipo: 'restaurar', estado: INICIAL });
      }
    } catch {
      track('onboarding_iniciado');
      dispatch({ tipo: 'restaurar', estado: INICIAL });
    }
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      /* sin almacenamiento: el flujo sigue funcionando en memoria */
    }
  }, [estado, listo]);

  const indice = PASOS.indexOf(estado.paso);
  const progreso = Math.max(6, ((indice + 1) / PASOS.length) * 100); // la barra arranca en 6% (progreso otorgado)

  const profundidad = useRef(0);
  const ir = useCallback((paso: Paso, direccion: 1 | -1) => {
    dispatch({ tipo: 'ir', paso, direccion });
    if (direccion === 1) {
      window.history.pushState({ p: paso }, '');
      profundidad.current += 1;
    }
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    // el botón atrás del navegador o de Android recorre los pasos en vez de sacar a la persona del flujo
    const alVolver = (e: PopStateEvent) => {
      const crudo = (e.state?.p ?? 'nombre') as Paso;
      const p: Paso = crudo === 'cargando' ? 'reserva' : crudo;
      profundidad.current = Math.max(0, profundidad.current - 1);
      if (PASOS.includes(p)) dispatch({ tipo: 'ir', paso: p, direccion: -1 });
    };
    window.addEventListener('popstate', alVolver);
    return () => window.removeEventListener('popstate', alVolver);
  }, []);
  const avanzar = useCallback(() => {
    const sig = PASOS[indice + 1];
    if (!sig) return;
    track('onboarding_paso_completado', { paso: estado.paso });
    ir(sig, 1);
  }, [indice, estado.paso, ir]);
  const atras = () => {
    if (profundidad.current > 0) {
      window.history.back(); // el historial real: un solo toque, sin desfase con el botón del navegador
      return;
    }
    const ant = indice === 7 ? 5 : indice - 1; // desde el resultado se puede volver a editar la reserva
    if (ant >= 0) ir(PASOS[ant], -1);
  };

  if (!listo) return <div className="min-h-dvh bg-[var(--bg)]" aria-busy="true" />;

  const props: PantallaProps = { estado, dispatch, avanzar };
  const mostrarAtras = indice > 0 && estado.paso !== 'cargando';

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-dvh bg-[radial-gradient(520px_320px_at_85%_-8%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%),var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-4 pt-4">
        <header className="flex h-11 items-center gap-2">
          {mostrarAtras ? (
            <button type="button" onClick={atras} aria-label="Volver al paso anterior" className="-ml-2 flex size-11 items-center justify-center text-[var(--text-secondary)]">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <span className="-ml-2 size-11" aria-hidden="true" />
          )}
          <div className="flex-1">
            <Progreso valor={progreso} />
          </div>
          <span className={`w-10 text-right text-xs tabular-nums text-[var(--text-secondary)] ${estado.paso === 'cargando' ? 'invisible' : ''}`}>{Math.round(progreso)}%</span>
        </header>
        <AnimatePresence mode="wait" initial={false} custom={estado.direccion}>
          <motion.main
            key={estado.paso}
            custom={estado.direccion}
            initial={reducir ? { opacity: 0 } : { opacity: 0, x: 40 * estado.direccion }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducir ? { opacity: 0 } : { opacity: 0, x: -24 * estado.direccion }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-1 flex-col"
          >
            {estado.paso === 'nombre' && <PasoNombre {...props} />}
            {estado.paso === 'agencia' && (
              <PasoUnica {...props} titulo="¿Con qué agencia trabajas?" ayuda="Empezamos con los plazos de Archer; luego podrás ajustarlos." opciones={AGENCIAS.map((texto) => ({ texto, Icon: Building2 }))} valor={estado.agencia} campo="agencia" conOtra />
            )}
            {estado.paso === 'control' && (
              <PasoUnica {...props} titulo="¿Cómo llevas hoy tus comisiones?" opciones={CONTROLES} valor={estado.control} campo="control" conOtra />
            )}
            {estado.paso === 'preocupacion' && (
              <PasoUnica {...props} titulo="¿Qué te preocupa más?" ayuda="Empezamos por ahí." opciones={PREOCUPACIONES} valor={estado.preocupacion} campo="preocupacion" conOtra />
            )}
            {estado.paso === 'reconocimiento' && <PasoReconocimiento {...props} />}
            {estado.paso === 'reserva' && <PasoReserva {...props} />}
            {estado.paso === 'cargando' && <PasoCargando {...props} />}
            {estado.paso === 'resultado' && <PasoResultado {...props} />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
    </MotionConfig>
  );
}
