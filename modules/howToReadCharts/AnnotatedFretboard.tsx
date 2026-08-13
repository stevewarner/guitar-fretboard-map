import type { ReactNode } from 'react';
import { Fretboard } from '@/components/FretboardChart';
import {
  fbHeight,
  fontSize,
  strHeight,
  stroke,
  svgDimension,
  topSpace,
} from '@/components/FretboardChart/constants';

// Mirrors Pattern.tsx's own cx/cy math, so a callout target lines up exactly
// with where Pattern would actually draw a dot for the same (string, fret).
export const stringX = (stringIndex: number) =>
  topSpace + stroke / 2 + strHeight * stringIndex;
export const fretY = (fret: number, startFret = 1) =>
  fret === 0
    ? topSpace / 2 + stroke / 2
    : topSpace / 2 + stroke / 2 + topSpace * (fret - startFret + 1);
// The right edge of the fretted area — useful for a callout aimed at a fret
// line itself rather than a specific string.
export const fretboardRight = fbHeight + stroke + topSpace;
// Mirrors Fretboard.tsx's own finger-label x/y math (row index i = the i-th
// fretted row, top to bottom).
export const fingerLabelX = topSpace / 2;
export const fingerLabelY = (rowIndex: number) =>
  topSpace * (rowIndex + 1.5) + fontSize / 3;

export interface FretboardCallout {
  // A single line, or multiple lines stacked with tspans (for a label too
  // wide to read comfortably on one line in the margin).
  text: string | string[];
  // Where the arrow points, in the fretboard's own coordinate space (the
  // same 0-100-wide grid Fretboard/Pattern draw onto) — use stringX/fretY
  // above rather than hand-picked numbers so it stays exact.
  target: { x: number; y: number };
  // Where the arrow line starts and the label sits, in the *outer* canvas's
  // coordinate space (i.e. already accounting for padding) — the caller
  // places these directly since collision-free label layout isn't something
  // this component tries to solve automatically.
  from: { x: number; y: number };
  labelPos: { x: number; y: number };
  anchor?: 'start' | 'middle' | 'end';
  // How far the arrow bows away from a straight line, as a fraction of its
  // length — negative bows the other way. A little curve reads as more
  // hand-drawn than a ruler-straight line; 0 falls back to dead straight.
  curve?: number;
  // How far short of the target the arrowhead stops, so it doesn't land
  // directly on top of (and hide) the thing it's pointing at.
  gap?: number;
}

interface AnnotatedFretboardProps {
  numFrets: number;
  title: string;
  fingerLabels?: string[];
  callouts: FretboardCallout[];
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: ReactNode;
}

// Wraps Fretboard in a larger outer <svg> so callouts (arrows + labels) can
// live in the margin around it. Fretboard is nested unscaled (same width/
// height as its own viewBox), just offset by the padding — so any point in
// its coordinate system maps to the outer canvas by adding padding.top/left.
export function AnnotatedFretboard({
  numFrets,
  title,
  fingerLabels,
  callouts,
  padding,
  children,
}: AnnotatedFretboardProps) {
  const pad = {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0,
  };
  const innerHeight = topSpace * (numFrets + 2);
  const width = pad.left + svgDimension + pad.right;
  const height = pad.top + innerHeight + pad.bottom;
  // The arrowhead's strokes are drawn at exactly this width — same as the
  // arc itself, so the tip reads as one continuous marker stroke rather than
  // a heavier, disconnected cap. markerUnits="userSpaceOnUse" plus a viewBox
  // matched 1:1 to markerWidth/markerHeight keeps this a direct, un-scaled
  // measurement (the default markerUnits="strokeWidth" would otherwise
  // multiply this against the path's own stroke width a second time).
  const arrowStrokeWidth = 1.2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <defs>
        <marker
          id="callout-arrowhead"
          viewBox="0 0 5 5"
          refX="4.3"
          refY="2.5"
          markerWidth="5"
          markerHeight="5"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          {/* A short open chevron rather than a filled triangle — reads more
              like a quick hand-drawn arrow tick. */}
          <path
            d="M 1.3,0.9 L 4.3,2.5 L 1.3,4.1"
            fill="none"
            stroke="red"
            strokeWidth={arrowStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <Fretboard
        x={pad.left}
        y={pad.top}
        width={svgDimension}
        height={innerHeight}
        numFrets={numFrets}
        title={title}
        fingerLabels={fingerLabels}
      >
        {children}
      </Fretboard>

      {callouts.map((callout, i) => {
        const lines = Array.isArray(callout.text)
          ? callout.text
          : [callout.text];
        const x1 = callout.from.x;
        const y1 = callout.from.y;
        // The target itself — the arrowhead stops short of this by `gap`,
        // computed below, rather than landing on it.
        const targetX = pad.left + callout.target.x;
        const targetY = pad.top + callout.target.y;
        // Bow the line through a control point offset perpendicular to its
        // midpoint, so it arcs instead of running ruler-straight.
        const dx = targetX - x1;
        const dy = targetY - y1;
        const len = Math.hypot(dx, dy) || 1;
        const bow = callout.curve ?? len * 0.18;
        const controlX = (x1 + targetX) / 2 + (-dy / len) * bow;
        const controlY = (y1 + targetY) / 2 + (dx / len) * bow;
        // Pull the endpoint back along the curve's own approach direction
        // (control point -> target, the quadratic's tangent at t=1) rather
        // than the straight from->target line, so the shortened tip still
        // sits right on the arc instead of cutting a corner off it.
        const gap = callout.gap ?? 5;
        const tdx = targetX - controlX;
        const tdy = targetY - controlY;
        const tlen = Math.hypot(tdx, tdy) || 1;
        const x2 = targetX - (tdx / tlen) * gap;
        const y2 = targetY - (tdy / tlen) * gap;

        return (
          <g key={i}>
            <path
              d={`M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`}
              fill="none"
              stroke="red"
              strokeWidth={arrowStrokeWidth}
              strokeLinecap="round"
              markerEnd="url(#callout-arrowhead)"
            />
            <text
              x={callout.labelPos.x}
              y={callout.labelPos.y}
              textAnchor={callout.anchor ?? 'middle'}
              fontFamily="'Comic Sans MS', 'Comic Sans', cursive"
              fontSize={6}
              fill="red"
            >
              {lines.map((line, li) => (
                <tspan key={li} x={callout.labelPos.x} dy={li === 0 ? 0 : 8}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
