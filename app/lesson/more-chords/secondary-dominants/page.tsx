import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { SecondaryDominantsExplorer } from './SecondaryDominantsExplorer';

export const metadata = buildLessonMetadata(
  'more-chords',
  'secondary-dominants',
);

const DEFAULT_ROOT = 'C';
const QUALITIES = ['7', 'm7', 'maj7'] as const;

export default async function SecondaryDominantsLesson() {
  const dbShapes = await getShapesBySymbols([...QUALITIES], [5]);
  const shapes = Object.fromEntries(
    QUALITIES.map((symbol) => {
      const shape = dbShapes.find(
        (s) =>
          s.quality_symbol === symbol &&
          s.root_string === 5 &&
          s.root_finger === 1,
      );
      return [symbol, shape?.tab_relative ?? []];
    }),
  ) as Record<(typeof QUALITIES)[number], (number | 'x')[]>;

  return (
    <>
      <LessonHeader partSlug="more-chords" lessonSlug="secondary-dominants" />

      <h2>Borrowing a V7</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Any diatonic chord can be preceded by its own V7, written{' '}
          <strong>V/target</strong> and read &ldquo;five of target&rdquo;: a
          secondary dominant
        </li>
        <li>
          A secondary dominant&apos;s root is always a perfect 5th above its
          target, same relationship the key&apos;s own V has to I, just applied
          to a different chord for a moment
        </li>
        <li>
          It&apos;s not diatonic to the key: its 3rd and 7th introduce a note
          from outside the scale, which is exactly what gives it a stronger pull
          into the target than the target&apos;s usual neighbor would have
        </li>
        <li>
          V/I isn&apos;t shown below: that&apos;s just the key&apos;s own V,
          nothing borrowed about it
        </li>
      </ul>
      <SecondaryDominantsExplorer defaultRoot={DEFAULT_ROOT} shapes={shapes} />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Chaining them works too: D7 leads to G7 leads to C is V/V leading to V
          leading to I, each chord borrowing the next one&apos;s dominant
        </li>
        <li>
          This is the same tension-then-resolution engine as the key&apos;s own
          V7, just aimed at any chord in the progression, not only the final
          landing point
        </li>
      </ul>
    </>
  );
}
