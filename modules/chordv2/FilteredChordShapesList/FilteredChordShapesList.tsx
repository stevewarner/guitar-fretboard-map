'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button, ButtonVariant } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { Modal } from '@/components/Modal';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { PillSelect } from '@/components/PillSelect';
import { RequestChordModal } from '@/modules/chordv2/RequestChordModal';
import {
  CHORD_FAMILIES,
  type ChordFamily,
} from '@/modules/chordv2/utils/chordFamily';
import type { FlatTabValue } from '@/types';

export type ChordCard = {
  id: string;
  qualitySymbol: string;
  qualityFullName: string;
  family: ChordFamily;
  rootString: number;
  rootFinger: number;
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
  description: string | null;
  // Set only in "Open chords" mode, where every card carries its own curated
  // root (Cmaj, Dm, Fmaj9#11, …) instead of sharing one page-level root.
  // Overrides `linkRoot` for this card's label and link when present.
  rootNote?: string;
  // Set only for slash chords (inversion > 0) — the bass note shown after the
  // slash (e.g. "G" for C/G), and the inversion number carried into the href
  // so the detail page resolves back to this exact fixed shape.
  bassNote?: string;
  inversion?: number;
};

type Props = {
  cards: ChordCard[];
  controls?: ReactNode;
  showFretLabels?: boolean;
  // Root note to carry into each card's link — only set once the user has
  // explicitly chosen one (see the page's `hasRoot` gate).
  linkRoot?: string;
};

export const FilteredChordShapesList = ({
  cards,
  controls,
  showFretLabels = true,
  linkRoot,
}: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [userSearch, setUserSearch] = useState(
    searchParams?.get('query') || '',
  );
  const [family, setFamily] = useState(searchParams?.get('family') || '');
  const modalOpen = searchParams?.get('requestChord') === 'true';

  // Unlike family/search (client-side filters over an already-fetched list),
  // mode changes which query the server runs — it has to be a real URL param.
  const rawMode = searchParams?.get('mode');
  const mode = rawMode === 'open' || rawMode === 'slash' ? rawMode : 'all';
  const setMode = (next: string) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (next === 'open' || next === 'slash') {
      params.set('mode', next);
      // Root/string/position are meaningless once every card has its own root.
      params.delete('root');
      params.delete('string');
      params.delete('position');
    } else {
      params.delete('mode');
    }
    const qs = params.toString();
    replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleModalOpen = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (isOpen) {
      params.set('requestChord', 'true');
    } else {
      params.delete('requestChord');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    !!userSearch ||
    !!family ||
    mode !== 'all' ||
    !!searchParams?.get('root') ||
    !!searchParams?.get('string') ||
    !!searchParams?.get('position');

  const clearAll = () => {
    setUserSearch('');
    setFamily('');
    const params = new URLSearchParams(searchParams || undefined);
    ['query', 'family', 'mode', 'root', 'string', 'position'].forEach((key) =>
      params.delete(key),
    );
    const qs = params.toString();
    replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredCards = useMemo(() => {
    const q = userSearch.toLowerCase();
    return cards.filter((c) => {
      const matchesSearch =
        !q ||
        c.qualitySymbol.toLowerCase().includes(q) ||
        c.qualityFullName.toLowerCase().includes(q);
      const matchesFamily = !family || c.family === family;
      return matchesSearch && matchesFamily;
    });
  }, [cards, userSearch, family]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            id="search-shapes"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onClear={() => setUserSearch('')}
          />
          <PillSelect
            id="filter-family"
            aria-label="Filter by chord quality"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
          >
            <option value="">All qualities</option>
            {CHORD_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </PillSelect>
          <PillSelect
            id="filter-mode"
            aria-label="Browse mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="all">All shapes</option>
            <option value="open">Open chords</option>
            <option value="slash">Slash chords</option>
          </PillSelect>
          {hasActiveFilters && (
            <Button
              type="button"
              variant={ButtonVariant.TERTIARY}
              pill
              onClick={clearAll}
            >
              Clear
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant={ButtonVariant.TERTIARY}
          pill
          onClick={() => toggleModalOpen(true)}
        >
          Request a new chord +
        </Button>
      </div>

      {controls}

      {filteredCards.length === 0 ? (
        <p className="text-sm text-fg-secondary">
          No chords match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredCards.map((card) => {
            const params = new URLSearchParams({
              string: String(card.rootString),
              position: String(card.rootFinger),
            });
            const effectiveRoot = card.rootNote ?? linkRoot;
            if (effectiveRoot) params.set('root', effectiveRoot);
            if (card.inversion) params.set('inversion', String(card.inversion));
            const href = `/chord/${encodeURIComponent(card.qualitySymbol)}?${params.toString()}`;
            const slashSuffix = card.bassNote ? `/${card.bassNote}` : '';

            return (
              <ChordPreviewCard
                key={card.id}
                variant="raised"
                href={href}
                label={
                  card.rootNote
                    ? `${card.rootNote}${card.qualitySymbol}${slashSuffix}`
                    : card.qualityFullName
                }
                sublabel={
                  card.rootNote ? card.qualityFullName : card.qualitySymbol
                }
                tab={card.tab}
                startFret={card.startFret}
                numFrets={card.numFrets}
                showFretLabel={showFretLabels}
              />
            );
          })}
        </div>
      )}

      {!!modalOpen && (
        <Modal
          title="Request a new chord"
          onClose={() => toggleModalOpen(false)}
          content={<RequestChordModal />}
        />
      )}
    </>
  );
};
