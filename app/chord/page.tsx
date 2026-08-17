import { Metadata } from 'next';
import { Suspense } from 'react';

import {
  FilteredChordShapesList,
  type ChordCard,
} from '@/modules/chordv2/FilteredChordShapesList';
import { PositionControls } from '@/components/PositionControls';
import { SectionLabel } from '@/components/SectionLabel';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/app/utils/structuredData';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import {
  classifyFamily,
  type ChordFamily,
} from '@/modules/chordv2/utils/chordFamily';
import { parseNote } from '@/app/utils/noteSpelling';
import { PC_TO_NOTE } from '@/app/utils/constants';
import {
  ROOT_STRINGS,
  getValidFingersForString,
  type RootString,
  type RootFinger,
} from '@/modules/scale/utils/scaleUtils';
import {
  getCanonicalShapePerQuality,
  getShapesAtPosition,
  getAvailableFingersForRoot,
  getFingerZeroHasStretchShapes,
  getAllOpenChordShapes,
  getAllSlashChordShapes,
  getAllQualities,
  type DbChordShape,
  type DbChordQuality,
} from '@/modules/chordv2/db/queries';

// Shared by both "Open chords" (for its inversion rows) and "Slash chords"
// browse modes — an inversion anchors transposition on the bass note, not
// the root, so this can't reuse the plain root-position card-building path.
function buildInversionCard(
  shape: DbChordShape,
  quality: DbChordQuality | undefined,
  rootPc: number,
  family: ChordFamily | undefined,
): ChordCard | null {
  if (!quality || !family) return null;
  const bassPc = (rootPc + (quality.intervals[shape.inversion] % 12)) % 12;
  const anchorString = shape.bass_string ?? shape.root_string;
  const anchorFinger = shape.bass_finger ?? shape.root_finger ?? 1;
  const transposed = transposeShape(
    shape.tab_relative as (number | 'x')[],
    anchorString,
    anchorFinger,
    bassPc,
  );
  if (!transposed) return null;

  return {
    id: `${shape.id}-${rootPc}`,
    qualitySymbol: shape.quality_symbol,
    qualityFullName: shape.quality_full_name,
    family,
    rootString: shape.root_string,
    rootFinger: shape.root_finger ?? 1,
    rootNote: PC_TO_NOTE[rootPc],
    bassNote: PC_TO_NOTE[bassPc],
    inversion: shape.inversion,
    tab: transposed.tab,
    startFret: transposed.startFret,
    numFrets: transposed.numFrets,
    description: shape.description ?? null,
  };
}

// Single source for each browse mode's copy — reused as the meta/OG
// description and as the on-page paragraph under that mode's H1, the same
// pattern scale mode pages use (see docs/TODO.md's SEO section).
const DEFAULT_DESCRIPTION =
  "Guitar chord database. Browse every chord quality's shapes in any key and position. Search or filter by chord family below; choose a root, string, and finger to see the shape in a specific key and hand position.";
const OPEN_DESCRIPTION =
  "Open position guitar chords in their real keys, with alternate fingerings and inversions included. Search or filter by chord family to narrow the list; root and position filters don't apply here since each shape already carries its own key.";
const SLASH_DESCRIPTION =
  "Slash chords (inversions) in their real keys, with the bass note fretted on the lowest strings. Search or filter by chord family to narrow the list; root and position filters don't apply here for the same reason as open chords.";

// Shared header treatment for all three browse modes: breadcrumb-style
// section label, big title with an optional accent-colored count figure
// beside it (mirrors the mockup's "Chord database / N qualities" header),
// then description.
function ChordPageHeader({
  sectionLabel,
  title,
  description,
  count,
}: {
  sectionLabel: string;
  title: string;
  description: string;
  count?: { value: number; label: string };
}) {
  return (
    <div>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {count && (
          <p className="text-2xl font-semibold text-accent">
            {count.value} {count.label}
          </p>
        )}
      </div>
      <p className="mt-4 max-w-2xl text-sm text-fg-secondary">{description}</p>
    </div>
  );
}

type MetadataProps = {
  searchParams: Promise<{ mode?: string }>;
};

export async function generateMetadata({
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const { mode } = await searchParams;

  if (mode === 'open') {
    return {
      title: 'Open Chords',
      description: OPEN_DESCRIPTION,
      alternates: { canonical: '/chord?mode=open' },
      openGraph: {
        title: 'GuitarTheory | Open Chords',
        description: OPEN_DESCRIPTION,
      },
    };
  }

  if (mode === 'slash') {
    return {
      title: 'Slash Chords',
      description: SLASH_DESCRIPTION,
      alternates: { canonical: '/chord?mode=slash' },
      openGraph: {
        title: 'GuitarTheory | Slash Chords',
        description: SLASH_DESCRIPTION,
      },
    };
  }

  return {
    title: 'Chord Database',
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: '/chord' },
    openGraph: {
      title: 'GuitarTheory | Chord Database',
      description: DEFAULT_DESCRIPTION,
    },
  };
}

