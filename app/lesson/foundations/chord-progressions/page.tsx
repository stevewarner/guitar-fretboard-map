import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { ProgressionExample } from './ProgressionExample';

export const metadata = buildLessonMetadata(
  'foundations',
  'chord-progressions',
);

export default async function ChordProgressionsLesson() {
  const dbShapes = await getShapesBySymbols(['maj', 'm'], [5]);
  const maj = dbShapes.find(
    (s) =>
      s.quality_symbol === 'maj' && s.root_string === 5 && s.root_finger === 1,
  );
  const m = dbShapes.find(
    (s) =>
      s.quality_symbol === 'm' && s.root_string === 5 && s.root_finger === 1,
  );
  // Both are known-good, permanently-seeded rows (see the diatonic-harmony
  // lesson, which relies on the same two shapes) — if either is somehow
  // missing, fail loudly rather than silently rendering an empty lesson.
  if (!maj || !m) {
    throw new Error(
      'Missing maj/m chord_shapes at root_string=5, root_finger=1',
    );
  }
  const shapes = { maj: maj.tab_relative, m: m.tab_relative };

  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="chord-progressions" />

      <h2>Naming progressions by number</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          A progression is a sequence of chords, each named by its scale degree
          instead of a specific chord name: I–IV–V, ii–V–I, and so on
        </li>
        <li>
          Case still signals quality, exactly like the Roman numerals from
          Diatonic Harmony: uppercase is major, lowercase is minor
        </li>
        <li>
          Because a number describes a relationship rather than a note name, the
          same progression label works in any key. Change the key and the chords
          change, but the pattern doesn&rsquo;t
        </li>
        <li>
          This is the Nashville Number System in practice: the system session
          musicians actually use to write charts any band can read in any key,
          on the spot
        </li>
      </ul>

      <h2>Common progressions</h2>
      <ProgressionExample
        numeralsLabel="I – IV – V"
        degrees={[1, 4, 5]}
        defaultRoot="A"
        description="The classic I–IV–V blues progression: home, up to the IV, up to the V, and back home."
        shapes={shapes}
      />
      <ProgressionExample
        numeralsLabel="I – V – vi – IV"
        degrees={[1, 5, 6, 4]}
        defaultRoot="G"
        description="The most-used progression in pop and rock, sometimes called “the four chords” for how many songs share it."
        shapes={shapes}
      />
      <ProgressionExample
        numeralsLabel="ii – V – I – vi"
        degrees={[2, 5, 1, 6]}
        defaultRoot="F"
        description="A staple jazz turnaround, and an example that doesn't start on the I chord: the numbers still work the same way regardless of which chord comes first."
        shapes={shapes}
      />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Learning a song &ldquo;by the numbers&rdquo; means it transposes
          instantly: the same I–V–vi–IV works whether a singer needs it in G or
          Eb
        </li>
        <li>
          Recognizing a progression by number means recognizing it by ear across
          completely different songs and keys, not just memorizing one
          song&rsquo;s chords
        </li>
        <li>
          It&rsquo;s how a guitarist, a bassist, and a keyboard player read the
          same chart and instantly know their own part, without anyone writing
          out every chord name in every key
        </li>
      </ul>
    </>
  );
}
