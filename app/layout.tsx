import type { Metadata } from 'next';
import { Sora, Inter_Tight } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['500', '600', '700', '800'], display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', weight: ['400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Commission Guard — Ninguna comisión se te vence sin que lo sepas',
  description:
    'Para agentes de viajes de agencias Host: el Semáforo de Comisiones te avisa antes de que venza cada plazo de alta, pago y reclamo. Prueba 14 días gratis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${sora.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
