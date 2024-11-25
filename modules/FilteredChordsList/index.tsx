'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChordsList } from '@/types';
import { SearchInput } from '@/components/SearchInput';

type Props = {
  chords: ChordsList[];
};

const FilteredChordsList = ({ chords }: Props) => {
  const [userSearch, setUserSearch] = useState('');

  return (
    <>
      <SearchInput
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />
      <div className="grid grid-cols-4 gap-4 gap-y-8">
        {chords
          .filter((chord) =>
            chord.name.toLowerCase().includes(userSearch.toLowerCase()),
          )
          .map((chord) => (
            <div key={chord.id} className="flex justify-center">
              <Link
                className="rounded border border-current px-4 py-2 hover:bg-gray-100"
                href={`/chord/${chord.name}`}
              >
                {chord.name}
              </Link>
            </div>
          ))}
      </div>
    </>
  );
};

export default FilteredChordsList;
