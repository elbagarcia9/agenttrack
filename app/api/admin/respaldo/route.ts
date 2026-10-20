// RESPALDO de tus datos: baja un archivo con todo lo importante a TU computadora. Solo lo puede pedir la dueña (para cualquier
// otra persona la ruta "no existe"). El archivo trae datos personales de tus clientas: guárdalo en un lugar privado.

import { NextResponse } from 'next/server';
import { dentroDelLimite } from '@/lib/eventos';
import { servicioConfigurado, supabaseServicio } from '@/lib/supabase/servicio';
import { exigirAdmin } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Tablas que se respaldan (no se incluyen las llaves de los celulares ni las bitácoras de uso, que no hacen falta para restaurar)
const TABLAS: { nombre: string; columnas: string; orden: string }[] = [
  { nombre: 'perfiles', columnas: '*', orden: 'creado_en' },
  { nombre: 'preferencias', columnas: '*', orden: 'user_id' },
  { nombre: 'reservas', columnas: '*', orden: 'creada_en' },
  { nombre: 'payment_transactions', columnas: '*', orden: 'occurred_at' },
  { nombre: 'accesos_regalo', columnas: '*', orden: 'id' },
  { nombre: 'consentimientos', columnas: '*', orden: 'id' },
  { nombre: 'encuesta_salida', columnas: '*', orden: 'id' },
  { nombre: 'costos_operativos', columnas: '*', orden: 'id' },
  { nombre: 'acquisition_spend', columnas: '*', orden: 'id' },
  { nombre: 'ajustes_negocio', columnas: '*', orden: 'clave' },
];

export async function GET() {
  const { user } = await exigirAdmin(); // 404 para quien no sea la dueña
  if (!servicioConfigurado()) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  if (!dentroDelLimite(`respaldo:${user.id}`, 5)) return NextResponse.json({ error: 'Muchas descargas seguidas. Espera un minuto.' }, { status: 429 });

  const sb = supabaseServicio();
  const datos: Record<string, unknown[]> = {};
  const conteos: Record<string, number> = {};
  for (const t of TABLAS) {
    const filas: unknown[] = [];
    for (let desde = 0; ; desde += 1000) {
      const { data, error } = await sb.from(t.nombre).select(t.columnas).order(t.orden, { ascending: true }).range(desde, desde + 999);
      if (error) {
        // una tabla que falla no tira el respaldo completo: se anota cuál faltó
        conteos[t.nombre] = -1;
        break;
      }
      filas.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    if (conteos[t.nombre] !== -1) {
      datos[t.nombre] = filas;
      conteos[t.nombre] = filas.length;
    }
  }

  const ahora = new Date();
  const cuerpo = JSON.stringify({ aplicacion: 'AgentTrack', formato: 1, creado_en: ahora.toISOString(), conteos, datos }, null, 1);
  const fecha = ahora.toISOString().slice(0, 10);
  return new NextResponse(cuerpo, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="AgentTrack-respaldo-${fecha}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
