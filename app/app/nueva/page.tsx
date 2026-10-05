'use client';

// NUEVA RESERVA — protagonista: guardar una venta en segundos. Los 10 campos pedidos + pago pendiente (fecha y cantidad).

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { parseFecha, sumarDias, formatoFecha } from '@/lib/plazos';
import { TIPOS, useReservas, type Estatus, type Moneda, type Tipo } from '@/lib/reservas';

const entradaClase =
  'mt-1 h-12 w-full rounded-[var(--radius-button)] border campo-suave px-3 text-base outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';
const borde = 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]';
const bordeError = 'border-2 border-[var(--rojo-text)]';

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Campo({ etiqueta, error, children }: { etiqueta: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{etiqueta}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-sm font-medium text-[var(--rojo-text)]">
          {error}
        </span>
      )}
    </label>
  );
}

export default function NuevaReserva() {
  const router = useRouter();
  const { agregar } = useReservas();
  const [cliente, setCliente] = useState('');
  const [contacto, setContacto] = useState('');
  const [destino, setDestino] = useState('');
  const [tipo, setTipo] = useState<Tipo>('Paquete');
  const [proveedor, setProveedor] = useState('');
  const [precio, setPrecio] = useState('');
  const [comision, setComision] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [compra, setCompra] = useState(hoyISO());
  const [viaje, setViaje] = useState('');
  const [pagoFecha, setPagoFecha] = useState('');
  const [pagoMonto, setPagoMonto] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [estatus, setEstatus] = useState<Estatus>('pendiente_alta');
  const [intento, setIntento] = useState(false);

  const fCompra = parseFecha(compra);
  const fViaje = parseFecha(viaje);
  const errores = {
    cliente: cliente.trim().length < 2 ? 'Escribe el nombre del cliente.' : '',
    destino: destino.trim().length < 2 ? 'Escribe el destino.' : '',
    comision: !(Number(comision) > 0) ? 'Escribe tu comisión.' : '',
    compra: !fCompra ? 'Elige la fecha de compra.' : '',
    viaje: !fViaje ? 'Elige la fecha de viaje.' : fCompra && fViaje.getTime() < fCompra.getTime() ? 'El viaje no puede ser antes de la compra.' : '',
    pago: (pagoFecha && !(Number(pagoMonto) > 0)) || (!pagoFecha && Number(pagoMonto) > 0) ? 'Completa la fecha y la cantidad del pago pendiente, o déjalos vacíos.' : '',
  };
  const valido = Object.values(errores).every((e) => !e);
  const mostrar = (k: keyof typeof errores) => (intento ? errores[k] : '');

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setIntento(true);
    if (!valido) return;
    agregar({
      cliente: cliente.trim(),
      contacto: contacto.trim(),
      destino: destino.trim(),
      tipo,
      proveedor: proveedor.trim(),
      precioVenta: Number(precio) || 0,
      comision: Number(comision),
      moneda,
      fechaCompra: compra,
      fechaViaje: viaje,
      pagoPendienteFecha: pagoFecha || undefined,
      pagoPendienteMonto: pagoFecha ? Number(pagoMonto) : undefined,
      comentarios: comentarios.trim(),
      estatus,
    });
    router.push('/app/reservas');
  };

  const limiteAlta = fCompra ? formatoFecha(sumarDias(fCompra, 30)) : null;

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-5 pb-24 md:pb-0">
      <div>
        <Link href="/app/reservas" className="-ml-2 flex min-h-11 w-fit items-center gap-1 px-2 text-sm font-semibold text-[var(--text-secondary)]">
          <ChevronLeft size={18} aria-hidden="true" />
          Reservas
        </Link>
        <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">Nueva reserva</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Tu asistente programa los avisos en cuanto la guardes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Cliente" error={mostrar('cliente')}>
          <input value={cliente} onChange={(e) => setCliente(e.target.value)} autoFocus placeholder="Luis Peña" aria-invalid={mostrar('cliente') ? true : undefined} className={`${entradaClase} ${mostrar('cliente') ? bordeError : borde}`} />
        </Campo>
        <Campo etiqueta="Contacto (opcional)">
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} inputMode="tel" placeholder="55 1234 5678" className={`${entradaClase} ${borde}`} />
        </Campo>
        <Campo etiqueta="Destino" error={mostrar('destino')}>
          <input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Miami" aria-invalid={mostrar('destino') ? true : undefined} className={`${entradaClase} ${mostrar('destino') ? bordeError : borde}`} />
        </Campo>
        <Campo etiqueta="Tipo de reserva">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)} className={`${entradaClase} ${borde}`}>
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Proveedor (opcional)">
          <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Royal Caribbean" className={`${entradaClase} ${borde}`} />
        </Campo>
        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
          <Campo etiqueta="Precio de venta (opcional)">
            <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" inputMode="decimal" min="0" placeholder="3440" className={`${entradaClase} ${borde}`} />
          </Campo>
          <div role="group" aria-label="Moneda" className="mt-5 grid h-12 grid-cols-2 rounded-[var(--radius-button)] bg-[color-mix(in_oklab,var(--text-primary)_8%,transparent)] p-1">
            {(['USD', 'MXN'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={moneda === m} onClick={() => setMoneda(m)} className={`rounded-[var(--radius-button)] px-3 text-sm font-semibold ${moneda === m ? 'tarjeta-suave' : 'text-[var(--text-secondary)]'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <Campo etiqueta="Tu comisión" error={mostrar('comision')}>
          <input value={comision} onChange={(e) => setComision(e.target.value)} type="number" inputMode="decimal" min="0" placeholder="344" aria-invalid={mostrar('comision') ? true : undefined} className={`${entradaClase} ${mostrar('comision') ? bordeError : borde}`} />
        </Campo>
        <Campo etiqueta="Fecha de compra" error={mostrar('compra')}>
          <input value={compra} onChange={(e) => setCompra(e.target.value)} type="date" aria-invalid={mostrar('compra') ? true : undefined} className={`${entradaClase} ${mostrar('compra') ? bordeError : borde}`} />
        </Campo>
        <Campo etiqueta="Fecha de viaje" error={mostrar('viaje')}>
          <input value={viaje} onChange={(e) => setViaje(e.target.value)} type="date" min={compra || undefined} aria-invalid={mostrar('viaje') ? true : undefined} className={`${entradaClase} ${mostrar('viaje') ? bordeError : borde}`} />
        </Campo>
      </div>

      <fieldset className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)] p-4">
        <legend className="px-2 text-sm font-bold">Pago pendiente de tu cliente (opcional)</legend>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">Si todavía debe completar un pago de la reserva, anota cuándo y cuánto. Tu asistente te avisará.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Fecha del pago">
            <input value={pagoFecha} onChange={(e) => setPagoFecha(e.target.value)} type="date" className={`${entradaClase} ${borde}`} />
          </Campo>
          <Campo etiqueta="Cantidad del pago" error={mostrar('pago')}>
            <input value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} type="number" inputMode="decimal" min="0" placeholder="900" className={`${entradaClase} ${mostrar('pago') ? bordeError : borde}`} />
          </Campo>
        </div>
      </fieldset>

      <Campo etiqueta="Comentarios (opcional)">
        <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} rows={3} placeholder="Regalo de bienvenida, documentos firmados…" className={`${entradaClase} h-auto py-3 ${borde}`} />
      </Campo>

      <Campo etiqueta="Estatus inicial">
        <select value={estatus} onChange={(e) => setEstatus(e.target.value as Estatus)} className={`${entradaClase} ${borde}`}>
          <option value="pendiente_alta">Pendiente de alta</option>
          <option value="pendiente_pago">Pendiente de pago (ya dada de alta)</option>
          <option value="solicitar_revision">Solicitar revisión</option>
          <option value="pagado">Pagado</option>
        </select>
      </Campo>
      {estatus === 'pendiente_alta' && limiteAlta && <p className="-mt-2 text-sm text-[var(--text-secondary)]">Tienes hasta el {limiteAlta} para darla de alta (30 días desde la compra).</p>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-[var(--bg)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
        <button type="submit" className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] text-base font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-2)] md:max-w-xs">
          Guardar reserva
        </button>
      </div>
    </form>
  );
}
