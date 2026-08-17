'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SectionLabel } from '@/components/SectionLabel';
import { ScaleSystem } from '@/modules/scale/data/systems';

export function ScalesNav({ systems }: { systems: ScaleSystem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Scale systems">
      <SectionLabel className="mb-3">Scale Systems</SectionLabel>
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
                  className="mb-2 block text-sm font-semibold"
                >
                  {system.displayName}
                </Link>
                <ul
                  className={`flex flex-col gap-0.5 ${
                    isSystemActive ? '' : 'hidden md:flex'
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
                          className={`block rounded-full px-3 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-fg font-medium text-fg-inverted'
                              : 'text-fg-secondary hover:bg-surface-sunken hover:text-fg'
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
                className="mb-1 block text-sm font-semibold"
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
