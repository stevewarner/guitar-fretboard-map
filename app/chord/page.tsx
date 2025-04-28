import { Metadata } from 'next';
import { Suspense } from 'react';

import { sql } from '@vercel/postgres';
import FilteredChordsList from '@/modules/FilteredChordsList';
import { ChordType } from '@/types';

export const metadata: Metadata = {
  title: 'Chord Database',
  description:
    'Guitar chord diagram database. Learn guitar chords in all positions on the guitar fretboard. Create, Share, and Download chord diagrams.',
  openGraph: {
    title: 'GuitarTheory | Chord Database',
    description:
      'Guitar chord diagram database. Learn guitar chords in all positions on the guitar fretboard. Create, Share, and Download chord diagrams.',
  },
};

export default async function Chords(): Promise<JSX.Element> {
  const { rows: chords } = await sql<ChordType>`SELECT * from CHORDS`;

  return (
    <div className="flex flex-col gap-8">
      <Suspense>
        <FilteredChordsList chords={chords} />
      </Suspense>
    </div>
  );
}
