import type { Metadata } from 'next';
import { PaywallFlow } from './PaywallFlow';

export const metadata: Metadata = {
  title: 'Elige tu plan — AgentTrack',
  robots: { index: false },
};

export default function Paywall() {
  return <PaywallFlow />;
}
