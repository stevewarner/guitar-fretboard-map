'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChordType } from '@/types';
import { SearchInput } from '@/components/SearchInput';
import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';
import { Modal } from '@/components/Modal';
import NewChordForm from '@/components/NewChordForm';

type Props = {
  chords: ChordType[];
};

const FilteredChordsList = ({ chords }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const userSearch = searchParams?.get('query') || '';
  const modalOpen = searchParams?.get('createNewChord') === 'true';

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const toggleModalOpen = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (isOpen) {
      params.set('createNewChord', 'true');
    } else {
      params.delete('createNewChord');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <SearchInput
          defaultValue={searchParams?.get('query')?.toString()}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-800"
          onClick={() => {
            // open modal
            toggleModalOpen(true);
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
                className="flex flex-col gap-1 rounded border border-current px-4 py-2 hover:bg-gray-100"
                href={`/chord/${encodeURIComponent(chord.name)}`}
              >
                <span>{chord.name}</span>

                <FretboardV2
                  id={chord.id.toString()}
                  title={chord.name}
                  numFrets={chord.num_frets}
                  startFret={chord.start_fret}
                  height={150}
                  width={150}
                >
                  <PatternV2
                    tab={chord.tab}
                    startFret={chord.start_fret}
                    fillColor="#000"
                  />
                </FretboardV2>
              </Link>
            </div>
          ))}
      </div>
      {!!modalOpen && (
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
