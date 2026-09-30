// Marca provisional: escudo con semáforo. Se reemplaza al elegir el nombre final.
export function Logo({ tono = 'accent' }: { tono?: 'accent' | 'neutro' }) {
  const fondo = tono === 'accent' ? 'var(--accent)' : 'var(--text-tertiary)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" fill={fondo} />
      <circle cx="12" cy="8.2" r="1.7" fill="var(--bg)" />
      <circle cx="12" cy="12" r="1.7" fill="var(--accent-2)" />
      <circle cx="12" cy="15.8" r="1.7" fill="var(--bg)" opacity="0.55" />
    </svg>
  );
}
