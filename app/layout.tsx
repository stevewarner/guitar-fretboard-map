import { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Music Theory for Guitarists',
  description: 'Chord and Scale charts for guitar',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎸</text></svg>',
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
        <div className="flex">
          <div className="container mx-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
