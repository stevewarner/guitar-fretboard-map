import { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import FilteredChordsList from '@/modules/FilteredChordsList';
import { ChordType } from '@/types';

export const metadata: Metadata = {
  title: 'Chord Database',
  description: 'Guitar chord chart database',
  openGraph: {
    title: 'GuitarTheory | Chord Database',
    description: 'Guitar chord chart database',
  },
};

export default async function Chords(): Promise<JSX.Element> {
  const { rows: chords } = await sql<ChordType>`SELECT * from CHORDS`;

  return (
    <div className="flex flex-col gap-8">
      <FilteredChordsList chords={chords} />
    </div>
  );
}
