import { sql } from '@vercel/postgres';

export type DbChordQuality = {
  id: number;
  symbol: string;
  full_name: string;
  intervals: number[];
  degrees: string[];
  category: string | null;
  interval_overrides: Record<string, string> | null;
  // Alternate names for the same root + interval set — an opinionated naming
  // difference (e.g. sus2#4 vs sus2#11), not a different chord. Displayed as
  // plain text on the detail page; not a routable identifier.
  aliases: string[] | null;
};

export type DbChordShape = {
  id: number;
  quality_id: number;
  quality_symbol: string;
  quality_full_name: string;
  moveable: boolean;
  tab_relative: (number | 'x')[];
  root_string: number;
  root_finger: number | null;
  root_pc: number | null;
  inversion: number;
  bass_string: number | null;
  bass_finger: number | null;
  description: string | null;
  is_manual: boolean;
};

function parseTab(raw: (number | null)[]): (number | 'x')[] {
  return raw.map((v) => (v === null ? 'x' : v));
}

export async function getQualityBySymbol(
  symbol: string,
): Promise<DbChordQuality | null> {
  const { rows } = await sql.query<DbChordQuality>(
    `SELECT id, symbol, full_name, intervals, degrees, category, interval_overrides, aliases
     FROM chord_qualities WHERE symbol = $1`,
    [symbol],
  );
  return rows[0] ?? null;
}

export async function getAllQualities(): Promise<DbChordQuality[]> {
  const { rows } = await sql.query<DbChordQuality>(
    `SELECT id, symbol, full_name, intervals, degrees, category, interval_overrides, aliases
     FROM chord_qualities ORDER BY id`,
  );
  return rows;
}

export async function getShapesBySymbol(
  symbol: string,
): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cq.symbol = $1 AND cs.inversion = 0 AND cs.bass_string IS NULL`,
    [symbol],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// Returns the full voicing cycle for a string set: inversion 0 (base) through 3,
// all keyed by bass_string. Ordered base-first.
export async function getInversionShapes(
  symbol: string,
  bassString: number,
): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cq.symbol = $1 AND cs.bass_string = $2
     ORDER BY cs.inversion`,
    [symbol, bassString],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// `rootPc` is optional and only affects ranking, not filtering — every quality
// with any shape still gets a row back (if NO shape for a quality+string is
// actually valid at rootPc, the highest-preference one still wins the tie,
// same as before — there's simply nothing better to rank it against). When
// given, it stops the preferred string/finger from winning ties with a shape
// that's invalid for that root — either a FIXED shape whose root_pc doesn't
// match (e.g. an open-E chord winning the "string=6, finger=0" tie for a root
// of C#), or a MOVEABLE shape that's root-restricted via open_chords and
// loses to a sibling shape that's actually valid at this root (e.g. an
// open-only 1st-finger voicing losing to the general 2nd-finger form at any
// root other than its own). Omit rootPc to keep the original pure
// string/finger-preference ranking (e.g. chordid, which isn't root-scoped).
export async function getCanonicalShapePerQuality(
  preferRootString: number,
  preferRootFinger: number,
  rootPc?: number,
): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `WITH shape_open AS (
       SELECT chord_shape_id, array_agg(root_pc) AS open_roots
       FROM open_chords GROUP BY chord_shape_id
     ),
     sibling_claims AS (
       SELECT cs.quality_id, cs.root_string, cs.root_finger, oc.root_pc
       FROM chord_shapes cs
       JOIN open_chords oc ON oc.chord_shape_id = cs.id
       WHERE cs.moveable = true
     ),
     ranked AS (
       SELECT cs.id, cs.quality_id, cs.moveable, cs.tab_relative, cs.root_string,
              cs.root_finger, cs.root_pc, cs.inversion, cs.bass_string, cs.bass_finger,
              cs.description, cs.is_manual,
              cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
              ROW_NUMBER() OVER (
                PARTITION BY cs.quality_id
                ORDER BY
                  CASE
                    WHEN $3::int IS NULL THEN 0
                    WHEN cs.moveable = false AND cs.root_pc = $3 THEN 0
                    WHEN cs.moveable = true AND so.open_roots IS NOT NULL AND $3 = ANY(so.open_roots) THEN 0
                    WHEN cs.moveable = true AND so.open_roots IS NULL AND NOT EXISTS (
                           SELECT 1 FROM sibling_claims sc
                           WHERE sc.quality_id = cs.quality_id AND sc.root_string = cs.root_string
                             AND sc.root_finger = cs.root_finger AND sc.root_pc = $3
                         ) THEN 0
                    ELSE 1
                  END,
                  CASE WHEN cs.root_string = $1 AND cs.root_finger = $2 THEN 0 ELSE 1 END,
                  cs.id
              ) AS rn
       FROM chord_shapes cs
       LEFT JOIN shape_open so ON so.chord_shape_id = cs.id
       JOIN chord_qualities cq ON cs.quality_id = cq.id
       WHERE cs.inversion = 0 AND cs.bass_string IS NULL
     )
     SELECT id, quality_id, moveable, tab_relative, root_string, root_finger, root_pc,
            inversion, bass_string, bass_finger, description, is_manual,
            quality_symbol, quality_full_name
     FROM ranked WHERE rn = 1
     ORDER BY quality_id`,
    [preferRootString, preferRootFinger, rootPc ?? null],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// Returns one shape per quality that actually HAS a shape at the given
