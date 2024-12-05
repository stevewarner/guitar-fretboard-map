'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChordsList } from '@/types';
import { SearchInput } from '@/components/SearchInput';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

type Props = {
  chords: ChordsList[];
};

const FilteredChordsList = ({ chords }: Props) => {
  const [userSearch, setUserSearch] = useState('');

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <SearchInput
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <Link className="w-fit" href="/chord/new">
          Add a new chord ➕
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
        {chords
          .sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
          .filter((chord) =>
            chord.name.toLowerCase().includes(userSearch.toLowerCase()),
          )
          .map((chord) => (
            <div key={chord.id} className="flex items-center justify-center">
              <Link
                className="flex flex-col gap-4 rounded border border-current px-4 py-2 hover:bg-gray-100"
                href={`/chord/${chord.name}`}
              >
                <span>{chord.name}</span>
                <div className="mb-[-100px] mr-[-120px] origin-top-left scale-50">
                  <Fretboard
                    numFrets={chord.num_frets}
                    small
                    showOpenNotes
                    options={{
                      fbHeight: fbHeight,
                      fbWidth: 250,
                      strHeight: fbHeight / 5,
                      fretWidth: fbWidth / 4,
                      stroke: stroke,
                      circRad: fbHeight / 20,
                      topSpace: fbHeight / 20 + stroke / 2,
                    }}
                  >
                    <Pattern
                      tab={chord.tab}
                      startFret={chord.start_fret}
                      fillColor="#000"
                    />
                  </Fretboard>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </>
  );
};

export default FilteredChordsList;
