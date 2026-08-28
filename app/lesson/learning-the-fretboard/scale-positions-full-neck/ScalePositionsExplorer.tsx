import Link from 'next/link';
import {
  Fretboard,
  Pattern,
  buildChart,
  describeChartForScreenReaders,
  type ScaleChartLayer,
} from '@/components/FretboardChart';
import {
  MAJOR_SCALE_INTERVALS,
  type RootString,
  type RootFinger,
} from '@/modules/scale/utils/scaleUtils';

const ROOT_STRINGS: RootString[] = [6, 5, 4];
// Finger 0 (the stretch) is deliberately excluded — for a plain 4-finger
// position it shares its window with finger 2 on the same string, just
// reached by a backward stretch instead of landing there naturally.
// Including it would only ever produce a near-duplicate of an already-shown
// position.
const ROOT_FINGERS: RootFinger[] = [1, 2, 3, 4];
const POSITIONS_TO_SHOW = 5;
export const FINGER_ORDINAL: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
};

export interface Candidate {
  rootString: RootString;
  rootFinger: RootFinger;
  startFret: number;
  numFrets: number;
  layers: ScaleChartLayer[];
}

// Picks 5 positions spread across the neck, evenly, in ascending fret order
// — for whichever root is selected. A fixed (string, finger) list can't do
// this: verified that any single hardcoded set of 5 positions only stays in
// ascending order for 2 of the 12 roots, since each position's own
// low-string octave wraparound point falls at a different root. Computing
// fresh per root is what actually delivers "connects across the neck with
// no gaps" for every key, not just the one it was eyeballed against.
//
// Sorts by the *rendered* startFret from buildChart, not a hand-derived
// window — deriveScaleRender runs its own fallback logic
// (resolveWindowForPosition) that can shift a position's actual displayed
// fret away from the naive computePositionWindow result (e.g. reaching
// toward an idle open string), so anything computed independently of the
// real render risks picking a "5 positions, ascending" set that doesn't
// match what's actually on screen.
export function pickPositions(rootPc: number): Candidate[] {
  const candidates = ROOT_STRINGS.flatMap((rootString) =>
    ROOT_FINGERS.map((rootFinger) => {
      const built = buildChart(
        {
          kind: 'position',
          intervals: MAJOR_SCALE_INTERVALS,
          rootString,
          rootFinger,
        },
        rootPc,
      );
      return { rootString, rootFinger, ...built };
    }),
  );

  candidates.sort((a, b) => a.startFret - b.startFret);

  // Drop consecutive ties (different strings can legitimately land on the
  // same startFret — but showing both back to back reads as a near-repeat,
  // not new ground).
  const deduped = candidates.filter(
    (c, i) => i === 0 || c.startFret !== candidates[i - 1].startFret,
  );

  const lastIndex = deduped.length - 1;
  const picks = Array.from({ length: POSITIONS_TO_SHOW }, (_, i) =>
    Math.round((i * lastIndex) / (POSITIONS_TO_SHOW - 1)),
  );
  return [...new Set(picks)].map((i) => deduped[i]);
}

interface ScalePositionsExplorerProps {
  root: string;
  positions: Candidate[];
}

// Presentational row — root and the picked positions both come from the
// parent (ScalePositionsSection), which computes pickPositions() once and
// shares the result with the merged full-neck overlay below, so both views
// always show the exact same 5 positions, not just the same root.
export function ScalePositionsExplorer({
  root,
  positions,
}: ScalePositionsExplorerProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-6">
      {positions.map(
        ({ rootString, rootFinger, numFrets, startFret, layers }) => {
          const label = `${rootString}th String, ${FINGER_ORDINAL[rootFinger]} Finger`;
          return (
            <div key={`${rootString}-${rootFinger}`}>
              <Link
                href={`/scale/major-scale/ionian?root=${encodeURIComponent(root)}&string=${rootString}&position=${rootFinger}`}
                className="hover:opacity-80"
              >
                <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
                  {label}
                </p>
                <div className="w-40">
                  <Fretboard
                    numFrets={numFrets}
                    startFret={startFret > 1 ? startFret : undefined}
                    title={`${root} major scale, ${label} — guitar fretboard diagram`}
                  >
                    {layers.map((layer, i) => (
                      <Pattern key={i} {...layer} />
                    ))}
                  </Fretboard>
                </div>
              </Link>
              <p className="sr-only">{describeChartForScreenReaders(layers)}</p>
            </div>
          );
        },
      )}
    </div>
  );
}