// string/root (and finger, when provided) — used to narrow the list to a
// chosen position. Qualities without a valid shape there are simply absent,
// not backfilled. `rootPc` applies the same validity rule as
// getAvailableFingersForRoot: fixed shapes must match their own root_pc; a
// moveable shape with its own open_chords entries is valid only at those
// roots; a moveable shape with none is excluded at any root a sibling shape
// (same quality + string + finger) has claimed via open_chords.
export async function getShapesAtPosition(
  rootString: number,
  rootFinger: number | null,
  rootPc: number,
): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `WITH shape_open AS (
       SELECT chord_shape_id, array_agg(root_pc) AS open_roots
       FROM open_chords GROUP BY chord_shape_id
     ),
     sibling_claims AS (
       SELECT cs.quality_id, cs.root_string, cs.root_finger, oc.root_pc
       FROM chord_shapes cs
       JOIN open_chords oc ON oc.chord_shape_id = cs.id
       WHERE cs.moveable = true
     ),
     ranked AS (
       SELECT cs.id, cs.quality_id, cs.moveable, cs.tab_relative, cs.root_string,
              cs.root_finger, cs.root_pc, cs.inversion, cs.bass_string, cs.bass_finger,
              cs.description, cs.is_manual,
              cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
              ROW_NUMBER() OVER (PARTITION BY cs.quality_id ORDER BY cs.id) AS rn
       FROM chord_shapes cs
       LEFT JOIN shape_open so ON so.chord_shape_id = cs.id
       JOIN chord_qualities cq ON cs.quality_id = cq.id
       WHERE cs.root_string = $1 AND cs.inversion = 0 AND cs.bass_string IS NULL
         AND ($2::int IS NULL OR cs.root_finger = $2)
         AND (
           (cs.moveable = false AND cs.root_pc = $3)
           OR (cs.moveable = true AND so.open_roots IS NOT NULL AND $3 = ANY(so.open_roots))
           OR (cs.moveable = true AND so.open_roots IS NULL AND NOT EXISTS (
                 SELECT 1 FROM sibling_claims sc
                 WHERE sc.quality_id = cs.quality_id AND sc.root_string = cs.root_string
                   AND sc.root_finger = cs.root_finger AND sc.root_pc = $3
               ))
         )
     )
     SELECT id, quality_id, moveable, tab_relative, root_string, root_finger, root_pc,
            inversion, bass_string, bass_finger, description, is_manual,
            quality_symbol, quality_full_name
     FROM ranked WHERE rn = 1
     ORDER BY quality_id`,
    [rootString, rootFinger, rootPc],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// Fixed (non-moveable) inversions — open-position slash chords like C/G —
