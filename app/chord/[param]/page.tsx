import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ChordType } from '@/types';
import ChordActionDropdown from '@/modules/ChordActionDropdown';

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

const createTab = (val: string) => {
  const newArr: string[] = [];
  val.split('').map((fretNum: string) => {
    !!fretNum && newArr.push(fretNum);
  });
  return newArr;
};

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

    const startFret = Math.min(
      ...tab.filter((item) => !isNaN(item as unknown as number)).map(Number),
    );

    const endFret = Math.max(
      ...tab.filter((item) => !isNaN(item as unknown as number)).map(Number),
    );

    const numFrets = endFret - startFret + 1 >= 4 ? endFret - startFret + 1 : 4;

    // TODO what if the same tab has multiple chord names?

    // TODO if it doesn't exist, add CREATE button (opens edit chord modal)

    return (
      <>
        <div className="flex flex-col items-center">
          {chordExists && <h1 className="mb-4">{chords[0].name}</h1>}
          <Fretboard
            numFrets={numFrets}
            small
            showOpenNotes
            startFret={startFret}
            options={{
              fbHeight: fbHeight,
              fbWidth: (fbWidth / 4) * numFrets + 100, // TODO fix all this
              strHeight: fbHeight / 5,
              fretWidth: fbWidth / 4,
              stroke: stroke,
              circRad: fbHeight / 20,
              topSpace: fbHeight / 20 + stroke / 2,
            }}
          >
            <Pattern
              tab={tab}
              // get the smallest number in the param
              startFret={startFret}
              fillColor="#000"
            />
          </Fretboard>
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
      {chords.map((chord) => (
        <div className="flex flex-col items-center gap-4" key={chord.id}>
          <h1 className="mb-4">{chord.name}</h1>
          <Fretboard
            numFrets={chord.num_frets}
            small
            showOpenNotes
            startFret={chord.start_fret}
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
          <ChordActionDropdown chord={chord} />
        </div>
      ))}
    </>
  );
};

export default Chord;
