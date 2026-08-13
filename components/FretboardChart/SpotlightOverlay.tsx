'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Fretboard } from './Fretboard';
import { Pattern } from './Pattern';
import { DEFAULT_DOT_COLOR, HIGHLIGHT_DOT_COLOR } from './scaleChartLayers';

export interface SpotlightShape {
  label: string;
  tab: number[][];
  intervals: (string | number)[][];
}

interface SpotlightOverlayProps {
  shapes: SpotlightShape[];
  caption: ReactNode;
  boardTitle: string;
  className?: string;
  // Fixed lower bound on the fretboard's fret count — e.g. FullNeckOverlay
  // needs room for its 1st position's octave-up repeat even when the raw
  // fret range would otherwise be narrower. Defaults to 1 (no minimum).
  minNumFrets?: number;
  // Whether a shape's open-string dots render filled. FullNeckOverlay only
  // fills them while that shape is the spotlit one (unfilled default color
  // matches every other chord diagram's ring convention); scale overlays
  // fill them unconditionally, matching the individual position diagrams
  // above them. Defaults to always filled.
  fillOpen?: (isSpotlit: boolean) => boolean;
  // Whether a shape's dots show interval labels. Every existing overlay
  // (chord positions, scale positions, mixed modes) shows every shape's
  // labels all the time, so that's the default; a lesson with enough
  // overlapping shapes that labels turn into clutter (four-note-voicings'
  // 7-chords-on-one-neck view) can opt into showing labels only on the
  // spotlit shape instead.
  showIntervals?: (isSpotlit: boolean) => boolean;
}

// Shared by every "merge N shapes onto one fretboard, click a legend entry
// to spotlight just that shape's notes in red" lesson diagram (chord
// positions, scale positions, mixed modes) — single-select spotlight via
// index, spotlit shape drawn last so its color wins on an exact overlap,
// everything else stays the default color rather than disappearing. Callers
// own the domain-specific work of turning their own data into
// {label, tab, intervals} shapes; this component only owns the fretboard +
// legend presentation.
export function SpotlightOverlay({
  shapes,
  caption,
  boardTitle,
  className = 'mb-4',
  minNumFrets = 1,
  fillOpen = () => true,
  showIntervals = () => true,
}: SpotlightOverlayProps) {
  const [spotlight, setSpotlight] = useState<number | null>(null);

  const { startFret, numFrets, patternStartFret } = useMemo(() => {
    const allFrets = shapes.flatMap((shape) => shape.tab.flat());
    const start = allFrets.length ? Math.min(...allFrets) : 1;
    const end = allFrets.length ? Math.max(...allFrets) : start;
    return {
      startFret: start,
      numFrets: Math.max(minNumFrets, end - start + 1),
      patternStartFret: Math.max(1, start),
    };
  }, [shapes, minNumFrets]);

  const drawOrder = useMemo(
    () =>
      shapes
        .map((_, i) => i)
        .sort((a, b) => Number(a === spotlight) - Number(b === spotlight)),
    [shapes, spotlight],
  );

  return (
    <div className={className}>
      <p className="mb-4 text-sm text-fg-secondary">{caption}</p>
      <div className="flex flex-wrap items-start gap-6">
        <div className="w-64">
          <Fretboard
            numFrets={numFrets}
            startFret={startFret > 1 ? startFret : undefined}
            title={boardTitle}
          >
            {drawOrder.map((i) => {
              const shape = shapes[i];
              const isSpotlit = i === spotlight;
              return (
                <Pattern
                  key={i}
                  tab={shape.tab}
                  intervals={
                    showIntervals(isSpotlit) ? shape.intervals : undefined
                  }
                  startFret={patternStartFret}
                  fillColor={
                    isSpotlit ? HIGHLIGHT_DOT_COLOR : DEFAULT_DOT_COLOR
                  }
                  fillOpen={fillOpen(isSpotlit)}
                />
              );
            })}
          </Fretboard>
        </div>
        <ul className="flex flex-col gap-2">
          {shapes.map((shape, i) => {
            const isSpotlit = i === spotlight;
            return (
              <li key={shape.label}>
                <button
                  type="button"
                  onClick={() =>
                    setSpotlight((prev) => (prev === i ? null : i))
                  }
                  aria-pressed={isSpotlit}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block size-3 shrink-0 rounded-full border border-line"
                    style={{
                      backgroundColor: isSpotlit
                        ? HIGHLIGHT_DOT_COLOR
                        : 'transparent',
                    }}
                  />
                  {shape.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