// valid at a specific root. Unlike moveable inversions (see
// getInversionShapes), these aren't scoped to a string set: there's exactly
// one voicing per (quality, root, inversion), so they're discoverable purely
// from the root note rather than requiring a matching string/position pick.
export async function getFixedInversionsForRoot(
  symbol: string,
  rootPc: number,
): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cq.symbol = $1 AND cs.inversion > 0 AND cs.moveable = false AND cs.root_pc = $2
     ORDER BY cs.inversion`,
    [symbol, rootPc],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// Distinct root_finger values on a string that have at least one shape valid
// for the given root. Used to grey out finger options with no results instead
// of letting a click land on an empty (or mismatched) selection.
//
// Three cases per candidate shape:
//   - fixed: valid only at its own root_pc (unchanged).
//   - moveable WITH open_chords entries of its own: it's a root-restricted
//     alternate fingering (e.g. an open-position voicing that only makes
//     sense at one root) — valid ONLY at those open roots, not everywhere.
//   - moveable with NO open_chords entries: the general-purpose fingering —
//     valid everywhere EXCEPT roots a sibling shape (same quality + string +
//     finger) has claimed via its own open_chords entry, so the two don't
//     both appear as selectable positions at the same root/finger. Sibling
//     claims are scoped to the same finger, not just the same string — a
//     shape claiming a root at finger 3 must not exclude an unrelated finger
//     1 shape at that same root (they're different positions entirely).
export async function getAvailableFingersForRoot(
  rootString: number,
  rootPc: number,
): Promise<number[]> {
  const { rows } = await sql.query<{ root_finger: number }>(
    `WITH shape_open AS (
       SELECT chord_shape_id, array_agg(root_pc) AS open_roots
       FROM open_chords GROUP BY chord_shape_id
     ),
     sibling_claims AS (
       SELECT cs.quality_id, cs.root_string, cs.root_finger, oc.root_pc
       FROM chord_shapes cs
       JOIN open_chords oc ON oc.chord_shape_id = cs.id
       WHERE cs.moveable = true
     )
     SELECT DISTINCT cs.root_finger
     FROM chord_shapes cs
     LEFT JOIN shape_open so ON so.chord_shape_id = cs.id
     WHERE cs.root_string = $1 AND cs.inversion = 0 AND cs.bass_string IS NULL
       AND cs.root_finger IS NOT NULL
       AND (
         (cs.moveable = false AND cs.root_pc = $2)
         OR (cs.moveable = true AND so.open_roots IS NOT NULL AND $2 = ANY(so.open_roots))
         OR (cs.moveable = true AND so.open_roots IS NULL AND NOT EXISTS (
               SELECT 1 FROM sibling_claims sc
               WHERE sc.quality_id = cs.quality_id AND sc.root_string = cs.root_string
                 AND sc.root_finger = cs.root_finger AND sc.root_pc = $2
             ))
       )
     ORDER BY cs.root_finger`,
    [rootString, rootPc],
  );
  return rows.map((r) => r.root_finger);
}

// Per-shape open roots for a set of shape ids — used where the caller already
// has a small set of shapes in memory (e.g. one quality's shapes on the
// detail page) and wants to apply the same root-restriction rule as
// getAvailableFingersForRoot without a broader cross-quality query.
export async function getOpenRootsByShapeId(
  shapeIds: number[],
): Promise<Map<number, number[]>> {
  const map = new Map<number, number[]>();
  if (shapeIds.length === 0) return map;
  const { rows } = await sql.query<{ chord_shape_id: number; root_pc: number }>(
    `SELECT chord_shape_id, root_pc FROM open_chords WHERE chord_shape_id = ANY($1)`,
    [shapeIds],
  );
  for (const r of rows) {
    const arr = map.get(r.chord_shape_id) ?? [];
    arr.push(r.root_pc);
    map.set(r.chord_shape_id, arr);
  }
  return map;
}

// Whether any MOVEABLE (true stretch) shape ever uses finger 0 on this string.
// Today every finger=0 chord shape is a fixed open chord, so the "position=0"
// slot should read "Open" — this only flips to "Stretch 1st finger" once real
// stretch shapes exist there, rather than hardcoding the label either way.
export async function getFingerZeroHasStretchShapes(
  rootString: number,
): Promise<boolean> {
  const { rows } = await sql.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM chord_shapes
       WHERE root_string = $1 AND root_finger = 0 AND moveable = true
         AND inversion = 0 AND bass_string IS NULL
     )`,
    [rootString],
  );
  return rows[0]?.exists ?? false;
}

