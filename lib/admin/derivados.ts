// Cálculos del panel a partir de los datos reales. Nada se inventa: si falta un dato, el resultado lo dice
// ("estimacion" + lista de lo que falta) o queda en null ("Sin datos").

import { nombreCanal } from './etiquetas';
import { dinero, porcentaje } from './formato';
import type { CanalNegocio, Costo, Negocio, Salud, Uso, Ventas } from './tipos';

// ───────── GANANCIA ─────────

export interface Ganancia {
  moneda: string;
  estado: 'estimacion' | 'completa';
  ingresosBrutos: number;
  reembolsos: number;
  ingresosNetos: number;
  hotmart: number;
  afiliados: number;
  impuestos: number | null;
  infra: number | null;
  email: number | null;
  otros: number | null;
  ganancia: number;
  margenPct: number | null;
  faltantes: string[];
}

// Una "completa" significa: están todos los costos anotados. Sigue sin conciliarse con la liquidación de Hotmart.
export function calcularGanancia(ventas: Ventas, costosDelMes: Costo[], tasaImpuestosPct: number | null): Ganancia[] {
  const monedas = new Set<string>([...ventas.por_moneda.map((m) => m.moneda), ...costosDelMes.map((c) => c.moneda)]);
  const salida: Ganancia[] = [];
  for (const moneda of monedas) {
    const v = ventas.por_moneda.find((m) => m.moneda === moneda);
    const costos = costosDelMes.filter((c) => c.moneda === moneda);
    const suma = (concepto: Costo['concepto']) => costos.filter((c) => c.concepto === concepto).reduce((t, c) => t + c.monto_minor, 0);
    const hay = (concepto: Costo['concepto']) => costos.some((c) => c.concepto === concepto);

    const ingresosBrutos = v?.ingresos ?? 0;
    const reembolsos = v?.reembolsos ?? 0;
    const ingresosNetos = ingresosBrutos - reembolsos;
    const hotmart = v?.comision_hotmart ?? 0;
    const afiliados = v?.comision_afiliados ?? 0;
    const impuestos = tasaImpuestosPct === null ? null : Math.round((Math.max(ingresosNetos, 0) * tasaImpuestosPct) / 100);
    const infra = hay('infra') ? suma('infra') : null;
    const email = hay('email') ? suma('email') : null;
    const otros = hay('dominio') || hay('otro') ? suma('dominio') + suma('otro') : null;

    const faltantes: string[] = [];
    if (impuestos === null) faltantes.push('tu tasa de impuestos');
    if (infra === null) faltantes.push('el costo de infraestructura de este mes');
    if (email === null) faltantes.push('el costo de correos de este mes');
    if (v && v.ventas_sin_comision_hotmart > 0) {
      faltantes.push(`${v.ventas_sin_comision_hotmart} venta${v.ventas_sin_comision_hotmart === 1 ? '' : 's'} donde Hotmart no mandó su comisión`);
    }

    const ganancia = ingresosNetos - hotmart - afiliados - (impuestos ?? 0) - (infra ?? 0) - (email ?? 0) - (otros ?? 0);
    salida.push({
      moneda,
      estado: faltantes.length ? 'estimacion' : 'completa',
      ingresosBrutos,
      reembolsos,
      ingresosNetos,
      hotmart,
      afiliados,
      impuestos,
      infra,
      email,
      otros,
      ganancia,
      margenPct: porcentaje(ganancia, ingresosNetos),
      faltantes,
    });
  }
  return salida.sort((a, b) => a.moneda.localeCompare(b.moneda));
}

// ───────── NEGOCIO: CAC, LTV, relación, recuperación ─────────

export interface CanalCalculado extends CanalNegocio {
  cac: number | null;
  ltv: number | null;
  ratio: number | null;
  recuperaMeses: number | null;
  ganancia: number;
  notaLtv: string | null;
  veredicto: 'invertir' | 'ajustar' | 'pausar' | 'sin_datos' | 'sin_gasto';
  frase: string;
}

export function churnMensual(ventas: Ventas): number | null {
  const b = ventas.bajas;
  const bajas = b.voluntarias + b.involuntarias + b.otras;
  if (b.activos_inicio <= 0 || bajas === 0) return null;
  return bajas / b.activos_inicio;
}

