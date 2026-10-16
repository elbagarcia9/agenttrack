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
          <p>Cancelas tú misma, en unos minutos, desde Hotmart (que es quien cobra). Si te cobraron y no querías, puedes pedir el reembolso dentro del plazo de Hotmart.</p>
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
            Busca el correo de confirmación de compra que te mandó <b>Hotmart</b> cuando empezaste (revisa también spam).
          </li>
          <li>
            Dentro de ese correo, entra a <b>Acceder a mi compra</b> o <b>Gestionar mi suscripción</b>. También puedes entrar a{' '}
            <a href="https://consumer.hotmart.com" target="_blank" rel="noopener noreferrer" className={enlace}>
              consumer.hotmart.com
            </a>{' '}
            con el mismo correo con el que compraste.
          </li>
          <li>
            Elige la suscripción de AgentTrack y pulsa <b>Cancelar suscripción</b>.
          </li>
          <li>Hotmart te confirma la cancelación por correo. Guárdalo.</li>
        </ol>
        <p>
          Al cancelar, <b>conservas el acceso hasta el final del periodo que ya pagaste</b>. Si no encuentras el correo de Hotmart o algo no te deja cancelar, escríbenos a{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className={enlace}>
            {SOPORTE_EMAIL}
          </a>{' '}
          y te ayudamos el mismo día hábil.
        </p>
        <p>
          Cancelar la suscripción es distinto de borrar tu cuenta: tu cuenta y tus reservas se conservan para cuando quieras volver. Si también quieres borrar tus datos, usa <b>Mi cuenta → Eliminar mi cuenta</b> dentro
          de la app. <b>Antes de eliminarla, cancela tu suscripción en Hotmart</b>, porque borrar la cuenta no detiene los cobros.
        </p>
      </Seccion>

      <Seccion n={4} titulo="Reembolsos">
        <p>El cobro de tu suscripción lo procesa Hotmart y se rige también por su política de garantía y devoluciones al consumidor. Esto significa:</p>
        <Lista
          items={[
            <>
              <b>Derecho de arrepentimiento:</b> si te cobraron y no quieres continuar, puedes pedir la devolución dentro del plazo que Hotmart establece para tu compra (normalmente 7 días naturales desde el cobro). Pídela
              desde tu compra en Hotmart o escríbenos y te ayudamos a hacerlo.
            </>,
            <>
              <b>Cobro por error o repetido:</b> si crees que se te cobró algo que no corresponde, escríbenos a {SOPORTE_EMAIL} con el comprobante. Lo revisamos y, si procede, lo devolvemos.
            </>,
            <>
              <b>Después del plazo:</b> no ofrecemos devoluciones de periodos ya usados, pero puedes cancelar para que no se cobre el siguiente.
            </>,
          ]}
        />
        <p>El reembolso llega al mismo método de pago que usaste. El tiempo en que aparece depende de tu banco y de Hotmart.</p>
        <p>
          Si se aprueba un reembolso o hay un contracargo, tu acceso de pago se termina y tus datos siguen disponibles para exportarlos o borrarlos, según lo que pidas.
        </p>
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