// Whether this specific (shape, root) combination is curated as an open
// chord — see `open_chords`. Root-specific rather than a flag on the shape
// row: a moveable shape can ring open at one root by transposition
// coincidence without being open at any other root it's played at.
export async function isOpenChord(
  chordShapeId: number,
  rootPc: number,
): Promise<boolean> {
  const { rows } = await sql.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM open_chords WHERE chord_shape_id = $1 AND root_pc = $2
     )`,
    [chordShapeId, rootPc],
  );
  return rows[0]?.exists ?? false;
}

export type OpenChordShape = DbChordShape & { open_root_pc: number };

// Every curated (shape, root) pair from open_chords, joined with enough shape
// data to render a card. Unlike the position-based queries, each row carries
// its OWN root — this powers a browse mode that shows every open chord at its
// real key (Cmaj, Dm, Fmaj9#11, …) side by side, rather than everything
// transposed into one currently-selected key.
export async function getAllOpenChordShapes(): Promise<OpenChordShape[]> {
  const { rows } = await sql.query<
    Omit<OpenChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual,
            oc.root_pc AS open_root_pc
     FROM open_chords oc
     JOIN chord_shapes cs ON cs.id = oc.chord_shape_id
     JOIN chord_qualities cq ON cq.id = cs.quality_id
     ORDER BY oc.root_pc, cq.symbol`,
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

// Every fixed inversion (slash chord) across all qualities — powers a browse
// mode parallel to "Open chords", where each card shows its own real key
// (C/G, D/F#, Cmaj7/B, …) rather than everything transposed into one
// currently-selected root. Unlike open_chords-tagged shapes, no join is
// needed: a fixed inversion's own root_pc already is its root.
export async function getAllSlashChordShapes(): Promise<DbChordShape[]> {
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cs.inversion > 0 AND cs.moveable = false
     ORDER BY cs.root_pc, cq.symbol`,
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

export async function getShapesBySymbols(
  symbols: string[],
  rootStrings: number[],
): Promise<DbChordShape[]> {
  if (symbols.length === 0) return [];
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cq.symbol = ANY($1) AND cs.root_string = ANY($2) AND cs.inversion = 0 AND cs.bass_string IS NULL
     ORDER BY cs.id`,
    [symbols, rootStrings],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

export async function getNonMoveableShapesByRootPcs(
  rootPcs: number[],
): Promise<DbChordShape[]> {
  if (rootPcs.length === 0) return [];
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cs.moveable = false AND cs.root_pc = ANY($1) AND cs.inversion = 0 AND cs.bass_string IS NULL`,
    [rootPcs],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}

export async function getShapesForRelated(
  qualityIds: number[],
  rootString: number,
): Promise<DbChordShape[]> {
  if (qualityIds.length === 0) return [];
  const { rows } = await sql.query<
    Omit<DbChordShape, 'tab_relative'> & { tab_relative: (number | null)[] }
  >(
    `SELECT cs.id, cs.quality_id, cq.symbol AS quality_symbol, cq.full_name AS quality_full_name,
            cs.moveable, cs.tab_relative, cs.root_string, cs.root_finger, cs.root_pc,
            cs.inversion, cs.bass_string, cs.bass_finger, cs.description, cs.is_manual
     FROM chord_shapes cs
     JOIN chord_qualities cq ON cs.quality_id = cq.id
     WHERE cs.quality_id = ANY($1) AND cs.root_string = $2 AND cs.inversion = 0 AND cs.bass_string IS NULL`,
    [qualityIds, rootString],
  );
  return rows.map((r) => ({ ...r, tab_relative: parseTab(r.tab_relative) }));
}
