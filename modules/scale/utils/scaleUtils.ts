import { STANDARD_TUNING_PC, INTERVAL_LABELS } from '@/app/utils/constants';
import { spellScale } from '@/app/utils/noteSpelling';

// Ionian = the major scale itself — the reference scale most lesson
// explorers and modes are derived from or compared against.
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Rotate parent scale intervals to derive a mode starting at the given degree.
export function getModeIntervals(
  parentIntervals: number[],
  degree: number,
): number[] {
  const offset = parentIntervals[degree];
  return parentIntervals
    .map((i) => (i - offset + 12) % 12)
    .sort((a, b) => a - b);
}

// For each string, return interval labels matching the positions in scaleTab.
export function computeIntervalTab(
  scaleTab: number[][],
  rootPc: number,
): string[][] {
  return STANDARD_TUNING_PC.map((openPc, stringIndex) =>
    scaleTab[stringIndex].map(
      (fret) => INTERVAL_LABELS[(openPc + fret - rootPc + 12) % 12],
    ),
  );
}

// For each string, collect frets in [startFret, startFret+windowSize) that are in the scale.
export function computeScaleTab(
  modeIntervals: number[],
  rootPc: number,
  startFret = 0,
  windowSize = 5,
): number[][] {
  const scalePCs = new Set(modeIntervals.map((i) => (rootPc + i) % 12));
  return STANDARD_TUNING_PC.map((openPc) => {
    const frets: number[] = [];
    for (let fret = startFret; fret < startFret + windowSize; fret++) {
      if (scalePCs.has((openPc + fret) % 12)) frets.push(fret);
    }
    return frets;
  });
}

// ── Position system ──────────────────────────────────────────────────────────
//
// A scale position is defined by:
//   rootString  — which string carries the root note (6th, 5th, or 4th)
//   rootFinger  — which left-hand finger is placed on that root fret
//                 0 = stretch: the root stays under the 1st finger, same as
//                     position 1, but the 1st finger additionally stretches
//                     back one fret below the root to reach one more note.
//                     Exception: if the root itself is the open string, there's
//                     no fret below it to stretch for — the window just starts
//                     there, same as it would for position 1.
//                 1–4 = the numbered finger sits directly on the root fret
//
// Construction rules:
//   1. Don't stretch when you don't have to — fill the 4-fret window first.
//   2. Don't use the same finger twice on the same string.
//
// The resulting fret window is:
//   finger 0 (stretch): startFret = rootFret − 1 (or rootFret if that's 0),
//                                                                 numFrets = 5
//   finger 1–4:         startFret = rootFret − (rootFinger − 1), numFrets = 5
// (finger 1–4 all start on finger 1's fret, so the unused padding fret always
// falls after finger 4, never before finger 1.)
//
// Finger 4 is special: the 4-finger natural span already ends on the root fret,
// so the only room left to stretch for a 5th note is one fret *above* it (a
// "stretch 4" — the 4th finger reaching forward past its own natural fret). But
// if some string needs a note at both the root fret and that stretch-4 fret,
// the 4th finger can't be in two places on one string (rule 2) — the position
// falls back to stretching the 1st finger *backward* instead (a "stretch 1",
// the same mechanic finger 0 uses), shifting the whole window down one fret.
// See resolveWindowForPosition.

export type RootString = 6 | 5 | 4;
export type RootFinger = 0 | 1 | 2 | 3 | 4;

export interface ScalePosition {
  rootString: RootString;
  rootFinger: RootFinger;
}

const STRING_TO_INDEX: Record<RootString, number> = { 6: 0, 5: 1, 4: 2 };

