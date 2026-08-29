import { SVGProps, useId } from 'react';
import {
  svgDimension,
  fbHeight,
  strHeight,
  stroke,
  topSpace,
  numStrings,
  fontSize,
} from './constants';

interface FretboardProps {
  numFrets: number;
  startFret?: number;
  title?: string;
  // Longer machine/screen-reader-only summary (tab, notes, intervals, root
  // string) — the <title> is a one-line label, this is the full answer, so a
  // crawler that only reads the SVG's own accessible name still gets
  // everything docs/GEO_STRATEGY.md item 5 asks for. Omitted entirely (no
  // <desc>, aria-labelledby stays title-only) when not provided.
  description?: string;
  fingerLabels?: string[];
  showFretLabel?: boolean;
}

export const Fretboard = ({
  children,
  numFrets,
  startFret,
  title = '',
  description,
  fingerLabels,
  showFretLabel = true,
  ...rest
}: FretboardProps & SVGProps<SVGSVGElement>) => {
  const titleId = useId();
  const descId = useId();

  return (
    <svg
      strokeWidth={stroke}
      viewBox={`0 0 ${svgDimension} ${topSpace * (numFrets + 2)}`}
      role="img"
      aria-labelledby={description ? `${titleId} ${descId}` : titleId}
      {...rest}
    >
      <title id={titleId}>{title}</title>
      {description && <desc id={descId}>{description}</desc>}

      {/* strings */}
      {[...Array(numStrings)].map((_, index) => (
        <line
          key={`string-${index}`}
          x1={topSpace + stroke / 2 + strHeight * index}
          y1={topSpace}
          x2={topSpace + stroke / 2 + strHeight * index}
          y2={topSpace * (numFrets + 1)}
          stroke="black"
        />
      ))}

      {/* frets */}
      {[...Array(numFrets + 1)].map((_, index) => (
        <line
          key={`fret-${index}`}
          x1={topSpace}
          y1={topSpace * (index + 1)}
          x2={fbHeight + stroke + topSpace}
          y2={topSpace * (index + 1)}
          stroke="black"
        />
      ))}

      {children}

      {fingerLabels?.map((label, i) =>
        label ? (
          <text
            key={`finger-${i}`}
            x={topSpace / 2}
            y={topSpace * (i + 1.5) + fontSize / 3}
            fontFamily="Arial"
            fontSize={fontSize * 0.75}
            textAnchor="middle"
          >
            {label}
          </text>
        ) : null,
      )}

      {showFretLabel && startFret && startFret > 1 && (
        <text
          x={strHeight * numStrings + stroke / 2 + topSpace / 1.5}
          y={topSpace + topSpace / 2 + fontSize / 3}
          fontFamily="Arial"
          fontSize={fontSize * 0.75}
        >
          {`${startFret}fr`}
        </text>
      )}
    </svg>
  );
};
