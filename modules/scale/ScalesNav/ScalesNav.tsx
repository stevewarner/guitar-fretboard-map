'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScaleSystem } from '@/modules/scale/data/systems';

export function ScalesNav({ systems }: { systems: ScaleSystem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Scale systems">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-secondary">
        Scale Systems
      </p>
      {systems.map((system) => {
        const firstModeHref = `/scale/${system.slug}/${system.modes[0].slug}`;
        const isSystemActive = pathname.startsWith(`/scale/${system.slug}`);

        return (
          <div key={system.slug} className="mb-4">
            {system.showModes ? (
              <>
                <Link
                  href={firstModeHref}
                  aria-current={isSystemActive ? 'true' : undefined}
                  className="mb-1 block text-sm font-medium"
                >
                  {system.displayName}
                </Link>
                <ul
                  className={`space-y-0.5 ${
                    isSystemActive ? '' : 'hidden md:block'
                  }`}
                >
                  {system.modes.map((mode) => {
                    const href = `/scale/${system.slug}/${mode.slug}`;
                    const isActive = pathname === href;
                    return (
                      <li key={mode.slug}>
                        <Link
                          href={href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`block border-l-2 py-3 pl-3 text-sm transition-colors ${
                            isActive
                              ? 'border-current font-medium'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-current'
                          }`}
                        >
                          {mode.displayName.toLowerCase()}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <Link
                href={firstModeHref}
                aria-current={isSystemActive ? 'page' : undefined}
                className="mb-1 block text-sm font-medium"
              >
                {system.displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
