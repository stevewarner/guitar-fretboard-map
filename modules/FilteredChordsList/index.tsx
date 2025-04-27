'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChordType } from '@/types';
import { SearchInput } from '@/components/SearchInput';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { Modal } from '@/components/Modal';
import NewChordForm from '@/components/NewChordForm';

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

type Props = {
  chords: ChordType[];
};

const FilteredChordsList = ({ chords }: Props) => {
  const [userSearch, setUserSearch] = useState('');
  const [modalOpen, toggleModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <SearchInput
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-800"
          onClick={() => {
            // open modal
            toggleModalOpen(true);
            // TODO push route or query param ?=modalOpen
          }}
        >
          Add a new chord +
        </button>
      </div>
      <h3>{`Showing ${chords.length} chords`}</h3>
      <div className="grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
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
                href={`/chord/${encodeURIComponent(chord.name)}`}
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
      {modalOpen && (
        <Modal
          title="Add a new chord"
          onClose={() => toggleModalOpen(false)}
          content={<NewChordForm />}
        />
      )}
    </>
  );
};

export default FilteredChordsList;
