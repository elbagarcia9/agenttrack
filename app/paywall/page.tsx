import type { Metadata } from 'next';
import { PaywallFlow } from './PaywallFlow';

export const metadata: Metadata = {
  title: 'Elige tu plan — AgentTrack',
  robots: { index: false },
};

export default async function Paywall({ searchParams }: { searchParams: Promise<{ acceso?: string }> }) {
  const { acceso } = await searchParams;
  return <PaywallFlow acceso={acceso ?? null} />;
}
