import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  RootPickerCharts,
  type RootPickerChartSpec,
} from '@/components/FretboardChart';
import type { RootString, RootFinger } from '@/modules/scale/utils/scaleUtils';
import Link from 'next/link';

export const metadata = buildLessonMetadata('foundations', 'pentatonic');

const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9]; // 1 2 3 5 6
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10]; // 1 b3 4 5 b7
// Position 2 (2nd finger on the root) — usually the most familiar box shape for
// beginners, stays within a 4-fret span, and doesn't require a stretch.
const BOX_POSITION = { rootString: 6 as const, rootFinger: 2 as const };
const DEFAULT_ROOT = 'G';

type FixedPosition = { rootString: RootString; rootFinger: RootFinger };
type ModeSlug = 'major' | 'minor';

// Links a chart to the exact same shape on its Scale Explorer page. Only
// possible for a fixed hand position — an anchored-window shape has no
// (string, position) pair of its own to link to.
function scaleHref(modeSlug: ModeSlug, position: FixedPosition): string {
  return `/scale/pentatonic/${modeSlug}?root={root}&string=${position.rootString}&position=${position.rootFinger}`;
}

// The 5 positions across the neck, as fixed hand positions — major and minor
// don't share the same shape at every slot, so these are independent per scale.
const MAJOR_POSITIONS: FixedPosition[] = [
  { rootString: 6, rootFinger: 4 },
  BOX_POSITION,
  { rootString: 4, rootFinger: 2 },
  { rootString: 5, rootFinger: 4 },
  { rootString: 5, rootFinger: 2 },
];
const MINOR_POSITIONS: FixedPosition[] = [
  { rootString: 6, rootFinger: 1 },
  { rootString: 4, rootFinger: 1 },
  { rootString: 5, rootFinger: 4 },
  { rootString: 5, rootFinger: 1 },
  { rootString: 6, rootFinger: 4 },
];

const BOX_CHARTS: RootPickerChartSpec[] = [
  {
    label: 'Major',
    titleSuffix: 'major pentatonic, 6th string root, box position',
    source: {
      kind: 'position',
      intervals: MAJOR_PENTATONIC_INTERVALS,
      ...BOX_POSITION,
    },
    href: scaleHref('major', BOX_POSITION),
  },
  {
    label: 'Minor',
    titleSuffix: 'minor pentatonic, 6th string root, box position',
    source: {
      kind: 'position',
      intervals: MINOR_PENTATONIC_INTERVALS,
      ...BOX_POSITION,
    },
    href: scaleHref('minor', BOX_POSITION),
  },
];

// Builds the 5 "shape" charts for one scale. Labeled "Shape" rather than
// "Position" in the UI — "position" already means the rootString+rootFinger hand
// position elsewhere on the site (see scaleUtils.ts, PositionControls), and each
// of these 5 shapes is itself built from one specific position (e.g. shape 3 here
// is string 4, finger 2) — calling the shape itself a "position" would collide.
function buildPositionCharts(
  intervals: number[],
  qualityLabel: string,
  modeSlug: ModeSlug,
  positions: FixedPosition[],
): RootPickerChartSpec[] {
  return positions.map((position, i) => ({
    label: `Shape ${i + 1}`,
    titleSuffix: `${qualityLabel} pentatonic, shape ${i + 1}`,
    source: { kind: 'position', intervals, ...position },
    href: scaleHref(modeSlug, position),
  }));
}

const MAJOR_POSITION_CHARTS = buildPositionCharts(
  MAJOR_PENTATONIC_INTERVALS,
  'major',
  'major',
  MAJOR_POSITIONS,
);
const MINOR_POSITION_CHARTS = buildPositionCharts(
  MINOR_PENTATONIC_INTERVALS,
  'minor',
  'minor',
  MINOR_POSITIONS,
);

export default function PentatonicLesson() {
  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="pentatonic" />

      <h2>Major and minor pentatonic</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The pentatonic scale uses 5 of the 7 scale tones: the most common
          starting point for improvisation on guitar
        </li>
        <li>Major pentatonic: 1 2 3 5 6 (removes the 4 and 7)</li>
        <li>Minor pentatonic: 1 b3 4 5 b7 (removes the 2 and b6)</li>
        <li>
          Most guitar players already know the{' '}
          <Link
            href="/scale/pentatonic/minor?string=6&position=1"
            className="underline hover:text-fg"
          >
            1st finger position
          </Link>{' '}
          of the minor pentatonic
        </li>
        <li>
          Labeling the shape with interval numbers instead of fret positions
          means the same shape works in any key
        </li>
      </ul>
      <RootPickerCharts
        defaultRoot={DEFAULT_ROOT}
        charts={BOX_CHARTS}
        caption="{root} major and {root} minor pentatonic, same box position, root on the 6th string, 2nd finger."
      />

      <h2>Shapes across the neck</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The same 5 notes repeat across the entire fretboard in 5 overlapping
          shapes
        </li>
        <li>Learning all 5 shapes connects the neck into one continuous map</li>
        <li>
          Moving between shapes is the practical answer to being stuck in one
          area of the fretboard
        </li>
      </ul>
      <h3>Major pentatonic</h3>
      <RootPickerCharts
        defaultRoot={DEFAULT_ROOT}
        charts={MAJOR_POSITION_CHARTS}
        chartClassName="w-48"
        caption="{root} major pentatonic, all 5 shapes: five overlapping hand positions that connect into one continuous map across the neck."
      />

      <h3>Minor pentatonic</h3>
      <RootPickerCharts
        defaultRoot={DEFAULT_ROOT}
        charts={MINOR_POSITION_CHARTS}
        chartClassName="w-48"
        caption="{root} minor pentatonic, all 5 shapes: five overlapping hand positions that connect into one continuous map across the neck."
      />
    </>
  );
}
