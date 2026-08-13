import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { FourNoteVoicingsExplorer } from './FourNoteVoicingsExplorer';

export const metadata = buildLessonMetadata(
  'chord-voicings',
  'four-note-voicings',
);

const QUALITIES = ['maj7', 'm7', '7', 'm7b5'] as const;

export default async function FourNoteVoicingsLesson() {
  const dbShapes = await getShapesBySymbols([...QUALITIES], [4]);
  const shapes = Object.fromEntries(
    QUALITIES.map((symbol) => {
      const shape = dbShapes.find(
        (s) =>
          s.quality_symbol === symbol &&
          s.root_string === 4 &&
          s.root_finger === 1,
      );
      return [symbol, shape?.tab_relative ?? []];
    }),
  ) as Record<(typeof QUALITIES)[number], (number | 'x')[]>;

  return (
    <>
      <LessonHeader partSlug="chord-voicings" lessonSlug="four-note-voicings" />

      <h2>The 1-5-7-3 voicing</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          A 7th chord&apos;s 4 notes (1, 3, 5, 7) can be arranged in more than
          one order across the neck. This lesson uses one specific order, low to
          high: 1, 5, 7, 3
        </li>
        <li>Root on the 4th string, one finger per string, no doubled notes</li>
        <li>
          The same shape moves up the neck to reach every root, the same
          movable-shape idea from Major Chord Shapes
        </li>
      </ul>

      <FourNoteVoicingsExplorer defaultRoot="E" shapes={shapes} />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Every diatonic 7th chord in a key fits this same shape, just moved to
          a new fret. One shape, seven roots
        </li>
        <li>
          Voicing Inversions, next, keeps this same shape but changes which
          chord tone lands on the 4th string
        </li>
      </ul>
    </>
  );
}
