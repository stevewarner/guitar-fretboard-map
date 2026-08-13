import { Metadata } from 'next';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { topSpace } from '@/components/FretboardChart/constants';
import { computeFingerLabels } from '@/app/utils/musicUtils';
import {
  AnnotatedFretboard,
  stringX,
  fretY,
  fingerLabelX,
  fingerLabelY,
  fretboardRight,
  type FretboardCallout,
} from '@/modules/howToReadCharts/AnnotatedFretboard';

export const metadata: Metadata = {
  title: 'How to Read the Charts',
  description:
    'A quick guide to the dots, colors, and numbers used in every chord and scale diagram on GuitarTheory.',
  alternates: { canonical: '/how-to-read-charts' },
};

// The familiar open C major chord (x32010) — a fixed, non-interactive example
// up top so a reader sees one recognizable chart before the page starts
// breaking down what each piece means. One string per index (E A D G B e);
// 'x' is muted, everything else is a fret number.
const OPEN_C_TAB = ['x', 3, 2, 0, 1, 0];
const OPEN_C_INTERVALS = [undefined, '1', '3', '5', '1', '3'];
// Root (C) is fretted on the A string with the 3rd finger — the standard
// open-C fingering, same convention computeFingerLabels uses everywhere else.
const OPEN_C_FINGER_LABELS = computeFingerLabels(1, 4, 3, 3);

// A few callouts on the intro chart, pointing at the grid concepts the
// sections below explain in words.
const OPEN_C_CALLOUTS: FretboardCallout[] = [
  {
    text: ['Finger position', 'labels'],
    target: { x: fingerLabelX, y: fingerLabelY(0) },
    from: { x: 55, y: 58 },
    labelPos: { x: 55, y: 55 },
    anchor: 'end',
  },
  {
    text: 'Muted string',
    target: { x: stringX(0), y: fretY(0) },
    from: { x: 86.5, y: 24 },
    labelPos: { x: 86.5, y: 16 },
  },
  {
    // G string, open — played without fretting anything.
    text: 'Open string',
    target: { x: stringX(3), y: fretY(0) },
    from: { x: 135, y: 24 },
    labelPos: { x: 135, y: 16 },
  },
  {
    // D string, 2nd fret — the "3" interval of the C major chord.
    text: 'Interval label',
    target: { x: stringX(2), y: fretY(2) },
    from: { x: 172, y: 78 },
    labelPos: { x: 172, y: 70 },
    anchor: 'start',
    // Negative flips which side the arc bows toward — this one swoops down
    // instead of the default upward bow.
    curve: -12,
  },
];

// A 6-fret span with only 4 numbered fingers — the outer two rows are the
// stretches (1st finger reaching back, 4th finger reaching forward) that let
// a position cover more ground than a flat 4-finger span would. No notes,
// just the finger coverage itself: each finger's rows get a colored
// highlight, drawn as plain translucent <rect>s passed in as Fretboard
// children (same pattern AnnotatedFretboard uses for its own overlays).
const FINGER_SPAN_LABELS = ['', '1', '2', '3', '4', ''];
const FRET_ROW_HEIGHT = topSpace;
const FRET_GRID_LEFT = topSpace;
const FRET_GRID_WIDTH = fretboardRight - topSpace;
const fretRowY = (rowIndex: number) => topSpace * (rowIndex + 1);

