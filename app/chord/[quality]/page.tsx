import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
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
import {
  classifyFamily,
  FAMILY_DESCRIPTIONS,
} from '@/modules/chordv2/utils/chordFamily';
import Link from 'next/link';
import { PositionControls } from '@/components/PositionControls';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { Tags, type Tag } from '@/components/Tags';
import { SectionLabel } from '@/components/SectionLabel';
import { Panel } from '@/components/Panel';
import {
  RootHighlightProvider,
  RootHighlightToggle,
  RootHighlightLayer,
} from '@/components/RootHighlightToggle';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList, definedTerm } from '@/app/utils/structuredData';
import {
  INTERVAL_LABELS,
  STANDARD_TUNING_PC,
  DEGREE_FULL_NAMES,
  ACCENT_HEX,
} from '@/app/utils/constants';
import {
  computeRootFret,
  computeFingerLabels,
  STRING_LABELS,
  fingerLabel,
} from '@/app/utils/musicUtils';
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
import { LogMissingChordVisit } from '@/modules/chordv2/LogMissingChordVisit';
import { PC_TO_NOTE } from '@/app/utils/constants';
import { splitCompoundChordSymbol } from '@/modules/chordv2/utils/compoundChordSymbol';
import {
  getQualityBySymbol,
  getAllQualities,
  getShapesBySymbol,
  getInversionShapes,
  getFixedInversionsForRoot,
  isOpenChord,
  getOpenRootsByShapeId,
} from '@/modules/chordv2/db/queries';

type Props = {
  params: Promise<{ quality: string }>;
  searchParams: Promise<{
    root?: string;
    string?: string;
    position?: string;
    inversion?: string;
  }>;
};

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// Spells out a chord's full interval set in plain words ("root, major 3rd,
// perfect 5th, and major 7th") — quality-level, so it holds regardless of
// which shape/position is currently on screen.
function buildIntervalSentence(
  intervals: number[],
  overrides: Record<string, string> = {},
): string {
  const names = intervalsToDegrees(intervals, overrides).map(
    (d) => DEGREE_FULL_NAMES[d] ?? d,
  );
  return joinWithAnd(names);
}

// "Cmaj7" is the dominant real search form (guitartheory.app GSC data shows
// it beats "C maj7" / "C major 7" by roughly 250:1) but "C Major 7th" still
// matters for semantic/voice-search variants — pairing both in one string
// covers each without reading as keyword stuffing.
function buildChordDisplayNames(
  rootNote: string,
  symbol: string,
  fullName: string,
  intervals: number[],
  overrides: Record<string, string> = {},
): { compactName: string; title: string; description: string } {
  const compactName = `${rootNote}${symbol}`;
  const spelledName = `${rootNote} ${fullName}`;
  const intervalSentence = buildIntervalSentence(intervals, overrides);
  return {
    compactName,
    title: `${compactName} (${spelledName})`,
    description: `${compactName} (${spelledName}) guitar chord shapes in every position on the fretboard. Built from the ${intervalSentence}.`,
  };
}

