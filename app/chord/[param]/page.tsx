import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { ChordType } from '@/types';
import { getOrdinal } from '@/app/utils';
import { createTab } from '@/modules/chord/utils/createTab';
import { ChordActionDropdown } from '@/modules/chord/ChordActionDropdown';

import { Fretboard, Pattern } from '@/components/FretboardChart';

type Props = {
  params: Promise<{ param: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { param } = await params;

  return {
    title: `${param} Guitar Chord`,
    alternates: { canonical: `/chord/${param}` },
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

    const numericTab = tab
      .filter((item) => !isNaN(item as unknown as number))
      .map(Number);

    const startFret = numericTab.length > 0 ? Math.min(...numericTab) || 1 : 1;
    const endFret = numericTab.length > 0 ? Math.max(...numericTab) : startFret;

    const numFrets = endFret - startFret + 1 >= 4 ? endFret - startFret + 1 : 4;

    // TODO what if the same tab has multiple chord names?

    return (
      <>
        <div className="flex flex-col items-center">
          {chordExists && <h1 className="mb-4">{chords[0].name}</h1>}
          <Fretboard
            numFrets={numFrets}
            startFret={startFret}
            height={320}
            width={320}
          >
            <Pattern
              tab={tab}
              // get the smallest number in the param
              startFret={startFret}
              fillColor="#000"
            />
          </Fretboard>
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
            {chord.inversion > 0 && (
              <p className="text-sm text-fg-secondary">{`${chord.inversion}${getOrdinal(chord.inversion)} inversion`}</p>
            )}
            {chord.description && (
              <p className="max-w-md text-center text-sm italic text-fg-secondary">
                {chord.description}
              </p>
            )}
            <Fretboard
              id={chordId}
              title={param}
              numFrets={chord.num_frets}
              startFret={chord.start_fret}
              height={320}
            width={320}
            >
              <Pattern
                tab={chord.tab}
                intervals={chord.intervals}
                startFret={chord.start_fret}
                fillColor="#000"
              />
            </Fretboard>
          </div>
        );
      })}
    </>
  );
};

export default Chord;
