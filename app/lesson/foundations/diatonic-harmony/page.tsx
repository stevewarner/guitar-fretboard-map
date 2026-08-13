import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  Fretboard,
  Pattern,
  StaticChart,
  type ChartSource,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicTriads,
} from '@/modules/scale/utils/scaleUtils';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';

export const metadata = buildLessonMetadata('foundations', 'diatonic-harmony');

const KEY_OF_C = 'C';

// Every chart on this page anchors to the 5th string so the seven triads read
// as one shape moving to a new root, not seven unrelated fingerings.
const ROOT_ON_5TH_STRING = { rootString: 5 as const, rootFinger: 1 as const };

// The C major scale, one octave, root to root, entirely on the 5th string
// (fret 3 to fret 15). tabRelative/intervalLabels follow the tab_relative
// convention: one array per string (6→1), offsets from the root fret.
const SCALE_ON_5TH_STRING: ChartSource = {
  kind: 'relativeShape',
  tabRelative: [[], [0, 2, 4, 5, 7, 9, 11, 12], [], [], [], []],
  intervalLabels: [
    [],
    ['1', '2', '3', '4', '5', '6', '7', '1'],
    [],
    [],
    [],
    [],
  ],
  ...ROOT_ON_5TH_STRING,
};

const QUALITY_LABEL: Record<string, string> = {
  maj: 'Maj',
  m: 'min',
  mb5: 'mb5',
};

export default async function DiatonicHarmonyLesson() {
  const diatonicTriads =
    getDiatonicTriads(MAJOR_SCALE_INTERVALS, KEY_OF_C) ?? [];
  // The qualities getDiatonicTriads produces (maj, m, mb5) are already the
  // real chord_qualities symbols, so no name-remapping is needed to look
  // them up or to link to their /chord page.
  const shapes = await getShapesBySymbols(['maj', 'm', 'mb5'], [5]);

  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="diatonic-harmony" />

      <p>
        Every example below is in the key of C. Here is the C major scale, root
        to root, played entirely on the 5th string:
      </p>
      <StaticChart
        source={SCALE_ON_5TH_STRING}
        rootPc={NOTE_TO_PC[KEY_OF_C]}
        title="C major scale on the 5th string — guitar fretboard diagram"
        label="C Major Scale, 5th String"
        className="w-32"
      />

      <h2>Building chords from the scale</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Every note in the scale can be a chord root</li>
        <li>
          Build a triad from each scale degree using only notes already in the
          scale
        </li>
        <li>
          The major scale always produces the same chord quality sequence: I ii
          iii IV V vi vii (Maj min min Maj Maj min mb5)
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-6">
        {diatonicTriads.map((chord) => {
          const shape = shapes.find(
            (s) =>
              s.quality_symbol === chord.quality &&
              s.root_string === 5 &&
              s.root_finger === 1,
          );
          if (!shape) return null;
          const rootPc = NOTE_TO_PC[chord.rootNote];
          const transposed = transposeShape(shape.tab_relative, 5, 1, rootPc);
          if (!transposed) return null;
          const qualityLabel = QUALITY_LABEL[chord.quality];
          return (
            <Link
              key={chord.degree}
              href={`/chord/${encodeURIComponent(chord.quality)}?root=${encodeURIComponent(chord.rootNote)}&string=5&position=1`}
              className="hover:opacity-80"
            >
              <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
                {chord.romanNumeral} &ndash; {chord.name} ({qualityLabel})
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
          );
        })}
      </div>

      <h2>Talking in Roman numerals</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Roman numerals describe a progression without naming a key</li>
        <li>I–IV–V works the same way in C, G, Eb, or any key</li>
        <li>
          This is how musicians communicate chord progressions across
          instruments and keys
        </li>
      </ul>

      <h2>Why not diminished or half-diminished?</h2>
      {/* The tail of each sentence below is a plain string expression, not
      JSX text, on purpose: a literal space right after a closing tag gets
      silently dropped once Prettier wraps it onto the next line (JSX only
      preserves leading whitespace on a text node's own first line) — a
      string expression's contents are untouched by both JSX whitespace
      rules and Prettier's formatting. */}
      <p>
        Traditional theory has names for both the vii triad above and the 7th
        chord it becomes once a 7th is added: it calls the triad (1, b3, b5) a{' '}
        <strong>diminished triad</strong>, and the 7th chord (1, b3, b5, b7) a{' '}
        <strong>half-diminished</strong>
        {' chord. This site uses neither term. Here’s why:'}
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Diminished</strong>, precisely, means a chord built entirely
          from stacked minor 3rds: 1, b3, b5, bb7 (a double-flat 7th, not a
          regular b7). Every interval in it is the same minor-3rd shape, which
          is what makes it symmetrical. This site reserves &ldquo;dim&rdquo; for
          that chord specifically. It will show up as its own quality once 7th
          chords are introduced.
        </li>
        <li>
          <strong>Half-diminished</strong>
          {
            ' means 1, b3, b5, b7: the same triad as the vii chord above, but with a regular (not double-flat) 7th added. It’s a real, commonly used chord. This site just doesn’t use that name for it, since “half of a diminished chord” isn’t an intuitive way to describe what’s actually a different chord. It’s not half of anything.'
          }
        </li>
      </ul>
      <p>
        Calling the vii triad &ldquo;diminished&rdquo; here would set up a
        collision. Once 7th chords arrive, that same word names a different,
        unrelated chord: 1, b3, b5, bb7, the symmetrical one. The chord the vii
        triad actually turns into (1, b3, b5, b7) would then need the confusing
        &ldquo;half-diminished&rdquo; label instead. Naming the triad{' '}
        <strong>mb5</strong>
        {
          ' instead sidesteps both problems. It’s literally what the chord is (a minor triad with a flatted 5th), and it previews its own name once the 7th is added:'
        }{' '}
        <strong>m7b5</strong>.
      </p>
    </>
  );
}
