import type { Metadata } from 'next';
import Link from 'next/link';
import { Lista, PaginaLegal, Seccion } from '@/components/legal/PaginaLegal';
import { PRECIOS, RESPONSABLE, SITIO_WEB, SOPORTE_EMAIL, UBICACION } from '@/lib/legal';

export const metadata: Metadata = { title: 'Términos y condiciones — AgentTrack', description: 'Las reglas de uso de AgentTrack, escritas en lenguaje simple.' };

export default function Terminos() {
  return (
    <PaginaLegal
      titulo="Términos y condiciones"
      actual="/terminos"
      resumen={
        <>
          <p>AgentTrack es una herramienta que te recuerda tus plazos: dar de alta ventas, cobrar a tus clientes y reclamar tus comisiones.</p>
          <p>No cobra por ti, no habla con tu agencia y no garantiza que recibas una comisión. Tú sigues siendo quien registra y reclama.</p>
          <p>La suscripción se renueva sola y puedes cancelarla cuando quieras, desde Hotmart.</p>
        </>
      }
    >
      <Seccion n={1} titulo="Quién ofrece AgentTrack">
        <p>
          AgentTrack ({SITIO_WEB}) es operada por <b>{RESPONSABLE}</b>, persona física, con domicilio en {UBICACION}. Puedes escribirnos a{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className="font-semibold text-[var(--accent)] underline underline-offset-4">
            {SOPORTE_EMAIL}
          </a>
          . Al usar AgentTrack aceptas estos términos y el{' '}
          <Link href="/privacidad" className="font-semibold text-[var(--accent)] underline underline-offset-4">
            aviso de privacidad
          </Link>
          .
        </p>
      </Seccion>

      <Seccion n={2} titulo="Qué es AgentTrack y qué no es">
        <p>Es una aplicación web para agentes de viajes independientes. Te ayuda a:</p>
        <Lista
          items={[
            'Registrar tus ventas y los datos de cada reserva.',
            'Ver los plazos de cada una: alta en el portal, pagos pendientes del cliente, salida del viaje, revisión y reclamo de comisión.',
            'Recibir avisos dentro de la app y por correo electrónico.',
          ]}
        />
        <p>Lo que AgentTrack <b>no</b> es ni hace:</p>
        <Lista
          items={[
            'No está afiliada a Archer ni a ninguna agencia Host o proveedor de viajes. Esos nombres se usan solo para indicar con qué reglas de plazos puede funcionar la app.',
            'No registra tus ventas en el portal de tu agencia, no cobra comisiones y no mueve dinero de nadie.',
            'No es asesoría legal, fiscal ni financiera.',
            'No vende ni reserva viajes.',
          ]}
        />
      </Seccion>

      <Seccion n={3} titulo="Los plazos son una guía tuya, no una garantía">
        <p>
          Los plazos que muestra la app (por ejemplo, 30 días para dar de alta una venta, 60 días después del viaje para pedir revisión y 18 meses para reclamar) se toman de las reglas que tú nos
          indicaste y que hoy usa tu agencia. <b>Las agencias pueden cambiar sus reglas.</b> Antes de depender de una fecha, confírmala con tu agencia.
        </p>
        <p>
          Los avisos pueden retrasarse o no llegar (por ejemplo, si tu correo los manda a spam, si no tienes internet o si un servicio externo falla). Por eso no podemos garantizar que recibas todos los avisos,
          ni que cobres una comisión determinada. Tú eres la responsable de registrar, dar de alta y reclamar a tiempo; AgentTrack es una ayuda para recordártelo.
        </p>
      </Seccion>

      <Seccion n={4} titulo="Quién puede usar AgentTrack">
        <p>Solo personas mayores de 18 años que usen la app para su actividad profesional. Al crear tu cuenta confirmas que cumples con esto y que los datos que das son verdaderos.</p>
      </Seccion>

      <Seccion n={5} titulo="Tu cuenta">
        <p>
          Entras con tu correo, sin contraseña: te mandamos un enlace o un código de un solo uso. Cuida tu bandeja de correo: quien tenga acceso a ella puede entrar a tu cuenta. Si crees que alguien más entró, escríbenos
          de inmediato.
        </p>
      </Seccion>

      <Seccion n={6} titulo="Los datos que registras">
        <p>
          Lo que registras en la app es tuyo. Nos das permiso de guardarlo y usarlo solo para darte el servicio (mostrarte tus reservas y mandarte tus avisos). No vendemos tus datos.
        </p>
        <p>
          Al registrar una reserva guardas datos de tus clientes, como su nombre y su teléfono. <b>Tú eres la responsable de esos datos</b>: debes tener su permiso o una razón legítima para guardarlos, y avisarles
          cómo los usas. AgentTrack los guarda por cuenta tuya, solo para mostrártelos a ti. Te recomendamos registrar solo lo necesario y no escribir información sensible (como datos de salud, contraseñas o números
          de tarjeta) en los campos de la reserva.
        </p>
      </Seccion>

      <Seccion n={7} titulo="Uso aceptable">
        <p>No puedes:</p>
        <Lista
          items={[
            'Intentar entrar a cuentas o datos de otras personas.',
            'Usar la app para actividades ilegales o para engañar a clientes o agencias.',
            'Hacer pruebas de seguridad, copiar o revender la app, o saturarla con automatizaciones.',
            'Compartir tu cuenta para que otras personas la usen sin pagar.',
          ]}
        />
      </Seccion>

      <Seccion n={8} titulo="Precio, prueba gratis y renovación">
        <Lista
          items={[
            <>
              <b>Prueba gratis de {PRECIOS.prueba}:</b> se te pide tu tarjeta al empezar, pero no se cobra nada durante la prueba. Si cancelas antes de que termine, no pagas.
            </>,
            <>
              <b>Planes:</b> {PRECIOS.mensual} o {PRECIOS.anual}, en pesos mexicanos. Los precios pueden cambiar; si cambian, te avisamos por correo con al menos 30 días de anticipación y el cambio aplica a tu
              siguiente renovación.
            </>,
            <>
              <b>Renovación automática:</b> al terminar la prueba, y después cada mes o cada año según tu plan, se cobra tu suscripción de forma automática hasta que la canceles.
            </>,
            <>
              <b>Cobros:</b> los procesa Hotmart, que es quien guarda tu tarjeta y te da el comprobante. AgentTrack no ve ni guarda los datos de tu tarjeta.
            </>,
          ]}
        />
        <p>
          La forma de cancelar y de pedir un reembolso está explicada paso a paso en{' '}
          <Link href="/reembolsos" className="font-semibold text-[var(--accent)] underline underline-offset-4">
            Cancelación y reembolsos
          </Link>
          .
        </p>
      </Seccion>

      <Seccion n={9} titulo="Tiempo gratis dado por nosotros">
        <p>A veces damos acceso gratis por un tiempo (por ejemplo, 14 días, un mes o sin límite). Ese acceso puede terminar o cambiar con previo aviso, y no genera ningún cobro.</p>
      </Seccion>

      <Seccion n={10} titulo="Cuándo podemos suspender una cuenta">
        <p>
          Podemos suspender o cerrar una cuenta si se incumplen estos términos, si hay un uso que ponga en riesgo la app o a otras personas, o si un pago se revierte por reembolso o contracargo. Cuando sea posible, te
          avisaremos antes y te daremos oportunidad de explicar lo ocurrido.
        </p>
      </Seccion>

      <Seccion n={11} titulo="Disponibilidad y cambios en la app">
        <p>
          Trabajamos para que AgentTrack esté disponible siempre, pero no podemos prometer que nunca fallará ni que no habrá mantenimientos. Podemos mejorar, cambiar o quitar funciones. Si quitamos algo importante de tu
          plan, te avisaremos.
        </p>
      </Seccion>

      <Seccion n={12} titulo="Límite de responsabilidad">
        <p>
          AgentTrack se ofrece &ldquo;como está&rdquo;. En la medida que permite la ley, no somos responsables de comisiones que se pierdan por plazos vencidos, avisos que no llegaron, cambios de reglas de tu agencia, errores
          en datos que tú capturaste o decisiones que tomes con base en la app. Nuestra responsabilidad total frente a ti, si llegara a existir, se limita a lo que hayas pagado por la app en los 12 meses anteriores al
          problema. Esto no limita derechos que la ley de protección al consumidor te reconozca y que no se puedan renunciar.
        </p>
      </Seccion>

      <Seccion n={13} titulo="Propiedad de la app">
        <p>
          El diseño, el código, el nombre y el logotipo de AgentTrack pertenecen a {RESPONSABLE}. Te damos una licencia personal, no exclusiva e intransferible para usar la app mientras tengas tu cuenta activa. Tus datos
          y tus reservas siguen siendo tuyos.
        </p>
      </Seccion>

      <Seccion n={14} titulo="Cambios a estos términos">
        <p>
          Si cambiamos estos términos en algo importante, te avisaremos por correo con al menos 15 días de anticipación y te pediremos aceptar la nueva versión. La fecha de arriba siempre indica cuándo se actualizaron por
          última vez.
        </p>
      </Seccion>

      <Seccion n={15} titulo="Ley aplicable y dudas">
        <p>
          Estos términos se rigen por las leyes de México. Para cualquier controversia, las partes se someten a los tribunales competentes de {UBICACION}, sin perjuicio de los derechos que la Ley Federal de Protección
          al Consumidor te reconozca y de tu derecho a acudir a la Procuraduría Federal del Consumidor (Profeco). Antes de cualquier trámite, escríbenos a {SOPORTE_EMAIL}: preferimos resolverlo contigo directamente.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
