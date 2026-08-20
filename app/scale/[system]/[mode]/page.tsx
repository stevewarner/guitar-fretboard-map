import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { SCALE_INTERVALS } from '@/modules/scale/data/scaleIntervals';
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
import { SectionLabel } from '@/components/SectionLabel';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList, definedTerm } from '@/app/utils/structuredData';

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
  const title = `${mode.displayName} — ${system.displayName}`;
  const description = mode.description;
  return {
    title,
    description,
    alternates: { canonical: `/scale/${system.slug}/${mode.slug}` },
    openGraph: {
      title: `GuitarTheory | ${title}`,
      description,
    },
  };
}

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
  const parentIntervals = SCALE_INTERVALS[dbName];
  if (!parentIntervals) notFound();
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

  const modeTitle = modeData.pageTitle ?? modeData.displayName;

  return (
    <div>
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Scales', path: '/scale' },
          {
            name: modeTitle,
            path: `/scale/${system.slug}/${modeData.slug}`,
          },
        ])}
      />
      <JsonLd
        data={definedTerm({
          name: `${modeTitle} — ${system.displayName}`,
          description: modeData.description,
          termSetName: 'Guitar Scales',
          termSetPath: '/scale',
        })}
      />
      <SectionLabel>
        Scales / {system.displayName} / {modeData.displayName}
      </SectionLabel>
      <h1 className="mb-2 mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        {modeTitle}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-fg-secondary">
        {modeData.description}
      </p>
      {system.showModeInfo && (
        <p className="mb-6 text-sm text-fg-muted">
          {degree}
          {getOrdinal(degree)} mode of the {system.displayName} scale
          {quality && ` · ${quality}`}
        </p>
      )}
      <SectionLabel as="h2" className="mb-1">
        Intervals
      </SectionLabel>
      <p className="mb-6 font-mono text-sm tracking-wider">{intervalFormula}</p>
      <SectionLabel as="h2" className="mb-3">
        Diagram
      </SectionLabel>
      {/* key resets ScaleViewer's root-highlight toggle when navigating to a
          different system/mode — root/string/position changes reuse the
          same key, so those intentionally leave the toggle as-is. */}
      <ScaleViewer
        key={`${system.slug}-${modeData.slug}`}
        modeIntervals={modeIntervals}
        modeTitle={modeTitle}
        patternKind={system.slug === 'pentatonic' ? 'scale' : 'mode'}
        rootNote={rootNote}
        rootPc={rootPc}
        position={position}
      />
      {system.slug === 'pentatonic' && (
        <>
          <SectionLabel as="h2" className="mb-3 mt-8">
            Pentatonic Pattern
          </SectionLabel>
          <PentatonicBoxChart
            rootPc={rootPc}
            modeIntervals={modeIntervals}
            rootString={position.rootString}
          />
        </>
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
