import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  children: ReactNode;
}

// One homepage section (Chords, Scales, Lessons): a heading, one plain
// sentence saying what's there, a link into that part of the site, then the
// preview cards.
export function HomeSection({
  title,
  description,
  linkLabel,
  linkHref,
  children,
}: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-[15px] leading-normal text-fg-secondary">
            {description}
          </p>
        </div>
        <Link
          href={linkHref}
          className="whitespace-nowrap text-[15px] font-semibold underline underline-offset-[3px]"
        >
          {linkLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}
