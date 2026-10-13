import Image from 'next/image';

// Logo final de AgentTrack. "completo" = escudo + nombre (ya trae el texto: no se escribe el nombre al lado);
// "escudo" = solo la marca, para espacios chicos o cuando el texto de al lado es otro (ej. "Panel del dueño").
export function Logo({ variante = 'completo', alto = 'h-8' }: { variante?: 'completo' | 'escudo'; alto?: string }) {
  if (variante === 'escudo') {
    return <Image src="/img/logo-escudo.png" alt="" aria-hidden="true" width={148} height={176} className={`${alto} w-auto shrink-0`} />;
  }
  return <Image src="/img/logo-agenttrack.png" alt="AgentTrack" width={997} height={236} className={`${alto} w-auto shrink-0`} />;
}
