'use client';
import { useState } from 'react';
import { Fretboard } from '@/components/FretboardChart';
import {
  topSpace,
  svgDimension,
} from '@/components/FretboardChart/constants';
import { Button, ButtonVariant } from '@/components/Button';
import { NumberField } from '../NumberField';
import styles from './FretboardPrintTemplate.module.scss';

const CHART_WIDTH = 260;
const NUM_CHARTS = 2;

export const FretboardPrintTemplate = () => {
  const [numFrets, setNumFrets] = useState(5);

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-surface p-8 shadow-sm print:shadow-none">
      <div className="printHidden mb-6 flex flex-wrap items-center justify-between gap-4">
        <NumberField
          id="numFrets"
          label="Number of frets:"
          value={numFrets}
          onChange={setNumFrets}
          min={5}
          max={17}
        />
        <Button
          type="button"
          variant={ButtonVariant.TERTIARY}
          pill
          onClick={() => window.print()}
        >
          Print this page
        </Button>
      </div>

      <div className={styles.chartContainer}>
        {[...Array(NUM_CHARTS)].map((_, index) => (
          <div key={index} className={styles.chart}>
            <Fretboard
              numFrets={numFrets}
              startFret={0}
              showFretLabel={false}
              width={CHART_WIDTH}
              height={(CHART_WIDTH * topSpace * (numFrets + 2)) / svgDimension}
              title={`Blank fretboard diagram ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
