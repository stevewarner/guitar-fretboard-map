import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  RootPickerCharts,
  type RootPickerChartSpec,
} from '@/components/FretboardChart';
import { MAJOR_SCALE_INTERVALS } from '@/modules/scale/utils/scaleUtils';

export const metadata = buildLessonMetadata(
  'foundations',
  'intervals-and-root-note',
);

const SCALE_CHART: RootPickerChartSpec[] = [
  {
    titleSuffix: 'Ionian scale, 6th string root, 2nd position',
    source: {
      kind: 'position',
      intervals: MAJOR_SCALE_INTERVALS,
      rootString: 6,
      rootFinger: 2,
    },
  },
];

// Every occurrence of the root across a wide, fixed span of the neck — frets 0
// (open) through 15 — rather than one hand position.
const ROOT_ACROSS_NECK_CHART: RootPickerChartSpec[] = [
  {
    titleSuffix: 'root notes across the fretboard, 6th string root',
    source: { kind: 'rootAcrossNeck', startFret: 0, numFrets: 16 },
  },
];

export default function IntervalsAndRootNoteLesson() {
  return (
    <>
      <LessonHeader
        partSlug="foundations"
        lessonSlug="intervals-and-root-note"
      />

      <h2>From 12 notes to intervals</h2>
      <p>
        Western music draws from 12 notes total, repeating in a cycle. Playing
        all 12 in a row, none skipped, is the <strong>chromatic</strong> scale.
        Most scales use far fewer of them. The major and minor scales guitarists
        actually play are <strong>heptatonic</strong>: built from 7 of those 12
        notes, arranged in one specific pattern of whole and half steps that
        also makes them <strong>diatonic</strong>. That&rsquo;s the reason
        interval numbers only run 1 through 7: each number names one of the 7
        notes a diatonic scale keeps, counted from wherever it starts.
      </p>
      <p>
        The{' '}
        <Link
          href="/scale/pentatonic/major"
          className="underline hover:text-fg"
        >
          pentatonic scale
        </Link>{' '}
        contains 5 of those same 7 notes. A <strong>chord</strong> is some of
        those same numbered notes played together instead of one at a time. The
        most common chord, a <strong>triad</strong>, uses exactly 3 of them: 1,
        3, and 5 for major, or 1, b3, and 5 for minor.
      </p>
      <p>
        Whichever of those numbers is being counted, in a scale or a chord, they
        all count from the same starting point. That starting point is always
        numbered 1 (the root), which is why it gets a section of its own next.
      </p>

      <h2>What is an interval</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>An interval is the distance between two notes</li>
        <li>
          Intervals are numbered 1 through 7 within a scale; the 1 is always the
          starting note
        </li>
        <li>
          A half step is the smallest distance between two notes (one fret on
          guitar); a whole step is two half steps (two frets)
        </li>
        <li>
          Intervals can be raised or lowered: a sharp (#) raises a note by one
          half step, a flat (b) lowers it by one half step
        </li>
      </ul>
      <RootPickerCharts
        defaultRoot="G"
        charts={SCALE_CHART}
        caption="{root} major (Ionian), root on the 6th string, 2nd position; every dot labeled by interval number, the root (1) highlighted."
      />

      <h2>The root note (the 1)</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The root is the note a scale or chord is built from. It gives the key
          its name
        </li>
        <li>Every pattern on the fretboard is defined relative to the root</li>
        <li>
          Knowing where the root is tells you what key you are in and how to
          move the pattern anywhere
        </li>
        <li>
          The same note appears many times across the fretboard. The root is not
          one location, it is everywhere
        </li>
      </ul>
      <RootPickerCharts
        defaultRoot="G"
        charts={ROOT_ACROSS_NECK_CHART}
        chartClassName="w-56"
        caption="Every {root} on the neck: the same root note, all over the fretboard."
      />
    </>
  );
}