// C wasn't enough: avoiding the literal open notes (E/A/D on strings 6/5/4)
// only prevents finger=0 shapes from landing on fret 0 — shapes with negative
// tab_relative offsets (down to -3 in current data) can still land on fret 0
// at other root frets. Checked all 12 roots against every shape on strings
// 6/5/4; only C# and G# never produce an open string. Chosen root is never
// shown (fret labels stay hidden until a root is explicitly picked).
const DEFAULT_ROOT_NOTE = 'C#';

function parseRootNote(raw: string | undefined): string {
  if (!raw) return DEFAULT_ROOT_NOTE;
  try {
    parseNote(raw);
    return raw;
  } catch {
    return DEFAULT_ROOT_NOTE;
  }
}

type Props = {
  searchParams: Promise<{
    root?: string;
    string?: string;
    position?: string;
    mode?: string;
  }>;
};

export default async function ChordsV2({ searchParams }: Props) {
  const sp = await searchParams;

  if (sp.mode === 'open') {
    return <OpenChordsView />;
  }
  if (sp.mode === 'slash') {
    return <SlashChordsView />;
  }

  // Position controls are empty by default: no string selected → show every
  // quality's default shape. Selecting a string narrows to qualities that have
  // a shape there; adding a finger narrows further. Fret labels only appear
  // once a root note is chosen — with everything on "Any" the fret numbers
  // aren't tied to a real key yet, so showing them would be misleading.
  const hasRoot = !!sp.root;
  const rootNote = parseRootNote(sp.root);
  const rootPc = parseNote(rootNote).pc;

  const rs = Number(sp.string);
  const hasString = (ROOT_STRINGS as number[]).includes(rs);
  const rootString: RootString = hasString ? (rs as RootString) : 6;

  const validFingers = getValidFingersForString(rootString, rootPc);
  const rf = Number(sp.position) as RootFinger;
  const hasFinger =
    hasString && sp.position !== undefined && validFingers.includes(rf);
  const rootFinger: RootFinger = hasFinger ? rf : (validFingers[0] ?? 1);
  const position = { rootString, rootFinger };

  const [shapes, qualities, availableFingers, fingerZeroHasStretch] =
    await Promise.all([
      hasString
        ? getShapesAtPosition(rootString, hasFinger ? rootFinger : null, rootPc)
        : getCanonicalShapePerQuality(rootString, rootFinger, rootPc),
      getAllQualities(),
      hasString
        ? getAvailableFingersForRoot(rootString, rootPc)
        : Promise.resolve<number[]>([]),
      getFingerZeroHasStretchShapes(rootString),
    ]);
  const disabledFingers = hasString
    ? validFingers.filter((f) => !availableFingers.includes(f))
    : [];
  const fingerZeroLabel: 'open' | 'stretch' = fingerZeroHasStretch
    ? 'stretch'
    : 'open';

  const familyBySymbol = new Map(
    qualities.map((q) => [q.symbol, classifyFamily(q.intervals)]),
  );

  const cards: ChordCard[] = shapes.flatMap((shape) => {
    // Fixed (non-moveable) shapes — open chords — are only valid at their own
    // root_pc. Transposing one elsewhere renders it correctly on screen but
    // produces a link the detail page can't resolve back to the same shape
    // (its matchingShape logic rejects fixed shapes whose root_pc doesn't
    // match), so it silently falls back to a different finger position.
    // Moveable shapes are already root-filtered by the query itself (see
    // getShapesAtPosition/getCanonicalShapePerQuality's open_chords rule).
    if (!shape.moveable && shape.root_pc !== rootPc) return [];

    const transposed = transposeShape(
      shape.tab_relative as (number | 'x')[],
      shape.root_string,
      shape.root_finger ?? 1,
      rootPc,
    );
    const family = familyBySymbol.get(shape.quality_symbol);
    if (!transposed || !family) return [];

    return [
      {
        id: `${shape.quality_id}-${shape.root_string}`,
        qualitySymbol: shape.quality_symbol,
        qualityFullName: shape.quality_full_name,
        family,
        // The string/finger this specific shape actually renders at — carried
        // into the card's href so the detail page lands on the same shape.
        rootString: shape.root_string,
        rootFinger: shape.root_finger ?? 1,
        tab: transposed.tab,
        startFret: transposed.startFret,
        numFrets: transposed.numFrets,
        description: shape.description ?? null,
      },
    ];
  });

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Chords', path: '/chord' },
        ])}
      />
      <ChordPageHeader
        sectionLabel="Chords"
        title="Chord Database"
        description={DEFAULT_DESCRIPTION}
        count={{ value: qualities.length, label: 'qualities' }}
      />
      <Suspense>
        <FilteredChordShapesList
          cards={cards}
          showFretLabels={hasRoot}
          linkRoot={hasRoot ? rootNote : undefined}
          controls={
            <PositionControls
              allowAny
              rootNote={rootNote}
              rootPc={rootPc}
              position={position}
              disabledFingers={disabledFingers}
              fingerZeroLabel={fingerZeroLabel}
            />
          }
        />
      </Suspense>
    </div>
  );
}

