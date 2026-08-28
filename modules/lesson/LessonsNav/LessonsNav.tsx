'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';

import { LESSON_PARTS, LESSONS } from '@/modules/lesson/lessons';

export function LessonsNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = LESSONS.find((l) => l.href === pathname);
  const listId = useId();

  return (
    <nav aria-label="Lessons">
      {/* Mobile toggle */}
      <button
        className="flex w-full items-center justify-between py-2 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-fg-secondary">
          Lessons
        </span>
        <span className="text-xs text-fg-secondary">
          {current ? current.title : ''}
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`ml-1 inline size-3 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Desktop label */}
      <p className="mb-3 hidden text-xs font-semibold uppercase tracking-widest text-fg-secondary md:block">
        Lessons
      </p>

      <div
        id={listId}
        className={`space-y-4 ${open ? 'mt-2' : 'hidden'} md:block`}
      >
        {LESSON_PARTS.map((part) => {
          const partHref = `/lesson/${part.slug}`;
          const isActivePart =
            pathname.startsWith(`${partHref}/`) || pathname === partHref;

          return (
            <div key={part.slug}>
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isActivePart ? 'text-fg' : 'text-fg-secondary'
                }`}
              >
                {part.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {part.lessons.map((lesson) => {
                  const href = `${partHref}/${lesson.slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block border-l-2 py-2 pl-3 text-sm transition-colors ${
                          isActive
                            ? 'border-current font-medium'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-current'
                        }`}
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