export function calcularCanales(negocio: Negocio, ventas: Ventas): CanalCalculado[] {
  const churn = churnMensual(ventas);
  return negocio.canales
    .map((c) => {
      const cac = c.gasto > 0 && c.nuevos > 0 ? Math.round(c.gasto / c.nuevos) : null;
      const ltv = c.ingreso_mensual_cliente !== null && churn !== null ? Math.round(c.ingreso_mensual_cliente / churn) : null;
      const ratio = ltv !== null && cac !== null && cac > 0 ? ltv / cac : null;
      const recuperaMeses = cac !== null && c.ingreso_mensual_cliente ? cac / c.ingreso_mensual_cliente : null;
      const notaLtv =
        churn === null ? 'Aún no hay bajas este mes: no se puede estimar cuánto dura un cliente.' : c.ingreso_mensual_cliente === null ? 'Sin compras nuevas con ciclo conocido.' : null;
      const ganancia = c.ingresos - c.comision_hotmart - c.comision_afiliados - c.gasto;
      const nombre = nombreCanal(c.canal);
      let veredicto: CanalCalculado['veredicto'];
      let frase: string;
      if (c.gasto <= 0) {
        veredicto = 'sin_gasto';
        frase = ganancia >= 0 ? 'Sin gasto anotado: lo que dejó este mes sale de ventas, sin descontar inversión.' : 'Sin gasto anotado no hay costo por cliente que medir.';
      } else if (ratio === null) {
        veredicto = 'sin_datos';
        frase = `Aún no hay datos para decidir sobre ${nombre}: faltan bajas que midan cuánto dura un cliente.${ganancia < 0 ? ` Este mes va en pérdida (${dinero(ganancia, c.moneda)}).` : ''}`;
      } else if (ganancia < 0 && ratio < 1) {
        veredicto = 'pausar';
        frase = `Pausa o cambia el anuncio de ${nombre}: por cada $1 que gastas recuperas $${ratio.toFixed(2)} en toda la vida del cliente.`;
      } else if (ganancia < 0) {
        veredicto = 'ajustar';
        frase = `${nombre} va en pérdida este mes (${dinero(ganancia, c.moneda)}), pero cada cliente recupera la inversión en ${recuperaMeses !== null ? recuperaMeses.toFixed(1) : '—'} meses: ${ratio >= 3 ? 'tiene buen futuro' : 'baja el costo por cliente'}.`;
      } else if (ratio >= 3) {
        veredicto = 'invertir';
        frase = `${nombre} funciona: por cada $1 que gastas recuperas $${ratio.toFixed(2)}. Podrías invertir más.`;
      } else {
        veredicto = 'ajustar';
        frase = `${nombre} gana, pero por debajo del 3 a 1 sano ($${ratio.toFixed(2)} por cada $1): busca bajar el costo por cliente.`;
      }
      return { ...c, cac, ltv, ratio, recuperaMeses, ganancia, notaLtv, veredicto, frase };
    })
    .sort((a, b) => b.ganancia - a.ganancia);
}

// ───────── AVISOS AL DUEÑO ─────────

export type NivelAviso = 'critico' | 'atencion' | 'info';
export interface Aviso {
  id: string;
  nivel: NivelAviso;
  titulo: string; // qué pasó
  porQue: string; // por qué importa
  queHacer: string; // qué hacer
  href?: string;
}

interface EntradaAvisos {
  ventas: Ventas;
  ganancias: Ganancia[];
  salud: Salud;
  uso: Uso;
  canales: CanalCalculado[];
}

