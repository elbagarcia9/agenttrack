'use client';

// "Avisos en tu celular": instalar AgentTrack en la pantalla de inicio y activar las notificaciones.
// En Android (Chrome) se instala con un botón; en iPhone hay que agregarla a la pantalla de inicio desde Safari y
// abrirla desde ahí (Apple solo permite avisos a las apps instaladas). Todo lo decide la persona con un toque.

import { useEffect, useState } from 'react';
import { BellRing, Download, Loader2, Share, SquarePlus } from 'lucide-react';
import { AUTH_LOCAL } from '@/lib/auth';

type EventoInstalar = Event & { prompt: () => Promise<void> };

function aBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const relleno = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const crudo = atob(base64);
  const salida = new Uint8Array(new ArrayBuffer(crudo.length));
  for (let i = 0; i < crudo.length; i++) salida[i] = crudo.charCodeAt(i);
  return salida;
}

const boton =
  'flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 text-base font-semibold disabled:opacity-60 [touch-action:manipulation]';

export function AvisosCelular() {
  const [listo, setListo] = useState(false);
  const [soportado, setSoportado] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const [permiso, setPermiso] = useState<NotificationPermission>('default');
  const [activo, setActivo] = useState(false);
  const [instalador, setInstalador] = useState<EventoInstalar | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const apto = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEsIOS(ios);
    setInstalada(standalone);
    setSoportado(apto);
    if (apto) {
      setPermiso(Notification.permission);
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then((r) => r.pushManager.getSubscription())
        .then((s) => setActivo(Boolean(s)))
        .catch(() => undefined);
    }
    setListo(true);
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setInstalador(e as EventoInstalar);
    };
    window.addEventListener('beforeinstallprompt', alInstalar);
    window.addEventListener('appinstalled', () => setInstalada(true));
    return () => window.removeEventListener('beforeinstallprompt', alInstalar);
  }, []);

  const instalar = async () => {
    if (!instalador) return;
    await instalador.prompt();
    setInstalador(null);
  };

  const activar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      const resultado = await Notification.requestPermission();
      setPermiso(resultado);
      if (resultado !== 'granted') {
        setMensaje({ ok: false, texto: 'No diste permiso para las notificaciones. Puedes activarlas en los ajustes del navegador o de tu celular para AgentTrack.' });
        return;
      }
      const registro = await navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready);
      const { clave } = (await (await fetch('/api/push/clave')).json()) as { clave: string };
      const previa = await registro.pushManager.getSubscription();
      if (previa) await previa.unsubscribe(); // por si quedó una suscripción de una versión anterior
      const sub = await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(clave) });
      const r = await fetch('/api/push/suscribir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) });
      if (!r.ok) throw new Error('guardar');
      setActivo(true);
      setMensaje({ ok: true, texto: 'Listo: los avisos están activados en este dispositivo. Pulsa "Mandarme un aviso de prueba" para verlo.' });
    } catch {
      setMensaje({ ok: false, texto: 'No pudimos activar los avisos. Inténtalo de nuevo o escríbenos a soporte@agenttrack.app.' });
    } finally {
      setTrabajando(false);
    }
  };

  const desactivar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      const registro = await navigator.serviceWorker.ready;
      const sub = await registro.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/baja', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setActivo(false);
      setMensaje({ ok: true, texto: 'Listo: ya no recibirás avisos en este dispositivo.' });
    } catch {
      setMensaje({ ok: false, texto: 'No pudimos desactivarlos. Inténtalo de nuevo.' });
    } finally {
      setTrabajando(false);
    }
  };

  const probar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      const r = await fetch('/api/push/prueba', { method: 'POST' });
      const d = (await r.json()) as { ok?: boolean; motivo?: string };
      setMensaje(
        d.ok
          ? { ok: true, texto: 'Te mandamos un aviso de prueba. Debe aparecer en unos segundos como notificación.' }
          : { ok: false, texto: d.motivo === 'limite' ? 'Muchas pruebas seguidas. Espera un minuto.' : 'No llegó el aviso. Desactiva y vuelve a activar los avisos, o escríbenos a soporte@agenttrack.app.' },
      );
    } catch {
      setMensaje({ ok: false, texto: 'No pudimos mandar la prueba. Inténtalo de nuevo.' });
    } finally {
      setTrabajando(false);
    }
  };

  const paso = 'flex items-start gap-3 text-base';
  const numero = 'flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)] text-sm font-bold text-[var(--accent)]';

  return (
    <section id="celular" aria-label="Avisos en tu celular" className="rounded-[var(--radius-card)] tarjeta-suave p-4">
      <h2 className="text-lg font-bold [font-family:var(--font-display)]">Avisos en tu celular</h2>
      <p className="mt-1 text-base text-[var(--text-secondary)]">
        Instala AgentTrack en tu pantalla de inicio y recibe tus plazos como notificaciones, como las del banco, aunque no abras la app.
      </p>

      {AUTH_LOCAL ? (
        <p className="mt-3 text-sm font-medium text-[var(--alerta-text)]">Modo de prueba: los avisos se activan con una cuenta conectada.</p>
      ) : !listo ? null : (
        <div className="mt-3 flex flex-col gap-3">
          {/* Paso 1: instalar */}
          {!instalada && esIOS && (
            <div className="rounded-[var(--radius-button)] bg-[var(--surface-2)] p-3">
              <p className="text-sm font-bold">Instalar en iPhone</p>
              <ol className="mt-2 flex flex-col gap-2">
                <li className={paso}>
                  <span className={numero}>1</span>
                  <span>
                    Abre esta página en <b>Safari</b> y toca el botón <Share size={16} aria-hidden="true" className="mx-0.5 inline align-text-bottom" /> <b>Compartir</b>.
                  </span>
                </li>
                <li className={paso}>
                  <span className={numero}>2</span>
                  <span>
                    Elige <SquarePlus size={16} aria-hidden="true" className="mx-0.5 inline align-text-bottom" /> <b>Agregar a pantalla de inicio</b> y toca <b>Agregar</b>.
                  </span>
                </li>
                <li className={paso}>
                  <span className={numero}>3</span>
                  <span>Abre AgentTrack desde su ícono nuevo, entra a <b>Mi cuenta</b> y activa los avisos aquí.</span>
                </li>
              </ol>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Necesitas iOS 16.4 o más reciente. Apple solo manda avisos a las apps instaladas así.</p>
            </div>
          )}
          {!instalada && !esIOS && instalador && (
            <button type="button" onClick={instalar} className={`${boton} border border-[var(--accent)] text-[var(--accent)]`}>
              <Download size={18} aria-hidden="true" />
              Instalar AgentTrack en mi celular
            </button>
          )}
          {!instalada && !esIOS && !instalador && (
            <p className="text-sm text-[var(--text-secondary)]">
              Para instalarla: en el menú de tu navegador (⋮) elige <b>Instalar app</b> o <b>Agregar a pantalla de inicio</b>.
            </p>
          )}
          {instalada && <p className="text-sm font-semibold text-[var(--verde-text)]">✓ AgentTrack está instalada en este dispositivo.</p>}

          {/* Paso 2: activar los avisos */}
          {!soportado ? (
            !esIOS && <p className="text-sm text-[var(--text-secondary)]">Este navegador no permite notificaciones. Prueba con Chrome en Android o con la app instalada.</p>
          ) : activo ? (
            <>
              <p className="text-sm font-semibold text-[var(--verde-text)]">✓ Avisos activados en este dispositivo.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" disabled={trabajando} onClick={probar} className={`${boton} bg-[var(--accent)] text-[var(--on-accent)]`}>
                  {trabajando ? <Loader2 size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <BellRing size={18} aria-hidden="true" />}
                  Mandarme un aviso de prueba
                </button>
                <button type="button" disabled={trabajando} onClick={desactivar} className={`${boton} border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]`}>
                  Desactivar en este dispositivo
                </button>
              </div>
            </>
          ) : permiso === 'denied' ? (
            <p className="text-sm font-medium text-[var(--alerta-text)]">
              Las notificaciones están bloqueadas para AgentTrack. Actívalas en los ajustes de tu navegador o de tu celular y vuelve aquí.
            </p>
          ) : (
            <button type="button" disabled={trabajando} onClick={activar} className={`${boton} bg-[var(--accent)] text-[var(--on-accent)]`}>
              {trabajando ? <Loader2 size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <BellRing size={18} aria-hidden="true" />}
              Activar avisos en este dispositivo
            </button>
          )}

          {mensaje && (
            <p role={mensaje.ok ? 'status' : 'alert'} className={`text-sm font-medium ${mensaje.ok ? 'text-[var(--verde-text)]' : 'text-[var(--rojo-text)]'}`}>
              {mensaje.texto}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
