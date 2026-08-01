'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { LESSONS } from '@/modules/lesson/lessons';

export function LessonsNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = LESSONS.find((l) => l.href === pathname);

  return (
    <nav>
      {/* Mobile toggle */}
      <button
        className="flex w-full items-center justify-between md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Lessons
        </span>
        <span className="text-xs text-gray-500">
          {current ? current.label : ''}
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
      <p className="mb-3 hidden text-xs font-semibold uppercase tracking-widest text-gray-400 md:block">
        Lessons
      </p>

      <ul className={`space-y-0.5 ${open ? 'mt-2' : 'hidden'} md:block`}>
        {LESSONS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block border-l-2 py-1 pl-3 text-sm transition-colors ${
                  isActive
                    ? 'border-current font-medium'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-current'
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
