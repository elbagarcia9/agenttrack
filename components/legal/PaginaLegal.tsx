import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { FECHA_LEGAL, SOPORTE_EMAIL } from '@/lib/legal';

// Estructura común de las páginas legales: lectura cómoda a 375px, resumen en simple arriba y enlaces cruzados abajo.
const OTRAS = [
  { href: '/terminos', texto: 'Términos y condiciones' },
  { href: '/privacidad', texto: 'Aviso de privacidad' },
  { href: '/reembolsos', texto: 'Cancelación y reembolsos' },
];

export function PaginaLegal({ titulo, resumen, actual, children }: { titulo: string; resumen: ReactNode; actual: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4">
        <Link href="/" aria-label="AgentTrack, ir a la página principal" className="flex h-11 items-center">
          <Logo />
        </Link>

        <main className="mt-8 flex flex-col gap-6">
          <header>
            <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)] md:text-4xl">{titulo}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: {FECHA_LEGAL}</p>
          </header>

          <section aria-label="Resumen en simple" className="rounded-[var(--radius-card)] bg-[var(--chip-azul-bg)] p-4">
            <h2 className="text-base font-bold [font-family:var(--font-display)]">En simple</h2>
            <div className="mt-1 flex flex-col gap-2 text-base">{resumen}</div>
          </section>

          <article className="flex flex-col gap-6 text-base leading-relaxed">{children}</article>

          <nav aria-label="Otros documentos" className="border-t border-black/10 pt-6">
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Otros documentos</p>
            <ul className="mt-1 flex flex-col">
              {OTRAS.filter((o) => o.href !== actual).map((o) => (
                <li key={o.href}>
                  <Link href={o.href} className="flex min-h-11 items-center font-semibold text-[var(--accent)] underline underline-offset-4">
                    {o.texto}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              ¿Dudas? Escríbenos a{' '}
              <a href={`mailto:${SOPORTE_EMAIL}`} className="font-semibold text-[var(--accent)] underline underline-offset-4">
                {SOPORTE_EMAIL}
              </a>
              .
            </p>
          </nav>
        </main>
      </div>
    </div>
  );
}

export function Seccion({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`sec-${n}`} className="flex flex-col gap-2">
      <h2 id={`sec-${n}`} className="text-xl font-bold leading-snug [font-family:var(--font-display)]">
        {n}. {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Lista({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-[var(--accent)]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
