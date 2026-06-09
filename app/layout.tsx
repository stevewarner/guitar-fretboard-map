import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.guitartheory.app'),
  title: {
    default: 'GuitarTheory | Music Theory for Guitarists',
    template: '%s | GuitarTheory',
  },
  description: 'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
  openGraph: {
    title: 'GuitarTheory | Music Theory for Guitarists',
    description: 'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
    url: 'https://www.guitartheory.app',
    siteName: 'GuitarTheory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuitarTheory | Music Theory for Guitarists',
    description: 'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
            {children}
            <Analytics />
            <SpeedInsights />
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
