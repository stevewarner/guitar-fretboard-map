import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  Fretboard,
  Pattern,
  describeChartForScreenReaders,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
} from '@/modules/scale/utils/scaleUtils';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { SeventhChordExample } from './SeventhChordExample';

export const metadata = buildLessonMetadata('foundations', 'seventh-chords');

const KEY_OF_C = 'C';
const SEVENTH_QUALITIES = ['maj7', 'm7', '7', 'm7b5'] as const;

export default async function SeventhChordsLesson() {
  const diatonicSevenths =
    getDiatonicChords(MAJOR_SCALE_INTERVALS, KEY_OF_C) ?? [];
  // The qualities getDiatonicChords produces (maj7, m7, 7, m7b5) are already
  // the real chord_qualities symbols, so no name-remapping is needed to look
  // them up or to link to their /chord page — same pattern as the triads
  // grid on the Diatonic Harmony lesson.
  const dbShapes = await getShapesBySymbols([...SEVENTH_QUALITIES], [5]);
  const shapesByQuality = Object.fromEntries(
    SEVENTH_QUALITIES.map((symbol) => {
      const shape = dbShapes.find(
        (s) =>
          s.quality_symbol === symbol &&
          s.root_string === 5 &&
          s.root_finger === 1,
      );
      return [symbol, shape?.tab_relative ?? []];
    }),
  ) as Record<(typeof SEVENTH_QUALITIES)[number], (number | 'x')[]>;

  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="seventh-chords" />

      <h2>Stacking the 7th</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Stack one more interval above a triad (1 3 5 7) to get a 7th chord, a
          fourth, genuinely new note, not the root repeated an octave up
        </li>
        <li>
          Four chord qualities appear naturally in the major scale:{' '}
          <strong>maj7</strong> (1 3 5 7), <strong>m7</strong> (1 b3 5 b7),
          dominant <strong>7</strong> (1 3 5 b7), and <strong>m7b5</strong> (1
          b3 b5 b7). That last one is the same m7b5 the vii triad turns into
          once its 7th is added, from Diatonic Harmony
        </li>
        <li>
          Each scale degree keeps the same role as its triad, just richer: I and
          IV become maj7, ii/iii/vi become m7, V becomes the dominant 7, and vii
          becomes m7b5
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-6">
        {diatonicSevenths.map((chord) => {
          const tab =
            shapesByQuality[chord.quality as keyof typeof shapesByQuality];
          if (!tab || tab.length === 0) return null;
          const rootPc = NOTE_TO_PC[chord.rootNote];
          const transposed = transposeShape(tab, 5, 1, rootPc);
          if (!transposed) return null;
          return (
            <div key={chord.degree}>
              <Link
                href={`/chord/${encodeURIComponent(chord.quality)}?root=${encodeURIComponent(chord.rootNote)}&string=5&position=1`}
                className="hover:opacity-80"
              >
                <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
                  {chord.romanNumeral} &ndash; {chord.name}
                </p>
                <div className="w-40">
                  <Fretboard
                    numFrets={transposed.numFrets}
                    startFret={transposed.startFret}
                    title={`${chord.name} chord, root on the 5th string — guitar fretboard diagram`}
                  >
                    <Pattern
                      tab={transposed.tab}
                      startFret={transposed.startFret}
                      fillColor="#000"
                    />
                  </Fretboard>
                </div>
              </Link>
              <p className="sr-only">
                {describeChartForScreenReaders([{ tab: transposed.tab }])}
              </p>
            </div>
          );
        })}
      </div>

      <h2>The dominant 7th</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The V7 chord is the most tension-carrying chord in a key. Every major
          key has exactly one, and it always wants to resolve back to I
        </li>
        <li>
          That pull comes from a tritone hiding inside it: the 3rd and b7 of a
          V7 chord sit 6 semitones apart, the most unstable interval in Western
          music. Resolving to I straightens it back out
        </li>
        <li>
          This is the engine behind the ii–V–I turnaround from the last lesson,
          heard here with the 7ths that make it actually sound like jazz
        </li>
      </ul>
      <SeventhChordExample
        numeralsLabel="V7 – Imaj7"
        degrees={[5, 1]}
        defaultRoot="E"
        description="Tension, then resolution: the dominant 7th pulling back home to the major 7th."
        shapes={shapesByQuality}
      />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          7th chords are the default sound in jazz, R&amp;B, gospel, and
          neo-soul. Plain triads start to sound thin once your ear is tuned to
          this
        </li>
        <li>
          Every progression already learned by number still works exactly the
          same way with 7ths swapped in for triads: the numbers don&rsquo;t
          change, only the chord quality gets richer
        </li>
        <li>
          Major Chord Shapes, up next, takes this same idea (a shape anchored to
          a root string and root finger) and moves it across every position on
          the neck. 4 Note Chord Shapes, right after that, does the same for
          these 4-note shapes specifically
        </li>
      </ul>
    </>
  );
}
