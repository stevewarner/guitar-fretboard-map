'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { FreeformFretboardWithControls } from '@/components/FreeformFretboard';
import { identifyChord, type FreeformMatch } from '@/modules/chordid/actions';
import type { FlatTabValue } from '@/types';

function parseSearch(raw: string | null): (number | undefined)[] {
  if (!raw) return Array(6).fill(undefined);
  const parts = raw.split(',').slice(0, 6);
  while (parts.length < 6) parts.push('x');
  return parts.map((p) => {
    const trimmed = p.trim();
    if (trimmed === 'x' || trimmed === '') return undefined;
    const n = parseInt(trimmed, 10);
    return isNaN(n) ? undefined : n;
  });
}

function tabToSearch(tab: (number | undefined)[]): string {
  return tab.map((v) => (v === undefined ? 'x' : String(v))).join(',');
}

function MatchResult({
  m,
  fallbackTab,
  fallbackStartFret,
  fallbackNumFrets,
}: {
  m: FreeformMatch;
  fallbackTab: FlatTabValue[];
  fallbackStartFret: number;
  fallbackNumFrets: number;
}) {
  const params = new URLSearchParams({ root: m.rootNote });
  if (m.root_string != null) params.set('string', String(m.root_string));
  if (m.root_finger != null) params.set('position', String(m.root_finger));
  const href = `/chord/${encodeURIComponent(m.quality_symbol)}?${params}`;

  // Prefer the match's own real shape when one exists — only fall back to
  // the searched pattern for qualities with no seeded shape data at all.
  const tab = m.tab !== null ? m.tab : fallbackTab;
  const startFret = m.tab !== null ? m.startFret : fallbackStartFret;
  const numFrets = m.tab !== null ? m.numFrets : fallbackNumFrets;

  return (
    <ChordPreviewCard
      href={href}
      label={`${m.rootNote}${m.quality_symbol}`}
      sublabel={m.quality_full_name}
      tab={tab}
      startFret={startFret}
      numFrets={numFrets}
      className="w-32"
    />
  );
}

function tabDisplayInfo(tab: (number | undefined)[]): {
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
} {
  const flatTab: FlatTabValue[] = tab.map((v) =>
    v === undefined ? undefined : v,
  );
  const frettedValues = flatTab.filter(
    (v): v is number => typeof v === 'number' && v > 0,
  );
  const hasOpenStrings = flatTab.some((v) => v === 0);

  if (hasOpenStrings) {
    const maxFret = frettedValues.length ? Math.max(...frettedValues) : 0;
    return { tab: flatTab, startFret: 1, numFrets: Math.max(4, maxFret) };
  }
  if (!frettedValues.length) return { tab: flatTab, startFret: 1, numFrets: 4 };

  const minFret = Math.min(...frettedValues);
  const maxFret = Math.max(...frettedValues);
  return {
    tab: flatTab,
    startFret: minFret,
    numFrets: Math.max(4, maxFret - minFret + 1),
  };
}

export function FreeformChordIdentifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState<(number | undefined)[]>(() =>
    parseSearch(searchParams.get('search')),
  );
  const [checked, setChecked] = useState(false);
  const [matches, setMatches] = useState<FreeformMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (newTab: (number | undefined)[]) => {
    setTab(newTab);
    setChecked(false);
  };

  const handleClear = () => {
    setTab(Array(6).fill(undefined));
    setChecked(false);
    setMatches([]);
  };

  const handleCheck = () => {
    setError(null);
    startTransition(async () => {
      try {
        const results = await identifyChord(tab);
        setMatches(results);
        setChecked(true);
        router.replace(`${pathname}?search=${tabToSearch(tab)}`, {
          scroll: false,
        });
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Something went wrong. Please try again.',
        );
      }
    });
  };

  const handleReset = () => {
    setTab(Array(6).fill(undefined));
    setChecked(false);
    setMatches([]);
  };

  const tabDisplay = tab.map((v) => (v === undefined ? '-' : v)).join('  ');
  const displayInfo = tabDisplayInfo(tab);
  const exactMatches = matches.filter((m) => m.matchType === 'exact');
  const suggestMatches = matches.filter((m) => m.matchType === 'suggest');
  const hasNotes = tab.some((v) => v !== undefined);

  return (
    <div>
      <div className="w-80">
        <FreeformFretboardWithControls
          tab={tab}
          onTabChange={handleTabChange}
          onClear={handleClear}
        />
      </div>

      <p className="mt-3 font-mono text-xs tracking-widest text-fg-secondary">
        {tabDisplay}
      </p>

      <button
        type="button"
        onClick={handleCheck}
        disabled={isPending || !hasNotes}
        className="mt-4 rounded border border-current px-4 py-2 text-sm font-medium hover:bg-surface-sunken disabled:opacity-50"
      >
        {isPending ? 'Checking…' : 'Check'}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {checked && (
        <div className="mt-6 flex flex-col gap-4">
          {exactMatches.length === 0 && suggestMatches.length === 0 && (
            <p className="text-sm text-fg-secondary">No match found</p>
          )}
          {exactMatches.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Match</p>
              <div className="flex flex-wrap gap-4">
                {exactMatches.map((m) => (
                  <MatchResult
                    key={`${m.rootPc}-${m.quality_symbol}`}
                    m={m}
                    fallbackTab={displayInfo.tab}
                    fallbackStartFret={displayInfo.startFret}
                    fallbackNumFrets={displayInfo.numFrets}
                  />
                ))}
              </div>
            </div>
          )}
          {suggestMatches.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Did you mean?</p>
              <div className="flex flex-wrap gap-4">
                {suggestMatches.map((m) => (
                  <MatchResult
                    key={`${m.rootPc}-${m.quality_symbol}`}
                    m={m}
                    fallbackTab={displayInfo.tab}
                    fallbackStartFret={displayInfo.startFret}
                    fallbackNumFrets={displayInfo.numFrets}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