export default function HowToReadChartsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4">How to Read the Charts</h1>
      <p className="mb-8 text-fg-secondary">
        Every chord and scale diagram on this site uses the same layout, so once
        it clicks here, it applies everywhere. This page walks through it piece
        by piece, then puts it together with a couple of real examples.
      </p>

      <div className="mb-8 w-full">
        <AnnotatedFretboard
          numFrets={4}
          title="C major chord — guitar fretboard diagram"
          fingerLabels={OPEN_C_FINGER_LABELS}
          callouts={OPEN_C_CALLOUTS}
          padding={{ top: 32, left: 65, right: 60, bottom: 5 }}
        >
          <Pattern tab={OPEN_C_TAB} intervals={OPEN_C_INTERVALS} />
        </AnnotatedFretboard>
      </div>

      <h2 className="mb-2">The grid</h2>
      <ul className="mb-8 list-disc space-y-1 pl-5">
        <li>
          The 6 vertical lines are the strings — thick low E on the left, thin
          high e on the right, same as looking down at the neck while holding
          the guitar
        </li>
        <li>The horizontal lines are frets, with the nut at the top</li>
        <li>
          A label like &ldquo;5fr&rdquo; next to the top line means the diagram
          starts at the 5th fret rather than the open string — the shape has
          just moved further up the neck
        </li>
        <li>A dot on a string means play that note there</li>
      </ul>

      <h2 className="mb-2">Numbers on the dots</h2>
      <ul className="mb-8 list-disc space-y-1 pl-5">
        <li>
          The number on a dot is an interval — its position in the scale — not a
          fret number or a note name
        </li>
        <li>The root is always labeled 1</li>
        <li>
          A &ldquo;b&rdquo; before a number (b3, b7) means that note is lowered
          a half step
        </li>
        <li>
          Because the labels are intervals, the exact same shape and numbering
          work in any key — only the root note picked below changes
        </li>
      </ul>

      <h2 className="mb-2">Finger numbers</h2>
      <ul className="mb-8 list-disc space-y-1 pl-5">
        <li>
          The small numbers down the left edge are a suggested left-hand
          fingering — 1 through 4 — for that row of frets
        </li>
        <li>
          A blank row means a stretch: reach with the 1st or 4th finger beyond
          the rest of the hand position to grab one extra note
        </li>
      </ul>
      <p className="mb-4 text-fg-secondary">
        The number to the left of the fretboard chart labels which finger covers
        that fret. Usually the rule is 1 finger per fret. Some scales and chords
        can span more than 4 frets. To cover those cases, the first and fourth
        finger can stretch to an additional fret, allowing coverage of 6 frets.
      </p>
      <p className="mb-4 text-fg-secondary">
        In the example below, the index finger covers the first 2 frets (blue).
        Middle finger covers the 3rd fret (red). Ring finger covers the 4th fret
        (green). Pinky finger covers the 5th and 6th fret (yellow).
      </p>
      <div className="mb-8 w-56">
        <Fretboard
          numFrets={6}
          title="A 6-fret span covered by 4 fingers, with a stretch at each end"
          fingerLabels={FINGER_SPAN_LABELS}
        >
          <rect
            x={FRET_GRID_LEFT}
            y={fretRowY(0)}
            width={FRET_GRID_WIDTH}
            height={FRET_ROW_HEIGHT * 2}
            fill="blue"
            fillOpacity={0.25}
          />
          <rect
            x={FRET_GRID_LEFT}
            y={fretRowY(2)}
            width={FRET_GRID_WIDTH}
            height={FRET_ROW_HEIGHT}
            fill="red"
            fillOpacity={0.25}
          />
          <rect
            x={FRET_GRID_LEFT}
            y={fretRowY(3)}
            width={FRET_GRID_WIDTH}
            height={FRET_ROW_HEIGHT}
            fill="green"
            fillOpacity={0.25}
          />
          <rect
            x={FRET_GRID_LEFT}
            y={fretRowY(4)}
            width={FRET_GRID_WIDTH}
            height={FRET_ROW_HEIGHT * 2}
            fill="yellow"
            fillOpacity={0.25}
          />
        </Fretboard>
      </div>

      <p className="mt-8 text-sm text-fg-secondary">
        Ready to put it to use? Browse the{' '}
        <Link href="/chord" className="underline hover:text-fg">
          chord library
        </Link>
        , explore the{' '}
        <Link href="/scale" className="underline hover:text-fg">
          scale explorer
        </Link>
        , or start the{' '}
        <Link href="/lesson" className="underline hover:text-fg">
          lessons
        </Link>
        .
      </p>
    </div>
  );
}
