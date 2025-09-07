import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChartV3';
import { ChordType } from '@/types';

interface ChordCarouselProps {
  chords: ChordType[];
}

export const ChordCarousel = ({ chords }: ChordCarouselProps) => {
  return (
    <div className="mt-4 flex flex-nowrap gap-4 overflow-x-scroll p-1 pb-4">
      {chords.map((chord) => (
        <div key={chord.id} className="flex items-center justify-center">
          <Link
            className="flex flex-col gap-1 rounded border border-current px-4 py-2 hover:bg-gray-100"
            href={`/chord/${encodeURIComponent(chord.name)}`}
          >
            <span>{chord.name}</span>
            <div>
              <Fretboard
                id={chord.id.toString()}
                title={chord.name}
                numFrets={chord.num_frets}
                startFret={chord.start_fret}
                height={150}
                width={150}
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
  );
};
