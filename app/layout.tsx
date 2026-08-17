import { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/app/utils/site';
import { websiteSchema } from '@/app/utils/structuredData';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GuitarTheory | Music Theory for Guitarists',
    template: '%s | GuitarTheory',
  },
  description:
    'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
  openGraph: {
    title: 'GuitarTheory | Music Theory for Guitarists',
    description:
      'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
    url: SITE_URL,
    siteName: 'GuitarTheory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuitarTheory | Music Theory for Guitarists',
    description:
      'Chord and scale charts for guitar. Interactive fretboard diagrams and music theory lessons for guitarists.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          Skip to main content
        </a>
        <JsonLd data={websiteSchema()} />
        <Navbar />
        <main id="main-content" className="flex flex-1 flex-col">
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
