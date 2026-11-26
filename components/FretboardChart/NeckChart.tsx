import { useId } from 'react';
import { getContrastColor } from '@/app/utils';
import {
  fbHeight,
  strHeight,
  stroke,
  topSpace,
  numStrings,
  circRad,
} from './constants';

export interface NeckChartLayer {
  // One array of frets per string, low E first (same order as every other tab
  // in the app).
  tab: number[][];
  // Label per fret, same shape as `tab`.
  labels?: string[][];
  fillColor: string;
  // Open-string (fret 0) dots draw as rings unless this is set, matching
  // Pattern's open-note convention.
  fillOpen?: boolean;
}

interface Props {
  numFrets: number;
  // Later layers draw on top — the highlighted shape/position goes last.
  layers: NeckChartLayer[];
  title: string;
  description?: string;
  className?: string;
}

// The vertical Fretboard diagram turned on its side for a full-neck view:
// same constants, stroke, dot radius and label style, frets running left to
// right from the nut, low E on the bottom (tab orientation). Labels stay
// upright, which is why this is its own component rather than a rotated
// <Fretboard>.
export function NeckChart({
  numFrets,
  layers,
  title,
  description,
  className = '',
}: Props) {
  const titleId = useId();
  const descId = useId();

  const fretX = (fret: number) =>
    fret === 0
      ? topSpace / 2 + stroke / 2
      : topSpace / 2 + stroke / 2 + topSpace * fret;
  const stringY = (stringIndex: number) =>
    topSpace + stroke / 2 + strHeight * (numStrings - 1 - stringIndex);

  const viewY = topSpace - circRad - 2;
  const viewWidth = topSpace * (numFrets + 2);
  const viewHeight = fbHeight + (circRad + 2) * 2 + stroke;

  return (
    <svg
      viewBox={`0 ${viewY} ${viewWidth} ${viewHeight}`}
      strokeWidth={stroke}
      role="img"
      aria-labelledby={description ? `${titleId} ${descId}` : titleId}
      className={className}
    >
      <title id={titleId}>{title}</title>
      {description && <desc id={descId}>{description}</desc>}

      {[...Array(numStrings)].map((_, i) => (
        <line
          key={`string-${i}`}
          x1={topSpace}
          y1={stringY(i)}
          x2={topSpace * (numFrets + 1)}
          y2={stringY(i)}
          stroke="black"
        />
      ))}
      {[...Array(numFrets + 1)].map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={topSpace * (i + 1)}
          y1={topSpace}
          x2={topSpace * (i + 1)}
          y2={fbHeight + stroke + topSpace}
          stroke="black"
        />
      ))}

      {layers.map((layer, layerIndex) =>
        layer.tab.map((frets, stringIndex) =>
          frets.map((fret, fretIndex) => {
            const filled = fret !== 0 || !!layer.fillOpen;
            const label = layer.labels?.[stringIndex]?.[fretIndex];
            const cx = fretX(fret);
            const cy = stringY(stringIndex);
            return (
              <g key={`${layerIndex}-${stringIndex}-${fretIndex}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={circRad}
                  fill={filled ? layer.fillColor : 'none'}
                  stroke="#000"
                  strokeWidth={stroke}
                />
                {label && (
                  <text
                    x={cx}
                    y={cy + circRad / 3}
                    fontFamily="Arial"
                    fontSize={circRad * 1.3}
                    textAnchor="middle"
                    fill={filled ? getContrastColor(layer.fillColor) : '#000'}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          }),
        ),
      )}
    </svg>
  );
}
