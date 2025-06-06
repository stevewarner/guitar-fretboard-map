import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { ChordType } from '@/types';
import { createTab } from '@/app/utils';
import ChordActionDropdown from '@/modules/ChordActionDropdown';

import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';

type Props = {
  params: Promise<{ param: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { param } = await params;

  return {
    title: `${param} Guitar Chord`,
    description: `How to play ${param} guitar chord in all positions across the fretboard. Share or download ${param} chord diagram svg.`,
    openGraph: {
      title: `${param} Guitar Chord`,
      description: `How to play ${param} guitar chord in all positions across the fretboard. Share or Download ${param} chord diagram svg.`,
    },
  };
}

const Chord = async ({ params }: Props) => {
  // asynchronous access of `params.param`.
  const { param } = await params;

  const decodedParam = decodeURIComponent(param);

  const formattedParam = decodedParam
    .toLowerCase()
    .replace('major7', 'maj7')
    .replace('minor', 'm')
    .replace('min', 'm');

  // if param is chord tab, display chord and check if it exists in DB
  if (/^[0-9x]{6}$/.test(param)) {
    const tab = createTab(param);

    // get chords from DB that match param
    const { rows: chords } =
      await sql<ChordType>`SELECT * from CHORDS WHERE LOWER(tab_id) = ${param}`;

    const chordExists = chords.length > 0;

    const startFret =
      Math.min(
        ...tab.filter((item) => !isNaN(item as unknown as number)).map(Number),
      ) || 1;

    const endFret = Math.max(
      ...tab.filter((item) => !isNaN(item as unknown as number)).map(Number),
    );

    const numFrets = endFret - startFret + 1 >= 4 ? endFret - startFret + 1 : 4;

    // TODO what if the same tab has multiple chord names?

    return (
      <>
        <div className="flex flex-col items-center">
          {chordExists && <h1 className="mb-4">{chords[0].name}</h1>}
          <FretboardV2
            numFrets={numFrets}
            startFret={startFret}
            height={400}
            width={400}
          >
            <PatternV2
              tab={tab}
              // get the smallest number in the param
              startFret={startFret}
              fillColor="#000"
            />
          </FretboardV2>
          {chordExists ? (
            <a
              href={`/chord/${chords[0].name}`}
            >{`See full page for ${chords[0].name} chord with all positions`}</a>
          ) : (
            <>
              <p>This chord is not yet in the database</p>
              <a
                href={`/chord/new?tab=${param}&startFret=${startFret}&numFrets=${numFrets}`}
              >
                Add chord
              </a>
            </>
          )}
        </div>
      </>
    );
  }

  // get chords from DB that match param
  const { rows: chords } =
    await sql<ChordType>`SELECT * from CHORDS WHERE LOWER(name) = ${formattedParam}`;

  if (chords.length === 0) return notFound(); // 404 page

  return (
    <>
      {chords.map((chord) => {
        const chordId = `chord-${chord.id}`;
        return (
          <div
            className="flex flex-col items-center gap-1"
            key={chord.id}
            id={chord.tab_id}
          >
            <span className="flex items-baseline gap-6">
              <h2 className="mb-4">{chord.name}</h2>
              <ChordActionDropdown id={chordId} chord={chord} />
            </span>

            <FretboardV2
              id={chordId}
              title={param}
              numFrets={chord.num_frets}
              startFret={chord.start_fret}
              height={400}
              width={400}
            >
              <PatternV2
                tab={chord.tab}
                intervals={chord.intervals}
                startFret={chord.start_fret}
                fillColor="#000"
              />
            </FretboardV2>
          </div>
        );
      })}
    </>
  );
};

export default Chord;
