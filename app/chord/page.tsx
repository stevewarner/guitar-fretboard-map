import { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import FilteredChordsList from '@/modules/FilteredChordsList';
import { ChordsList } from '@/types';

export const metadata: Metadata = {
  title: 'Chord Library',
};

export default async function Chords(): Promise<JSX.Element> {
  const { rows: chords } = await sql<ChordsList>`SELECT * from CHORDS`;

  return (
    <div className="flex flex-col gap-8">
      <FilteredChordsList chords={chords} />
    </div>
  );
}
