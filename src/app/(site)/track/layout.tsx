import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Tournament Registration',
  description: 'Check your ARENAGG tournament registration status using your private registration ID.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
