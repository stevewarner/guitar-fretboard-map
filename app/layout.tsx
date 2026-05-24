import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

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
  alternates: {
    canonical: 'https://www.guitartheory.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col">
        <Navbar />
        <div className="my-9 flex flex-1 min-h-0 px-2">
          <div className="container mx-auto h-full">
            {children}
            <Analytics />
            <SpeedInsights />
          </div>
        </div>
      </body>
    </html>
  );
}
