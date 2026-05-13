'use client';
import { Fretboard, Pattern } from '@/components/FretboardChartV3';
import {
  svgDimension,
  strHeight,
  stroke,
  topSpace,
  numStrings,
} from '@/components/FretboardChartV3/constants';

interface Props {
  tab: (string | undefined)[];
  startFret: number;
  numFrets: number;
  onTabChange: (tab: (string | undefined)[]) => void;
  size?: number;
}

export const InteractiveFretboard = ({
  tab,
  startFret,
  numFrets,
  onTabChange,
  size = 300,
}: Props) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgDimension;
    const svgY = ((e.clientY - rect.top) / rect.height) * svgDimension;

    const si = Math.round((svgX - topSpace - stroke / 2) / strHeight);
    if (si < 0 || si >= numStrings) return;

    const newTab = [...tab];

    if (svgY < topSpace) {
      newTab[si] = tab[si] === '0' ? 'x' : tab[si] === 'x' ? undefined : '0';
      onTabChange(newTab);
      return;
    }

    const row = Math.floor((svgY - topSpace) / topSpace);
    if (row < 0 || row >= numFrets) return;

    const fret = String(row + startFret);
    newTab[si] = tab[si] === fret ? undefined : fret;
    onTabChange(newTab);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={handleClick}
        className="cursor-pointer select-none"
        style={{ width: size, height: size }}
      >
        <Fretboard
          numFrets={numFrets}
          startFret={startFret}
          width={size}
          height={size}
        >
          <Pattern tab={tab} startFret={startFret} fillColor="#000" />
        </Fretboard>
      </div>
    </div>
  );
};
