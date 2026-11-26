import { NeckChart, type NeckChartLayer } from '@/components/FretboardChart';
import { LabelModeLayer } from '@/components/LabelModeToggle';
import { STANDARD_TUNING_PC, ACCENT_HEX } from '@/app/utils/constants';
import type { FlatTabValue } from '@/types';

const MIN_NECK_FRETS = 15;

interface Props {
  // Heading text, e.g. "Fmaj7".
  displayName: string;
  rootPc: number;
  // Pitch class (relative to the root, 0-11) → label, one entry per chord
  // tone: interval labels (buildDotLabelMap) and spelled note names.
  intervalLabelByPc: Record<number, string>;
  noteLabelByPc: Record<number, string>;
  // The shape on screen, highlighted on top of every other chord tone.
  shapeTab: FlatTabValue[];
  // "root on the 4th string, played with 1st finger" — for the diagram title.
  shapeDescription: string;
}

// Every chord tone from the open strings up the neck, with the shape on
// screen lit in the accent color, so the reader sees where this one shape
// sits among all the others. Must render within a LabelModeProvider (the
// panel's "Show note names" toggle relabels it too).
export function ChordNeck({
  displayName,
  rootPc,
  intervalLabelByPc,
  noteLabelByPc,
  shapeTab,
  shapeDescription,
}: Props) {
  const shapeFrets = shapeTab.filter((f): f is number => typeof f === 'number');
  const numFrets = Math.max(MIN_NECK_FRETS, ...shapeFrets);

  const relativePc = (stringIndex: number, fret: number) =>
    (STANDARD_TUNING_PC[stringIndex] + fret - rootPc + 120) % 12;

  const toneTab = STANDARD_TUNING_PC.map((_, stringIndex) =>
    Array.from({ length: numFrets + 1 }, (_, fret) => fret).filter(
      (fret) => relativePc(stringIndex, fret) in intervalLabelByPc,
    ),
  );
  const highlightTab = shapeTab.map((fret) =>
    typeof fret === 'number' ? [fret] : [],
  );

  const layers = (labelByPc: Record<number, string>): NeckChartLayer[] =>
    [
      { tab: toneTab, fillColor: '#000' },
      { tab: highlightTab, fillColor: ACCENT_HEX, fillOpen: true },
    ].map((layer) => ({
      ...layer,
      labels: layer.tab.map((frets, stringIndex) =>
        frets.map((fret) => labelByPc[relativePc(stringIndex, fret)]),
      ),
    }));

  const title = `${displayName} chord tones to the ${numFrets}th fret, ${shapeDescription} shape highlighted`;

  const chart = (labelByPc: Record<number, string>) => (
    // Scrolls sideways on a phone rather than shrinking the dots.
    <div className="overflow-x-auto pb-2 sm:pb-0">
      <NeckChart
        numFrets={numFrets}
        layers={layers(labelByPc)}
        title={title}
        className="w-[760px] max-w-none sm:w-full sm:max-w-full"
      />
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="text-base font-semibold">
        {displayName} on the fretboard
      </h3>
      <LabelModeLayer
        intervalContent={chart(intervalLabelByPc)}
        noteContent={chart(noteLabelByPc)}
      />
    </div>
  );
}
