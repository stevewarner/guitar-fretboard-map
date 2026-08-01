import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { INTERVAL_LABELS, NOTE_TO_PC } from '@/app/utils/constants';
import {
  getModeIntervals,
  isValidPosition,
  getValidFingersForString,
  getDiatonicChords,
  getDiatonicTriads,
  ROOT_STRINGS,
  ROOT_FINGERS,
  DEFAULT_POSITION,
  type RootString,
  type RootFinger,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';
import { getOrdinal } from '@/app/utils';
import { ScaleViewer } from '@/modules/scale/ScaleViewer';
import { ModeChords } from '@/modules/scale/ModeChords';
import { PentatonicBoxChart } from '@/modules/scale/PentatonicBoxChart';

type Props = {
  params: Promise<{ system: string; mode: string }>;
  searchParams: Promise<{ root?: string; string?: string; position?: string }>;
};

export function generateStaticParams() {
  return SCALE_SYSTEMS.flatMap((s) =>
    s.modes.map((m) => ({ system: s.slug, mode: m.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { system: systemSlug, mode: modeSlug } = await params;
  const system = SCALE_SYSTEMS.find((s) => s.slug === systemSlug);
  const mode = system?.modes.find((m) => m.slug === modeSlug);
  if (!system || !mode) return {};
  return {
    title: `${mode.displayName} — ${system.displayName}`,
    alternates: { canonical: `/scale/${system.slug}/${mode.slug}` },
  };
}

type ScaleRow = { intervals: number[] };

function parseRootNote(raw: string | undefined): string {
  return raw && raw in NOTE_TO_PC ? raw : 'A';
}

function parsePosition(
  stringParam: string | undefined,
  positionParam: string | undefined,
  rootPc: number,
): ScalePosition {
  const rs = Number(stringParam);
  const rf = Number(positionParam);
  const rootString: RootString = (ROOT_STRINGS as number[]).includes(rs)
    ? (rs as RootString)
    : DEFAULT_POSITION.rootString;
  const requestedFinger: RootFinger = (ROOT_FINGERS as number[]).includes(rf)
    ? (rf as RootFinger)
    : DEFAULT_POSITION.rootFinger;

  const requested: ScalePosition = { rootString, rootFinger: requestedFinger };
  if (isValidPosition(requested, rootPc)) return requested;

  const validFingers = getValidFingersForString(rootString, rootPc);
  if (validFingers.length > 0)
    return { rootString, rootFinger: validFingers[0] };
  return DEFAULT_POSITION;
}

export default async function ScaleModePage({ params, searchParams }: Props) {
  const { system: systemSlug, mode: modeSlug } = await params;
  const sp = await searchParams;

  const system = SCALE_SYSTEMS.find((s) => s.slug === systemSlug);
  const modeData = system?.modes.find((m) => m.slug === modeSlug);
  if (!system || !modeData) notFound();

  const dbName = modeData.dbName ?? system.dbName;
  const { rows } = await sql<ScaleRow>`
    SELECT intervals FROM scales WHERE name = ${dbName} LIMIT 1
  `;
  if (!rows.length) notFound();

  const parentIntervals = rows[0].intervals as number[];
  const modeIntervals = getModeIntervals(parentIntervals, modeData.degree);
  const intervalFormula = modeIntervals
    .map((i) => INTERVAL_LABELS[i])
    .join('  ');
  const quality =
    modeIntervals.includes(4) && !modeIntervals.includes(3)
      ? 'Major'
      : modeIntervals.includes(3)
        ? 'Minor'
        : null;

  const rootNote = parseRootNote(sp.root);
  const rootPc = NOTE_TO_PC[rootNote];
  const position = parsePosition(sp.string, sp.position, rootPc);
  const degree = modeData.degree + 1;

  const diatonicChords = getDiatonicChords(modeIntervals, rootNote);
  const diatonicTriads = getDiatonicTriads(modeIntervals, rootNote);

  return (
    <div>
      <h1 className={system.showModeInfo ? 'mb-1' : 'mb-4'}>
        {modeData.pageTitle ?? modeData.displayName}
      </h1>
      {system.showModeInfo && (
        <>
          <p className="text-sm text-gray-500">
            {degree}
            {getOrdinal(degree)} mode of the {system.displayName} scale
          </p>
          <p className="mb-4 text-sm text-gray-500">{quality}</p>
        </>
      )}
      <p className="mb-1 text-sm font-medium">Intervals</p>
      <p className="mb-6 font-mono text-sm tracking-wider">{intervalFormula}</p>
      <ScaleViewer
        modeIntervals={modeIntervals}
        rootNote={rootNote}
        rootPc={rootPc}
        position={position}
      />
      {system.slug === 'pentatonic' && (
        <PentatonicBoxChart
          rootPc={rootPc}
          modeIntervals={modeIntervals}
          rootString={position.rootString}
        />
      )}
      {diatonicChords && diatonicTriads && (
        <ModeChords
          triads={diatonicTriads}
          sevenths={diatonicChords}
          rootPc={rootPc}
        />
      )}
    </div>
  );
}
