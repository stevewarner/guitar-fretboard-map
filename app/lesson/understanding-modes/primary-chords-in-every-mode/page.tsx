import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  getShapesBySymbols,
  type DbChordShape,
} from '@/modules/chordv2/db/queries';

export const metadata = buildLessonMetadata(
  'understanding-modes',
  'primary-chords-in-every-mode',
);

interface ModeChord {
  // Case follows docs/STYLE_GUIDE.md's Roman numeral rule: set by the
  // chord's 3rd, not its full quality. maj7/7 (dominant) have a major 3rd
  // and stay uppercase; m7/m7b5 have a minor 3rd and go lowercase, even
  // though these are still "the IV chord" or "the V chord" functionally.
  role: string;
  quality: string;
  root: string;
  string: number;
  finger: number;
}

interface Mode {
  name: string;
  formula: string;
  chords: ModeChord[];
}

// Fixed to A throughout, one mode at a time. Only 7 modes exist, so the
// quality and root of each I/IV/V is hardcoded here rather than derived
// from scale-degree math: I always on the 6th string, IV and V always on
// the 5th. maj7 needs the 2nd finger there specifically (a cleaner,
// standard voicing than the 1st-finger alternative); every other quality
// uses the 1st finger.
const MODES: Mode[] = [
  {
    name: 'Ionian',
    formula: '1 2 3 4 5 6 7',
    chords: [
      { role: 'I', quality: 'maj7', root: 'A', string: 6, finger: 2 },
      { role: 'IV', quality: 'maj7', root: 'D', string: 5, finger: 1 },
      { role: 'V', quality: '7', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Dorian',
    formula: '1 2 b3 4 5 6 b7',
    chords: [
      { role: 'i', quality: 'm7', root: 'A', string: 6, finger: 1 },
      { role: 'IV', quality: '7', root: 'D', string: 5, finger: 1 },
      { role: 'v', quality: 'm7', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Phrygian',
    formula: '1 b2 b3 4 5 b6 b7',
    chords: [
      { role: 'i', quality: 'm7', root: 'A', string: 6, finger: 1 },
      { role: 'iv', quality: 'm7', root: 'D', string: 5, finger: 1 },
      { role: 'v', quality: 'm7b5', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Lydian',
    formula: '1 2 3 #4 5 6 7',
    chords: [
      { role: 'I', quality: 'maj7', root: 'A', string: 6, finger: 2 },
      { role: 'iv', quality: 'm7b5', root: 'D#', string: 5, finger: 1 },
      { role: 'V', quality: 'maj7', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Mixolydian',
    formula: '1 2 3 4 5 6 b7',
    chords: [
      { role: 'I', quality: '7', root: 'A', string: 6, finger: 1 },
      { role: 'IV', quality: 'maj7', root: 'D', string: 5, finger: 1 },
      { role: 'v', quality: 'm7', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Aeolian',
    formula: '1 2 b3 4 5 b6 b7',
    chords: [
      { role: 'i', quality: 'm7', root: 'A', string: 6, finger: 1 },
      { role: 'iv', quality: 'm7', root: 'D', string: 5, finger: 1 },
      { role: 'v', quality: 'm7', root: 'E', string: 5, finger: 1 },
    ],
  },
  {
    name: 'Locrian',
    formula: '1 b2 b3 4 b5 b6 b7',
    chords: [
      { role: 'i', quality: 'm7b5', root: 'A', string: 6, finger: 1 },
      { role: 'iv', quality: 'm7', root: 'D', string: 5, finger: 1 },
      { role: 'V', quality: 'maj7', root: 'D#', string: 5, finger: 1 },
    ],
  },
];

export default async function PrimaryChordsInEveryModeLesson() {
  const shapes = await getShapesBySymbols(['maj7', 'm7', '7', 'm7b5'], [5, 6]);
  const findShape = (chord: ModeChord): DbChordShape | undefined =>
    shapes.find(
      (s) =>
        s.quality_symbol === chord.quality &&
        s.root_string === chord.string &&
        s.root_finger === chord.finger,
    );

  return (
    <>
      <LessonHeader
        partSlug="understanding-modes"
        lessonSlug="primary-chords-in-every-mode"
      />

      <h2>I, IV, and V cover the whole scale</h2>
      <p>
        A triad built on the 1st degree uses scale tones 1, 3, and 5. Build one
        on the 4th degree instead and its own 1st, 3rd, and 5th land on scale
        tones 4, 6, and 1. The 5th degree works the same way: 5, 7, and 2. Put
        all 3 chords together and every one of the scale&apos;s 7 tones shows up
        in at least one of them, nothing left out.
      </p>
      <p>
        That holds for any mode, not just the major scale. Playing a mode&apos;s
        I, IV, and V is a fast, practical way to hear its full note content, not
        just the one degree that makes the mode the mode.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {MODES.map(({ name, formula, chords }) => (
          <div key={name}>
            <h3>{name}</h3>
            <p className="mb-3 font-mono text-sm text-fg-secondary">
              {formula}
            </p>
            <div className="flex flex-wrap gap-6">
              {chords.map((chord) => {
                const shape = findShape(chord);
                if (!shape) return null;
                return (
                  <ChordCard
                    key={chord.role}
                    quality={chord.quality}
                    rootNote={chord.root}
                    rootPc={NOTE_TO_PC[chord.root]}
                    rootString={chord.string}
                    rootFinger={chord.finger}
                    tab={shape.tab_relative}
                    label={`${chord.role} – ${chord.root}${chord.quality}`}
                    showIntervals
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
