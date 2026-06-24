import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoxTutor — AI Mock Interview Platform',
  description: 'Practice domain-specific interviews with an AI voice interviewer. Get real feedback reports.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'VoxTutor — AI Mock Interview Platform',
    description: 'AI voice interviews. Real feedback. Practice for any domain.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