// Position-specific "how to play" sentence: root string/finger (the site's
// established position vocabulary, e.g. PositionControls) plus a bass-note
// clause for inversions and an omitted-tone clause when the current shape
// drops a chord tone (see droppedFifth/droppedSeventh at the call site).
function buildHowToPlayText(
  spelledName: string,
  rootString: number,
  rootFinger: number,
  rootPc: number,
  fingerZeroLabel: 'open' | 'stretch',
  bassNote: string | null,
  omittedDegrees: string[],
  isOpen: boolean,
): string {
  const finger = fingerLabel(rootFinger, rootString, rootPc, fingerZeroLabel);
  const bassClause = bassNote ? `, with ${bassNote} in the bass` : '';
  const omittedNames = omittedDegrees.map((d) => DEGREE_FULL_NAMES[d] ?? d);
  const omissionClause =
    omittedNames.length > 0
      ? ` This voicing omits the ${joinWithAnd(omittedNames)}.`
      : '';
  // Skip when the finger label already says "open" (root on an open string)
  // — stating it again right after would just repeat itself.
  const openClause =
    isOpen && finger !== 'open' ? ' This is an open chord.' : '';
  return `${spelledName}, root on the ${STRING_LABELS[rootString]}, ${finger}${bassClause}.${omissionClause}${openClause}`;
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
    qualityMeta.intervals,
    qualityMeta.interval_overrides ?? {},
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

// Isolates just the root-note position(s) from a tab — a shape can double
// the root on more than one string (e.g. a barre chord), so this goes by
// each string's actual degree label rather than assuming root_string is the
// only root. Used for the RootHighlightToggle overlay, drawn as a second
// Pattern layer on top of the default one.
function rootOnlyTab(
  tab: FlatTabValue[],
  labels: (string | undefined)[],
): FlatTabValue[] {
  return tab.map((fret, i) => (labels[i] === '1' ? fret : undefined));
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
  if (!qualityMeta) {
    // V1 used compound root+quality URLs ("/chord/C#dim") that V2 replaced
    // with "/chord/{quality}?root={root}" — those old links are still out
    // there (indexed by Google, shared on Reddit/forums). Recover them
    // instead of 404ing.
    const allQualities = await getAllQualities();
    const validSymbols = new Set(allQualities.map((q) => q.symbol));
    const split = splitCompoundChordSymbol(symbol, validSymbols);
    if (split) {
      const redirectParams = new URLSearchParams({ root: split.root });
      if (sp.string) redirectParams.set('string', sp.string);
      if (sp.position) redirectParams.set('position', sp.position);
      if (sp.inversion) redirectParams.set('inversion', sp.inversion);
      permanentRedirect(
        `/chord/${encodeURIComponent(split.quality)}?${redirectParams.toString()}`,
      );
    }
    notFound();
  }

  const fullName = shapes[0]?.quality_full_name ?? qualityMeta.full_name;
  const family = classifyFamily(qualityMeta.intervals);
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
  } = buildChordDisplayNames(
    rootNote,
    symbol,
    fullName,
    qualityMeta.intervals,
    qualityMeta.interval_overrides ?? {},
  );

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
  // purely by root, independent of string/position. Moveable multi-string-
  // set inversions (e.g. maj7's drop-2 cycle) are still scoped by the
  // currently-selected string, since which string set you're browsing is a
  // real choice for those. Both pools feed the one Inversions card row
  // below (see that file's top comment) and resolve which shape
  // `?inversion=` currently points at — fetched once here and passed down,
  // rather than re-fetched inside <Inversions> too.
  const [fixedInversionsForRoot, moveableInversionShapes] = qualityMeta
    ? await Promise.all([
        getFixedInversionsForRoot(symbol, rootPc),
        getInversionShapes(symbol, effectivePosition.rootString),
      ])
    : [[], []];

  const requestedInversion = Number(sp.inversion);
  const inversionShape =
    Number.isInteger(requestedInversion) &&
    requestedInversion >= 1 &&
    qualityMeta
      ? (fixedInversionsForRoot.find(
          (s) => s.inversion === requestedInversion,
        ) ??
        moveableInversionShapes.find(
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
  const displayPosition: ScalePosition = inversionShape
    ? {
        rootString: inversionShape.root_string as RootString,
        rootFinger: (inversionShape.root_finger ?? 0) as RootFinger,
      }
    : effectivePosition;

  const isOpen = matchingShape
    ? await isOpenChord(matchingShape.id, rootPc)
    : false;

  const omittedDegrees = qualityMeta.intervals
    .map((interval, i) => (missingPcs.has(interval % 12) ? degrees[i] : null))
    .filter((d): d is string => d !== null);
  const howToPlayText = transposed
    ? buildHowToPlayText(
        `${rootNote} ${fullName}`,
        displayPosition.rootString,
        displayPosition.rootFinger,
        rootPc,
        fingerZeroLabel,
        bassNote,
        omittedDegrees,
        isOpen,
      )
    : null;

  // Room to grow — more tags (e.g. "Barre", "Beginner") can push onto this
  // array as more curated properties get added. Each links back to the
  // matching browse mode on the chord list page.
  const tags: Tag[] = [];
  if (isOpen) {
    tags.push({ label: 'Open', href: '/chord?mode=open' });
  }
  if (matchingShape && matchingShape.inversion > 0) {
    tags.push({ label: 'Slash', href: '/chord?mode=slash' });
  }

  const dotLabels = transposed
    ? tabDegreeLabels(transposed.tab, rootPc, dotLabelMap)
    : undefined;
  // Always computed — RootHighlightLayer (client) decides whether to
  // actually render it, based on the toggle's local state.
  const rootHighlightTab =
    transposed && dotLabels ? rootOnlyTab(transposed.tab, dotLabels) : null;

  return (
    <div className="flex flex-col gap-8">
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
        <SectionLabel>Chords / {fullName}</SectionLabel>
        {/* Text content is identical to rootAwareTitle ("Cmaj7 (C Major
            7th)") — split across spans purely for the accent-color
            treatment, not to change what's rendered for SEO. */}
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {compactName}{' '}
          <span className="text-2xl font-normal text-fg-secondary sm:text-3xl">
            ({rootNote} <span className="text-accent">{fullName}</span>)
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-fg-secondary">
          {chordDescription}
        </p>

        {degrees.length > 0 && qualityMeta && (
          <div className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <SectionLabel as="h2">Intervals</SectionLabel>
              <p className="mt-2 font-mono text-sm tracking-wider">
                {qualityMeta.intervals
                  .map((interval, i) => {
                    const label = missingPcs.has(interval % 12)
                      ? `(${degrees[i]})`
                      : degrees[i];
                    return i === 0 ? label : `  ${label}`;
                  })
                  .join('')}
              </p>
              <p className="mt-1 max-w-xs text-xs text-fg-secondary">
                {FAMILY_DESCRIPTIONS[family]} See how interval numbers work in
                the{' '}
                <Link href="/lesson/foundations/intervals-and-root-note">
                  Intervals and the Root Note
                </Link>{' '}
                lesson.
              </p>
            </div>
            <div>
              <SectionLabel as="h2">Notes</SectionLabel>
              <p className="mt-2 font-mono text-sm tracking-wider">
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
            </div>
            {transposed && (
              <div>
                <div className="flex items-center gap-2">
                  <SectionLabel as="h2">Tab</SectionLabel>
                  <span className="text-xs text-fg-muted">
                    {droppedFifth && 'no 5'}
                    {droppedFifth && droppedSeventh && ' · '}
                    {droppedSeventh && 'no 7'}
                  </span>
                </div>
                <p className="mt-2 font-mono text-sm">
                  {transposed.tab
                    .map((v) => (v === undefined ? '' : v))
                    .join('-')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* key resets the toggle when navigating to a different quality (e.g.
          a Related Chords/Inversions card) — root/string/position/inversion
          changes reuse the same key (symbol doesn't change), so those
          intentionally leave the toggle as the reader left it. */}
      <RootHighlightProvider key={symbol}>
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <RootHighlightToggle />
          </div>

          {transposed && (
            <div className="mt-4">
              <p className="text-base font-semibold">{displayName}</p>
              {howToPlayText && (
                <p className="mt-1 text-sm text-fg-secondary">
                  {howToPlayText}
                </p>
              )}
            </div>
          )}

          {transposed ? (
            <div className="mt-4 flex items-start gap-2">
              <div className="w-64">
                <Fretboard
                  id="chord-diagram"
                  numFrets={transposed.numFrets}
                  startFret={transposed.startFret}
                  title={`${displayName} chord, root on the ${displayPosition.rootString}th string, guitar fretboard diagram`}
                  fingerLabels={fingerLabels}
                >
                  <Pattern
                    tab={transposed.tab}
                    startFret={transposed.startFret}
                    fillColor="#000"
                    intervals={dotLabels}
                  />
                  {rootHighlightTab && (
                    <RootHighlightLayer>
                      <Pattern
                        tab={rootHighlightTab}
                        startFret={transposed.startFret}
                        fillColor={ACCENT_HEX}
                        intervals={dotLabels}
                      />
                    </RootHighlightLayer>
                  )}
                </Fretboard>
                <div className="mt-2">
                  <Tags tags={tags} />
                </div>
                {!bassNote &&
                  qualityMeta?.aliases &&
                  qualityMeta.aliases.length > 0 && (
                    <p className="mt-2 text-sm text-fg-secondary">
                      Also known as:{' '}
                      {qualityMeta.aliases
                        .map((a) => `${rootNote}${a}`)
                        .join(', ')}
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
            <div className="mt-4">
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
            </div>
          )}
        </Panel>
      </RootHighlightProvider>

      <Inversions
        symbol={symbol}
        quality={qualityMeta}
        fixedShapes={fixedInversionsForRoot}
        moveableShapes={moveableInversionShapes}
        rootNote={rootNote}
        rootPc={rootPc}
        position={effectivePosition}
        currentInversion={inversionShape?.inversion ?? 0}
      />

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