// Every curated open chord at its real key (Cmaj, Dm, Fmaj9#11, …) side by
// side — the opposite of the default browse mode, which transposes every
// quality into one shared, currently-selected key. Root/string/position
// controls don't apply here since each card already carries its own root.
async function OpenChordsView() {
  const [openShapes, qualities] = await Promise.all([
    getAllOpenChordShapes(),
    getAllQualities(),
  ]);
  const familyBySymbol = new Map(
    qualities.map((q) => [q.symbol, classifyFamily(q.intervals)]),
  );

  const qualityById = new Map(qualities.map((q) => [q.id, q]));

  const cards: ChordCard[] = openShapes.flatMap((shape) => {
    const family = familyBySymbol.get(shape.quality_symbol);

    // Inversions (slash chords) anchor transposition on the bass note, not
    // the root — the same distinction the quality detail page makes.
    if (shape.inversion > 0) {
      const card = buildInversionCard(
        shape,
        qualityById.get(shape.quality_id),
        shape.open_root_pc,
        family,
      );
      return card ? [card] : [];
    }

    const transposed = transposeShape(
      shape.tab_relative as (number | 'x')[],
      shape.root_string,
      shape.root_finger ?? 1,
      shape.open_root_pc,
    );
    if (!transposed || !family) return [];

    return [
      {
        id: `${shape.id}-${shape.open_root_pc}`,
        qualitySymbol: shape.quality_symbol,
        qualityFullName: shape.quality_full_name,
        family,
        rootString: shape.root_string,
        rootFinger: shape.root_finger ?? 1,
        rootNote: PC_TO_NOTE[shape.open_root_pc],
        tab: transposed.tab,
        startFret: transposed.startFret,
        numFrets: transposed.numFrets,
        description: shape.description ?? null,
      },
    ];
  });

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Chords', path: '/chord' },
          { name: 'Open Chords', path: '/chord?mode=open' },
        ])}
      />
      <ChordPageHeader
        sectionLabel="Chords / Open"
        title="Open Chords"
        description={OPEN_DESCRIPTION}
        count={{ value: cards.length, label: 'shapes' }}
      />
      <Suspense>
        <FilteredChordShapesList cards={cards} showFretLabels />
      </Suspense>
    </div>
  );
}

// Every fixed inversion (slash chord) at its own real key (C/G, D/F#,
// Cmaj7/B, …) side by side, the same pattern as "Open chords" browse mode.
// Unlike open_chords-tagged shapes, no join is needed: root_pc already is
// the chord's own root for a fixed shape.
async function SlashChordsView() {
  const [slashShapes, qualities] = await Promise.all([
    getAllSlashChordShapes(),
    getAllQualities(),
  ]);
  const familyBySymbol = new Map(
    qualities.map((q) => [q.symbol, classifyFamily(q.intervals)]),
  );
  const qualityById = new Map(qualities.map((q) => [q.id, q]));

  const cards: ChordCard[] = slashShapes.flatMap((shape) => {
    if (shape.root_pc === null) return [];
    const family = familyBySymbol.get(shape.quality_symbol);
    const card = buildInversionCard(
      shape,
      qualityById.get(shape.quality_id),
      shape.root_pc,
      family,
    );
    return card ? [card] : [];
  });

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Chords', path: '/chord' },
          { name: 'Slash Chords', path: '/chord?mode=slash' },
        ])}
      />
      <ChordPageHeader
        sectionLabel="Chords / Slash"
        title="Slash Chords"
        description={SLASH_DESCRIPTION}
        count={{ value: cards.length, label: 'shapes' }}
      />
      <Suspense>
        <FilteredChordShapesList cards={cards} showFretLabels />
      </Suspense>
    </div>
  );
}
