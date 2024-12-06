import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ChordsList } from '@/types';

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

export const ChordCarousel = async () => {
  const { rows: chords } =
    await sql<ChordsList>`SELECT * from CHORDS ORDER BY created_at DESC LIMIT 10`;

  return (
    <>
      <h3>Recently added</h3>
      <div className="mt-4 flex flex-nowrap gap-4 overflow-scroll pb-4">
        {chords.map((chord) => (
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