export function computePositionWindow(
  position: ScalePosition,
  rootPc: number,
): { startFret: number; numFrets: number; rootFret: number } | null {
  const openPc = STANDARD_TUNING_PC[STRING_TO_INDEX[position.rootString]];
  const rawRootFret = (rootPc - openPc + 12) % 12;
  // For fingered positions (1–4) the root must be fretted, so bump open roots up an octave.
  // Stretch (finger 0) is exempt: the 1st finger sits on fret 1, the open string is the root.
  let rootFret =
    rawRootFret === 0 && position.rootFinger !== 0 ? 12 : rawRootFret;

  const numFrets = 5;
  const computeStart = (rf: number) => {
    if (position.rootFinger === 0) return rf === 0 ? 0 : rf - 1;
    return rf - (position.rootFinger - 1);
  };

  // If the position runs off the low end of the neck, shift the root up an octave
  // (e.g. F on the 6th string with 4th-finger position lives at fret 13, not fret 1).
  let startFret = computeStart(rootFret);
  if (startFret < 0) {
    rootFret += 12;
    startFret = computeStart(rootFret);
  }

  // Cap at a 22-fret neck (window of 5 frets → highest start = 18).
  if (startFret + numFrets - 1 > 22) return null;

  return { startFret, numFrets, rootFret };
}

// Adjacent strings are usually 5 semitones apart in standard tuning, except G-B,
// which is 4. Whenever a window is wide enough to reach fret F on one string and
// fret F-gap on the next string up, those two dots are the exact same pitch — a
// direct duplicate, not two different notes that happen to share an interval
// label. This used to only matter for the G-B pair in a 5-fret window, but wider
// windows (open positions, 6+ frets) can produce the same duplicate on any
// adjacent pair (e.g. the 5th fret of the low E string and the open A string).
//
// The higher string's copy is normally the one to keep: it's either the open
// string, or (moving up the neck) the copy a lower-numbered finger reaches —
// drop the lower string's. `fallbackFret`, when given, flips that for any
// duplicate the fallback fret is part of. It marks the one fret in the window
// that only exists because this position had to fall back to the opposite
// stretch direction (see resolveWindowForPosition) — not a fret this position
// natively reaches. Whichever side of the pair it lands on, that side is the
// less-natural one, so the *other* string's copy is the one to keep, even
// when that means keeping the lower string for once.
export function deduplicateUnisonStrings(
  tab: number[][],
  fallbackFret?: number,
): number[][] {
  const result = tab.map((s) => [...s]);
  for (let i = 0; i < result.length - 1; i++) {
    const gap = (STANDARD_TUNING_PC[i + 1] - STANDARD_TUNING_PC[i] + 12) % 12;
    const lowerFrets = result[i];
    const upperFrets = result[i + 1];
    const dupUpperFrets: number[] = [];
    const dupLowerFrets: number[] = [];
    lowerFrets.forEach((lowerFret) => {
      const upperFret = lowerFret - gap;
      if (!upperFrets.includes(upperFret)) return;
      // The open string (fret 0) is never the "less natural" side, even when
      // it's the fret this position had to fall back to reach — it's always
      // the easiest note on a string to play, fallback or not. Without this,
      // a position whose fallback lands on an open string would prefer
      // keeping a genuinely harder stretched note over the open one, which
      // is backwards.
      const fallbackInvolved =
        upperFret !== 0 &&
        (lowerFret === fallbackFret || upperFret === fallbackFret);
      if (fallbackInvolved) {
        dupUpperFrets.push(upperFret);
      } else {
        dupLowerFrets.push(lowerFret);
      }
    });
    result[i] = lowerFrets.filter((f) => !dupLowerFrets.includes(f));
    result[i + 1] = upperFrets.filter((f) => !dupUpperFrets.includes(f));
  }

  // The low E and high e strings are the same pitch class (2 octaves apart),
  // so they always start from the identical raw pattern — but the loop above
  // only ever removes from the *lower* string of a pair, so E can lose a note
  // to A while e, having no string above it to lose notes to, never does.
  // That leaves the two "E" strings mismatched even though they're meant to
  // mirror each other. Keep them in sync by intersecting: a fret only stays
  // part of the shape if it survives on both.
  const low = result.length - 1;
  if (low > 0) {
    const shared = result[0].filter((fret) => result[low].includes(fret));
    result[0] = shared;
    result[low] = shared;
  }

  return result;
}

