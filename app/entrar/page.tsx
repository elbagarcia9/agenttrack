import type { Metadata } from 'next';
import { EntrarForm } from './EntrarForm';

export const metadata: Metadata = {
  title: 'Entrar — AgentTrack',
  robots: { index: false },
};

export default async function Entrar({ searchParams }: { searchParams: Promise<{ plan?: string; error?: string }> }) {
  const { plan, error } = await searchParams;
  const valido = plan === 'anual' || plan === 'mensual' ? plan : null;
  return <EntrarForm plan={valido} enlaceFallido={error === 'enlace'} />;
}
