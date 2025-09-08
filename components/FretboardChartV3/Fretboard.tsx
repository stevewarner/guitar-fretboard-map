'use client';
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
}

export const Fretboard = ({
  children,
  numFrets,
  startFret,
  title = '',
  ...rest
}: FretboardProps & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      strokeWidth={stroke}
      viewBox={`0 0 ${svgDimension} ${svgDimension}`}
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
      {[...Array(numStrings)].map((x, index) => (
        <line
          key={`string-${index}`}
          x1={strHeight * (index + 1) + stroke / 2 + topSpace - strHeight}
          y1={topSpace}
          x2={strHeight * (index + 1) + stroke / 2 + topSpace - strHeight}
          y2={topSpace * numFrets + topSpace}
          stroke="black"
        />
      ))}

      {/* frets */}
      {[...Array(numFrets + 1)].map((x, index) => (
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

      {startFret && startFret > 1 && (
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