// For each string, collect frets in the window that land on the root pitch class.
export function computeRootTab(
  rootPc: number,
  startFret = 0,
  windowSize = 5,
): number[][] {
  return STANDARD_TUNING_PC.map((openPc) => {
    const frets: number[] = [];
    for (let fret = startFret; fret < startFret + windowSize; fret++) {
      if ((openPc + fret) % 12 === rootPc) frets.push(fret);
    }
    return frets;
  });
}

export const ROOT_STRINGS: RootString[] = [6, 5, 4];
export const ROOT_FINGERS: RootFinger[] = [0, 1, 2, 3, 4];
export const DEFAULT_POSITION: ScalePosition = { rootString: 6, rootFinger: 1 };

export function isValidPosition(
  position: ScalePosition,
  rootPc: number,
): boolean {
  return computePositionWindow(position, rootPc) !== null;
}

export function getValidFingersForString(
  rootString: RootString,
  rootPc: number,
): RootFinger[] {
  return ROOT_FINGERS.filter((f) =>
    isValidPosition({ rootString, rootFinger: f }, rootPc),
  );
}

// Shared by any position system: given a raw fret window, produce the tab/interval
// data a chart needs, absorbing the "open string at the top of the window" case
// (shift up one fret so the chart doesn't show an empty area above the nut).
function renderScaleWindow(
  modeIntervals: number[],
  rootPc: number,
  rawStartFret: number,
  numFrets: number,
  fallbackFret?: number,
) {
  const rawScaleTab = computeScaleTab(
    modeIntervals,
    rootPc,
    rawStartFret,
    numFrets,
  );
  const hasOpenNotes =
    rawStartFret === 0 && rawScaleTab.some((frets) => frets.includes(0));
  const startFret = rawStartFret === 0 && !hasOpenNotes ? 1 : rawStartFret;
  const patternStartFret = Math.max(1, startFret);

  // When startFret is 0, the open area above the nut replaces the first fret space
  // in the displayed window. Render one fewer fretted space (no leading empty slot —
  // the open string is the unfingered root).
  const isOpenPosition = startFret === 0;
  const displayNumFrets = isOpenPosition ? numFrets - 1 : numFrets;

  const scaleTab = deduplicateUnisonStrings(
    startFret === rawStartFret
      ? rawScaleTab
      : computeScaleTab(modeIntervals, rootPc, startFret, numFrets),
    fallbackFret,
  );
  const rootTab = deduplicateUnisonStrings(
    computeRootTab(rootPc, startFret, numFrets),
    fallbackFret,
  );
  const scaleIntervalTab = computeIntervalTab(scaleTab, rootPc);
  const rootIntervalTab = rootTab.map((frets) => frets.map(() => '1'));

  return {
    numFrets: displayNumFrets,
    startFret,
    patternStartFret,
    isOpenPosition,
    scaleTab,
    rootTab,
    scaleIntervalTab,
    rootIntervalTab,
  };
}

// The finger-position system's window always has room for a 4-finger stretch
// (5 frets), but a sparser scale (like a pentatonic) doesn't always use all of
// it. Trim the "padding" fret — the one beyond what any finger actually reaches
// — when it's genuinely empty, so charts default to 4 frets and only grow to 5
// when a note actually needs the room. Padding sits at the end for fingers 1–4
// (and for an open position); for the stretch position (finger 0) it's at the
// start.
//
// Deliberately "empty" rather than "below some string-count threshold": a
// 7-note scale can legitimately have only one unique note left in that column
// after unison dedup (e.g. Aeolian at certain positions) — trimming a column
// that still has real content in it silently drops a note from the shape.
function trimUnusedPaddingFret<
  T extends {
    startFret: number;
    patternStartFret: number;
    numFrets: number;
    scaleTab: number[][];
    rootTab: number[][];
    scaleIntervalTab: string[][];
    rootIntervalTab: string[][];
  },
