import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import { BluesModalInterchangeExplorer } from './BluesModalInterchangeExplorer';

export const metadata = buildLessonMetadata(
  'understanding-modes',
  'mixing-modes',
);

export default async function MixingModesLesson() {
  const shapes = await getShapesBySymbols(['7'], [5, 6]);

  return (
    <>
      <LessonHeader partSlug="understanding-modes" lessonSlug="mixing-modes" />

      <h2>Two other ways to explain the same sound</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Guitarists often explain blues informally as &ldquo;playing minor
          pentatonic over a major chord.&rdquo; That&apos;s true, but it
          doesn&apos;t say why that clash works
        </li>
        <li>
          Secondary Dominants, earlier in this course, is one real theory
          explanation: a chord borrowing the pull of its own V7 for a moment
        </li>
        <li>
          Modal interchange (borrowing a chord from a parallel mode of the same
          tonic) is another. This lesson uses it to explain blues specifically
        </li>
      </ul>

      <h2>Blues: three dominant chords from one key</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          A 12-bar blues progression is I7 – IV7 – V7, and every chord in it is
          a dominant 7
        </li>
        <li>
          A plain major key only has one naturally dominant chord, V; I and IV
          are normally maj7. Blues needs an explanation for the other two
        </li>
        <li>
          This is A blues: the key never changes. Every mode below is rooted on
          A; only the formula changes, chord to chord
        </li>
        <li>
          I7 has to come from A Mixolydian, IV7 from A Dorian, V7 from A Ionian:
          the one mode, per chord, whose own version of that chord happens to be
          a dominant 7
        </li>
      </ul>
      <BluesModalInterchangeExplorer shapes={shapes} />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          V7 barely needs modal interchange as an explanation: A Ionian&apos;s
          own 5th-degree chord is the plain diatonic dominant every major key
          already has, no borrowing required
        </li>
        <li>
          I7 and IV7 are the real cases. I7 needs A&apos;s own Mixolydian
          instead of A&apos;s own diatonic maj7, and IV7 needs A&apos;s Dorian
          instead of A&apos;s diatonic IV (also maj7). Both are borrowed from a
          different parallel mode of the same tonic: the same &ldquo;same root,
          different formula&rdquo; move from Relative vs Parallel Modes, earlier
          in this part
        </li>
        <li>
          All three shapes also share one fretboard position here. The whole
          progression is playable without moving your hand, which is exactly why
          guitarists reach for modal interchange over a full key change to
          explain (and play) the blues
        </li>
        <li>
          Modal interchange, stripped down, is exactly this: a mode belonging to
          the tonic bleeding into a chord that isn&apos;t itself in that mode.
          That&apos;s also what makes &ldquo;minor pentatonic over a major
          chord&rdquo; work in the first place
        </li>
      </ul>
    </>
  );
}