export function calcularAvisos({ ventas, ganancias, salud, uso, canales }: EntradaAvisos): Aviso[] {
  const avisos: Aviso[] = [];

  if (salud.pagos_sin_acceso.length > 0) {
    const n = salud.pagos_sin_acceso.length;
    avisos.push({
      id: 'pagos-sin-acceso',
      nivel: 'critico',
      titulo: `${n} ${n === 1 ? 'persona pagó' : 'personas pagaron'} y no ${n === 1 ? 'tiene' : 'tienen'} cuenta en la app`,
      porQue: 'Pagaron y no pueden entrar: es la queja más común y la que termina en reembolso.',
      queHacer: 'Agrégalas con su correo en Usuarios y mándales el acceso.',
      href: '/admin/usuarios',
    });
  }

  const wh = salud.webhook.por_resultado_7d;
  if ((wh.error ?? 0) > 0) {
    avisos.push({
      id: 'webhook-falla',
      nivel: 'critico',
      titulo: `Hotmart avisó ${wh.error} ${wh.error === 1 ? 'vez' : 'veces'} y no pudimos registrarlo`,
      porQue: 'Los pagos podrían no estar dando acceso (o dándolo gratis) y tus números quedarían incompletos.',
      queHacer: 'Revisa la conexión con Hotmart en Salud y reenvía el aviso desde su panel.',
      href: '/admin/salud',
    });
  }
  if ((wh.unauthorized ?? 0) >= 3) {
    avisos.push({
      id: 'webhook-intrusos',
      nivel: 'atencion',
      titulo: `${wh.unauthorized} intentos de aviso falsos en la última semana`,
      porQue: 'Alguien está probando el punto de entrada de pagos. Se rechazaron, pero conviene estar al tanto.',
      queHacer: 'Verifica que tu clave de Hotmart (hottok) no se haya compartido; si dudas, cámbiala.',
      href: '/admin/salud',
    });
  }

  for (const g of ganancias) {
    if (g.ganancia <= 0 && (g.ingresosNetos > 0 || g.infra || g.email || g.otros)) {
      avisos.push({
        id: `margen-${g.moneda}`,
        nivel: 'critico',
        titulo: `Este mes pierdes dinero en ${g.moneda}: ${dinero(g.ganancia, g.moneda)}`,
        porQue: 'Si cada venta deja menos de lo que cuesta, vender más empeora la pérdida.',
        queHacer: 'Revisa costos y precio en Ganancia antes de gastar más en conseguir clientes.',
        href: '/admin/ganancia',
      });
    }
  }

  const b = ventas.bajas;
  const bajas = b.voluntarias + b.involuntarias;
  if (bajas >= 2 && b.involuntarias / bajas > 0.5) {
    avisos.push({
      id: 'churn-involuntario',
      nivel: 'atencion',
      titulo: `${b.involuntarias} de ${bajas} bajas fueron por pago fallido`,
      porQue: 'Estás perdiendo clientes que sí querían pagar; es lo más barato de recuperar.',
      queHacer: 'Activa los recordatorios de pago fallido y ajusta el correo de recuperación.',
      href: '/admin/ventas',
    });
  }

  for (const c of canales) {
    if (c.gasto > 0 && c.ganancia < 0) {
      avisos.push({
        id: `canal-${c.canal}-${c.moneda}`,
        nivel: 'atencion',
        titulo: `${nombreCanal(c.canal)} te cuesta más de lo que deja este mes`,
        porQue: `Gastaste ${dinero(c.gasto, c.moneda)} y sus clientes dejaron ${dinero(c.ingresos - c.comision_hotmart - c.comision_afiliados, c.moneda)} netos de comisiones.`,
        queHacer: 'Pausa el gasto en ese canal o cambia el anuncio antes de seguir invirtiendo.',
        href: '/admin/negocio',
      });
    } else if (c.ratio !== null && c.ratio < 1) {
      avisos.push({
        id: `canal-ratio-${c.canal}-${c.moneda}`,
        nivel: 'atencion',
        titulo: `${nombreCanal(c.canal)} trae clientes que cuestan más de lo que dejan`,
        porQue: `Por cada $1 que gastas en conseguirlos, recuperas $${c.ratio.toFixed(2)} en toda su vida como clientes.`,
        queHacer: 'Pausa el gasto ahí y compara con tus otros canales.',
        href: '/admin/negocio',
      });
    }
  }

  const peor = salud.errores[0];
  if (peor && (peor.usuarios >= 3 || peor.n >= 10)) {
    avisos.push({
      id: 'errores-alza',
      nivel: 'atencion',
      titulo: `${peor.usuarios} ${peor.usuarios === 1 ? 'persona chocó' : 'personas chocaron'} con el mismo error`,
      porQue: 'Un error repetido suele significar que algo se rompió para mucha gente.',
      queHacer: 'Revisa el error más común en Salud y avísame para corregirlo.',
      href: '/admin/salud',
    });
  }

  if (uso.pagadores_fantasma > 0) {
    avisos.push({
      id: 'pagadores-fantasma',
      nivel: 'info',
      titulo: `${uso.pagadores_fantasma} ${uso.pagadores_fantasma === 1 ? 'suscriptor paga' : 'suscriptores pagan'} pero no ${uso.pagadores_fantasma === 1 ? 'entra' : 'entran'} hace 14 días o más`,
      porQue: 'Son los que más probablemente cancelen en su próxima renovación.',
      queHacer: 'Escríbeles un recordatorio con el beneficio que están dejando pasar.',
      href: '/admin/uso',
    });
  }

  const orden: Record<NivelAviso, number> = { critico: 0, atencion: 1, info: 2 };
  return avisos.sort((a, b2) => orden[a.nivel] - orden[b2.nivel]);
}