>(rendered: T, rootPc: number, paddingAtStart: boolean): T {
  if (rendered.numFrets <= 4) return rendered;

  const paddingFret = paddingAtStart
    ? rendered.patternStartFret
    : rendered.patternStartFret + rendered.numFrets - 1;
  const hasContentAtPadding = rendered.scaleTab.some((frets) =>
    frets.includes(paddingFret),
  );
  if (hasContentAtPadding) {
    return rendered;
  }

  // Actually drop the fret from the tabs, not just shrink numFrets — otherwise
  // the dot's still in the data and Pattern draws it outside the now-smaller grid.
  const dropPaddingFret = (tab: number[][]) =>
    tab.map((frets) => frets.filter((f) => f !== paddingFret));
  const scaleTab = dropPaddingFret(rendered.scaleTab);
  const rootTab = dropPaddingFret(rendered.rootTab);

  return {
    ...rendered,
    ...(paddingAtStart
      ? {
          startFret: rendered.startFret + 1,
          patternStartFret: rendered.patternStartFret + 1,
        }
      : {}),
    numFrets: rendered.numFrets - 1,
    scaleTab,
    rootTab,
    scaleIntervalTab: computeIntervalTab(scaleTab, rootPc),
    rootIntervalTab: rootTab.map((frets) => frets.map(() => '1')),
  };
}

