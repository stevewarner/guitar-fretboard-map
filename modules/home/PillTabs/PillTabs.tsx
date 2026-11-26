'use client';
import { useId, useRef, useState, type ReactNode } from 'react';

export type PillTab = {
  label: string;
  content: ReactNode;
};

interface Props {
  label: string;
  tabs: PillTab[];
  defaultIndex?: number;
}

// Pill toggles above a sideways-scrolling card row (homepage Chords: Popular /
// Open / Sevenths; Scales: one per scale system). Selected pill is the ink
// fill.
export function PillTabs({ label, tabs, defaultIndex = 0 }: Props) {
  const [activeTab, setActiveTab] = useState(defaultIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;

  // ARIA APG Tabs pattern: only the active tab is a Tab stop (roving
  // tabindex); Left/Right (and Home/End) move focus between tabs and
  // activate them immediately, matching the mouse behavior.
  const focusTab = (i: number) => {
    setActiveTab(i);
    tabRefs.current[i]?.focus();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    const next = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    focusTab(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-nowrap gap-2 overflow-x-auto pb-0.5"
      >
        {tabs.map((tab, i) => {
          const selected = i === activeTab;
          return (
            <button
              key={tab.label}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(i)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(i)}
              onKeyDown={(e) => handleTabKeyDown(e, i)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm ${
                selected
                  ? 'border-fg bg-fg font-semibold text-fg-inverted'
                  : 'border-line bg-surface font-medium text-fg hover:bg-surface-sunken'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId(activeTab)}
        aria-labelledby={tabId(activeTab)}
        className="flex flex-nowrap gap-3 overflow-x-auto p-0.5 pb-2"
      >
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
