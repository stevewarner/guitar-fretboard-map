'use client';
import { useState, useActionState } from 'react';
import { FreeformFretboardWithControls } from '@/components/FreeformFretboard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { submitChordRequest } from '@/app/chord/actions';
import { TAB_PATTERN } from '@/app/utils/validation';

const initialState = { success: false, message: '' };

const MAX_FRET = 24;

function tabToString(tab: (number | undefined)[]): string {
  return tab.map((v) => (v === undefined ? 'x' : String(v))).join(',');
}

function parseTabString(raw: string): (number | undefined)[] {
  const parts = raw.includes(',')
    ? raw.split(',').slice(0, 6)
    : raw.split('').slice(0, 6);
  while (parts.length < 6) parts.push('x');
  return parts.map((p) => {
    const trimmed = p.trim();
    if (trimmed === 'x' || trimmed === '') return undefined;
    const n = parseInt(trimmed, 10);
    if (isNaN(n) || n < 0 || n > MAX_FRET) return undefined;
    return n;
  });
}

export const RequestChordModal = () => {
  const [formState, formAction, isPending] = useActionState(
    submitChordRequest,
    initialState,
  );

  const [tab, setTab] = useState<(number | undefined)[]>(
    Array(6).fill(undefined),
  );
  const [tabInput, setTabInput] = useState('');
  const [chordName, setChordName] = useState('');

  const handleTabChange = (newTab: (number | undefined)[]) => {
    setTab(newTab);
    setTabInput(tabToString(newTab));
  };

  const handleTabInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTabInput(raw);
    const parsed = parseTabString(raw);
    if (parsed.length === 6) setTab(parsed);
  };

  const handleClear = () => {
    setTab(Array(6).fill(undefined));
    setTabInput('');
  };

  const hasNotes = tab.some((v) => v !== undefined);

  return (
    <div>
      <div className="px-4 pt-4 text-sm text-fg-secondary">
        <p>
          Can&rsquo;t find the chord you are looking for? Search for it{' '}
          <Link href="/chordid" className="underline hover:text-fg">
            here
          </Link>{' '}
          or submit a request below. After validating, I will add it to the
          database.
        </p>
      </div>
      <form action={formAction} className="mx-auto max-w-xl">
        <div className="flex flex-row gap-6 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div>
              <Input
                autoFocus
                id="chord-name-request"
                name="chordName"
                label="Chord name"
                placeholder="e.g. Cmaj7, G7sus4"
                value={chordName}
                onChange={(e) => setChordName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                id="chord-tab-request"
                name="tab"
                label="Tab"
                placeholder="x,x,x,x,x,x"
                value={tabInput}
                onChange={handleTabInputChange}
                pattern={TAB_PATTERN.source}
                errorText="Must be 6 comma-separated values with numbers or x"
                helpText="6 comma-separated values, use x for muted strings"
                required
              />
            </div>
          </div>

          <div className="shrink-0">
            <div className="w-56">
              <FreeformFretboardWithControls
                tab={tab}
                onTabChange={handleTabChange}
                onClear={handleClear}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 pt-0">
          {formState.message && !formState.success && (
            <p className="text-sm text-error" role="alert">
              {formState.message}
            </p>
          )}
          {formState.success && (
            <p className="text-sm text-fg-secondary" role="status">
              {formState.message}
            </p>
          )}
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!hasNotes || !chordName.trim()}
          >
            Submit chord
          </Button>
        </div>
      </form>
    </div>
  );
};
