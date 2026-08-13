'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LESSONS } from '@/modules/lesson/lessons';

export function LessonPager() {
  const pathname = usePathname();
  const index = LESSONS.findIndex((l) => l.href === pathname);

  if (index === -1) return null;

  const prev = LESSONS[index - 1] ?? null;
  const next = LESSONS[index + 1] ?? null;

  return (
    <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex max-w-[45%] flex-col gap-1"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-fg-secondary">
            Previous
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex max-w-[45%] flex-col items-end gap-1"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-fg-secondary">
            Next
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
