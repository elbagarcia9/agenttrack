import type { Metadata } from 'next';
import Link from 'next/link';
import { Lista, PaginaLegal, Seccion } from '@/components/legal/PaginaLegal';
import { PROVEEDORES, RESPONSABLE, SITIO_WEB, SOPORTE_EMAIL, UBICACION } from '@/lib/legal';

export const metadata: Metadata = { title: 'Aviso de privacidad — AgentTrack', description: 'Qué datos guarda AgentTrack, para qué, con quién se comparten y cómo borrarlos.' };

const enlace = 'font-semibold text-[var(--accent)] underline underline-offset-4';

export default function Privacidad() {
  return (
    <PaginaLegal
      titulo="Aviso de privacidad"
      actual="/privacidad"
      resumen={
        <>
          <p>Guardamos solo lo que tú registras para recordarte tus plazos. No vendemos tus datos ni los usamos para publicidad.</p>
          <p>Puedes pedir ver, corregir o borrar tus datos cuando quieras. Para borrar tu cuenta tienes un botón en la app, en Mi cuenta.</p>
        </>
      }
    >
      <Seccion n={1} titulo="Quién es la responsable de tus datos">
        <p>
          <b>{RESPONSABLE}</b>, persona física, con domicilio en {UBICACION}, es la responsable del tratamiento de tus datos personales en AgentTrack ({SITIO_WEB}). Contacto para cualquier tema de privacidad:{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className={enlace}>
            {SOPORTE_EMAIL}
          </a>
          .
        </p>
      </Seccion>

      <Seccion n={2} titulo="Qué datos guardamos">
        <p>
          <b>De ti:</b>
        </p>
        <Lista
          items={[
            'Tu correo electrónico y tu nombre.',
            'Tu agencia y la hora a la que prefieres recibir avisos.',
            'El estado de tu suscripción (si está activa, en prueba o cancelada) y el plan elegido. Los datos de tu tarjeta los guarda Hotmart; nosotros no los vemos.',
            'Cuándo entras a la app y los errores que te salen, para saber si algo falla.',
            'Si decides contestar la encuesta de salida, tus respuestas.',
            'La fecha y la versión de los documentos que aceptaste.',
          ]}
        />
        <p>
          <b>De tus clientes, lo que tú registres en cada reserva:</b>
        </p>
        <Lista items={['Nombre y datos de contacto (por ejemplo, teléfono).', 'Destino, tipo de reserva, proveedor, fechas de compra y de viaje.', 'Precio de venta, comisión y pagos pendientes.', 'Tus comentarios.']} />
        <p>
          No pedimos datos sensibles (como salud, creencias o datos biométricos). Te pedimos no escribirlos en los comentarios de las reservas. Esos datos de tus clientes los guardamos por cuenta tuya, solo para
          mostrártelos a ti; tú eres quien decide qué registrar y debes contar con su permiso o una razón legítima para hacerlo.
        </p>
        <p>
          Para medir qué partes de la app se usan, guardamos pasos de navegación anónimos (por ejemplo, &ldquo;vio la pantalla de planes&rdquo;). Esos registros <b>no incluyen</b> nombres de clientes, contactos ni
          datos de tus reservas.
        </p>
      </Seccion>

      <Seccion n={3} titulo="Para qué usamos tus datos">
        <p>Para lo necesario para darte el servicio:</p>
        <Lista
          items={[
            'Crear tu cuenta y dejarte entrar.',
            'Mostrarte tus reservas, calendario y alertas.',
            'Mandarte avisos por correo con tus plazos, el aviso de que tu prueba o tiempo gratis termina y, si no continúas, la encuesta de salida.',
            'Cobrarte la suscripción y atender tus dudas o solicitudes.',
            'Mantener la app segura y corregir fallas.',
          ]}
        />
        <p>
          No usamos tus datos para publicidad, no los vendemos y no los usamos para entrenar inteligencia artificial. Hoy AgentTrack no usa inteligencia artificial sobre tus datos; si algún día lo hiciera, te avisaríamos
          antes y te pediríamos aceptar el cambio.
        </p>
      </Seccion>

      <Seccion n={4} titulo="Con quién se comparten (y dónde están)">
        <p>Para operar usamos estos proveedores, que procesan datos por cuenta de AgentTrack y solo para la función indicada:</p>
        <div className="overflow-x-auto rounded-[var(--radius-card)] tarjeta-suave">
          <table className="w-full min-w-lg border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                <th className="p-3 font-semibold">Proveedor</th>
                <th className="p-3 font-semibold">Para qué</th>
                <th className="p-3 font-semibold">País</th>
              </tr>
            </thead>
            <tbody>
              {PROVEEDORES.map((p) => (
                <tr key={p.nombre} className="border-t border-black/5">
                  <th scope="row" className="p-3 font-bold">
                    {p.nombre}
                  </th>
                  <td className="p-3">{p.funcion}</td>
                  <td className="p-3">{p.pais}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Esto significa que tus datos pueden almacenarse y tratarse <b>fuera de México</b> (Estados Unidos y Brasil). Al aceptar este aviso consientes esas transferencias, que son necesarias para darte el servicio.
          Hotmart, además, trata tus datos de pago bajo su propia política de privacidad.
        </p>
        <p>
          Fuera de estos proveedores, solo compartiríamos tus datos si una autoridad competente lo exige por ley. No los compartimos con tu agencia ni con otras personas.
        </p>
      </Seccion>

      <Seccion n={5} titulo="Cookies y almacenamiento en tu navegador">
        <p>
          Usamos solo lo necesario: la sesión que te mantiene dentro de tu cuenta y algunas preferencias guardadas en tu navegador (por ejemplo, tus reservas de ejemplo o la hora de aviso). <b>No usamos cookies de
          publicidad ni de seguimiento de terceros</b>, por eso no te mostramos un aviso de cookies con botones de aceptar o rechazar.
        </p>
      </Seccion>

      <Seccion n={6} titulo="Cuánto tiempo guardamos tus datos">
        <p>
          Mientras tengas tu cuenta. Si la eliminas, borramos tus datos de la app en ese momento. Pueden quedar copias de respaldo del proveedor por un tiempo limitado hasta que se sobrescriben solas. Lo único que
          no se borra es el registro de tus pagos (en AgentTrack y en Hotmart), porque la ley fiscal exige conservarlo durante cierto tiempo.
        </p>
      </Seccion>

      <Seccion n={7} titulo="Tus derechos (ARCO)">
        <p>Tienes derecho a:</p>
        <Lista
          items={[
            <>
              <b>Acceder</b> a tus datos y saber cómo los usamos, y <b>llevártelos</b>: en Mi cuenta puedes descargar todas tus reservas en un archivo de Excel.
            </>,
            <>
              <b>Rectificarlos</b> si están mal o incompletos (puedes editarlos tú misma en la app).
            </>,
            <>
              <b>Cancelarlos</b>, es decir, pedir que los borremos.
            </>,
            <>
              <b>Oponerte</b> a que los usemos para algo, y retirar tu consentimiento.
            </>,
          ]}
        />
        <p>
          <b>Cómo ejercerlos:</b> para borrar todo, entra a la app, abre <b>Mi cuenta</b> y pulsa <b>Eliminar mi cuenta</b>. Para lo demás, escríbenos a{' '}
          <a href={`mailto:${SOPORTE_EMAIL}`} className={enlace}>
            {SOPORTE_EMAIL}
          </a>{' '}
          con tu nombre y el correo de tu cuenta, y qué quieres pedir. Te respondemos en un máximo de 20 días hábiles. Para dejar de recibir los avisos por correo, usa el enlace &ldquo;Dejar de recibir avisos&rdquo; que
          viene al final de cada correo.
        </p>
        <p>Si crees que tus derechos no fueron atendidos, puedes acudir a la autoridad mexicana de protección de datos personales.</p>
      </Seccion>

      <Seccion n={8} titulo="Seguridad">
        <p>
          Protegemos tus datos con conexión cifrada, acceso a tu cuenta por enlace o código de un solo uso (o por una contraseña opcional, que guardamos cifrada y que ni nosotros podemos leer) y reglas en la base de datos para que cada persona vea únicamente sus propios registros. Ningún sistema es
          100% infalible; si llegara a ocurrir una vulneración que te afecte de forma importante, te lo avisaremos.
        </p>
      </Seccion>

      <Seccion n={9} titulo="Menores de edad">
        <p>AgentTrack es una herramienta profesional para mayores de 18 años. No recopilamos datos de menores a propósito; si descubrimos que una cuenta es de un menor, la eliminamos.</p>
      </Seccion>

      <Seccion n={10} titulo="Cambios a este aviso">
        <p>
          Si cambiamos este aviso en algo importante, te avisaremos por correo antes de que aplique y te pediremos aceptar la nueva versión. La fecha de arriba indica la última actualización. Puedes leer también los{' '}
          <Link href="/terminos" className={enlace}>
            términos y condiciones
          </Link>
          .
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
