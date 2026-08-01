import { SVGProps } from 'react';
import {
  fontSize,
  svgDimension,
  fbHeight,
  strHeight,
  stroke,
  topSpace,
  numStrings,
} from './constants';

interface FretboardProps {
  numFrets: number;
  startFret?: number;
  title?: string;
  fingerLabels?: string[];
  showFretLabel?: boolean;
}

export const Fretboard = ({
  children,
  numFrets,
  startFret,
  title = '',
  fingerLabels,
  showFretLabel = true,
  ...rest
}: FretboardProps & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      strokeWidth={stroke}
      viewBox={`0 0 ${svgDimension} ${topSpace * (numFrets + 2)}`}
      {...rest}
    >
      <title>{title}</title>
      <text
        x="50%"
        y={fontSize}
        fontFamily="Arial"
        fontSize={fontSize}
        textAnchor="middle"
        className="hidden"
      >
        {title}
      </text>

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
