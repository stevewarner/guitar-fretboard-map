import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ChordsList } from '@/types';
import { ChordCarousel } from '@/components/ChordCarousel';

const numFrets = 13;
const fbHeight = 360;
const fbWidth = 400;
const stroke = 4;

export default async function Home() {
  const { rows: chords } =
    await sql<ChordsList>`SELECT * from CHORDS ORDER BY created_at DESC LIMIT 10`;

  return (
    <>
      <header className="flex flex-row flex-wrap items-center justify-between md:flex-nowrap">
        <div className="mx-auto mb-8 min-w-[45%] max-w-md text-center md:my-0 lg:mx-0 lg:flex-auto lg:px-4 lg:py-32 lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn chords and scales across the fretboard
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <Link
              href="/scale"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Get started
            </Link>
            <Link href="/about" className="font-semibold leading-6">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <Fretboard
          numFrets={numFrets}
          showOpenNotes={false}
          styles="m-4 md:mx-0"
          options={{
            fbHeight: fbHeight,
            strHeight: fbHeight / 5,
            fretWidth: fbWidth / 4,
            fbWidth: (fbWidth / 4) * numFrets,
            stroke: stroke,
            circRad: fbHeight / 20,
            topSpace: fbHeight / 20 + stroke / 2,
          }}
        >
          <path
            d="M 52 380 C 500 380 500 20 1252 20"
            stroke="#FF0000"
            strokeOpacity="0.7"
            strokeWidth="40"
            strokeLinecap="round"
            fill="transparent"
          />
          {/* <Pattern
            // nested array for scales
            // full major scale
            tab={[
              [0, 2, 4, 5, 7, 9, 11, 12],
              [0, 2, 4, 6, 7, 9, 11, 12],
              [1, 2, 4, 6, 7, 9, 11],
              [1, 2, 4, 6, 8, 9, 11],
              [0, 2, 4, 5, 7, 9, 10, 12],
              [0, 2, 4, 5, 7, 9, 11, 12],
            ]}
            // tab={[0, 2, 2, 1, 0, 12]}
            fillColor="#000"
          /> */}
          <Pattern
            // pentatonic
            tab={[
              [0, 2, 4, 7, 9, 12],
              [2, 4, 7, 9, 11],
              [2, 4, 6, 9, 11],
              [1, 4, 6, 9, 11],
              [0, 2, 5, 7, 9, 12],
              [0, 2, 4, 7, 9, 12],
            ]}
            fillColor="#000"
          />
          {/* <Pattern
            // chord tones 1 - 3 - 5
            tab={[
              [0, 4, 7, 12],
              [2, 6, 7, 11],
              [2, 6, 9],
              [1, 4, 9],
              [0, 5, 9, 12],
              [0, 4, 7, 12],
            ]}
            fillColor="#2200ff"
          /> */}
          {/* <Pattern
            // root
            tab={[[0, 12], [7], [2], [9], [5], [0, 12]]}
            fillColor="#ff0000"
          /> */}
        </Fretboard>
      </header>
      <section>
        <h2>
          <Link href={'/chord'}>Chords</Link>
        </h2>
        <h3>Recently added</h3>
        <ChordCarousel chords={chords} />
      </section>
    </>
  );
}
