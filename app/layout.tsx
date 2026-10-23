import type { Metadata, Viewport } from 'next';
import { Sora, Inter_Tight } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['500', '600', '700', '800'], display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', weight: ['400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'AgentTrack — Registra tus ventas y no pierdas ninguna comisión',
  description:
    'Para agentes de viajes de agencias Host: tu asistente vigila cada comisión y te avisa antes de que venza cada plazo de alta, pago y reclamo. Prueba 14 días gratis.',
  appleWebApp: { capable: true, title: 'AgentTrack', statusBarStyle: 'default' },
};

export const viewport: Viewport = { themeColor: '#226697' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${sora.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
