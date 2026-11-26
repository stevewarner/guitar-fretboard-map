import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { SCALE_INTERVALS } from '@/modules/scale/data/scaleIntervals';
import { parseNote, spellScale } from '@/app/utils/noteSpelling';
import { STRING_LABELS } from '@/app/utils/musicUtils';
import {
  getModeIntervals,
  scaleRootName,
  spellScaleIntervals,
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
import { PageSection } from '@/components/PageSection';
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
  const title = `${mode.displayName} - ${system.displayName}`;
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
  if (!raw) return 'A';
  try {
    parseNote(raw);
    return raw;
  } catch {
    return 'A';
  }
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
  const scaleIntervalLabels = spellScaleIntervals(modeIntervals);
  const quality =
    modeIntervals.includes(4) && !modeIntervals.includes(3)
      ? 'Major'
      : modeIntervals.includes(3)
        ? 'Minor'
        : null;

  const rootNote = parseRootNote(sp.root);
  const rootPc = parseNote(rootNote).pc;

  // Same rule as chord pages: ?root=A%23 on Ionian #5 moves to ?root=Bb.
  const preferredRootNote = scaleRootName(rootPc, modeIntervals);
  if (sp.root && rootNote !== preferredRootNote) {
    const redirectParams = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (typeof value === 'string') redirectParams.set(key, value);
    }
    redirectParams.set('root', preferredRootNote);
    permanentRedirect(
      `/scale/${system.slug}/${modeData.slug}?${redirectParams.toString()}`,
    );
  }
  const position = parsePosition(sp.string, sp.position, rootPc);
  const degree = modeData.degree + 1;

  const diatonicChords = getDiatonicChords(modeIntervals, rootNote);
  const diatonicTriads = getDiatonicTriads(modeIntervals, rootNote);

  const modeTitle = modeData.pageTitle ?? modeData.displayName;

  // SVG-only <desc> summary (docs/GEO_STRATEGY.md item 5) — short standalone
  // sentences covering notes, intervals, and root string, so a crawler/
  // screen reader that only reads the diagram's own accessible name still
  // gets the full answer. See buildChordSvgDescription in
  // app/chord/[quality]/page.tsx for the equivalent on chord pages.
  const scaleNoteNames = spellScale(rootNote, modeIntervals);
  const scaleSvgDescription = `${modeTitle} ${system.slug === 'pentatonic' ? 'scale' : 'mode'} in ${rootNote} guitar fretboard diagram. Notes ${scaleNoteNames.join(', ')}. Intervals ${scaleIntervalLabels.join(', ')}. Root ${rootNote} on the ${STRING_LABELS[position.rootString]}.`;

  const isPentatonic = system.slug === 'pentatonic';

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
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
          name: `${modeTitle} - ${system.displayName}`,
          description: modeData.description,
          termSetName: 'Guitar Scales',
          termSetPath: '/scale',
        })}
      />

      <div className="flex flex-col gap-6 lg:gap-8">
        <div>
          {/* Lines up with the scale-systems toggle beside it on desktop. */}
          <SectionLabel className="flex min-h-9 items-center">
            Scales / {system.displayName} / {modeData.displayName}
          </SectionLabel>
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
            {modeTitle}
          </h1>
          {/* Major or Minor from the 3rd. A label, not a link — so a grey
              pill, not the black link Tags used elsewhere. */}
          {quality && (
            <span className="mt-3 inline-block rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-bold">
              {quality}
            </span>
          )}
          {/* Pentatonic's 2 entries are separate scales, not modes of one
              another. */}
          {!isPentatonic && (
            <p className="mt-4 text-sm text-fg-secondary">
              {degree}
              {getOrdinal(degree)} mode of the {system.displayName} scale
            </p>
          )}
          {modeData.aka && (
            <p className="mt-1 text-sm text-fg-secondary">
              Also known as &lsquo;{modeData.aka}&rsquo;
            </p>
          )}
        </div>

        {/* key resets the panel's toggles when navigating to a different
            system/mode — root/string/position changes reuse the same key, so
            those intentionally leave the toggles as-is. */}
        <PageSection
          ariaLabel={`${rootNote} ${modeTitle} position`}
          lessons={[
            ...(isPentatonic
              ? ['foundations/pentatonic']
              : [
                  'understanding-modes/comparing-modes',
                  'understanding-modes/relative-vs-parallel-modes',
                ]),
            'learning-the-fretboard/position-playing',
            'learning-the-fretboard/scale-positions-full-neck',
          ]}
        >
          <ScaleViewer
            key={`${system.slug}-${modeData.slug}`}
            modeIntervals={modeIntervals}
            modeTitle={modeTitle}
            patternKind={isPentatonic ? 'scale' : 'mode'}
            rootNote={rootNote}
            rootPc={rootPc}
            position={position}
            intervalLabels={scaleIntervalLabels}
            noteNames={scaleNoteNames}
            description={scaleSvgDescription}
          />
        </PageSection>
      </div>

      {isPentatonic && (
        <PageSection title="Pentatonic pattern">
          <PentatonicBoxChart
            rootPc={rootPc}
            modeIntervals={modeIntervals}
            rootString={position.rootString}
          />
        </PageSection>
      )}

      {diatonicChords && diatonicTriads && (
        <PageSection
          title={`Chords in ${rootNote} ${modeTitle}`}
          lessons={[
            'understanding-modes/primary-chords-in-every-mode',
            'foundations/diatonic-harmony',
          ]}
        >
          <ModeChords
            triads={diatonicTriads}
            sevenths={diatonicChords}
            rootPc={rootPc}
            modeIntervals={modeIntervals}
            tonicNote={rootNote}
          />
        </PageSection>
      )}
    </div>
  );
}
