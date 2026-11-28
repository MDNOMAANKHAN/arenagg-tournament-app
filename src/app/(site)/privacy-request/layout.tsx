import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Request & Grievance',
  description: 'Submit a privacy request or grievance to ARENAGG.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function PrivacyRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
