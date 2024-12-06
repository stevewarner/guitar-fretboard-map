'use client';
import { useState, useActionState } from 'react';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { Input } from './Input';
import { createNewChord } from '@/app/actions';

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

const initialState = {
  success: false,
  message: '',
};

const NewChordForm: React.FC = () => {
  const [formState, formAction, isPending] = useActionState(
    createNewChord,
    initialState,
  );

  const [chordName, setChordName] = useState('');
  const [chordTab, setChordTab] = useState('');
  const [startFret, setStartFret] = useState('1');
  const [numFrets, setNumFrets] = useState('4');

  const createTab = (val: string) => {
    const newArr: string[] = [];
    val.split('').map((fretNum: string) => {
      !!fretNum && newArr.push(fretNum);
    });
    return newArr;
  };

  const isValidForm = !!chordName && chordTab.length === 6;

  return (
    <form action={formAction} className="mx-auto mt-16 max-w-xl sm:mt-20">
      <div className="flex flex-row flex-wrap gap-8 p-4">
        <div className="grid flex-[40%] grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {/* name */}
            <Input
              id="name"
              name="name"
              label="Chord name"
              placeholder="Cmaj7"
              value={chordName}
              onChange={(event) => setChordName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            {/* tab */}
            <Input
              id="tab"
              name="tab"
              label="Chord tab"
              placeholder="x32000"
              value={chordTab}
              pattern="^[0-9x]{6}$"
              errorText="value must be 6 digits containing only numbers and 'x'"
              onChange={(event) => setChordTab(event.target.value)}
              helpText="6 numbers (or x for muted string)"
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
              pattern="^[1-9]$"
              errorText="value must be a number"
              min={1}
              max={15}
              value={startFret}
              onChange={(event) => setStartFret(event.target.value)}
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
            />
          </div>
        </div>
        <div className="flex flex-auto flex-col items-center">
          {!!chordName && <h2 className="mb-4">{chordName}</h2>}
          <Fretboard
            numFrets={Number(numFrets) || 1}
            small
            showOpenNotes
            options={{
              fbHeight: fbHeight,
              fbWidth: 250,
              strHeight: fbHeight / 5,
              fretWidth: fbWidth / 4,
              stroke: stroke,
              circRad: fbHeight / 20,
              topSpace: fbHeight / 20 + stroke / 2,
            }}
          >
            <Pattern
              tab={createTab(chordTab)}
              fillColor="#000"
              startFret={Number(startFret)}
            />
          </Fretboard>
        </div>
      </div>
      <div className="mt-10">
        <button
          type="submit"
          disabled={!isValidForm}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          Add Chord
        </button>
        <p aria-live="polite" className="sr-only" role="status">
          {formState?.message}
        </p>
      </div>
    </form>
  );
};

export default NewChordForm;
