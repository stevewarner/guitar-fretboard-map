'use client';
import { useState, useActionState } from 'react';
import { InteractiveFretboard } from '@/components/InteractiveFretboard';
import { Input } from './Input';
import { createNewChord, updateChord } from '@/app/actions';
import { createTab } from '@/app/utils';
import { ChordType, FlatTabValue } from '@/types';

const initialState = {
  success: false,
  message: '',
};

interface ChordFormProps {
  initFormValues?: ChordType;
  isEdit?: boolean;
}

const NewChordForm = ({ initFormValues, isEdit = false }: ChordFormProps) => {
  const updateChordWithProps = updateChord.bind(null, initFormValues || null);
  const [formState, formAction, isPending] = useActionState(
    isEdit ? updateChordWithProps : createNewChord,
    initialState,
  );

  const [chordName, setChordName] = useState(initFormValues?.name || '');
  const [tab, setTab] = useState<FlatTabValue[]>(
    initFormValues?.tab_id ? createTab(initFormValues.tab_id) as FlatTabValue[] : Array(6).fill(undefined),
  );
  const [tabInput, setTabInput] = useState(
    initFormValues?.tab_id ?? '',
  );

  const handleTabChange = (newTab: FlatTabValue[]) => {
    setTab(newTab);
    setTabInput(newTab.join(','));
  };
  const [startFret, setStartFret] = useState(
    Number(initFormValues?.start_fret) || 1,
  );
  const [numFrets, setNumFrets] = useState(Number(initFormValues?.num_frets) || 4);
  const [chordIntervals, setChordIntervals] = useState(
    (initFormValues?.intervals && initFormValues?.intervals.join(',')) || '',
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl">
      <div className="flex flex-row flex-wrap gap-8 p-4">
        <div className="grid flex-[40%] grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              autoFocus
              id="name"
              name="name"
              label="Chord name"
              placeholder="Cmaj7"
              defaultValue={initFormValues?.name || ''}
              onChange={(event) => setChordName(event.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              id="tab"
              name="tab"
              label="Chord tab"
              placeholder="x32000 or x,3,2,0,0,0"
              pattern="^(?:[0-9x]{6}|(x|[0-9]|1\d|2[0-4]|)(,(x|[0-9]|1\d|2[0-4]|)){5})$"
              errorText="value must be 6 digits containing only numbers and 'x'"
              value={tabInput}
              onChange={(event) => {
                setTabInput(event.target.value);
                const parsed = createTab(event.target.value);
                if (parsed.length === 6) setTab(parsed);
              }}
              helpText="6 numbers (x for muted string) or comma separated values for each string"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <Input
              id="startFret"
              name="startFret"
              label="Starting fret"
              placeholder="1"
              type="text"
              inputMode="decimal"
              pattern="^(?:[1-9]|1\d|2[0-4])$"
              errorText="value must be a number"
              min={1}
              max={24}
              value={String(startFret)}
              onChange={(event) =>
                setStartFret(Number(event.target.value) || 1)
              }
              required
            />
          </div>
          <div className="sm:col-span-1">
            <Input
              id="numFrets"
              name="numFrets"
              label="# of frets"
              placeholder="4"
              type="number"
              errorText="value must be between 3 and 6"
              min={3}
              max={6}
              value={String(numFrets)}
              onChange={(event) => setNumFrets(Number(event.target.value))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              id="intervals"
              name="intervals"
              label="Intervals"
              placeholder=",1,3,5,1,3"
              pattern="^((b|#)?[1-7]|)(,((b|#)?[1-7]|)){5}$"
              errorText="value must be 6 comma separated values containing only numbers and 'b' or '#'"
              defaultValue={
                (initFormValues?.intervals &&
                  initFormValues?.intervals.join(',')) ||
                ''
              }
              helpText="6 comma separated values for each note interval. use empty comma for no value"
            />
          </div>
        </div>

        <div className="flex flex-auto flex-col items-center gap-2">
          {!!chordName && <h2>{chordName}</h2>}
          <InteractiveFretboard
            tab={tab}
            startFret={startFret}
            numFrets={numFrets >= 3 && numFrets <= 6 ? numFrets : 4}
            onTabChange={handleTabChange}
            size={250}
          />
        </div>
      </div>

      <div className="mt-10">
        {formState.message && !formState.success && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {formState.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-500 "
        >
          {isPending ? 'Saving...' : isEdit ? 'Edit Chord' : 'Add Chord'}
        </button>
        <p aria-live="polite" className="sr-only" role="status">
          {formState?.message}
        </p>
      </div>
    </form>
  );
};

export default NewChordForm;
