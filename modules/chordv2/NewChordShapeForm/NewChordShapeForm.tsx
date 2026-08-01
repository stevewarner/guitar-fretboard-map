'use client';
import { useState, useActionState, useMemo } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Checkbox } from '@/components/Checkbox';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { createNewChordShape } from '@/app/chord/actions';
import { createTab } from '@/app/utils/createTab';
import { ChordQuality, FlatTabValue } from '@/types';
import { PC_TO_NOTE } from '@/app/utils/constants';

const STRING_OPTIONS: { value: number; label: string }[] = [
  { value: 6, label: 'Low E (6th string)' },
  { value: 5, label: 'A (5th string)' },
  { value: 4, label: 'D (4th string)' },
  { value: 3, label: 'G (3rd string)' },
  { value: 2, label: 'B (2nd string)' },
  { value: 1, label: 'High e (1st string)' },
];

const FINGER_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '0 (stretch)' },
  { value: 1, label: '1 (index)' },
  { value: 2, label: '2 (middle)' },
  { value: 3, label: '3 (ring)' },
  { value: 4, label: '4 (pinky)' },
];

const initialState = { success: false, message: '' };

interface Props {
  qualities: ChordQuality[];
}

export const NewChordShapeForm = ({ qualities }: Props) => {
  const [formState, formAction, isPending] = useActionState(
    createNewChordShape,
    initialState,
  );

  const [qualityId, setQualityId] = useState('');
  const [moveable, setMoveable] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [tabRelative, setTabRelative] = useState('');
  const [rootString, setRootString] = useState('5');
  const [rootFinger, setRootFinger] = useState('1');
  const [rootPc, setRootPc] = useState('0');
  const [openRootPc, setOpenRootPc] = useState('0');
  const [inversion, setInversion] = useState('0');
  const [description, setDescription] = useState('');

  // For moveable shapes, offset 0 = root fret. Pattern treats fret 0 as an open string
  // (rendered above the nut), so shift all numeric values by +1 for display only.
  const { previewTab, previewStartFret, previewNumFrets } = useMemo(() => {
    const parsed = createTab(tabRelative);
    const empty = Array(6).fill(undefined) as FlatTabValue[];
    if (parsed.length !== 6)
      return { previewTab: empty, previewStartFret: 1, previewNumFrets: 5 };

    if (moveable) {
      const shifted = parsed.map(
        (v): FlatTabValue => (typeof v === 'number' ? v + 1 : v),
      );
      return { previewTab: shifted, previewStartFret: 1, previewNumFrets: 5 };
    }

    const numericFrets = parsed.filter(
      (v): v is number => typeof v === 'number',
    );
    const minFret = numericFrets.length ? Math.min(...numericFrets) : 0;
    const startFret = minFret === 0 ? 0 : minFret;
    return {
      previewTab: parsed,
      previewStartFret: startFret,
      previewNumFrets: 5,
    };
  }, [tabRelative, moveable]);

  const selectedQuality = qualities.find((q) => String(q.id) === qualityId);

  return (
    <form action={formAction} className="mx-auto max-w-2xl">
      <div className="flex flex-row flex-wrap gap-8 p-4">
        <div className="grid flex-[45%] grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="qualityId"
              className="block text-sm font-semibold leading-6 text-fg"
            >
              Quality
            </label>
            <select
              id="qualityId"
              name="qualityId"
              required
              value={qualityId}
              onChange={(e) => setQualityId(e.target.value)}
              className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 sm:text-sm sm:leading-6"
            >
              <option value="" disabled>
                Select a quality…
              </option>
              {qualities.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.full_name} ({q.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Checkbox
              id="moveable"
              name="moveable"
              label="Moveable (transposable)"
              isChecked={moveable}
              onChange={(e) => setMoveable(e.target.checked)}
            />
          </div>

          <div className="sm:col-span-2">
            <Checkbox
              id="isOpen"
              name="isOpen"
              label="Open (played with open strings)"
              isChecked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              id="tabRelative"
              name="tabRelative"
              label={
                moveable
                  ? 'Tab (relative to root fret)'
                  : 'Tab (absolute frets)'
              }
              placeholder={moveable ? 'x,0,2,1,2,x' : 'x,3,2,0,1,0'}
              pattern="^(?:[0-9x]{6}|(x|[0-9]|1\d|2[0-4]|)(,(x|[0-9]|1\d|2[0-4]|)){5})$"
              errorText="value must be 6 values containing only numbers and 'x'"
              value={tabRelative}
              onChange={(e) => setTabRelative(e.target.value)}
              helpText={
                moveable
                  ? '6 values, low E → high e. 0 = root fret, positive = above. x = muted.'
                  : '6 values, low E → high e. Absolute fret numbers. x = muted.'
              }
              required
            />
          </div>

          {moveable ? (
            <>
              <div className="sm:col-span-1">
                <label
                  htmlFor="rootString"
                  className="block text-sm font-semibold leading-6 text-fg"
                >
                  Root string
                </label>
                <select
                  id="rootString"
                  name="rootString"
                  value={rootString}
                  onChange={(e) => setRootString(e.target.value)}
                  className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 sm:text-sm sm:leading-6"
                >
                  {STRING_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label
                  htmlFor="rootFinger"
                  className="block text-sm font-semibold leading-6 text-fg"
                >
                  Root finger
                </label>
                <select
                  id="rootFinger"
                  name="rootFinger"
                  value={rootFinger}
                  onChange={(e) => setRootFinger(e.target.value)}
                  className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 sm:text-sm sm:leading-6"
                >
                  {FINGER_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {isOpen && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="openRootPc"
                    className="block text-sm font-semibold leading-6 text-fg"
                  >
                    Open at root
                  </label>
                  <select
                    id="openRootPc"
                    name="openRootPc"
                    value={openRootPc}
                    onChange={(e) => setOpenRootPc(e.target.value)}
                    className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 sm:text-sm sm:leading-6"
                  >
                    {PC_TO_NOTE.map((label, i) => (
                      <option key={i} value={i}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-fg-secondary">
                    Which root this shape rings open at — not every root, just
                    this one.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="sm:col-span-2">
              <label
                htmlFor="rootPc"
                className="block text-sm font-semibold leading-6 text-fg"
              >
                Root note
              </label>
              <select
                id="rootPc"
                name="rootPc"
                value={rootPc}
                onChange={(e) => setRootPc(e.target.value)}
                className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 sm:text-sm sm:leading-6"
              >
                {PC_TO_NOTE.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-span-1">
            <Input
              id="inversion"
              name="inversion"
              label="Inversion"
              type="number"
              min={0}
              max={6}
              value={inversion}
              onChange={(e) => setInversion(e.target.value)}
              helpText="0 = root position"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              id="description"
              name="description"
              label="Description"
              placeholder="Open position, A-shape barre, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-auto flex-col items-center gap-2">
          {selectedQuality && (
            <p className="text-sm font-medium">{selectedQuality.full_name}</p>
          )}
          <Fretboard
            numFrets={previewNumFrets}
            startFret={previewStartFret}
            width={200}
            height={200}
          >
            <Pattern
              tab={previewTab}
              startFret={previewStartFret}
              fillColor="#000"
            />
          </Fretboard>
          {moveable && tabRelative && (
            <p className="text-xs text-fg-secondary">root fret = 1fr label</p>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col px-4">
        {formState.message && !formState.success && (
          <p className="mb-3 text-sm text-error" role="alert">
            {formState.message}
          </p>
        )}
        {formState.message && formState.success && (
          <p className="mb-3 text-sm" role="status">
            {formState.message}
          </p>
        )}
        <Button type="submit" isLoading={isPending}>
          Add Shape
        </Button>
      </div>
    </form>
  );
};
