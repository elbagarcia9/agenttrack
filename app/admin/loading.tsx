// Mientras cargan los números: bloques con la forma del contenido (no un spinner).
export default function CargandoPanel() {
  return (
    <div role="status" aria-label="Cargando el panel" className="flex flex-col gap-6">
      <div className="h-10 w-48 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-reduce:animate-none" />
      <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-reduce:animate-none" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-reduce:animate-none" />
    </div>
  );
}