// Every position has a natural 4-finger span (finger 0 shares finger 1's
// span — "same as position 1", per the docs) plus room for one more note one
// fret beyond it. Finger 0 natively reaches for that extra note *below* the
// span (finger 1 stretching back); every other finger natively reaches
// *above* it (finger 4 either sitting on the root — for finger 4 itself — or
// just being the top of the natural span — for fingers 1–3).
//
// The natural span's own edge finger can turn out to need the same finger as
// the extension fret, on the same string — but that's not automatically
// fatal: deduplicateUnisonStrings already drops a note when an adjacent
// string reaches the identical pitch, and if *that's* what's sitting at the
// extension fret, dropping it resolves the conflict for free, because it
// means every note is still shown somewhere and no fret gets skipped. A
// conflict only forces the window to move when the extension fret is a
// genuinely distinct note with no adjacent-string stand-in — dedup can never
// resolve two different notes wanting the same finger on the same string;
// that's only fixable by not asking for both in the same window.
//
// A sparse scale (pentatonic and the like) can also leave the natural span's
// far edge (finger 1, fingers 1–3 only — 0 and 4 already anchor the root at
// an extreme edge, so there's nowhere further to reach) with *no* note on
// any string at all: not a rule violation, just a hand position spread
// across more frets than the scale needs. That's reason enough to reach the
// opposite direction too, even without a conflict.
//
// A related but distinct problem: even when every fret in the native window
// has *some* note somewhere, deduplication can leave one particular string
// down to a single, isolated dot — usually because that string's own notes
// keep losing out to adjacent strings' duplicates. A lone dot doesn't read
// as a usable line the way 2+ connected notes do, and reaching the opposite
// direction instead often gives every string a more even, connected spread
// (this is *not* the same test as an edge simply being raw-empty — a window
// can have a totally dead edge fret and still leave every string with 2+
// notes elsewhere, which is completely fine and shouldn't move the window;
// it's specifically about what a string is left with after dedup).
//
// Either way, unlike a genuine rescue, the resulting extension fret isn't
// "less natural" than the rest of the span (it's often the *more* useful
// fret — reaching it was the whole point), so it competes for duplicates on
// equal footing, not last-resort priority.
//
// Either way, the opposite direction can have the identical problem on its
// own edge (a different string), in which case there's no legal 5th note at
// all: fall back further, to the plain 4-finger span with no extension —
// whatever note needed the extra reach just isn't part of this position; a
// neighboring position picks it up instead. Returns the window to render
// and, when a conflict-driven fallback kicks in, which fret is the fallback
// one (for deduplicateUnisonStrings to give it last-resort priority on any
// *other* duplicate the shifted window turns up).
function resolveWindowForPosition(
  modeIntervals: number[],
  rootPc: number,
  position: ScalePosition,
  primaryWindow: { startFret: number; numFrets: number; rootFret: number },
): {
  startFret: number;
  numFrets: number;
  fallbackFret?: number;
  usedFallback?: boolean;
} {
  const { rootFinger } = position;
  const { rootFret } = primaryWindow;

  const hasContentAt = (fret: number) =>
    fret >= 0 &&
    computeScaleTab(modeIntervals, rootPc, fret, 1).some(
      (frets) => frets.length > 0,
    );

  const naturalBottom =
    rootFinger === 0 ? rootFret : rootFret - (rootFinger - 1);
  const naturalTop = naturalBottom + 3;
  const nativeBelow = rootFinger === 0;
  const nativeStart = nativeBelow ? primaryWindow.startFret : naturalBottom;
  const nativeWindow = { startFret: nativeStart, numFrets: 5 };

  // True when, after deduplication, some string still needs both of these
  // (always-adjacent) frets — a same-finger conflict dedup couldn't resolve.
  const stillConflicts = (
    startFret: number,
    numFrets: number,
    edgeFret: number,
    extensionFret: number,
    fallbackFret?: number,
  ) => {
    const tab = deduplicateUnisonStrings(
      computeScaleTab(modeIntervals, rootPc, startFret, numFrets),
      fallbackFret,
    );
    return tab.some(
      (frets) => frets.includes(edgeFret) && frets.includes(extensionFret),
    );
  };

  const nativeExtensionFret = nativeBelow ? naturalBottom - 1 : naturalTop + 1;
  const nativeEdgeFret = nativeBelow ? naturalBottom : naturalTop;
  if (nativeExtensionFret < 0) return nativeWindow; // open root: nothing below to extend into

  const hasConflict = stillConflicts(
    nativeStart,
    nativeWindow.numFrets,
    nativeEdgeFret,
    nativeExtensionFret,
  );
  const farEdgeIdle =
    rootFinger >= 1 && rootFinger <= 3 && !hasContentAt(naturalBottom);
  // See the "related but distinct problem" paragraph above: a string reduced
  // to a single dot after dedup, in the native window, is reason enough to
  // try the opposite direction — independent of whether any one fret is
  // raw-empty.
  const nativeLeavesStringIsolated =
    rootFinger >= 1 &&
    rootFinger <= 3 &&
    deduplicateUnisonStrings(
      computeScaleTab(modeIntervals, rootPc, nativeStart, 5),
    ).some((frets) => frets.length < 2);
  if (!hasConflict && !farEdgeIdle && !nativeLeavesStringIsolated) {
    return nativeWindow;
  }

  const fallbackExtensionFret = nativeBelow
    ? naturalTop + 1
    : naturalBottom - 1;
  const fallbackEdgeFret = nativeBelow ? naturalTop : naturalBottom;
  const fallbackStart = nativeBelow ? naturalBottom : fallbackExtensionFret;
  // The "same finger can't be in two places on one string" conflict this
  // guards against doesn't apply when the extension fret is the open string
  // — no finger is placed there at all, so it can never collide with
  // whatever finger sits on the edge fret.
  const fallbackBlocked =
    fallbackExtensionFret < 0 ||
    (fallbackExtensionFret !== 0 &&
      stillConflicts(
        fallbackStart,
        5,
        fallbackEdgeFret,
        fallbackExtensionFret,
        fallbackExtensionFret,
      ));

  if (fallbackBlocked) {
    return { startFret: naturalBottom, numFrets: 4 };
  }

  return {
    startFret: fallbackStart,
    numFrets: 5,
    // Only give the extension fret last-resort dedup priority when it's
    // genuinely rescuing a note from a same-string conflict — not when it's
    // here purely because the native edge was idle (see comment above).
    fallbackFret: hasConflict ? fallbackExtensionFret : undefined,
    usedFallback: true,
  };
}

