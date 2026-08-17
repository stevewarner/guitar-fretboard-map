'use client';
import { useRef, useState, type ReactNode } from 'react';
import ChevronRightIcon from '@/svgs/chevron-right.svg';
import { ButtonLink } from '@/components/Button';
import { SectionLabel } from '@/components/SectionLabel';

export type ShowcaseTab = {
  label: string;
  content: ReactNode;
};

interface Props {
  sectionLabel: string;
  // Two-line headline — the second line renders in the accent color, e.g.
  // ["Every voicing,", "every position."].
  headline: [string, string];
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tabs: ShowcaseTab[];
  // Mirrors the column layout — carousel on the left, text on the right —
  // matching the design's alternating rhythm down the three homepage
  // sections (direction-a.jsx: AChordsSection normal, AScalesSection
  // mirrored, ALessonsSection normal). Only the visual order flips (CSS
  // `order`), not the DOM order, so keyboard/reader flow stays text-first
  // regardless of which side the carousel lands on.
  mirror?: boolean;
}

const SCROLL_AMOUNT = 320;

// Homepage-only "hero section per subdirectory" pattern: section label +
// 2-line headline + pill CTA on one side, a tab-filtered horizontally-
// scrolling preview row on the other. Deliberately heavier than the site's
// normal plain style — see CLAUDE.md's Design Philosophy exception for the
// homepage. Not reused outside app/page.tsx.
export function ShowcaseSection({
  sectionLabel,
  headline,
  description,
  ctaLabel,
  ctaHref,
  tabs,
  mirror = false,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className={`grid grid-cols-1 gap-8 py-12 lg:items-start lg:gap-12 ${
        mirror
          ? 'lg:grid-cols-[1fr_minmax(0,340px)]'
          : 'lg:grid-cols-[minmax(0,340px)_1fr]'
      }`}
    >
      <div className={mirror ? 'lg:order-2' : 'lg:order-1'}>
        <SectionLabel tone="accent">{sectionLabel}</SectionLabel>
        <h2 className="mt-3 text-4xl font-semibold leading-[1.12] tracking-tight">
          {headline[0]}
          <br />
          <span className="text-accent">{headline[1]}</span>
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
          {description}
        </p>
        <ButtonLink href={ctaHref} pill className="mt-7">
          {ctaLabel}
          <ChevronRightIcon width={16} height={16} aria-hidden="true" />
        </ButtonLink>
      </div>

      <div className={`min-w-0 ${mirror ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="flex items-center justify-between gap-4">
          <div
            className={`flex flex-wrap gap-4 ${mirror ? 'order-2' : 'order-1'}`}
            role="tablist"
            aria-label={`${sectionLabel} categories`}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={i === activeTab}
                onClick={() => setActiveTab(i)}
                className={
                  i === activeTab
                    ? 'font-semibold text-fg'
                    : 'text-fg-secondary hover:text-fg'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div
            className={`hidden shrink-0 gap-2 sm:flex ${mirror ? 'order-1' : 'order-2'}`}
          >
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="flex size-9 items-center justify-center rounded-full border border-line hover:border-line-strong"
            >
              <ChevronRightIcon
                width={16}
                height={16}
                className="rotate-180"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="flex size-9 items-center justify-center rounded-full border border-line hover:border-line-strong"
            >
              <ChevronRightIcon width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="mt-4 flex flex-nowrap gap-4 overflow-x-auto p-1 pb-2"
        >
          {tabs[activeTab].content}
        </div>
      </div>
    </section>
  );
}
