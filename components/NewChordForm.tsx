'use client';
import { useState, useActionState } from 'react';
import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';
import { Input } from './Input';
import { createNewChord, updateChord } from '@/app/actions';
import { ChordType } from '@/types';

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
  const [chordTab, setChordTab] = useState(initFormValues?.tab_id || '');
  const [startFret, setStartFret] = useState(initFormValues?.start_fret || '1');
  const [numFrets, setNumFrets] = useState(initFormValues?.num_frets || '4');
  const [chordIntervals, setChordIntervals] = useState(
    (initFormValues?.intervals && initFormValues?.intervals.join(',')) || '',
  );

  const createTab = (val: string) => {
    const newArr: string[] = [];
    const splitVal = val.length === 6 ? '' : ',';
    val.split(splitVal).map((fretNum: string) => {
      !!fretNum && newArr.push(fretNum);
    });
    return newArr;
  };

  return (
    <form action={formAction} className="mx-auto max-w-xl">
      <div className="flex flex-row flex-wrap gap-8 p-4">
        <div className="grid flex-[40%] grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {/* name */}
            <Input
              id="name"
              name="name"
              label="Chord name"
              placeholder="Cmaj7"
              // defaultValue={formState}
              value={chordName}
              onChange={(event) => setChordName(event.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            {/* tab */}
            <Input
              id="tab"
              name="tab"
              label="Chord tab"
              placeholder="x32000 or x,3,2,0,0,0"
              value={chordTab}
              pattern="^(?:[0-9x]{6}|(x|[0-9]|1\d|2[0-4])(,(x|[0-9]|1\d|2[0-4])){5})$"
              errorText="value must be 6 digits containing only numbers and 'x'"
              onChange={(event) => setChordTab(event.target.value)}
              helpText="6 numbers (x for muted string) or comma separated values for each string"
              required
            />
          </div>
          {/* start_fret */}
          <div className="sm:col-span-1">
            <Input
              id="startFret"
              name="startFret"
              label="Starting fret"
              placeholder="1"
              type="text"
              inputMode="decimal" // show numpad on mobile
              pattern="^(?:[1-9]|1\d|2[0-4])$"
              errorText="value must be a number"
              min={1}
              max={24}
              value={startFret}
              onChange={(event) => setStartFret(event.target.value)}
              required
            />
          </div>
          {/* num_frets */}
          <div className="sm:col-span-1">
            <Input
              id="numFrets"
              name="numFrets"
              label="# of frets"
              placeholder="1"
              type="text"
              inputMode="decimal" // show numpad on mobile
              pattern="^[1-9]$"
              errorText="value must be a number"
              min={3}
              max={6}
              value={numFrets}
              onChange={(event) => setNumFrets(event.target.value)}
              required
            />
          </div>
          {/* intervals */}
          <div className="sm:col-span-2">
            <Input
              id="intervals"
              name="intervals"
              label="Intervals"
              placeholder=",1,3,5,1,3"
              value={chordIntervals}
              pattern="^((b|#)?[1-7]|)(,((b|#)?[1-7]|)){5}$"
              errorText="value must be 6 comma separated values containing only numbers and 'b' or '#'"
              onChange={(event) => setChordIntervals(event.target.value)}
              helpText="6 comma separated values for each note interval. use empty comma for no value"
            />
          </div>
        </div>
        <div className="flex flex-auto flex-col items-center">
          {!!chordName && <h2>{chordName}</h2>}
          <FretboardV2
            title={chordName}
            numFrets={Number(numFrets) || 1}
            startFret={Number(startFret)}
            height={250}
            width={250}
          >
            <PatternV2
              tab={createTab(chordTab)}
              intervals={chordIntervals.split(',')}
              startFret={Number(startFret)}
              fillColor="#000"
            />
          </FretboardV2>
        </div>
      </div>
      <div className="mt-10">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {isEdit ? 'Edit Chord' : 'Add Chord'}
        </button>
        <p aria-live="polite" className="sr-only" role="status">
          {formState?.message}
        </p>
      </div>
    </form>
  );
};

export default NewChordForm;
