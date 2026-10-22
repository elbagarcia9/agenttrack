'use client';

// Landing de ventas — copy MARCADO de docs/copy/landing.md (trazado a FICHA-AVATAR.md).
// Modelo 2 (02C): el CTA lleva a /onboarding. Nombre de marca provisional en BRAND.

import { useEffect } from 'react';
import { track } from '@/lib/track';
import { SOPORTE_EMAIL } from '@/lib/legal';
import { CalendarX, CircleHelp, FileSpreadsheet, FileWarning, Repeat } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { AntesDespues } from '@/components/landing/AntesDespues';
import { BandaPuente } from '@/components/landing/BandaPuente';
import { EscenaFondo } from '@/components/landing/EscenaFondo';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile } from '@/components/landing/ui';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { AvisosAsistente } from '@/components/AvisosAsistente';
import { ImportarExcel } from '@/components/ImportarExcel';

const BRAND = 'AgentTrack';
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Empezar mis 14 días gratis';

export default function Landing() {
  useEffect(() => {
    track('landing_vista');
  }, []);
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero
        appName={BRAND}
        logo={<Logo alto="h-8 md:h-9" />}
        logoCompleto
        loginHref="/entrar"
        h1Marked="[acento]Ninguna comisión[/acento] se te vence sin que lo sepas"
        subtitleMarked="Tu Guardián de ventas avisa: [b]alta a 30 días[/b], [b]reclamo a 18 meses[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span className="text-balance">Hecho para agentes de agencias Host en México. Tarjeta al empezar, sin cobro hoy.</span>}
        visual={
          <div className="w-full">
            <div className="-mx-4 md:mx-0">
            <Image
              src="/img/hero-agente.webp"
              alt="Una agente de viajes sonriendo con su computadora, junto a la pantalla de inicio de AgentTrack en un celular"
              width={926}
              height={713}
              priority
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto w-full"
            />
            </div>
            <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">Vista de ejemplo con datos ficticios</p>
          </div>
        }
      />

      <BandaPuente
        preguntaMarked="¿Trabajar el viaje entero de a gratis?"
        respuestaMarked="Con AgentTrack eso no te vuelve a pasar"
        fondoAbajo="var(--accent)"
      />

      <Problema
        fondo="azul"
        titulo="¿Te suena?"
        preguntas={[
          { icon: CircleHelp, textoMarked: '¿No recuerdas si esa comisión que te deben [b]ya es tiempo de reclamarla[/b]?' },
          { icon: FileWarning, textoMarked: '¿Se te pasó [b]dar de alta[/b] una venta en el portal?' },
          { icon: FileSpreadsheet, textoMarked: '¿Tu Excel es un caos y es [b]difícil revisarlo en el celular[/b]?' },
          { icon: CalendarX, textoMarked: '¿Tus fechas de viaje y de cobro están [b]revueltas[/b]?' },
          { icon: Repeat, textoMarked: '¿Tu sistema es improvisado y debes [b]revisarlo a diario[/b] para no olvidar?' },
        ]}
      />

      <EscenaFondo
        src="/img/escena-desvelo.jpg"
        citaMarked="Nadie se va a parar a prender la compu…"
        cierreMarked={`Puedes estar tranquila: [b]${BRAND} te avisará con anticipación[/b].`}
      />

      <Solucion
        kicker="¿CÓMO FUNCIONA?"
        tituloMarked="[acento]Tu Guardián de ventas[/acento] vigilando cada comisión"
        mecanismo="Guardián de ventas"
        bigIdeaMarked="Cada venta que registras tiene su guardián: [b]te avisa antes de que venza cada plazo[/b]."
        pasos={[
          { titulo: 'Registra la venta', detalle: 'Cliente, destino, fechas y comisión, en segundos desde tu celular.' },
          { titulo: 'Calculamos tus plazos', detalle: 'Alta a 30 días de la compra, revisión a 60 días del viaje y reclamo a 18 meses.' },
          { titulo: 'Actúas a tiempo', detalle: 'Te avisamos en la app y por correo antes de que venza cada plazo.' },
        ]}
      />

      <AntesDespues />

      <AvisosAsistente />

      <ImportarExcel />

      <AppPorDentro
        kicker="VISTAS DE EJEMPLO DE LA APP"
        tituloMarked="Dale un vistazo a [acento]tu próximo asistente[/acento]"
        frames={[
          { src: '/mock/resultado.png', alt: 'Vista de ejemplo: plazos programados de una reserva', label: 'Tu primera reserva, ya vigilada' },
          { src: '/mock/nueva-reserva.png', alt: 'Vista de ejemplo: formulario de nueva reserva', label: 'Registra una venta en segundos' },
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
            'Guardián de ventas: vigila alta, pago y reclamo',
            'Tabla de reservas con filtros y orden',
            'Calendario de viajes y de cobros',
            'Importa tu Excel: tu base lista el mismo día',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$149',
          sufijo: 'MXN/mes',
          ctaLabel: 'Empezar con el plan mensual',
          ctaHref: '/onboarding?plan=mensual',
          features: [
            'Avisos por correo y notificación antes de cada plazo',
            'Guardián de ventas: vigila alta, pago y reclamo',
            'Importa tu Excel: tu base lista el mismo día',
            'Tabla de reservas con filtros y calendario',
            'Cancelas cuando quieras',
          ],
        }}
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
        recap="14 días gratis · cancela cuando quieras"
        psMarked="Cada venta que registres hoy tiene sus plazos vigilados desde el primer día. Empieza con 14 días gratis y decide después."
      />

      <FooterLegal
        appName={BRAND}
        logo={<Logo alto="h-7" />}
        logoCompleto
        soporteEmail={SOPORTE_EMAIL}
        aviso="No estamos afiliados a Archer ni a ninguna agencia Host. Los nombres se mencionan solo para indicar con qué reglas de plazos funciona la app."
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Cancelación y reembolsos', href: '/reembolsos' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
