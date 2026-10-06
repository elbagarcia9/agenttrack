'use client';

// Estructura de la app interna: barra lateral en computadora, barra de pestañas abajo en celular.
// 4 secciones (Inicio, Reservas, Calendario, Alertas) con un protagonista cada una; el acceso a "Registrar venta nueva"
// está siempre a un toque. Cuando hay cuentas reales, aquí se protegerá la ruta (middleware).

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarDays, FileText, House, Plus, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { alertasDe, useReservas } from '@/lib/reservas';

const ITEMS: { href: string; texto: string; Icon: LucideIcon }[] = [
  { href: '/app', texto: 'Inicio', Icon: House },
  { href: '/app/reservas', texto: 'Reservas', Icon: FileText },
  { href: '/app/calendario', texto: 'Calendario', Icon: CalendarDays },
  { href: '/app/alertas', texto: 'Alertas', Icon: Bell },
];

function activo(path: string, href: string) {
  return href === '/app' ? path === '/app' : path.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [confirmando, setConfirmando] = useState(false);
  const { reservas, esDemo, empezarLimpio, listo } = useReservas();
  const hoy = new Date();
  const urgentes = listo
    ? reservas.flatMap((r) => alertasDe(r, hoy)).filter((a) => a.severidad === 'vencido' || a.severidad === 'urgente').length
    : 0;
  const enNueva = path.startsWith('/app/nueva') || path.startsWith('/app/importar');

  return (
    <div className="min-h-dvh bg-[var(--bg)] bg-[image:radial-gradient(640px_420px_at_85%_-8%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)] text-[var(--text-primary)] [font-family:var(--font-body)] md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-black/10 bg-[var(--surface)] p-4 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:gap-1">
        <Link href="/app" className="flex min-h-11 items-center gap-2 px-2 pb-4 text-base font-semibold text-[var(--accent)]">
          <Logo />
          AgentTrack
        </Link>
        <Link
          href="/app/nueva"
          className="mb-3 flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--alerta-text)]/30 bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] text-sm font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-1)] transition-transform active:scale-[0.97]"
        >
          <Plus size={18} aria-hidden="true" />
          Registrar venta nueva
        </Link>
        <nav aria-label="Secciones" className="flex flex-col gap-1">
          {ITEMS.map(({ href, texto, Icon }) => {
            const on = activo(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-button)] px-3 text-sm font-semibold ${on ? 'bg-[var(--surface-2)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                <Icon size={18} aria-hidden="true" />
                {texto}
                {href === '/app/alertas' && urgentes > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--btn-oro-to)] px-2 py-0.5 text-xs font-bold text-[var(--btn-oro-text)]">{urgentes}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-col pb-32 md:pb-0">
        {esDemo && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--alerta-bg)] px-4 py-2 text-sm font-medium text-[var(--alerta-text)]">
            {confirmando ? (
              <>
                <span>¿Quitar los datos de ejemplo? Tus reservas se conservan.</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      empezarLimpio();
                      setConfirmando(false);
                    }}
                    className="min-h-11 rounded-[var(--radius-button)] bg-[var(--alerta-text)] px-4 font-bold text-white"
                  >
                    Sí, quitarlos
                  </button>
                  <button type="button" onClick={() => setConfirmando(false)} className="min-h-11 px-3 font-bold underline underline-offset-4">
                    Cancelar
                  </button>
                </span>
              </>
            ) : (
              <>
                <span>Estás viendo datos de ejemplo.</span>
                <button type="button" onClick={() => setConfirmando(true)} className="min-h-11 font-bold underline underline-offset-4">
                  Empezar con mis datos
                </button>
              </>
            )}
          </div>
        )}
        <header className="flex h-14 items-center justify-between px-4 md:hidden">
          <Link href="/app" className="flex min-h-11 items-center gap-2 text-base font-semibold text-[var(--accent)]">
            <Logo />
            AgentTrack
          </Link>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-6 pt-2 md:px-8 md:pt-8">{children}</main>
      </div>

      {!enNueva && (
        <nav
          aria-label="Secciones"
          className="capsula-menu fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md justify-between rounded-full p-2 md:hidden"
        >
          {ITEMS.map(({ href, texto, Icon }) => {
            const on = activo(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 text-xs font-semibold transition-colors duration-200 ${on ? 'bg-[var(--surface-2)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full transition-colors duration-200 ${on ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_6px_12px_-6px_rgb(34_102_151_/_0.7)]' : ''}`}
                >
                  <Icon size={on ? 16 : 22} aria-hidden="true" />
                </span>
                {texto}
                {href === '/app/alertas' && urgentes > 0 && (
                  <span className="absolute right-3 top-1 rounded-full bg-[var(--btn-oro-to)] px-1.5 text-xs font-bold text-[var(--btn-oro-text)]">{urgentes}</span>
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
