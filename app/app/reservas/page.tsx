'use client';

// RESERVAS — protagonista: la tabla completa tipo Excel, con filtros y orden. En celular se vuelve una lista de tarjetas.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileUp, Plus, Search } from 'lucide-react';
import { SelectorEstatus } from '@/components/app/Insignias';
import { fechaCorta as fechaCortaDe, parseFecha } from '@/lib/plazos';
import { alertasDe, formatoDinero, useReservas, type Reserva } from '@/lib/reservas';

type Orden = 'az' | 'creacion' | 'viaje';
type CampoFecha = 'fechaViaje' | 'fechaCompra';

const campoClase =
  'min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';

function fechaCorta(iso: string, hoy: Date): string {
  const d = parseFecha(iso);
  return d ? fechaCortaDe(d, hoy) : '—';
}

export default function Reservas() {
  const { reservas, listo, actualizar } = useReservas();
  const hoy = useMemo(() => new Date(), []);
  const [busca, setBusca] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [campoFecha, setCampoFecha] = useState<CampoFecha>('fechaViaje');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [orden, setOrden] = useState<Orden>('creacion');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const proveedores = useMemo(() => [...new Set(reservas.map((r) => r.proveedor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')), [reservas]);

  const filas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = reservas.filter((r) => {
      if (q && !`${r.cliente} ${r.destino} ${r.contacto}`.toLowerCase().includes(q)) return false;
      if (proveedor && r.proveedor !== proveedor) return false;
      if (soloPendientes && r.estatus === 'pagado') return false;
      const f = r[campoFecha];
      if (desde && f < desde) return false;
      if (hasta && f > hasta) return false;
      return true;
    });
    return lista.sort((a, b) => {
      if (orden === 'az') return a.cliente.localeCompare(b.cliente, 'es');
      if (orden === 'viaje') return a.fechaViaje.localeCompare(b.fechaViaje);
      return b.creada - a.creada;
    });
  }, [reservas, busca, proveedor, soloPendientes, campoFecha, desde, hasta, orden]);

  const hayFiltros = Boolean(busca || proveedor || soloPendientes || desde || hasta);
  const limpiar = () => {
    setBusca('');
    setProveedor('');
    setSoloPendientes(false);
    setDesde('');
    setHasta('');
  };

  const tono = (r: Reserva) => {
    const al = alertasDe(r, hoy);
    if (al.some((a) => a.severidad === 'vencido')) return 'bg-[var(--chip-rojo-bg)]';
    if (al.some((a) => a.severidad === 'urgente')) return 'bg-[var(--alerta-bg)]';
    return '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">Reservas</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {listo ? `${filas.length} de ${reservas.length}` : 'Cargando…'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/importar" className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-4 text-sm font-semibold">
            <FileUp size={16} aria-hidden="true" />
            Importar
          </Link>
          <Link href="/app/nueva" className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] px-4 text-sm font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-1)]">
            <Plus size={16} aria-hidden="true" />
            Nueva
          </Link>
        </div>
      </div>

      <section aria-label="Filtros" className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Buscar cliente o destino</span>
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente o destino" className={`${campoClase} pl-9`} />
          </label>
          <button
            type="button"
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-extra"
            onClick={() => setFiltrosAbiertos((v) => !v)}
            className="min-h-11 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 text-sm font-semibold md:hidden"
          >
            Filtros{hayFiltros ? ' •' : ''}
          </button>
        </div>
        <div id="filtros-extra" className={`${filtrosAbiertos ? 'grid' : 'hidden'} gap-3 sm:grid-cols-2 md:grid lg:grid-cols-4`}>
        <label>
          <span className="sr-only">Proveedor</span>
          <select value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={campoClase}>
            <option value="">Todos los proveedores</option>
            {proveedores.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ordenar</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className={campoClase}>
            <option value="creacion">Orden: más recientes</option>
            <option value="az">Orden: cliente A–Z</option>
            <option value="viaje">Orden: fecha de viaje</option>
          </select>
        </label>
        <button
          type="button"
          aria-pressed={soloPendientes}
          onClick={() => setSoloPendientes((v) => !v)}
          className={`min-h-11 rounded-[var(--radius-button)] border px-3 text-sm font-semibold ${soloPendientes ? 'border-[var(--accent)] bg-[var(--chip-azul-bg)] text-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)]'}`}
        >
          Solo comisiones pendientes
        </button>
        <div className="grid grid-cols-1 items-center gap-2 sm:col-span-2 sm:grid-cols-[auto_1fr_1fr] lg:col-span-4">
          <label>
            <span className="sr-only">Filtrar por fecha de</span>
            <select value={campoFecha} onChange={(e) => setCampoFecha(e.target.value as CampoFecha)} className={campoClase}>
              <option value="fechaViaje">Fecha de viaje</option>
              <option value="fechaCompra">Fecha de compra</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Desde</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} aria-label="Desde" className={campoClase} />
          </label>
          <label>
            <span className="sr-only">Hasta</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} aria-label="Hasta" className={campoClase} />
          </label>
        </div>
        </div>
      </section>

      {listo && filas.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-bold [font-family:var(--font-display)]">{reservas.length === 0 ? 'Aún no tienes reservas' : 'Ninguna reserva coincide'}</h2>
          <p className="text-[var(--text-secondary)]">
            {reservas.length === 0 ? 'Registra tu primera venta o importa tu Excel.' : 'Prueba quitando algún filtro.'}
          </p>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="min-h-11 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)]">
              Quitar filtros
            </button>
          )}
        </div>
      )}

      {/* Tabla (computadora) */}
      {filas.length > 0 && (
        <div className="hidden overflow-x-auto rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-1)] md:block">
          <table className="w-full min-w-6xl border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                {['Cliente', 'Contacto', 'Destino', 'Tipo', 'Proveedor', 'Precio venta', 'Comisión', 'Compra', 'Viaje', 'Pago pendiente', 'Comentarios', 'Estatus'].map((h, i) => (
                  <th key={h} scope="col" className={`whitespace-nowrap px-3 py-3 font-semibold ${i === 5 || i === 6 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id} className={`border-t border-black/5 ${tono(r)}`}>
                  <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-bold">
                    {r.cliente}
                  </th>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.contacto || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.destino}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.tipo}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.proveedor || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.precioVenta ? formatoDinero(r.precioVenta, r.moneda) : '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums">{formatoDinero(r.comision, r.moneda)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{fechaCorta(r.fechaCompra, hoy)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{fechaCorta(r.fechaViaje, hoy)}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {r.pagoPendienteFecha && r.pagoPendienteMonto ? `${fechaCorta(r.pagoPendienteFecha, hoy)} · ${formatoDinero(r.pagoPendienteMonto, r.moneda)}` : '—'}
                  </td>
                  <td className="max-w-44 truncate px-3 py-2 text-[var(--text-secondary)]" title={r.comentarios}>
                    {r.comentarios || '—'}
                  </td>
                  <td className="px-3 py-1">
                    <SelectorEstatus valor={r.estatus} etiqueta={`Estatus de ${r.cliente}`} onCambio={(e) => actualizar(r.id, { estatus: e })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tarjetas (celular) */}
      {filas.length > 0 && (
        <ul className="flex flex-col gap-3 md:hidden">
          {filas.map((r) => (
            <li key={r.id} className={`rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)] ${tono(r)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold">{r.cliente}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {r.destino} · {r.tipo}
                    {r.proveedor ? ` · ${r.proveedor}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-base font-extrabold tabular-nums [font-family:var(--font-display)]">{formatoDinero(r.comision, r.moneda)}</p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-[var(--text-secondary)]">Compra</dt>
                <dd className="text-right font-medium">{fechaCorta(r.fechaCompra, hoy)}</dd>
                <dt className="text-[var(--text-secondary)]">Viaje</dt>
                <dd className="text-right font-medium">{fechaCorta(r.fechaViaje, hoy)}</dd>
                {r.pagoPendienteFecha && r.pagoPendienteMonto ? (
                  <>
                    <dt className="text-[var(--text-secondary)]">Pago pendiente</dt>
                    <dd className="text-right font-medium">
                      {fechaCorta(r.pagoPendienteFecha, hoy)} · {formatoDinero(r.pagoPendienteMonto, r.moneda)}
                    </dd>
                  </>
                ) : null}
              </dl>
              {r.comentarios && <p className="mt-2 text-sm text-[var(--text-secondary)]">{r.comentarios}</p>}
              <div className="mt-3 flex justify-end">
                <SelectorEstatus valor={r.estatus} etiqueta={`Estatus de ${r.cliente}`} onCambio={(e) => actualizar(r.id, { estatus: e })} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
