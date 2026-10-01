'use client';

// Landing de ventas — copy MARCADO de docs/copy/landing.md (trazado a FICHA-AVATAR.md).
// Modelo 2 (02C): el CTA lleva a /onboarding. Nombre de marca provisional en BRAND.

import { CalendarX, CircleHelp, FileSpreadsheet, FileWarning, Clock3, HandCoins } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Garantia } from '@/components/landing/Garantia';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile } from '@/components/landing/ui';
import { AppMockInicio } from '@/components/AppMockInicio';
import { Logo } from '@/components/Logo';
import { SemaforoVisual } from '@/components/SemaforoVisual';

const BRAND = 'Commission Guard'; // provisional — el nombre final lo elige el usuario
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Empezar mis 14 días gratis';

export default function Landing() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero
        appName={BRAND}
        logo={<Logo />}
        loginHref="/entrar"
        h1Marked="[acento]Ninguna comisión[/acento] se te vence sin que lo sepas"
        subtitleMarked="El Semáforo de Comisiones te avisa antes de que venza [b]cada plazo[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span className="text-balance">Hecho para agentes de agencias Host en México. Tarjeta al empezar, sin cobro hoy.</span>}
        visual={
          <div>
            <AppMockInicio />
            <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">Vista de ejemplo con datos ficticios</p>
          </div>
        }
      />

      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: CircleHelp, textoMarked: '¿No sabes si la comisión de aquel viaje [b]ya cayó[/b]?' },
          { icon: FileWarning, textoMarked: '¿Se te pasó [b]dar de alta[/b] una venta en el portal?' },
          { icon: FileSpreadsheet, textoMarked: '¿Tu Excel es un caos que en el celular no se lee?' },
          { icon: CalendarX, textoMarked: '¿Tus fechas de viaje y de cobro están [b]revueltas[/b]?' },
        ]}
      />

      <Agitacion
        iconos={[Clock3, Clock3, HandCoins, FileWarning]}
        frases={[
          'De noche, en la cama: ¿aquel viaje [b]ya te pagó[/b] la comisión?',
          'Cada venta corre [b]tres relojes[/b]: alta, pago y reclamo.',
          'Trabajar el viaje entero para terminar [b]trabajando de a gratis[/b].',
          'Si dejas vencer el plazo de reclamo, [acento]ya no puedes pedirla[/acento].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Excel, WhatsApp y portal: tres lugares y ningún aviso a tiempo.',
          labelFuturo: 'Si nada cambia',
          futuro: 'El mismo desorden, con más meses de comisiones sin revisar.',
        }}
      />

      <Solucion
        tituloMarked="[acento]Un semáforo[/acento] para cada comisión"
        mecanismo="el Semáforo de Comisiones"
        bigIdeaMarked="No es descuido: cada plazo vive en un lugar distinto. El Semáforo los junta y [b]te avisa antes de que venzan[/b]."
        pasos={[
          { titulo: 'Registra la venta', detalle: 'Los datos clave, en segundos.' },
          { titulo: 'El Semáforo cuenta', detalle: 'Alta, pago y reclamo, con su fecha.' },
          { titulo: 'Actúas a tiempo', detalle: 'Dorado a 5 días; rojo si venció.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Excel pasivo y fechas en tu cabeza.',
          labelDespues: 'Después',
          despues: 'Cada venta con su estatus y su aviso a tiempo.',
        }}
      />

      <SemaforoVisual />

      <AppPorDentro
        kicker="VISTAS DE EJEMPLO DE LA APP"
        tituloMarked="Tu negocio, [acento]a un vistazo[/acento]"
        frames={[
          { src: '/mock/nueva-reserva.png', alt: 'Vista de ejemplo: formulario de nueva reserva', label: 'Registra una venta en segundos' },
          { src: '/mock/resultado.png', alt: 'Vista de ejemplo: plazos programados de una reserva', label: 'Tu primera reserva, ya vigilada' },
          { src: '/mock/calendario.png', alt: 'Vista de ejemplo: calendario del mes', label: 'Viajes y cobros en un calendario' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      <Oferta
        tituloMarked="Empieza gratis. Protege [acento]cada comisión[/acento]"
        trialDias={14}
        anual={{
          nombre: 'Anual',
          badge: 'RECOMENDADO',
          precioMes: '$99',
          sufijo: 'MXN/mes',
          totalAnual: 'Se cobra $1,190 MXN al año',
          ahorro: 'Ahorras 4 meses',
          descomposicionDia: 'menos de $3.30 MXN al día',
          ctaLabel: 'Empezar mis 14 días gratis',
          ctaHref: '/onboarding?plan=anual',
          features: [
            'Avisos por correo y notificación antes de cada plazo',
            'Semáforo de plazos: alta, pago y reclamo',
            'Tabla de reservas con filtros y orden',
            'Calendario de viajes y de cobros',
            'Funciona en celular y en computadora',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$149',
          sufijo: 'MXN/mes',
          ctaLabel: 'Elegir mensual',
          ctaHref: '/onboarding?plan=mensual',
          features: [
            'Avisos por correo y notificación antes de cada plazo',
            'Semáforo de plazos: alta, pago y reclamo',
            'Tabla de reservas con filtros y orden',
            'Calendario de viajes y de cobros',
            'Cancelas cuando quieras',
          ],
        }}
      />

      <p className="bg-[var(--bg)] px-5 pb-10 text-center text-sm text-[var(--text-secondary)]">
        Tarjeta al empezar, sin cobro hoy. Si cancelas antes de los 14 días, no pagas nada.
      </p>

      <Garantia
        nombre="Prueba de 14 días sin riesgo"
        condicionMarked="Pruébalo 14 días sin cobro. Si no te sirve, [b]cancelas antes[/b] y no pagas nada."
      />

      <Faq
        items={[
          {
            pregunta: '¿Por qué no sigo con mi Excel gratis?',
            respuestaMarked:
              'Excel guarda datos, pero [b]no te avisa[/b]. El Semáforo cuenta los plazos de cada venta y te alerta antes de que venzan.',
          },
          {
            pregunta: '¿Tengo que capturar todo dos veces?',
            respuestaMarked:
              'Capturas una vez. El portal de tu agencia sigue siendo tuyo: [b]la app no lo reemplaza[/b], te recuerda usarlo a tiempo.',
          },
          {
            pregunta: '¿Funciona con mi agencia y en computadora?',
            respuestaMarked:
              'Empezamos con [b]Archer México y Latinoamérica[/b]; otras agencias vendrán después. Funciona en el navegador de tu celular y de tu computadora.',
          },
          {
            pregunta: '¿Y si no me sirve?',
            respuestaMarked:
              'Tienes [b]14 días gratis[/b]. Te pedimos tu tarjeta al empezar, pero no se cobra hoy; si cancelas antes, no pagas nada.',
          },
          {
            pregunta: '¿Vale la pena pagar otra suscripción?',
            respuestaMarked:
              'Cuesta [b]menos de $3.30 MXN al día[/b]. Una sola comisión que no dejes vencer puede cubrir varios meses de la app.',
          },
          {
            pregunta: '¿Qué pasa con los datos de mis clientes?',
            respuestaMarked:
              'Guardamos solo lo que tú registras y no vendemos tus datos. Lo detallamos en el aviso de privacidad.',
          },
        ]}
      />

      <CtaFinal
        h2Marked="Duerme sabiendo que [acento]nada se vence[/acento]"
        futurePacingMarked="Mañana registras tu primera venta y el Semáforo empieza a vigilar cada plazo por ti."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="14 días gratis · tarjeta al empezar, sin cobro hoy · cancela cuando quieras"
        psMarked="PS: Cada venta que registres hoy tiene sus plazos vigilados desde el primer día. Empieza con 14 días gratis y decide después."
      />

      <FooterLegal
        appName={BRAND}
        logo={<Logo tono="neutro" />}
        soporteEmail="soporte@tu-dominio.mx"
        aviso="No estamos afiliados a Archer ni a ninguna agencia Host. Los nombres se mencionan solo para indicar con qué reglas de plazos funciona la app."
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