// Derive everything needed to render the chart for a given mode/key/position.
// Position must be valid for this key (use isValidPosition first).
export function deriveScaleRender(
  modeIntervals: number[],
  rootPc: number,
  position: ScalePosition,
) {
  const primaryWindow = computePositionWindow(position, rootPc)!;
  const {
    startFret: rawStartFret,
    numFrets,
    fallbackFret,
    usedFallback,
  } = resolveWindowForPosition(modeIntervals, rootPc, position, primaryWindow);

  // An open position "spends" one window fret on the open-string row instead of
  // a fretted one (renderScaleWindow subtracts it back out below), so request
  // one extra fret here to compensate — open charts get the same shot at 4 (or
  // 5) fretted rows as closed ones, plus the open row on top.
  const willBeOpen =
    rawStartFret === 0 &&
    computeScaleTab(modeIntervals, rootPc, 0, 1).some(
      (frets) => frets.length > 0,
    );

  const { isOpenPosition, ...rendered } = renderScaleWindow(
    modeIntervals,
    rootPc,
    rawStartFret,
    willBeOpen ? numFrets + 1 : numFrets,
    fallbackFret,
  );

  // Finger 0's blank/extension slot is always the bottom row: natively it's
  // the literal stretch-1 fret below the root; when it falls back to
  // extending above instead, the root itself becomes the note reached by
  // stretching back, and the numbered fingers occupy the natural span above
  // it — either way, row 0 is blank. Every other finger is the mirror image:
  // its blank slot is the top row natively (the extra fret above the natural
  // span), but flips to the bottom row on a fallback (the natural span stays
  // put, with a new extension fret added below it).
  const stretch =
    !isOpenPosition && (position.rootFinger === 0 || !!usedFallback);
  const trimmed = trimUnusedPaddingFret(rendered, rootPc, stretch);

  const fingerLabels: string[] =
    trimmed.numFrets === 4
      ? ['1', '2', '3', '4']
      : stretch
        ? ['', '1', '2', '3', '4']
        : ['1', '2', '3', '4', ''];

  return { ...trimmed, fingerLabels };
}

interface MergeableScaleRender {
  scaleTab: number[][];
  rootTab: number[][];
  scaleIntervalTab: (string | number)[][];
  rootIntervalTab: (string | number)[][];
}

// Merges deriveScaleRender's separate scaleTab/rootTab — kept apart so an
// individual position diagram can color the root differently — into one
// per-string tab, for a merged multi-position overlay where every note in a
// shape needs the same color regardless of scale-degree-vs-root. Optionally
// repeats every note an octave higher, so a reader can see a position's
// shape reappear further up the neck instead of taking it on faith.
export function mergeScaleRenderShape(
  rendered: MergeableScaleRender,
  label: string,
  includeRepeat = false,
): { label: string; tab: number[][]; intervals: (string | number)[][] } {
  const tab: number[][] = [];
  const intervals: (string | number)[][] = [];
  for (let i = 0; i < 6; i++) {
    const frets = [
      ...(rendered.scaleTab[i] ?? []),
      ...(rendered.rootTab[i] ?? []),
    ];
    const labels = [
      ...(rendered.scaleIntervalTab[i] ?? []),
      ...(rendered.rootIntervalTab[i] ?? []),
    ];
    tab.push(includeRepeat ? [...frets, ...frets.map((f) => f + 12)] : frets);
    intervals.push(includeRepeat ? [...labels, ...labels] : labels);
  }
  return { label, tab, intervals };
}

