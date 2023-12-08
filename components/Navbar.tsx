'use client';
import { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="w-full">
      <div className="mx-auto justify-between px-4 md:flex md:items-center md:px-8 lg:max-w-7xl">
        <div>
          <div className="flex items-center justify-between py-3 md:block md:py-5">
            <h2 className="text-2xl font-bold">
              <Link href="/">FretboardMap</Link>
            </h2>
            <div className="md:hidden">
              <button
                className="inline-flex items-center justify-center rounded-md bg-white p-2 focus:outline-none focus:ring-2 focus:ring-inset"
                onClick={() => setNavOpen((prevState) => !prevState)}
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
                      className="h-6 w-6"
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
                      className="h-6 w-6"
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
          </div>
        </div>

        <div>
          <div
            className={`mt-8 flex-1 justify-self-center pb-3 md:mt-0 md:block md:pb-0 ${
              navOpen ? 'block' : 'hidden'
            }`}
          >
            <ul className="items-center justify-center space-y-8 no-underline md:flex md:space-x-6 md:space-y-0">
              <li className="text-center">
                <Link href="/chord">Chords</Link>
              </li>
              <li className="text-center">
                <Link href="/scale">Scales</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
