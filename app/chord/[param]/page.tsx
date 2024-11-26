import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ChordsList } from '@/types';

type Props = {
  params: Promise<{ param: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { param } = await params;

  return {
    title: `${param} chord`,
  };
}

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

const Chord = async ({ params }: Props) => {
  // asynchronous access of `params.param`.
  const { param } = await params;

  const formattedParam = param
    .toLowerCase()
    .replace('major7', 'maj7')
    .replace('minor', 'm')
    .replace('min', 'm');

  // get chords from DB that match param
  const { rows: chords } =
    await sql<ChordsList>`SELECT * from CHORDS WHERE LOWER(name) = ${formattedParam}`;

  if (chords.length === 0) return notFound(); // 404 page

  return (
    <>
      {chords.map((chord) => (
        <div className="flex flex-col items-center" key={chord.id}>
          <h1 className="mb-4">{chord.name}</h1>
          <Fretboard
            numFrets={chord.num_frets}
            small
            showOpenNotes
            options={{
              fbHeight: fbHeight,
              fbWidth: chord.tab.some((val) => Number(val) >= 4)
                ? 250
                : fbWidth,
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
      ))}
    </>
  );
};

export default Chord;
