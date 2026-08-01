'use server';

import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import {
  getAllQualities,
  getCanonicalShapePerQuality,
  getNonMoveableShapesByRootPcs,
  getShapesBySymbols,
  type DbChordQuality,
} from '@/modules/chordv2/db/queries';
import { STANDARD_TUNING_PC, PC_TO_NOTE } from '@/app/utils/constants';
import type { FlatTabValue } from '@/types';

type MatchType = 'exact' | 'suggest';

export type FreeformMatch = {
  rootNote: string;
  rootPc: number;
  quality_symbol: string;
  quality_full_name: string;
  matchType: 'exact' | 'suggest';
  tab: FlatTabValue[] | null;
  startFret: number;
  numFrets: number;
  root_string: number | null;
  root_finger: number | null;
};

type RawMatch = {
  rootPc: number;
  quality: DbChordQuality;
  matchType: 'exact' | 'suggest';
};

export async function identifyChord(
  tab: (number | undefined)[],
): Promise<FreeformMatch[]> {
  const playedPcs = tab
    .map((fret, si) =>
      fret !== undefined ? (STANDARD_TUNING_PC[si] + fret) % 12 : null,
    )
    .filter((pc): pc is number => pc !== null);

  const uniquePlayedPcs = Array.from(new Set(playedPcs));
  if (uniquePlayedPcs.length < 2) return [];

  try {
    const [qualities, canonicalShapes, keySpecificShapes] = await Promise.all([
      getAllQualities(),
      getCanonicalShapePerQuality(6, 1),
      getNonMoveableShapesByRootPcs(uniquePlayedPcs),
    ]);
    const shapeBySymbol = new Map(
      canonicalShapes.map((s) => [s.quality_symbol, s]),
    );
    const keySpecificBySymbolAndPc = new Map(
      keySpecificShapes.map((s) => [`${s.quality_symbol}:${s.root_pc}`, s]),
    );

    // Phase 1: pitch-class matching — collect raw (rootPc, quality, matchType) tuples
    const rawExact: RawMatch[] = [];
    const rawSuggest: RawMatch[] = [];
    const seenExact = new Set<string>();
    const seenSuggest = new Set<string>();

    for (const rootPc of uniquePlayedPcs) {
      const userIntervals = new Set(
        uniquePlayedPcs.map((pc) => (pc - rootPc + 12) % 12),
      );

      for (const quality of qualities) {
        const qualityPcs = new Set(quality.intervals.map((i) => i % 12));
        const key = `${rootPc}-${quality.symbol}`;

        const allUserInQuality = Array.from(userIntervals).every((i) =>
          qualityPcs.has(i),
        );
        const isExact =
          allUserInQuality && userIntervals.size === qualityPcs.size;

        if (isExact && !seenExact.has(key)) {
          seenExact.add(key);
          rawExact.push({ rootPc, quality, matchType: 'exact' });
        } else if (
          allUserInQuality &&
          !isExact &&
          qualityPcs.size - userIntervals.size <= 2 &&
          !seenExact.has(key) &&
          !seenSuggest.has(key)
        ) {
          seenSuggest.add(key);
          rawSuggest.push({ rootPc, quality, matchType: 'suggest' });
        }
      }
    }

    const allRawMatches = [
      ...rawExact,
      ...rawSuggest.filter(
        (m) => !seenExact.has(`${m.rootPc}-${m.quality.symbol}`),
      ),
    ];

    // Phase 2: find which guitar strings carry each rootPc in the user's tab
    const rootPcToRootStrings = new Map<number, number[]>();
    for (const rootPc of uniquePlayedPcs) {
      const strings = tab
        .map((fret, si) =>
          fret !== undefined && (STANDARD_TUNING_PC[si] + fret) % 12 === rootPc
            ? 6 - si
            : null,
        )
        .filter((s): s is number => s !== null);
      if (strings.length) rootPcToRootStrings.set(rootPc, strings);
    }

    // Phase 3: batch-fetch shapes for all matched symbols × candidate root strings
    const matchedSymbols = [
      ...new Set(allRawMatches.map((m) => m.quality.symbol)),
    ];
    const candidateRootStrings = [
      ...new Set([...rootPcToRootStrings.values()].flat()),
    ];
    const tabShapes =
      matchedSymbols.length && candidateRootStrings.length
        ? await getShapesBySymbols(matchedSymbols, candidateRootStrings)
        : [];

    const shapesByKey = new Map<string, typeof tabShapes>();
    for (const shape of tabShapes) {
      const k = `${shape.quality_symbol}:${shape.root_string}`;
      const arr = shapesByKey.get(k) ?? [];
      arr.push(shape);
      shapesByKey.set(k, arr);
    }

    // Phase 4: build FreeformMatch, preferring a tab-matched shape over canonical
    const buildMatch = ({
      rootPc,
      quality,
      matchType,
    }: RawMatch): FreeformMatch => {
      let tabMatchedShape: (typeof tabShapes)[0] | null = null;

      for (const rootString of rootPcToRootStrings.get(rootPc) ?? []) {
        const si = 6 - rootString;
        const rootFret = tab[si];
        if (rootFret === undefined) continue;

        const relativeTab = tab.map<number | 'x'>((v) =>
          v === undefined ? 'x' : v - rootFret,
        );
        const candidates = (
          shapesByKey.get(`${quality.symbol}:${rootString}`) ?? []
        ).filter((s) => s.root_pc === null || s.root_pc === rootPc);
        const found = candidates.find(
          (shape) =>
            shape.tab_relative.length === relativeTab.length &&
            shape.tab_relative.every((v, i) => v === relativeTab[i]),
        );
        if (found) {
          tabMatchedShape = found;
          break;
        }
      }

      const shape =
        tabMatchedShape ??
        keySpecificBySymbolAndPc.get(`${quality.symbol}:${rootPc}`) ??
        shapeBySymbol.get(quality.symbol);

      const transposed = shape
        ? transposeShape(
            shape.tab_relative as (number | 'x')[],
            shape.root_string,
            shape.root_finger ?? 1,
            rootPc,
          )
        : null;

      // A literal fret-for-fret match against a real curated shape outranks
      // the pitch-class subset comparison from Phase 1 — even a shape that
      // deliberately omits a chord tone (e.g. a dropped-3rd voicing) is an
      // exact identification of what's actually being played, not a guess.
      const resolvedMatchType: MatchType = tabMatchedShape
        ? 'exact'
        : matchType;

      return {
        rootNote: PC_TO_NOTE[rootPc],
        rootPc,
        quality_symbol: quality.symbol,
        quality_full_name: quality.full_name,
        matchType: resolvedMatchType,
        tab: transposed?.tab ?? null,
        startFret: transposed?.startFret ?? 1,
        root_string: shape?.root_string ?? null,
        root_finger: shape?.root_finger ?? null,
        numFrets: transposed?.numFrets ?? 4,
      };
    };

    return allRawMatches.map(buildMatch);
  } catch (e) {
    console.error('identifyChord error:', e);
    throw new Error('Failed to identify chord. Please try again.');
  }
}
