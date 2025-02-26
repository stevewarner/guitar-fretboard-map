'use client';
import { SVGProps } from 'react';
import {
  fontSize,
  svgDimension,
  fbHeight,
  strHeight,
  fretWidth,
  stroke,
  topSpace,
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
      <rect
        x={stroke / 2 + fretWidth}
        y={topSpace}
        width={fretWidth * numFrets}
        height={fbHeight}
        fill="none"
        stroke="black"
      />

      {[...Array(4)].map((x, index) => (
        <line
          key={`string-${index}`}
          x1={fretWidth}
          y1={strHeight * (index + 1) + topSpace}
          x2={fretWidth * numFrets + stroke + fretWidth}
          y2={strHeight * (index + 1) + topSpace}
          stroke="black"
        />
      ))}

      {[...Array(numFrets - 1)].map((x, index) => (
        <line
          key={`string-${index}`}
          x1={fretWidth * (index + 1) + stroke / 2 + fretWidth}
          y1={topSpace}
          x2={fretWidth * (index + 1) + stroke / 2 + fretWidth}
          y2={fbHeight + topSpace}
          stroke="black"
        />
      ))}

      {children}
      {startFret && startFret > 1 && (
        <text
          x={fretWidth + fretWidth / 2}
          y={strHeight * (5 + 1) + topSpace}
          fontFamily="Arial"
          fontSize={fontSize}
          textAnchor="middle"
        >
          {startFret}
        </text>
      )}
    </svg>
  );
};
