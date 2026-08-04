import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import {
  transposeShape,
  type TransposedShape,
} from '@/modules/chordv2/utils/transposeShape';
import {
  intervalsToDegrees,
  buildDotLabelMap,
} from '@/modules/chordv2/utils/intervalDegrees';
import { getMissingIntervalPcs } from '@/modules/chordv2/utils/droppedIntervals';
import { PositionControls } from '@/components/PositionControls';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { Tags, type Tag } from '@/components/Tags';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList, definedTerm } from '@/app/utils/structuredData';
import { INTERVAL_LABELS, STANDARD_TUNING_PC } from '@/app/utils/constants';
import { computeRootFret, computeFingerLabels } from '@/app/utils/musicUtils';
import { parseNote } from '@/app/utils/noteSpelling';
import type { FlatTabValue } from '@/types';
import {
  isValidPosition,
  getValidFingersForString,
  ROOT_STRINGS,
  DEFAULT_POSITION,
  type RootString,
  type RootFinger,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

import { ChordShapeActionDropdown } from '@/modules/chordv2/ChordShapeActionDropdown';
import { RelatedChords } from '@/modules/chordv2/RelatedChords';
import { Inversions } from '@/modules/chordv2/Inversions';
import {
  InversionSelect,
  type InversionOption,
} from '@/modules/chordv2/InversionSelect';
import { LogMissingChordVisit } from '@/modules/chordv2/LogMissingChordVisit';
import { PC_TO_NOTE } from '@/app/utils/constants';
import {
  getQualityBySymbol,
  getShapesBySymbol,
  getInversionShapes,
  getFixedInversionsForRoot,
  isOpenChord,
  getOpenRootsByShapeId,
} from '@/modules/chordv2/db/queries';

const INVERSION_ORDINAL: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
};

type Props = {
  params: Promise<{ quality: string }>;
  searchParams: Promise<{
    root?: string;
    string?: string;
    position?: string;
    inversion?: string;
  }>;
};

