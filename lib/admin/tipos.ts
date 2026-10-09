// Formas de los datos que devuelven las funciones del panel (ver migración "admin_funciones_de_metricas").
// Todos los importes van en unidad menor (centavos) + moneda ISO: nunca se suman monedas distintas.

export interface VentasMoneda {
  moneda: string;
  ingresos: number;
  ventas: number;
  nuevas: number;
  renovaciones: number;
  reembolsos: number;
  n_reembolsos: number;
  comision_hotmart: number;
  ventas_sin_comision_hotmart: number;
  comision_afiliados: number;
}

export interface Ventas {
  por_moneda: VentasMoneda[];
  acumulado: { moneda: string; ingresos: number }[];
  serie: { mes: string; moneda: string; ingresos: number; reembolsos: number }[];
  mrr: { moneda: string; mrr: number; suscripciones: number }[];
  mrr_sin_ciclo: number;
  membresias: Record<string, number>;
  bajas: { voluntarias: number; involuntarias: number; otras: number; activos_inicio: number };
  ultimas: { email: string; tipo: 'sale' | 'refund' | 'chargeback'; monto: number; moneda: string; cuando: string; canal: string; ciclo: string | null }[];
}

export interface UsuariosResumen {
  total: number;
  activos_hoy: number;
  activos_7d: number;
  activos_30d: number;
  nuevos_7d: number;
  desactivados: number;
}

export interface ActividadReservas {
  total: number;
  usuarios_con_reservas: number;
  por_dia: { dia: string; n: number }[];
}

export interface Uso {
  medicion_desde: string | null;
  eventos: Record<string, number>;
  embudo: Record<'landing_vista' | 'onboarding_iniciado' | 'resultado_visto' | 'paywall_visto' | 'checkout_iniciado' | 'acceso_solicitado', number>;
  retencion: Record<'d1' | 'd7' | 'd30', { elegibles: number; retenidos: number }>;
  curr_semanal: { semana: string; activos_previos: number; volvieron: number }[];
  dau: { dia: string; n: number }[];
  pagadores_fantasma: number;
}

export interface CanalNegocio {
  canal: string;
  moneda: string;
  nuevos: number;
  ingresos: number;
  comision_hotmart: number;
  comision_afiliados: number;
  gasto: number;
  ingreso_mensual_cliente: number | null;
}

export interface Negocio {
  canales: CanalNegocio[];
  trial: { pruebas: number; pagaron: number };
}

export interface Salud {
  errores: { mensaje: string; n: number; usuarios: number; ultimo: string; ruta: string | null }[];
  errores_24h: number;
  webhook: {
    ultimo: string | null;
    por_resultado_7d: Record<string, number>;
    recientes: { tipo: string | null; resultado: string; cuando: string }[];
  };
  pagos_sin_acceso: { email: string; cuando: string }[];
}

export interface Costo {
  id: number;
  mes: string;
  concepto: 'infra' | 'email' | 'dominio' | 'otro';
  monto_minor: number;
  moneda: string;
  nota: string | null;
}

export interface Gasto {
  id: number;
  canal: string;
  monto_minor: number;
  moneda: string;
  desde: string;
  hasta: string;
  nota: string | null;
}

export interface FilaUsuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'usuario' | 'admin';
  estado: 'activo' | 'desactivado';
  membresia: string | null;
  plan: string | null;
  ciclo: string | null;
  fuente: string;
  creado_en: string;
  ultimo_acceso: string | null;
}
