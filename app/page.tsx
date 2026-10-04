'use client';

// Landing de ventas — copy MARCADO de docs/copy/landing.md (trazado a FICHA-AVATAR.md).
// Modelo 2 (02C): el CTA lleva a /onboarding. Nombre de marca provisional en BRAND.

import { CalendarX, CircleHelp, FileSpreadsheet, FileWarning, HandCoins, Repeat } from 'lucide-react';
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
import { AvisosAsistente } from '@/components/AvisosAsistente';
import { ImportarExcel } from '@/components/ImportarExcel';

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
        subtitleMarked="Tu asistente vigila cada comisión y te avisa antes de que venza [b]cada plazo[/b]"
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
          { icon: CircleHelp, textoMarked: '¿No recuerdas si esa comisión que te deben [b]ya es tiempo de reclamarla[/b]?' },
          { icon: FileWarning, textoMarked: '¿Se te pasó [b]dar de alta[/b] una venta en el portal?' },
          { icon: FileSpreadsheet, textoMarked: '¿Tu Excel es un caos y es [b]difícil revisarlo en el celular[/b]?' },
          { icon: CalendarX, textoMarked: '¿Tus fechas de viaje y de cobro están [b]revueltas[/b]?' },
          { icon: Repeat, textoMarked: '¿Tu sistema es improvisado y debes [b]revisarlo a diario[/b] para no olvidar?' },
        ]}
      />

      <Agitacion
        iconos={[HandCoins, FileWarning]}
        frases={[
          'Trabajar el viaje entero para terminar [b]trabajando de a gratis[/b].',
          'Si dejas vencer el plazo de reclamo, [acento]ya no puedes pedirla[/acento].',
        ]}
        escena={{
          citaMarked: 'Nadie se va a parar a prender la compu…',
          cierreMarked: `Puedes estar tranquila: [b]${BRAND} te avisará con anticipación[/b].`,
        }}
      />

      <Solucion
        kicker="¿CÓMO FUNCIONA?"
        tituloMarked="[acento]Tu asistente[/acento] vigilando cada comisión"
        mecanismo="tu asistente de comisiones"
        bigIdeaMarked="Cada venta que registras tiene su asistente: [b]te avisa antes de que venza cada plazo[/b]."
        pasos={[
          { titulo: 'Registra la venta', detalle: 'Todos los datos necesarios, en segundos.' },
          { titulo: 'El asistente ya tiene la información', detalle: 'Las fechas importantes ya tienen su alerta.' },
          { titulo: 'Actúas a tiempo', detalle: 'Aviso anticipado en dorado para tomar acción.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Excel pasivo y fechas en tu cabeza.',
          labelDespues: `Con ${BRAND}`,
          despues: 'Tu asistente vigila cada venta y te avisa a tiempo.',
        }}
      />

      <AvisosAsistente />

      <ImportarExcel />

      <AppPorDentro
        kicker="VISTAS DE EJEMPLO DE LA APP"
        tituloMarked="Dale un vistazo a [acento]tu próximo asistente[/acento]"
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
            'Asistente que vigila alta, pago y reclamo',
            'Tabla de reservas con filtros y orden',
            'Calendario de viajes y de cobros',
            'Importa tu Excel: tu base lista el mismo día',
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
            'Asistente que vigila alta, pago y reclamo',
            'Importa tu Excel: tu base lista el mismo día',
            'Tabla de reservas con filtros y calendario',
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
              'Excel guarda datos, pero [b]no te avisa[/b]. Tu asistente cuenta los plazos de cada venta y te alerta antes de que venzan.',
          },
          {
            pregunta: '¿Tengo que pasar mis datos a mano?',
            respuestaMarked:
              'No. [b]Importas tu Excel o CSV[/b], confirmas qué es cada columna y tu base queda lista el mismo día. El portal de tu agencia sigue siendo tuyo.',
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
        futurePacingMarked="Mañana registras tu primera venta y tu asistente empieza a vigilar cada plazo por ti."
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
