'use client';
import { useState } from 'react';
import { PillSelect } from '@/components/PillSelect';
import { PrintTemplate } from '@/modules/print/PrintTemplate';
import { FretboardPrintTemplate } from '@/modules/print/FretboardPrintTemplate';

type HandoutType = 'chords' | 'fretboard';

export const PrintWorksheet = () => {
  const [handoutType, setHandoutType] = useState<HandoutType>('chords');

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="printHidden flex items-center gap-2 self-start">
        <label htmlFor="handoutType" className="text-sm text-fg-secondary">
          Handout:
        </label>
        <PillSelect
          id="handoutType"
          value={handoutType}
          onChange={(e) => setHandoutType(e.target.value as HandoutType)}
        >
          <option value="chords">Blank chord charts</option>
          <option value="fretboard">Blank fretboard</option>
        </PillSelect>
      </div>

      {handoutType === 'chords' ? <PrintTemplate /> : <FretboardPrintTemplate />}
    </div>
  );
};
