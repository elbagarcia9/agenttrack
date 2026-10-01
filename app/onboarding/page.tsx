import type { Metadata } from 'next';
import { OnboardingFlow } from './OnboardingFlow';

export const metadata: Metadata = {
  title: 'Tu primer plan — Commission Guard',
  robots: { index: false },
};

export default function Onboarding() {
  return <OnboardingFlow />;
}
