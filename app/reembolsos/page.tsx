import type { Metadata } from 'next';
import Link from 'next/link';
import { Lista, PaginaLegal, Seccion } from '@/components/legal/PaginaLegal';
import { PRECIOS, SOPORTE_EMAIL } from '@/lib/legal';

export const metadata: Metadata = { title: 'Cancelación y reembolsos — AgentTrack', description: 'Cómo cancelar tu suscripción de AgentTrack y cómo pedir un reembolso.' };

const enlace = 'font-semibold text-[var(--accent)] underline underline-offset-4';

export default function Reembolsos() {
  return (
    <PaginaLegal
      titulo="Cancelación y reembolsos"
      actual="/reembolsos"
      resumen={
        <>
          <p>Tienes {PRECIOS.prueba} gratis para probar. Si cancelas antes de que terminen, no se te cobra nada.</p>
          <p>Cancelas tú misma en unos minutos, desde Hotmart (que es quien cobra). Cancelar detiene los cobros futuros. Si te llegó un cobro que no esperabas, escríbenos dentro de los 7 días siguientes y revisamos tu caso.</p>
        </>
      }
    >
      <Seccion n={1} titulo="Tu prueba gratis">
        <p>
          Al empezar te pedimos tu tarjeta, pero <b>durante los {PRECIOS.prueba} de prueba no se cobra nada</b>. El primer cobro ocurre al terminar la prueba, y te avisamos por correo unos días antes. Si cancelas antes
          de ese momento, no pagas.
        </p>
      </Seccion>

      <Seccion n={2} titulo="Cuánto cuesta y cuándo se renueva">
        <Lista
          items={[
            <>
              <b>Mensual:</b> {PRECIOS.mensual}. Se renueva cada mes.
            </>,
            <>
              <b>Anual:</b> {PRECIOS.anual}. Se renueva cada año.
            </>,
            'La renovación es automática hasta que canceles. El cobro lo hace Hotmart con la tarjeta que diste al empezar.',
          ]}
        />
      </Seccion>

      <Seccion n={3} titulo="Cómo cancelar, paso a paso">
        <p>Puedes cancelar cuando quieras, sin llamar a nadie y sin dar explicaciones:</p>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 marker:font-bold marker:text-[var(--accent)]">
          <li>
            Entra a{' '}
            <a href="https://consumer.hotmart.com" target="_blank" rel="noopener noreferrer" className={enlace}>
              consumer.hotmart.com
            </a>{' '}
            con el mismo correo con el que compraste. Si no recuerdas tu contraseña de Hotmart, usa <b>Olvidé mi contraseña</b>.
          </li>
          <li>
            En <b>Mis compras</b>, busca <b>AgentTrack</b> y pulsa <b>Mostrar detalles</b>.
          </li>
          <li>
            En tu transacción, pulsa <b>Configurar forma de pago</b>.
          </li>
          <li>
            Pulsa <b>Cancelar tu suscripción</b> y confirma con <b>Sí</b>.
          </li>
          <li>Hotmart te confirma la cancelación por correo. Guárdalo.</li>
        </ol>
        <p>
          Al cancelar <b>se detienen los cobros futuros</b>, y en general conservas el acceso hasta el final del periodo que ya está cubierto (la prueba o el mes o año pagado). Si no encuentras el correo de Hotmart o algo no te deja cancelar, escríbenos a{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className={enlace}>
            {SOPORTE_EMAIL}
          </a>{' '}
          y te ayudamos el mismo día hábil.
        </p>
        <p>
          <b>Antes de cancelar puedes llevarte tus datos:</b> en <b>Mi cuenta → Descargar mis reservas en Excel</b> sacas todas tus reservas en un archivo. Cancelar la suscripción es distinto de borrar tu cuenta: tu cuenta y tus reservas se conservan para cuando quieras volver. Si también quieres borrar tus datos, usa <b>Mi cuenta → Eliminar mi cuenta</b> dentro
          de la app. <b>Antes de eliminarla, cancela tu suscripción en Hotmart</b>, porque borrar la cuenta no detiene los cobros.
        </p>
      </Seccion>

      <Seccion n={4} titulo="Reembolsos">
        <p>
          El cobro de tu suscripción lo procesa Hotmart y se rige por sus reglas. Según esas reglas, la garantía de devolución se aplica a la <b>compra inicial</b>, y <b>cancelar evita los cobros futuros pero no devuelve
          lo que ya se cobró</b>. Esto significa:
        </p>
        <Lista
          items={[
            <>
              <b>Lo normal es cancelar, no pedir reembolso:</b> como empiezas con {PRECIOS.prueba} sin costo, si no te convence cancelas antes de que terminen y no pagas nada.
            </>,
            <>
              <b>Garantía de 7 días de Hotmart:</b> la compra inicial tiene una garantía de 7 días. Como esa compra inicial es la prueba gratis, en ese momento no hay dinero que devolver.
            </>,
            <>
              <b>Si te llegó un primer cobro que no esperabas:</b> escríbenos a {SOPORTE_EMAIL} dentro de los 7 días siguientes al cobro. Hotmart no siempre devuelve cobros posteriores a la compra inicial, pero revisamos cada
              caso de buena fe y, si procede, te lo devolvemos.
            </>,
            <>
              <b>Cobro por error o repetido:</b> si crees que se te cobró algo que no corresponde, escríbenos con el comprobante. Lo revisamos y, si procede, lo devolvemos.
            </>,
          ]}
        />
        <p>Cuando hay una devolución, llega al mismo método de pago que usaste. El tiempo en que aparece depende de tu banco y de Hotmart.</p>
        <p>Si se aprueba un reembolso o hay un contracargo, tu acceso de pago se termina y tus datos siguen disponibles para exportarlos o borrarlos, según lo que pidas.</p>
      </Seccion>

      <Seccion n={5} titulo="Cambios de precio">
        <p>
          Si cambia el precio, te avisamos por correo con al menos 30 días de anticipación. El nuevo precio aplica a tu siguiente renovación, y puedes cancelar antes si no estás de acuerdo.
        </p>
      </Seccion>

      <Seccion n={6} titulo="Más información">
        <p>
          Estas condiciones forman parte de los{' '}
          <Link href="/terminos" className={enlace}>
            términos y condiciones
          </Link>
          . Para cualquier duda sobre un cobro, escríbenos a {SOPORTE_EMAIL}.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
