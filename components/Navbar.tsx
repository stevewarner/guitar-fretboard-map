'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/chord', label: 'Chords' },
  { href: '/scale', label: 'Scales' },
  { href: '/lesson', label: 'Lessons' },
];

export const Navbar: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  const close = () => setNavOpen(false);

  return (
    <nav id="nav" className="w-full border-b border-line">
      <div className="mx-auto px-4 md:flex md:items-center md:justify-between md:px-8 lg:max-w-7xl">
        <div className="flex items-center justify-between py-3 md:py-5">
          <Link className="text-2xl font-bold" href="/" onClick={close}>
            GuitarTheory
          </Link>

          <button
            className="p-2 md:hidden"
            onClick={() => setNavOpen((prev) => !prev)}
            aria-expanded={navOpen}
            aria-controls="nav-menu"
          >
            {navOpen ? (
              <>
                <span className="sr-only">Close main menu</span>
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </>
            ) : (
              <>
                <span className="sr-only">Open main menu</span>
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="printHidden size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        <div
          id="nav-menu"
          className={`border-t border-line-subtle pb-4 md:border-none md:pb-0 ${navOpen ? 'block' : 'hidden'} md:block`}
        >
          <ul className="space-y-1 md:flex md:items-center md:space-x-6 md:space-y-0">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="block p-2 text-base font-medium md:inline md:p-0 md:text-sm"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
