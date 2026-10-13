"use client";

// ALERTAS — protagonista: lo que tu asistente te pide hacer, de lo más urgente a lo más tranquilo, con la acción a un toque.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { InsigniaSeveridad } from "@/components/app/Insignias";
import { formatoFecha } from "@/lib/plazos";
import {
  todasLasAlertas,
  useReservas,
  type Alerta,
  type Severidad,
} from "@/lib/reservas";

const GRUPOS: {
  sev: Severidad[];
  titulo: string;
  ayuda: string;
  borde: string;
}[] = [
  {
    sev: ["vencido"],
    titulo: "Plazo vencido",
    ayuda: "Consulta con tu agencia si aún puedes gestionarlas.",
    borde: "border-l-[var(--rojo-text)]",
  },
  {
    sev: ["urgente"],
    titulo: "Quedan 5 días o menos",
    ayuda: "Actúa hoy.",
    borde: "border-l-[var(--btn-oro-to)]",
  },
  { sev: ["normal"], titulo: "", ayuda: "", borde: "border-l-[var(--accent)]" },
  {
    sev: ["info"],
    titulo: "Salidas de viajeros",
    ayuda: "Tus clientes salen pronto: acompáñalos.",
    borde: "border-l-[var(--accent)]",
  },
];

type Filtro = "alta" | "urgente" | "salida" | "vencido";
const FILTROS: {
  id: Filtro;
  texto: string;
  coincide: (a: Alerta) => boolean;
}[] = [
  { id: "alta", texto: "Alta pendiente", coincide: (a) => a.tipo === "alta" },
  {
    id: "urgente",
    texto: "Urgente",
    coincide: (a) => a.severidad === "urgente",
  },
  { id: "salida", texto: "Salidas", coincide: (a) => a.tipo === "salida" },
  {
    id: "vencido",
    texto: "Vencidas",
    coincide: (a) => a.severidad === "vencido",
  },
];

export default function Alertas() {
  const [activos, setActivos] = useState<Filtro[]>([]);
  const { reservas, listo, actualizar } = useReservas();
  const hoy = useMemo(() => new Date(), []);
  const todas = useMemo(() => todasLasAlertas(reservas, hoy), [reservas, hoy]);
  // Sin ninguna casilla marcada se ve todo; al marcar, se muestran las que cumplan cualquiera de las marcadas
  const alertas =
    activos.length === 0
      ? todas
      : todas.filter((a) =>
          FILTROS.some((f) => activos.includes(f.id) && f.coincide(a)),
        );

  const accion = (a: Alerta): { texto: string; hacer: () => void } | null => {
    switch (a.tipo) {
      case "alta":
        return {
          texto: "Ya la di de alta",
          hacer: () => actualizar(a.reservaId, { estatus: "pendiente_pago" }),
        };
      case "pago_cliente":
        return {
          texto: "Ya completó su pago",
          hacer: () =>
            actualizar(a.reservaId, {
              pagoPendienteFecha: undefined,
              pagoPendienteMonto: undefined,
            }),
        };
      case "revision":
        return {
          texto: "Ya me pagaron",
          hacer: () => actualizar(a.reservaId, { estatus: "pagado" }),
        };
      case "reclamo":
        return {
          texto: "Ya me pagaron",
          hacer: () => actualizar(a.reservaId, { estatus: "pagado" }),
        };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">
          Alertas
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {listo
            ? `${alertas.length} ${alertas.length === 1 ? "aviso" : "avisos"} de tu asistente`
            : "Cargando…"}
        </p>
      </div>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar avisos</legend>
        {FILTROS.map((f) => {
          const on = activos.includes(f.id);
          return (
            <label
              key={f.id}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-button)] px-3 text-sm font-semibold tarjeta-suave has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)] ${on ? "ring-2 ring-[var(--accent)]" : ""}`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() =>
                  setActivos(
                    on ? activos.filter((x) => x !== f.id) : [...activos, f.id],
                  )
                }
                className="size-5 accent-[var(--accent)]"
              />
              {f.texto}
            </label>
          );
        })}
      </fieldset>

      {listo && alertas.length === 0 && (
        <div className="rounded-[var(--radius-card)] tarjeta-suave p-6">
          <h2 className="text-xl font-bold [font-family:var(--font-display)]">
            Todo en orden
          </h2>
          <p className="mt-1 text-[var(--text-secondary)]">
            {activos.length
              ? "Ningún aviso coincide con lo que marcaste."
              : "No hay avisos por ahora. Tu asistente te avisará antes de cada plazo."}
          </p>
        </div>
      )}

      {GRUPOS.map((g) => {
        const items = alertas.filter((a) => g.sev.includes(a.severidad));
        if (items.length === 0) return null;
        return (
          <section
            key={g.sev[0]}
            aria-label={g.titulo || "Avisos"}
            className="flex flex-col gap-3"
          >
            {g.titulo && (
              <div>
                <h2 className="text-lg font-bold [font-family:var(--font-display)]">
                  {g.titulo}{" "}
                  <span className="text-[var(--text-secondary)]">
                    · {items.length}
                  </span>
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {g.ayuda}
                </p>
              </div>
            )}
            <ul className="flex flex-col gap-3">
              {items.map((a) => {
                const ac = accion(a);
                return (
                  <li
                    key={a.id}
                    className={`rounded-[var(--radius-card)] border-l-4 tarjeta-suave p-4 ${g.borde}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold">{a.titulo}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {a.detalle}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatoFecha(a.fecha, hoy)}
                        </p>
                      </div>
                      <InsigniaSeveridad alerta={a} hoy={hoy} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ac && (
                        <button
                          type="button"
                          onClick={ac.hacer}
                          className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--on-accent)]"
                        >
                          <Check size={16} aria-hidden="true" />
                          {ac.texto}
                        </button>
                      )}
                      <Link
                        href="/app/reservas"
                        className="flex min-h-11 items-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] px-4 text-sm font-semibold"
                      >
                        Ver reserva
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