// The conventional "5 box positions" for a pentatonic (or any) scale: a fixed-width
// window anchored at each scale-degree fret on a reference string (the low E string
// by default). Adjacent positions overlap — that overlap is what lets a player shift
// smoothly from one position to the next, rather than the neck being cut into
// non-overlapping slices.
export interface AnchoredPosition {
  // The scale-degree fret this position is anchored to, on the reference string —
  // before the open-position adjustment below. Callers use this to find, e.g.,
  // "whichever position has its root on this string" regardless of key.
  anchorFret: number;
  startFret: number;
  numFrets: number;
}

export function computeAnchoredPositions(
  modeIntervals: number[],
  rootPc: number,
  // Charts default to this many fretted rows, growing by one (see below) only
  // when needed — matches deriveScaleRender's default.
  windowSize = 4,
  referenceStringIndex = 0,
): AnchoredPosition[] {
  const openPc = STANDARD_TUNING_PC[referenceStringIndex];
  const scalePCs = new Set(modeIntervals.map((i) => (rootPc + i) % 12));
  const anchorFrets: number[] = [];
  for (let fret = 0; fret < 12; fret++) {
    if (scalePCs.has((openPc + fret) % 12)) anchorFrets.push(fret);
  }
  return anchorFrets.map((anchorFret) => {
    // Fret 0 can't belong to any position's window except the first one (there's
    // no fret -1 to overlap into), so a lowest anchor of 1 would otherwise cut off
    // open-string scale tones on other strings — pull the window down to the nut.
    const startFret = anchorFret <= 1 ? 0 : anchorFret;
    // An open position "spends" one window fret on the open-string row instead of
    // a fretted one (renderScaleWindow subtracts it back out), so request one
    // extra fret here to compensate — open charts get the same shot at windowSize
    // fretted rows as closed ones, plus the open row on top.
    let numFrets = windowSize + (startFret === 0 ? 1 : 0);
    // A pentatonic scale doesn't have a note on every fret of every string, so a
    // fixed-width window can end on a fret with no scale tone anywhere on the
    // neck — a visibly dead trailing column that reads as a missing fret rather
    // than an unused one. Grow by (at most) one more fret to avoid that, rather
    // than always requesting the wider window up front.
    if (
      !STANDARD_TUNING_PC.some((stringOpenPc) =>
        scalePCs.has((stringOpenPc + startFret + numFrets - 1) % 12),
      )
    ) {
      numFrets++;
    }
    return { anchorFret, startFret, numFrets };
  });
}

// Index into computeAnchoredPositions' result whose anchor is the root note itself
// on the reference string (e.g. "position 1, root on the 6th string") — independent
// of key, unlike a literal array index, which only means "root" for keys where the
// root happens to be the lowest scale tone on that string.
export function findRootAnchoredPositionIndex(
  positions: AnchoredPosition[],
  rootPc: number,
  referenceStringIndex = 0,
): number {
  const openPc = STANDARD_TUNING_PC[referenceStringIndex];
  return positions.findIndex((p) => (openPc + p.anchorFret) % 12 === rootPc);
}

// Derive chart data for one anchored position window (see computeAnchoredPositions).
export function deriveAnchoredScaleRender(
  modeIntervals: number[],
  rootPc: number,
  window: { startFret: number; numFrets: number },
) {
  const { isOpenPosition: _isOpenPosition, ...rendered } = renderScaleWindow(
    modeIntervals,
    rootPc,
    window.startFret,
    window.numFrets,
  );
  return rendered;
}

