import type { Metadata } from 'next';
import { PaywallFlow } from './PaywallFlow';

export const metadata: Metadata = {
  title: 'Elige tu plan — Commission Guard',
  robots: { index: false },
};

export default function Paywall() {
  return <PaywallFlow />;
}
