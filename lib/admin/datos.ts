import 'server-only';

// Carga de datos del panel. CADA función vuelve a verificar que quien pregunta es administrador
// (un layout no se re-ejecuta al navegar) y además la base filtra por RLS: doble candado.

import { exigirAdmin } from '@/lib/supabase/servidor';
import { rangoDeMes } from './formato';
import type { ActividadReservas, Costo, FilaUsuario, Gasto, Negocio, Salud, Uso, UsuariosResumen, Ventas } from './tipos';

async function rpc<T>(nombre: string, args?: Record<string, unknown>): Promise<T> {
  const { sb } = await exigirAdmin();
  const { data, error } = await sb.rpc(nombre, args);
  if (error) throw new Error(`No se pudo cargar "${nombre}": ${error.message}`);
  return data as T;
}

export const cargarVentas = (mes: string) => {
  const r = rangoDeMes(mes);
  return rpc<Ventas>('admin_ventas', { p_desde: r.desde, p_hasta: r.hasta });
};
export const cargarUso = (mes: string) => {
  const r = rangoDeMes(mes);
  return rpc<Uso>('admin_uso', { p_desde: r.desde, p_hasta: r.hasta });
};
export const cargarNegocio = (mes: string) => {
  const r = rangoDeMes(mes);
  return rpc<Negocio>('admin_negocio', { p_desde: r.desde, p_hasta: r.hasta });
};
export const cargarSalud = () => rpc<Salud>('admin_salud');
export const cargarUsuariosResumen = () => rpc<UsuariosResumen>('admin_usuarios_resumen');
export const cargarActividadReservas = () => rpc<ActividadReservas>('admin_actividad_reservas');

export async function cargarCostos(mes?: string): Promise<Costo[]> {
  const { sb } = await exigirAdmin();
  let q = sb.from('costos_operativos').select('id, mes, concepto, monto_minor, moneda, nota').order('mes', { ascending: false }).order('id', { ascending: false }).limit(200);
  if (mes) q = q.eq('mes', `${mes}-01`);
  const { data, error } = await q;
  if (error) throw new Error(`No se pudieron cargar los costos: ${error.message}`);
  return (data ?? []) as Costo[];
}

export async function cargarGastos(): Promise<Gasto[]> {
  const { sb } = await exigirAdmin();
  const { data, error } = await sb.from('acquisition_spend').select('id, canal, monto_minor, moneda, desde, hasta, nota').order('desde', { ascending: false }).limit(200);
  if (error) throw new Error(`No se pudieron cargar los gastos: ${error.message}`);
  return (data ?? []) as Gasto[];
}

export async function cargarTasaImpuestos(): Promise<number | null> {
  const { sb } = await exigirAdmin();
  const { data, error } = await sb.from('ajustes_negocio').select('valor').eq('clave', 'tasa_impuestos_pct').maybeSingle();
  if (error) throw new Error(`No se pudo cargar la tasa de impuestos: ${error.message}`);
  return data ? Number(data.valor) : null;
}

export interface ListaUsuarios {
  filas: FilaUsuario[];
  total: number;
  pagina: number;
  porPagina: number;
}

export async function cargarUsuarios(opts: { q?: string; estado?: string; membresia?: string; pagina?: number }): Promise<ListaUsuarios> {
  const { sb } = await exigirAdmin();
  const porPagina = 25;
  const pagina = Math.max(1, opts.pagina ?? 1);
  let q = sb
    .from('perfiles')
    .select('id, email, nombre, rol, estado, membresia, plan, ciclo, fuente, creado_en, ultimo_acceso', { count: 'exact' })
    .order('creado_en', { ascending: false })
    .range((pagina - 1) * porPagina, pagina * porPagina - 1);
  const busca = (opts.q ?? '').trim().replace(/[%,()]/g, ' ').slice(0, 80);
  if (busca) q = q.or(`email.ilike.%${busca}%,nombre.ilike.%${busca}%`);
  if (opts.estado === 'activo' || opts.estado === 'desactivado') q = q.eq('estado', opts.estado);
  if (opts.membresia === 'sin_membresia') q = q.is('membresia', null);
  else if (opts.membresia && /^[a-z_]+$/.test(opts.membresia)) q = q.eq('membresia', opts.membresia);
  const { data, error, count } = await q;
  if (error) throw new Error(`No se pudo cargar la lista de usuarios: ${error.message}`);
  return { filas: (data ?? []) as FilaUsuario[], total: count ?? 0, pagina, porPagina };
}
