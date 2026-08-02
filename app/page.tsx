import { Metadata } from 'next';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChartLegacy';
import { FlatTabValue } from '@/types';
import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { ScalePreviewCard } from '@/components/ScalePreviewCard';
import { getModeIntervals } from '@/modules/scale/utils/scaleUtils';
import ChevronRightIcon from '@/svgs/chevron-right.svg';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const numFrets = 13;

const COMMON_CHORDS: {
  label: string;
  href: string;
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
}[] = [
  {
    label: 'A',
    href: '/chord/maj?root=A&string=5&position=0',
    tab: ['x', 0, 2, 2, 2, 0],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'Am',
    href: '/chord/m?root=A&string=5&position=0',
    tab: ['x', 0, 2, 2, 1, 0],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'B',
    href: '/chord/maj?root=B&string=5&position=0',
    tab: ['x', 2, 4, 4, 4, 2],
    startFret: 2,
    numFrets: 4,
  },
  {
    label: 'Bm',
    href: '/chord/m?root=B&string=5&position=0',
    tab: ['x', 2, 4, 4, 3, 2],
    startFret: 2,
    numFrets: 4,
  },
  {
    label: 'C',
    href: '/chord/maj?root=C&string=5&position=0',
    tab: ['x', 3, 2, 0, 1, 0],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'D',
    href: '/chord/maj?root=D&string=4&position=0',
    tab: ['x', 'x', 0, 2, 3, 2],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'Dm',
    href: '/chord/m?root=D&string=4&position=0',
    tab: ['x', 'x', 0, 2, 3, 1],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'E',
    href: '/chord/maj?root=E&string=6&position=0',
    tab: [0, 2, 2, 1, 0, 0],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'Em',
    href: '/chord/m?root=E&string=6&position=0',
    tab: [0, 2, 2, 0, 0, 0],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'F',
    href: '/chord/maj?root=F&string=6&position=0',
    tab: [1, 3, 3, 2, 1, 1],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'Fm',
    href: '/chord/m?root=F&string=6&position=0',
    tab: [1, 3, 3, 1, 1, 1],
    startFret: 1,
    numFrets: 4,
  },
  {
    label: 'G',
    href: '/chord/maj?root=G&string=6&position=3',
    tab: [3, 2, 0, 0, 0, 3],
    startFret: 1,
    numFrets: 4,
  },
];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const ROOT_PC = 9; // A

const MAJOR_SCALE_MODES = [
  { slug: 'ionian', displayName: 'Ionian', degree: 0 },
  { slug: 'dorian', displayName: 'Dorian', degree: 1 },
  { slug: 'phrygian', displayName: 'Phrygian', degree: 2 },
  { slug: 'lydian', displayName: 'Lydian', degree: 3 },
  { slug: 'mixolydian', displayName: 'Mixolydian', degree: 4 },
  { slug: 'aeolian', displayName: 'Aeolian', degree: 5 },
  { slug: 'locrian', displayName: 'Locrian', degree: 6 },
];

export default async function Home() {
  return (
    <>
      <header className="flex flex-row flex-wrap items-center justify-between md:flex-nowrap">
        <div className="mx-auto mb-8 min-w-[45%] max-w-md text-center md:my-0 lg:mx-0 lg:flex-auto lg:px-4 lg:py-32 lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn chords and scales across the fretboard
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <Link
              href="/chord"
              className="rounded-md bg-accent px-6 py-3 text-lg font-semibold text-accent-fg shadow-sm hover:bg-accent-hover"
            >
              See all chords
            </Link>
            <Link href="/about" className="font-semibold leading-6">
              <span className="flex items-center gap-1">
                Learn more
                <ChevronRightIcon height={16} width={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        <Fretboard
          numFrets={numFrets}
          showOpenNotes={false}
          styles="m-4 md:mx-0"
          title="Guitar fretboard diagram highlighting the minor pentatonic scale pattern"
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
      <section className="flex flex-col gap-6">
        <h2>
          <Link href={'/chord'}>Chords</Link>
        </h2>
        <div className="flex flex-col gap-4">
          <h3>Common Chords</h3>
          <CardRow>
            {COMMON_CHORDS.map((chord) => (
              <ChordPreviewCard
                key={chord.label}
                href={chord.href}
                label={chord.label}
                tab={chord.tab}
                startFret={chord.startFret}
                numFrets={chord.numFrets}
                className="w-32 shrink-0"
              />
            ))}
          </CardRow>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h2>
          <Link href="/scale/major-scale/ionian">Modes of the Major Scale</Link>
        </h2>
        <CardRow>
          {MAJOR_SCALE_MODES.map((mode) => (
            <ScalePreviewCard
              key={mode.slug}
              className="w-32 shrink-0"
              href={`/scale/major-scale/${mode.slug}`}
              label={mode.displayName}
              modeIntervals={getModeIntervals(
                MAJOR_SCALE_INTERVALS,
                mode.degree,
              )}
              rootPc={ROOT_PC}
            />
          ))}
        </CardRow>
      </section>
    </>
  );
}
