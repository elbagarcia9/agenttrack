"use client";

// CALENDARIO — protagonista: el mes completo, tipo calendario de Google. Cada día muestra lo que hay; un toque abre la lista de ese día.

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { InsigniaEstatus } from "@/components/app/Insignias";
import {
  capitalizar,
  estadoSemaforo,
  formatoFecha,
  parseFecha,
  sumarDias,
  sumarMeses,
} from "@/lib/plazos";
import { formatoDinero, useReservas, type Reserva } from "@/lib/reservas";

type Clase = "viaje" | "alta" | "pago" | "revision" | "reclamo";
interface Evento {
  clave: string;
  reserva: Reserva;
  clase: Clase;
  texto: string;
  detalle: string;
  fecha: Date;
  tono: "normal" | "urgente" | "vencido";
}

const COLOR: Record<Clase, string> = {
  viaje: "bg-[var(--accent)] text-white",
  alta: "bg-[var(--btn-oro-to)] text-[var(--btn-oro-text)]",
  pago: "bg-[var(--slate)] text-white",
  revision: "bg-[var(--slate)] text-white",
  reclamo: "bg-[var(--rojo-text)] text-white",
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function clave(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Calendario() {
  const { reservas, listo } = useReservas();
  const hoy = useMemo(() => new Date(), []);
  const [mes, setMes] = useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1),
  );
  const [sel, setSel] = useState<Date>(hoy);
  const [verMes, setVerMes] = useState(false);

  const eventos = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    const poner = (e: Evento) => {
      const k = clave(e.fecha);
      mapa.set(k, [...(mapa.get(k) ?? []), e]);
    };
    for (const r of reservas) {
      const compra = parseFecha(r.fechaCompra);
      const viaje = parseFecha(r.fechaViaje);
      if (!compra || !viaje) continue;
      poner({
        clave: `${r.id}-v`,
        reserva: r,
        clase: "viaje",
        texto: `Sale: ${r.cliente}`,
        detalle: `${r.destino} · ${r.proveedor || r.tipo}`,
        fecha: viaje,
        tono: "normal",
      });
      if (r.estatus === "pendiente_alta") {
        const l = sumarDias(compra, 30);
        const e = estadoSemaforo(l, hoy);
        poner({
          clave: `${r.id}-a`,
          reserva: r,
          clase: "alta",
          texto: `Alta: ${r.cliente}`,
          detalle: "Último día para dar de alta (30 días desde la compra)",
          fecha: l,
          tono: e === "enPlazo" ? "normal" : e,
        });
      }
      if (r.pagoPendienteFecha && r.pagoPendienteMonto) {
        const f = parseFecha(r.pagoPendienteFecha);
        if (f)
          poner({
            clave: `${r.id}-p`,
            reserva: r,
            clase: "pago",
            texto: `Pago: ${r.cliente}`,
            detalle: `Debe completar ${formatoDinero(r.pagoPendienteMonto, r.moneda)}`,
            fecha: f,
            tono: "normal",
          });
      }
      if (r.estatus !== "pagado") {
        poner({
          clave: `${r.id}-r`,
          reserva: r,
          clase: "revision",
          texto: `Revisión: ${r.cliente}`,
          detalle: "Ya puedes preguntar por tu pago (60 días tras el viaje)",
          fecha: sumarDias(viaje, 60),
          tono: "normal",
        });
        const l = sumarMeses(viaje, 18);
        const e = estadoSemaforo(l, hoy);
        poner({
          clave: `${r.id}-c`,
          reserva: r,
          clase: "reclamo",
          texto: `Reclamo: ${r.cliente}`,
          detalle: "Último día para reclamar (18 meses)",
          fecha: l,
          tono: e === "enPlazo" ? "normal" : e,
        });
      }
    }
    return mapa;
  }, [reservas, hoy]);

  // cuadrícula lunes a domingo
  const primero = mes;
  const offset = (primero.getDay() + 6) % 7;
  const inicio = new Date(
    primero.getFullYear(),
    primero.getMonth(),
    1 - offset,
  );
  const dias = Array.from(
    { length: 42 },
    (_, i) =>
      new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i),
  );
  const filas = dias[35].getMonth() === mes.getMonth() ? 6 : 5;
  const visibles = dias.slice(0, filas * 7);
  const titulo = `${MESES[mes.getMonth()]} ${mes.getFullYear()}`;
  const desde = Math.min(hoy.getFullYear() - 3, mes.getFullYear());
  const hasta = Math.max(hoy.getFullYear() + 5, mes.getFullYear());
  const anios = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  const irA = (y: number, m: number) => setMes(new Date(y, m, 1));
  const delDia = eventos.get(clave(sel)) ?? [];
  const delMesTodo = [...eventos.values()]
    .flat()
    .filter(
      (e) =>
        e.fecha.getMonth() === mes.getMonth() &&
        e.fecha.getFullYear() === mes.getFullYear(),
    )
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const lista = verMes ? delMesTodo : delDia;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">
              <h1 className="sr-only">Calendario</h1>
              <label className="relative">
                <span className="sr-only">Mes</span>
                <select
                  value={mes.getMonth()}
                  onChange={(e) =>
                    irA(mes.getFullYear(), Number(e.target.value))
                  }
                  className="cursor-pointer appearance-none rounded-[var(--radius-button)] bg-transparent py-1 pr-1 [field-sizing:content] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i} className="bg-white text-base font-medium text-black">
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="relative">
                <span className="sr-only">Año</span>
                <select
                  value={mes.getFullYear()}
                  onChange={(e) => irA(Number(e.target.value), mes.getMonth())}
                  className="cursor-pointer appearance-none rounded-[var(--radius-button)] bg-transparent py-1 pr-1 [field-sizing:content] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {anios.map((y) => (
                    <option key={y} value={y} className="bg-white text-base font-medium text-black">
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <ChevronDown
                size={20}
                aria-hidden="true"
                className="shrink-0 text-[var(--text-secondary)]"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Mes anterior"
                onClick={() =>
                  setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))
                }
                className="flex size-11 items-center justify-center rounded-[var(--radius-button)] tarjeta-suave"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
                  setSel(hoy);
                  setVerMes(false);
                }}
                className="min-h-11 rounded-[var(--radius-button)] tarjeta-suave px-3 text-sm font-semibold"
              >
                Hoy
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() =>
                  setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))
                }
                className="flex size-11 items-center justify-center rounded-[var(--radius-button)] tarjeta-suave"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <section
            aria-label="Calendario del mes"
            className="overflow-hidden rounded-[var(--radius-card)] tarjeta-suave"
          >
            <div className="grid grid-cols-7 bg-[var(--surface-2)] text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {DIAS.map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {visibles.map((d) => {
                const evs = eventos.get(clave(d)) ?? [];
                const delMes = d.getMonth() === mes.getMonth();
                const esHoy = clave(d) === clave(hoy);
                const esSel = clave(d) === clave(sel);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => {
                      setSel(d);
                      setVerMes(false);
                    }}
                    aria-label={`${formatoFecha(d, hoy)}${evs.length ? `, ${evs.length} ${evs.length === 1 ? "elemento" : "elementos"}` : ""}`}
                    aria-pressed={esSel}
                    className={`flex min-h-16 flex-col items-stretch gap-1 border-l border-t border-black/5 p-1 text-left align-top first:border-l-0 md:min-h-24 md:p-2 ${esSel ? "bg-[var(--chip-azul-bg)] ring-2 ring-inset ring-[var(--accent)]" : ""} ${delMes ? "" : "bg-black/[0.02] text-[var(--text-tertiary)]"}`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${esHoy ? "bg-[var(--accent)] text-white" : ""}`}
                    >
                      {d.getDate()}
                    </span>
                    <span className="hidden flex-col gap-1 md:flex">
                      {evs.slice(0, 2).map((e) => (
                        <span
                          key={e.clave}
                          className={`truncate rounded px-1.5 py-0.5 text-xs font-semibold ${COLOR[e.clase]}`}
                        >
                          {e.texto}
                        </span>
                      ))}
                      {evs.length > 2 && (
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">
                          +{evs.length - 2} más
                        </span>
                      )}
                    </span>
                    {evs.length > 0 && (
                      <span
                        className="flex gap-0.5 md:hidden"
                        aria-hidden="true"
                      >
                        {evs.slice(0, 3).map((e) => (
                          <span
                            key={e.clave}
                            className={`size-2 rounded-full ${COLOR[e.clase].split(" ")[0]}`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside
          aria-label="Lista del día"
          className="rounded-[var(--radius-card)] tarjeta-suave p-4"
        >
          <button
            type="button"
            onClick={() => setVerMes(true)}
            aria-pressed={verMes}
            className="mb-3 min-h-11 w-full rounded-[var(--radius-button)] bg-[var(--accent)] px-3 text-sm font-semibold text-white"
          >
            Ver todo el mes
          </button>
          <h2 className="text-lg font-bold [font-family:var(--font-display)]">
            {verMes
              ? titulo
              : capitalizar(
                  new Intl.DateTimeFormat("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(sel),
                )}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {listo
              ? lista.length === 0
                ? verMes
                  ? "Nada este mes."
                  : "Nada este día."
                : `${lista.length} ${lista.length === 1 ? "elemento" : "elementos"}`
              : "Cargando…"}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {lista.map((e) => (
              <li
                key={e.clave}
                className={`rounded-[var(--radius-button)] border-l-4 bg-[var(--bg)] p-3 ${e.tono === "vencido" ? "border-l-[var(--rojo-text)]" : e.tono === "urgente" ? "border-l-[var(--btn-oro-to)]" : "border-l-[var(--accent)]"}`}
              >
                {verMes && (
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {capitalizar(
                      new Intl.DateTimeFormat("es-MX", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }).format(e.fecha),
                    )}
                  </p>
                )}
                <p className="text-sm font-bold">{e.texto}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {e.detalle}
                </p>
                <div className="mt-2">
                  <InsigniaEstatus estatus={e.reserva.estatus} />
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <ul
        className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-secondary)]"
        aria-label="Leyenda"
      >
        {[
          ["bg-[var(--accent)]", "Sale el cliente"],
          ["bg-[var(--btn-oro-to)]", "Alta en el portal"],
          ["bg-[var(--slate)]", "Pago o revisión"],
          ["bg-[var(--rojo-text)]", "Plazo de reclamo"],
        ].map(([c, t]) => (
          <li key={t} className="flex items-center gap-1">
            <span className={`size-2 rounded-full ${c}`} aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