// "Cmaj7" is the dominant real search form (guitartheory.app GSC data shows
// it beats "C maj7" / "C major 7" by roughly 250:1) but "C Major 7th" still
// matters for semantic/voice-search variants — pairing both in one string
// covers each without reading as keyword stuffing.
function buildChordDisplayNames(
  rootNote: string,
  symbol: string,
  fullName: string,
): { compactName: string; title: string; description: string } {
  const compactName = `${rootNote}${symbol}`;
  const spelledName = `${rootNote} ${fullName}`;
  return {
    compactName,
    title: `${compactName} (${spelledName})`,
    description: `${compactName} guitar chord shapes — ${spelledName}, in every position on the fretboard.`,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { quality } = await params;
  const sp = await searchParams;
  const symbol = decodeURIComponent(quality);
  const qualityMeta = await getQualityBySymbol(symbol);
  if (!qualityMeta) return {};
  const rootNote = parseRootNote(sp.root);
  const { title, description } = buildChordDisplayNames(
    rootNote,
    symbol,
    qualityMeta.full_name,
  );
  return {
    title,
    description,
    alternates: {
      canonical: `/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(rootNote)}`,
    },
    openGraph: {
      title: `GuitarTheory | ${title}`,
      description,
    },
  };
}

function tabDegreeLabels(
  tab: FlatTabValue[],
  rootPc: number,
  labelMap: Record<number, string> = {},
): (string | undefined)[] {
  return tab.map((fret, si) => {
    if (fret === 'x' || fret === undefined) return undefined;
    const interval = (STANDARD_TUNING_PC[si] + fret - rootPc + 120) % 12;
    return labelMap[interval] ?? INTERVAL_LABELS[interval];
  });
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
  const requestedFinger: RootFinger = ([0, 1, 2, 3, 4] as number[]).includes(rf)
    ? (rf as RootFinger)
    : DEFAULT_POSITION.rootFinger;

  const requested: ScalePosition = { rootString, rootFinger: requestedFinger };
  if (isValidPosition(requested, rootPc)) return requested;

  const validFingers = getValidFingersForString(rootString, rootPc);
  if (validFingers.length > 0)
    return { rootString, rootFinger: validFingers[0] };
  return DEFAULT_POSITION;
}

export default async function ChordQualityPage({
  params,
  searchParams,
}: Props) {
  const { quality } = await params;
  const sp = await searchParams;

  const symbol = decodeURIComponent(quality);
  const [shapes, qualityMeta] = await Promise.all([
    getShapesBySymbol(symbol),
    getQualityBySymbol(symbol),
  ]);
  // Only 404 for a symbol that isn't a real quality at all. A quality that
  // exists in the theory but has no seeded shapes yet (e.g. surfaced by the
  // chord identifier's pitch-class matching) still gets a page — just with
  // no diagram, same as an unavailable position.
  if (!qualityMeta) notFound();

  const fullName = shapes[0]?.quality_full_name ?? qualityMeta.full_name;
  const degrees = qualityMeta
    ? intervalsToDegrees(
        qualityMeta.intervals,
        qualityMeta.interval_overrides ?? {},
      )
    : [];
  const dotLabelMap = qualityMeta
    ? buildDotLabelMap(
        qualityMeta.intervals,
        qualityMeta.interval_overrides ?? {},
      )
    : {};

  const rootNote = parseRootNote(sp.root);
  const rootPc = parseNote(rootNote).pc;
  const position = parsePosition(sp.string, sp.position, rootPc);
  const {
    compactName,
    title: rootAwareTitle,
    description: chordDescription,
  } = buildChordDisplayNames(rootNote, symbol, fullName);

  // A moveable shape is valid at a given root unless it's root-restricted:
  //   - it has its own open_chords entries → valid ONLY at those roots (an
  //     alternate fingering that only makes sense open, e.g. finger=1 here).
  //   - it has none, but a MOVEABLE sibling at the SAME finger claims this
  //     root via open_chords → excluded, so the two fingerings don't both
  //     show up as selectable positions at the same root/finger. Scoped to
  //     the same finger (not just the same string) because a shape claiming
  //     a root at, say, finger 3 has nothing to do with an unrelated finger 1
  //     shape — they're different positions entirely, and one ringing open
  //     at this root must not blind-exclude the other. A FIXED sibling's
  //     open_chords claim (e.g. a curated "open Cmaj7" shape at finger=3)
  //     must not exclude the generic moveable shapes on other fingers either
  //     — it only ever applies at its own root anyway — matching the
  //     `WHERE cs.moveable = true` restriction on the sibling_claims CTE in
  //     getShapesAtPosition/getCanonicalShapePerQuality/getAvailableFingersForRoot.
  const openRootsByShapeId = await getOpenRootsByShapeId(
    shapes.map((s) => s.id),
  );
  const isShapeValidAtRoot = (
    s: (typeof shapes)[number],
    targetRootPc: number,
  ): boolean => {
    if (!s.moveable) return s.root_pc === null || s.root_pc === targetRootPc;
    const ownOpenRoots = openRootsByShapeId.get(s.id);
    if (ownOpenRoots && ownOpenRoots.length > 0)
      return ownOpenRoots.includes(targetRootPc);
    return !shapes.some(
      (sib) =>
        sib.moveable &&
        sib.quality_id === s.quality_id &&
        sib.root_string === s.root_string &&
        sib.root_finger === s.root_finger &&
        (openRootsByShapeId.get(sib.id) ?? []).includes(targetRootPc),
    );
  };

  const availableFingers = Array.from(
    new Set(
      shapes
        .filter(
          (s) =>
            s.root_string === position.rootString &&
            isShapeValidAtRoot(s, rootPc),
        )
        .map((s) => s.root_finger ?? 0),
    ),
  ).sort((a, b) => a - b);

  const effectiveFinger: RootFinger = availableFingers.includes(
    position.rootFinger,
  )
    ? (position.rootFinger as RootFinger)
    : ((availableFingers[0] ?? DEFAULT_POSITION.rootFinger) as RootFinger);
  const effectivePosition: ScalePosition = {
    rootString: position.rootString,
    rootFinger: effectiveFinger,
  };

  // Grey out (rather than hide) strings/fingers this quality has no shape for
  // at the current root — same pattern as the chord list page.
  const disabledStrings = ROOT_STRINGS.filter(
    (rs) =>
      !shapes.some(
        (s) => s.root_string === rs && isShapeValidAtRoot(s, rootPc),
      ),
  );
  const disabledFingers = getValidFingersForString(
    position.rootString,
    rootPc,
  ).filter((f) => !availableFingers.includes(f));
  const fingerZeroHasStretch = shapes.some(
    (s) =>
      s.root_string === position.rootString &&
      s.root_finger === 0 &&
      s.moveable,
  );
  const fingerZeroLabel: 'open' | 'stretch' = fingerZeroHasStretch
    ? 'stretch'
    : 'open';

  // Fixed (open-position) inversions — slash chords like C/G — are looked up
  // purely by root, independent of string/position (see InversionSelect).
  // Moveable multi-string-set inversions (e.g. maj7's drop-2 cycle) are still
  // scoped by the currently-selected string, since which string set you're
  // browsing is a real choice for those.
  const fixedInversionsForRoot = qualityMeta
    ? await getFixedInversionsForRoot(symbol, rootPc)
    : [];
  const inversionOptions: InversionOption[] = [
    { inversion: 0, label: 'Root position' },
    ...fixedInversionsForRoot.map((s) => ({
      inversion: s.inversion,
      label: `${INVERSION_ORDINAL[s.inversion] ?? `${s.inversion}th`} inversion`,
    })),
  ];

  const requestedInversion = Number(sp.inversion);
  const inversionShape =
    Number.isInteger(requestedInversion) &&
    requestedInversion >= 1 &&
    qualityMeta
      ? (fixedInversionsForRoot.find(
          (s) => s.inversion === requestedInversion,
        ) ??
        (await getInversionShapes(symbol, effectivePosition.rootString)).find(
          (s) => s.inversion === requestedInversion && s.moveable,
        ) ??
        null)
      : null;

  let matchingShape: (typeof shapes)[number] | null = null;
  let transposed: TransposedShape | null = null;
  let missingPcs = new Set<number>();
  let fingerLabels: string[] | undefined;
  let bassNote: string | null = null;

  if (inversionShape && qualityMeta) {
    // Bass note is quality.intervals[inversion] semitones above the root.
    const bassPc =
      (rootPc + (qualityMeta.intervals[inversionShape.inversion] % 12)) % 12;
    bassNote = PC_TO_NOTE[bassPc];
    matchingShape = inversionShape;
    transposed = transposeShape(
      inversionShape.tab_relative,
      inversionShape.bass_string ?? inversionShape.root_string,
      inversionShape.bass_finger ?? inversionShape.root_finger ?? 0,
      bassPc,
    );
  } else {
    matchingShape =
      shapes.find(
        (s) =>
          s.root_string === effectivePosition.rootString &&
          s.root_finger === effectivePosition.rootFinger &&
          !s.moveable &&
          s.root_pc === rootPc,
      ) ??
      shapes.find(
        (s) =>
          s.root_string === effectivePosition.rootString &&
          s.root_finger === effectivePosition.rootFinger &&
          s.moveable,
      ) ??
      null;

    transposed = matchingShape
      ? transposeShape(
          matchingShape.tab_relative,
          matchingShape.root_string,
          effectivePosition.rootFinger,
          rootPc,
        )
      : null;

    missingPcs =
      matchingShape && qualityMeta
        ? getMissingIntervalPcs(
            matchingShape.tab_relative,
            matchingShape.root_string,
            matchingShape.root_finger ?? 0,
            rootPc,
            qualityMeta.intervals,
          )
        : new Set<number>();

    const rootFret = matchingShape
      ? computeRootFret(
          matchingShape.root_string,
          matchingShape.root_finger ?? 0,
          rootPc,
        )
      : 0;
    fingerLabels = transposed
      ? computeFingerLabels(
          transposed.startFret,
          transposed.numFrets,
          rootFret,
          effectivePosition.rootFinger,
        )
      : undefined;
  }

  const droppedFifth = missingPcs.has(7);
  const droppedSeventh = missingPcs.has(10) || missingPcs.has(11);
  const displayName = bassNote ? `${compactName}/${bassNote}` : compactName;
  // A fixed inversion (open-position slash chord) is a variant of a specific
  // root-position shape (e.g. C/G is "open C, string 5, 3rd finger" with G
  // added in the bass) — root_string/root_finger on the inversion row are set
  // to that parent shape's position, so the controls stay meaningful instead
  // of describing where the bass note happens to fall.
  const isFixedInversion = !!inversionShape && !inversionShape.moveable;
  const displayPosition: ScalePosition = inversionShape
    ? {
        rootString: inversionShape.root_string as RootString,
        rootFinger: (inversionShape.root_finger ?? 0) as RootFinger,
      }
    : effectivePosition;
  // The string-scoped Inversions card row can't discover fixed inversions
  // (they're keyed by bass_string, which no longer matches root_string once
  // it points at the parent shape) — the Inversion select above is the
  // reliable path for those, so skip the card row while one's showing.

  // Room to grow — more tags (e.g. "Barre", "Beginner") can push onto this
  // array as more curated properties get added. Each links back to the
  // matching browse mode on the chord list page.
  const tags: Tag[] = [];
  if (matchingShape && (await isOpenChord(matchingShape.id, rootPc))) {
    tags.push({ label: 'Open', href: '/chord?mode=open' });
  }
  if (matchingShape && matchingShape.inversion > 0) {
    tags.push({ label: 'Slash', href: '/chord?mode=slash' });
  }

  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Chords', path: '/chord' },
          { name: fullName, path: `/chord/${encodeURIComponent(symbol)}` },
        ])}
      />
      <JsonLd
        data={definedTerm({
          name: rootAwareTitle,
          description: chordDescription,
          termSetName: 'Guitar Chords',
          termSetPath: '/chord',
        })}
      />
      <div>
        <div>
          <h1 className="text-2xl font-bold">{rootAwareTitle}</h1>
        </div>
        {degrees.length > 0 && qualityMeta && (
          <>
            <h2 className="mb-1 mt-4 text-sm font-medium">Intervals</h2>
            <p className="font-mono text-sm tracking-wider">
              {qualityMeta.intervals
                .map((interval, i) => {
                  const label = missingPcs.has(interval % 12)
                    ? `(${degrees[i]})`
                    : degrees[i];
                  return i === 0 ? label : `  ${label}`;
                })
                .join('')}
            </p>
          </>
        )}
        {degrees.length > 0 && qualityMeta && (
          <>
            <h2 className="mb-1 mt-4 text-sm font-medium">Notes</h2>
            <p className="font-mono text-sm tracking-wider">
              {qualityMeta.intervals
                .map((interval, i) => {
                  const note = PC_TO_NOTE[(rootPc + interval) % 12];
                  const label = missingPcs.has(interval % 12)
                    ? `(${note})`
                    : note;
                  return i === 0 ? label : `  ${label}`;
                })
                .join('')}
            </p>
          </>
        )}
        {transposed && (
          <>
            <div className="mb-1 mt-4 flex items-center gap-2">
              <h2 className="text-sm font-medium">Tab</h2>
              <span className="text-xs text-fg-secondary">
                {droppedFifth && 'no 5'}
                {droppedFifth && droppedSeventh && ' · '}
                {droppedSeventh && 'no 7'}
              </span>
            </div>
            <p className="font-mono text-sm">
              {transposed.tab.map((v) => (v === undefined ? '' : v)).join('-')}
            </p>
          </>
        )}
      </div>

      <Suspense>
        <PositionControls
          rootNote={rootNote}
          rootPc={rootPc}
          position={displayPosition}
          disabledStrings={disabledStrings}
          disabledFingers={disabledFingers}
          fingerZeroLabel={fingerZeroLabel}
        />
      </Suspense>

      <InversionSelect
        options={inversionOptions}
        selected={inversionShape?.inversion ?? 0}
      />

      {transposed && <p className="text-base font-semibold">{displayName}</p>}

      {transposed ? (
        <div className="flex items-start gap-2">
          <div className="w-64">
            <Fretboard
              id="chord-diagram"
              numFrets={transposed.numFrets}
              startFret={transposed.startFret}
              title={displayName}
              fingerLabels={fingerLabels}
            >
              <Pattern
                tab={transposed.tab}
                startFret={transposed.startFret}
                fillColor="#000"
                intervals={tabDegreeLabels(transposed.tab, rootPc, dotLabelMap)}
              />
            </Fretboard>
            <div className="mt-2">
              <Tags tags={tags} />
            </div>
            {!bassNote &&
              qualityMeta?.aliases &&
              qualityMeta.aliases.length > 0 && (
                <p className="mt-2 text-sm text-fg-secondary">
                  Also known as:{' '}
                  {qualityMeta.aliases.map((a) => `${rootNote}${a}`).join(', ')}
                </p>
              )}
          </div>
          {matchingShape && (
            <ChordShapeActionDropdown
              shapeId={matchingShape.id}
              chordName={displayName}
              svgId="chord-diagram"
            />
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-fg-secondary">
            {shapes.length === 0
              ? 'No shapes have been added for this chord yet.'
              : 'No shape found for this string and position.'}
          </p>
          {shapes.length === 0 && qualityMeta && (
            <LogMissingChordVisit
              qualitySymbol={qualityMeta.symbol}
              qualityFullName={qualityMeta.full_name}
              intervals={qualityMeta.intervals}
            />
          )}
        </>
      )}

      {!isFixedInversion && (
        <Inversions
          symbol={symbol}
          rootNote={rootNote}
          rootPc={rootPc}
          position={effectivePosition}
          currentInversion={inversionShape?.inversion ?? 0}
        />
      )}

      <RelatedChords
        symbol={symbol}
        rootNote={rootNote}
        rootPc={rootPc}
        position={effectivePosition}
        actualIntervals={qualityMeta.intervals.filter(
          (i) => !missingPcs.has(i % 12),
        )}
      />
    </div>
  );
}
