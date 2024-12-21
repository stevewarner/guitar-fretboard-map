import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'GuitarTheory | Music Theory for Guitarists',
  description: 'Chord and Scale charts for guitar',
  openGraph: {
    title: 'GuitarTheory | Music Theory for Guitarists',
    description: 'Chord and Scale charts for guitar',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="my-9 flex px-2">
          <div className="container mx-auto">
            {children}
            <Analytics />
            <SpeedInsights />
          </div>
        </div>
      </body>
    </html>
  );
}
