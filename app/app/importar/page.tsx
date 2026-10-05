'use client';

// IMPORTAR EXCEL (Fase 1: Excel y CSV) — protagonista: pasar tu base completa sin capturar a mano.
// Todo se lee en tu navegador: el archivo no se sube a ningún servidor.

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, FileUp, Loader2, TriangleAlert } from 'lucide-react';
import { ExitoAnimado } from '@/components/app/ExitoAnimado';
import { CAMPOS, convertirFilas, indiceEncabezado, parseCsv, sugerirMapeo, type Campo, type Fila, type Mapeo } from '@/lib/importar';
import { formatoDinero, useReservas, type Moneda } from '@/lib/reservas';

type Paso = 'archivo' | 'columnas' | 'revisar' | 'listo';

const selectClase =
  'min-h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] campo-suave px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]';
const CLAVE_MAPEO = 'cg_mapeo_importacion';

function firma(enc: Fila): string {
  return enc.map((c) => String(c ?? '').trim().toLowerCase()).join('|');
}

function celdaTexto(c: unknown): string {
  if (c instanceof Date) return c.toLocaleDateString('es-MX');
  return c === null || c === undefined ? '' : String(c);
}

export default function Importar() {
  const { reservas, agregar } = useReservas();
  const [paso, setPaso] = useState<Paso>('archivo');
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [filas, setFilas] = useState<Fila[]>([]);
  const [encIdx, setEncIdx] = useState(0);
  const [mapeo, setMapeo] = useState<Mapeo>({});
  const [orden, setOrden] = useState<'dmy' | 'mdy'>('dmy');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [omitirDuplicadas, setOmitirDuplicadas] = useState(true);
  const [resultado, setResultado] = useState({ importadas: 0, omitidas: 0 });
  const entrada = useRef<HTMLInputElement>(null);

  const encabezado = filas[encIdx] ?? [];

  const leerArchivo = async (archivo: File) => {
    setError('');
    setLeyendo(true);
    try {
      const nombre = archivo.name.toLowerCase();
      let datos: Fila[] = [];
      if (nombre.endsWith('.csv') || nombre.endsWith('.txt')) {
        datos = parseCsv(await archivo.text());
      } else if (nombre.endsWith('.xlsx')) {
        const { default: leerXlsx } = await import('read-excel-file/browser');
        const hojas = await leerXlsx(archivo);
        const mayor = [...hojas].sort((a, b) => b.data.length - a.data.length)[0];
        datos = (mayor?.data ?? []) as Fila[];
      } else if (nombre.endsWith('.xls')) {
        setError('Los archivos .xls antiguos no se pueden leer. En Excel elige Archivo → Guardar como y guárdalo como .xlsx o .csv.');
        return;
      } else {
        setError('Elige un archivo de Excel (.xlsx) o un .csv.');
        return;
      }
      datos = datos.filter((f) => f.some((c) => c !== null && c !== undefined && String(c).trim() !== ''));
      if (datos.length < 2) {
        setError('El archivo está vacío o solo tiene una fila. Revisa que tenga tus reservas debajo de los encabezados.');
        return;
      }
      const idx = indiceEncabezado(datos);
      let sugerido = sugerirMapeo(datos, idx, 'dmy');
      try {
        const guardado = JSON.parse(window.localStorage.getItem(CLAVE_MAPEO) ?? 'null');
        if (guardado && guardado.firma === firma(datos[idx])) sugerido = guardado.mapeo; // la misma hoja que importaste antes
      } catch {
        /* sin mapeo guardado */
      }
      setFilas(datos);
      setEncIdx(idx);
      setMapeo(sugerido);
      setNombreArchivo(archivo.name);
      setPaso('columnas');
    } catch {
      setError('No pudimos leer ese archivo. Revisa que no esté dañado ni protegido con contraseña, o guárdalo como .csv e inténtalo de nuevo.');
    } finally {
      setLeyendo(false);
    }
  };

  const faltantes = CAMPOS.filter((c) => c.obligatorio && mapeo[c.id] === undefined).map((c) => c.etiqueta);

  const convertidas = useMemo(
    () =>
      paso === 'revisar' || paso === 'listo'
        ? convertirFilas(filas, encIdx, mapeo, { orden, monedaPorDefecto: moneda, existentes: reservas })
        : [],
    [paso, filas, encIdx, mapeo, orden, moneda, reservas],
  );
  const buenas = convertidas.filter((c) => c.reserva && !(omitirDuplicadas && c.duplicada));
  const conError = convertidas.filter((c) => !c.reserva).length;
  const duplicadas = convertidas.filter((c) => c.duplicada).length;

  const pasarARevisar = () => {
    if (faltantes.length > 0) {
      setError(`Falta decir qué columna es: ${faltantes.join(', ')}.`);
      return;
    }
    setError('');
    setPaso('revisar');
  };

  const importar = () => {
    let n = 0;
    for (const c of buenas) {
      if (c.reserva) {
        agregar(c.reserva);
        n += 1;
      }
    }
    try {
      window.localStorage.setItem(CLAVE_MAPEO, JSON.stringify({ firma: firma(encabezado), mapeo }));
    } catch {
      /* sin almacenamiento */
    }
    setResultado({ importadas: n, omitidas: convertidas.length - n });
    setPaso('listo');
  };

  const reiniciar = () => {
    setPaso('archivo');
    setFilas([]);
    setMapeo({});
    setError('');
    if (entrada.current) entrada.current.value = '';
  };

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-0">
      <div>
        <Link href="/app/reservas" className="-ml-2 flex min-h-11 w-fit items-center gap-1 px-2 text-sm font-semibold text-[var(--text-secondary)]">
          <ChevronLeft size={18} aria-hidden="true" />
          Reservas
        </Link>
        <h1 className="text-4xl font-bold leading-[1.1] [font-family:var(--font-display)]">Importa tu Excel</h1>
        <p className="mt-1 max-w-[56ch] text-sm text-[var(--text-secondary)]">
          Trae tu base completa en segundos. Se lee en tu navegador: el archivo no se sube a ningún servidor.
        </p>
      </div>

      <ol className="flex gap-2 text-xs font-semibold" aria-label="Pasos">
        {(['archivo', 'columnas', 'revisar', 'listo'] as Paso[]).map((p, i) => {
          const orden = ['archivo', 'columnas', 'revisar', 'listo'].indexOf(paso);
          return (
            <li key={p} aria-current={paso === p ? 'step' : undefined} className={`min-w-0 flex-1 truncate rounded-full px-2 py-1 text-center ${i <= orden ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>
              {['Archivo', 'Columnas', 'Revisar', 'Listo'][i]}
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-[var(--radius-card)] bg-[var(--chip-rojo-bg)] p-3 text-sm font-medium text-[var(--rojo-text)]">
          <TriangleAlert size={18} aria-hidden="true" className="mt-px shrink-0" />
          {error}
        </p>
      )}

      {paso === 'archivo' && (
        <section className="flex flex-col gap-4">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[var(--surface)] p-6 text-center focus-within:ring-2 focus-within:ring-[var(--accent)]">
            {leyendo ? <Loader2 size={32} aria-hidden="true" className="motion-safe:animate-spin" color="var(--accent)" /> : <FileUp size={32} aria-hidden="true" color="var(--accent)" />}
            <span className="text-lg font-bold [font-family:var(--font-display)]">{leyendo ? 'Leyendo tu archivo…' : 'Elige tu archivo de Excel'}</span>
            <span className="text-sm text-[var(--text-secondary)]">.xlsx o .csv · con tus encabezados en la primera fila de datos</span>
            <input
              ref={entrada}
              type="file"
              accept=".xlsx,.csv,.txt"
              className="sr-only"
              onChange={(e) => {
                const a = e.target.files?.[0];
                if (a) void leerArchivo(a);
              }}
            />
          </label>
          <ul className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <li>Tus columnas pueden llamarse como quieras: tu asistente adivina cuál es cuál y tú confirmas.</li>
            <li>Antes de guardar ves una vista previa y puedes corregir lo que no coincida.</li>
            <li>Si tienes tu información en PDF o en fotos, por ahora pásala a Excel o CSV; los PDF y las fotos llegan después.</li>
          </ul>
        </section>
      )}

      {paso === 'columnas' && (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Archivo: <b className="text-[var(--text-primary)]">{nombreArchivo}</b> · {filas.length - encIdx - 1} filas. Confirma qué columna es cada dato.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS.map((c) => {
              const col = mapeo[c.id];
              const ejemplos = col === undefined ? [] : filas.slice(encIdx + 1, encIdx + 4).map((f) => celdaTexto(f[col])).filter(Boolean);
              return (
                <div key={c.id} className="rounded-[var(--radius-card)] tarjeta-suave p-3">
                  <label className="block">
                    <span className="flex items-center justify-between text-sm font-bold">
                      {c.etiqueta}
                      {c.obligatorio && <span className="text-xs font-semibold text-[var(--rojo-text)]">necesario</span>}
                    </span>
                    <select
                      value={col === undefined ? '' : String(col)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMapeo((m) => {
                          const n = { ...m };
                          if (v === '') delete n[c.id as Campo];
                          else n[c.id as Campo] = Number(v);
                          return n;
                        });
                      }}
                      className={`${selectClase} mt-1`}
                    >
                      <option value="">No importar</option>
                      {encabezado.map((e, i) => (
                        <option key={i} value={i}>
                          {celdaTexto(e) || `Columna ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{ejemplos.length ? `Ej.: ${ejemplos.join(' · ')}` : 'Sin columna'}</p>
                </div>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold">Formato de fechas</span>
              <select value={orden} onChange={(e) => setOrden(e.target.value as 'dmy' | 'mdy')} className={`${selectClase} mt-1`}>
                <option value="dmy">Día / mes / año (México)</option>
                <option value="mdy">Mes / día / año</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Moneda si el archivo no la dice</span>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={`${selectClase} mt-1`}>
                <option value="USD">Dólares (USD)</option>
                <option value="MXN">Pesos (MXN)</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reiniciar} className="min-h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-5 text-sm font-semibold">
              Elegir otro archivo
            </button>
            <button type="button" onClick={pasarARevisar} className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)]">
              Ver vista previa
            </button>
          </div>
        </section>
      )}

      {paso === 'revisar' && (
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[var(--radius-card)] bg-[var(--chip-verde-bg)] p-3 text-[var(--verde-text)]">
              <b className="block text-2xl [font-family:var(--font-display)]">{buenas.length}</b>
              <span className="text-xs font-semibold">se importan</span>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--chip-rojo-bg)] p-3 text-[var(--rojo-text)]">
              <b className="block text-2xl [font-family:var(--font-display)]">{conError}</b>
              <span className="text-xs font-semibold">con errores</span>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--chip-oro-bg)] p-3 text-[var(--alerta-text)]">
              <b className="block text-2xl [font-family:var(--font-display)]">{duplicadas}</b>
              <span className="text-xs font-semibold">repetidas</span>
            </div>
          </div>
          {duplicadas > 0 && (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={omitirDuplicadas} onChange={(e) => setOmitirDuplicadas(e.target.checked)} className="size-5 accent-[var(--accent)]" />
              Omitir las repetidas (mismo cliente, destino y fecha de viaje)
            </label>
          )}

          <div className="overflow-x-auto rounded-[var(--radius-card)] tarjeta-suave">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  {['#', 'Cliente', 'Destino', 'Compra', 'Viaje', 'Comisión', 'Nota'].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {convertidas.slice(0, 60).map((c) => (
                  <tr key={c.fila} className={`border-t border-black/5 ${!c.reserva ? 'bg-[var(--chip-rojo-bg)]' : c.duplicada ? 'bg-[var(--alerta-bg)]' : ''}`}>
                    <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">{c.fila}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-bold">{c.reserva?.cliente ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">{c.reserva?.destino ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">{c.reserva?.fechaCompra || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2">{c.reserva?.fechaViaje ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{c.reserva ? formatoDinero(c.reserva.comision, c.reserva.moneda) : '—'}</td>
                    <td className="px-3 py-2 text-xs font-medium">
                      {!c.reserva ? c.errores.join(', ') : c.duplicada ? 'Repetida' : c.avisos.join(' · ') || <Check size={16} color="var(--verde-text)" aria-label="Lista" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {convertidas.length > 60 && <p className="text-sm text-[var(--text-secondary)]">Mostrando las primeras 60 filas de {convertidas.length}. Se importan todas las válidas.</p>}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPaso('columnas')} className="min-h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-5 text-sm font-semibold">
              Corregir columnas
            </button>
            <button
              type="button"
              disabled={buenas.length === 0}
              onClick={importar}
              className="min-h-12 rounded-[var(--radius-button)] bg-gradient-to-b from-[var(--btn-oro-from)] to-[var(--btn-oro-to)] px-6 text-sm font-bold text-[var(--btn-oro-text)] shadow-[var(--shadow-2)] disabled:opacity-60"
            >
              {buenas.length === 0 ? 'No hay filas para importar' : `Importar ${buenas.length} reservas`}
            </button>
          </div>
        </section>
      )}

      {paso === 'listo' && (
        <section className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] tarjeta-suave p-6">
          <ExitoAnimado clase="size-44" />
          <h2 className="text-3xl font-bold leading-[1.1] [font-family:var(--font-display)]">Importaste {resultado.importadas} reservas</h2>
          <p className="max-w-[52ch] text-[var(--text-secondary)]">
            Tu asistente ya calculó los plazos de cada una.
            {resultado.omitidas > 0 ? ` Se omitieron ${resultado.omitidas} filas (con errores o repetidas).` : ''}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/reservas" className="flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--on-accent)] shadow-[var(--shadow-2)]">
              Ver mis reservas
            </Link>
            <button type="button" onClick={reiniciar} className="min-h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] px-5 text-sm font-semibold">
              Importar otro archivo
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
