import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { BrightnessSpectrumExplorer } from './BrightnessSpectrumExplorer';

export const metadata = buildLessonMetadata(
  'understanding-modes',
  'comparing-modes',
);

export default function ComparingModesLesson() {
  return (
    <>
      <LessonHeader
        partSlug="understanding-modes"
        lessonSlug="comparing-modes"
      />

      <h2>The brightness spectrum</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The 7 modes run from brightest to darkest: Lydian, Ionian, Mixolydian,
          Dorian, Aeolian, Phrygian, Locrian
        </li>
        <li>
          Brightness comes from raised degrees, darkness comes from lowered
          degrees
        </li>
        <li>
          Each mode below is anchored to the same root: not 7 different keys,
          one key played 7 different ways
        </li>
        <li>
          The highlighted note is the one thing that changed from the mode just
          before it: every step flattens exactly one more note than the last
        </li>
      </ul>
      <BrightnessSpectrumExplorer />

      <h2>Why Ionian, not Lydian?</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Western music theory treats Ionian as the center of this spectrum:
          it&apos;s &ldquo;the major scale,&rdquo; the one every key signature
          and every other mode gets described relative to
        </li>
        <li>
          But Ionian isn&apos;t the brightest mode; Lydian is. That means
          describing modes relative to Ionian needs two directions: Lydian is
          Ionian with a degree raised, everything else is Ionian with one or
          more degrees lowered
        </li>
        <li>
          If Lydian were the center instead, that mix of directions would
          disappear: every mode from Ionian down to Locrian would just be
          &ldquo;Lydian with one more note flattened,&rdquo; one note at a time,
          always the same direction
        </li>
        <li>
          Ionian won that center spot historically, not acoustically. It became
          the default major scale in Western harmony. Everything else, including
          Lydian itself, gets defined in reference to it instead of the other
          way around
        </li>
      </ul>

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Once the brightness order clicks, picking a mode becomes a brightness
          decision: need something darker than Aeolian without going all the way
          to Locrian&apos;s unstable b5? Phrygian is one step in between
        </li>
        <li>
          Mixing Modes, next, uses this same spectrum in reverse: borrowing a
          chord from a darker or brighter parallel mode to shift the color of a
          progression for a moment
        </li>
      </ul>
    </>
  );
}
