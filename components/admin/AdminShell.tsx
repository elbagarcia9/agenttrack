'use client';

// Estructura del panel del dueño: barra lateral en computadora, pestañas deslizables arriba en celular.
// La protección real vive en el servidor (exigirAdmin + RLS); esto solo es la estructura visual.

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CircleDollarSign, HeartPulse, LayoutDashboard, LogOut, Receipt, Target, Users, Wallet, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cerrarSesion } from '@/lib/auth';

const ITEMS: { href: string; texto: string; Icon: LucideIcon }[] = [
  { href: '/admin', texto: 'Resumen', Icon: LayoutDashboard },
  { href: '/admin/ventas', texto: 'Ventas', Icon: CircleDollarSign },
  { href: '/admin/ganancia', texto: 'Ganancia', Icon: Wallet },
  { href: '/admin/usuarios', texto: 'Usuarios', Icon: Users },
  { href: '/admin/uso', texto: 'Uso', Icon: Activity },
  { href: '/admin/negocio', texto: 'Negocio', Icon: Target },
  { href: '/admin/salud', texto: 'Salud', Icon: HeartPulse },
  { href: '/admin/costos', texto: 'Costos', Icon: Receipt },
];

const activo = (path: string, href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

async function salir() {
  await cerrarSesion();
  window.location.assign('/entrar');
}

export function AdminShell({ children, correo }: { children: React.ReactNode; correo: string }) {
  const path = usePathname();
  // En el celular la pestaña activa se centra sola para que nunca quede cortada o escondida
  useEffect(() => {
    document.querySelector('[data-pestana-activa="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [path]);
  return (
    <div className="min-h-dvh bg-[var(--bg)] bg-[image:radial-gradient(640px_420px_at_85%_-8%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)] text-[var(--text-primary)] [font-family:var(--font-body)] lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-black/10 bg-[var(--surface)] p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-1">
        <div className="flex min-h-11 items-center gap-2 px-2 pb-1 text-base font-semibold text-[var(--accent)]">
          <Logo />
          AgentTrack
        </div>
        <p className="px-2 pb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Panel del dueño</p>
        <nav aria-label="Secciones del panel" className="flex flex-col gap-1">
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
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <p className="truncate px-3 text-xs text-[var(--text-secondary)]" title={correo}>
            {correo}
          </p>
          <Link href="/app" className="flex min-h-11 items-center gap-3 rounded-[var(--radius-button)] px-3 text-sm font-semibold text-[var(--text-secondary)]">
            <LayoutDashboard size={18} aria-hidden="true" />
            Ir a la app
          </Link>
          <button type="button" onClick={salir} className="flex min-h-11 items-center gap-3 rounded-[var(--radius-button)] px-3 text-sm font-semibold text-[var(--text-secondary)]">
            <LogOut size={18} aria-hidden="true" />
            Salir
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-[var(--surface)] lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-base font-semibold text-[var(--accent)]">
              <Logo />
              Panel del dueño
            </div>
            <button type="button" onClick={salir} aria-label="Salir" className="flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]">
              <LogOut size={20} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Secciones del panel" className="flex snap-x gap-1 overflow-x-auto px-4 pb-2 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
            {ITEMS.map(({ href, texto, Icon }) => {
              const on = activo(path, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  data-pestana-activa={on ? 'true' : undefined}
                  className={`panel-tap flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-semibold ${on ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {texto}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="panel-entrada mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
