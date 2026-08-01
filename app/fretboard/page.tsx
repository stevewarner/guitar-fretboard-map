import { Metadata } from 'next';
import { FretboardPlayground } from '@/modules/fretboard/FretboardPlayground';

export const metadata: Metadata = {
  title: 'Fretboard Playground',
  description:
    'Free-form guitar fretboard explorer. Highlight a root note and any combination of intervals across the whole neck.',
  alternates: { canonical: '/fretboard' },
  openGraph: {
    title: 'GuitarTheory | Fretboard Playground',
    description:
      'Free-form guitar fretboard explorer. Highlight a root note and any combination of intervals across the whole neck.',
  },
};

export default function FretboardPage() {
  return <FretboardPlayground />;
}
