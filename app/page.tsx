import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const numFrets = 13;
const fbHeight = 360;
const fbWidth = 400;
const stroke = 4;

export default function Home() {
  return (
    <>
      <header className="flex flex-row flex-wrap items-center justify-between md:flex-nowrap">
        <div className="mx-auto mb-8 min-w-[45%] max-w-md text-center md:my-0 lg:mx-0 lg:flex-auto lg:px-4 lg:py-32 lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn chords and scales across the fretboard
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 ">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <Fretboard
          numFrets={numFrets}
          styles="mx-4 md:mx-0"
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
        </Fretboard>
      </header>
      <section>
        <h2>
          look up a chord in the url like <Link href={'/chord/C'}>Cmajor</Link>
        </h2>
      </section>
    </>
  );
}