export interface DiatonicChord {
  degree: number; // 1–7
  romanNumeral: string; // 'I', 'ii', 'III', etc. — case reflects chord quality
  quality: string; // 'maj7', 'm7', '7', 'm7b5', 'dim7', 'mMaj7', 'maj7#5', '7#5'
  rootNote: string; // 'C', 'C#', etc.
  name: string; // rootNote + quality, e.g. 'Cmaj7'
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function classifyTriad(
  third: number,
  fifth: number,
): { quality: string; isMajor: boolean } | null {
  if (third === 4 && fifth === 7) return { quality: 'maj', isMajor: true };
  if (third === 3 && fifth === 7) return { quality: 'm', isMajor: false };
  if (third === 3 && fifth === 6) return { quality: 'mb5', isMajor: false };
  if (third === 4 && fifth === 8) return { quality: 'aug', isMajor: true };
  return null;
}

export function getDiatonicTriads(
  modeIntervals: number[],
  tonicNote: string,
): DiatonicChord[] | null {
  if (modeIntervals.length !== 7) return null;

  const spelled = spellScale(tonicNote, modeIntervals);

  return modeIntervals.map((rootInterval, i): DiatonicChord => {
    const third = (modeIntervals[(i + 2) % 7] - rootInterval + 12) % 12;
    const fifth = (modeIntervals[(i + 4) % 7] - rootInterval + 12) % 12;

    const classified = classifyTriad(third, fifth);
    const quality = classified?.quality ?? '?';
    const isMajor = classified?.isMajor ?? false;

    const numeral = isMajor
      ? ROMAN_NUMERALS[i]
      : ROMAN_NUMERALS[i].toLowerCase();
    const rootNote = spelled[i];

    return {
      degree: i + 1,
      romanNumeral: numeral,
      quality,
      rootNote,
      name: `${rootNote}${quality === 'maj' ? '' : quality}`,
    };
  });
}

// Classify a 7th chord from semitone intervals (3rd, 5th, 7th) above the root.
// Returns null for combinations that don't match a common 7th-chord quality.
function classify7thChord(
  third: number,
  fifth: number,
  seventh: number,
): { quality: string; isMajor: boolean } | null {
  if (third === 4 && fifth === 7 && seventh === 11)
    return { quality: 'maj7', isMajor: true };
  if (third === 4 && fifth === 7 && seventh === 10)
    return { quality: '7', isMajor: true };
  if (third === 3 && fifth === 7 && seventh === 10)
    return { quality: 'm7', isMajor: false };
  if (third === 3 && fifth === 6 && seventh === 10)
    return { quality: 'm7b5', isMajor: false };
  if (third === 3 && fifth === 6 && seventh === 9)
    return { quality: 'dim7', isMajor: false };
  if (third === 3 && fifth === 7 && seventh === 11)
    return { quality: 'mMaj7', isMajor: false };
  if (third === 4 && fifth === 8 && seventh === 11)
    return { quality: 'maj7#5', isMajor: true };
  if (third === 4 && fifth === 8 && seventh === 10)
    return { quality: '7#5', isMajor: true };
  return null;
}

// Build the diatonic 7th-chord sequence for the given mode + tonic. Returns null
// for scales that aren't 7-note (e.g. pentatonic). Chord roots are spelled so each
// letter A–G appears once across the scale.
export function getDiatonicChords(
  modeIntervals: number[],
  tonicNote: string,
): DiatonicChord[] | null {
  if (modeIntervals.length !== 7) return null;

  const spelled = spellScale(tonicNote, modeIntervals);

  return modeIntervals.map((rootInterval, i): DiatonicChord => {
    const third = (modeIntervals[(i + 2) % 7] - rootInterval + 12) % 12;
    const fifth = (modeIntervals[(i + 4) % 7] - rootInterval + 12) % 12;
    const seventh = (modeIntervals[(i + 6) % 7] - rootInterval + 12) % 12;

    const classified = classify7thChord(third, fifth, seventh);
    const quality = classified?.quality ?? '?';
    const isMajor = classified?.isMajor ?? false;

    const numeral = isMajor
      ? ROMAN_NUMERALS[i]
      : ROMAN_NUMERALS[i].toLowerCase();
    const rootNote = spelled[i];

    return {
      degree: i + 1,
      romanNumeral: numeral,
      quality,
      rootNote,
      name: `${rootNote}${quality}`,
    };
  });
}
