'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScaleSystem } from '@/app/data/modes';

export function ScalesNav({ systems }: { systems: ScaleSystem[] }) {
  const pathname = usePathname();

  return (
    <nav>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-gray-400">
        Scale Systems
      </p>
      {systems.map((system) => {
        const firstModeHref = `/scale/${system.slug}/${system.modes[0].slug}`;
        const isSystemActive = pathname.startsWith(`/scale/${system.slug}`);

        return (
          <div key={system.slug} className="mb-4">
            {system.showModes ? (
              <>
                <p className="text-sm font-medium mb-1">{system.displayName}</p>
                <ul className="space-y-0.5">
                  {system.modes.map((mode) => {
                    const href = `/scale/${system.slug}/${mode.slug}`;
                    const isActive = pathname === href;
                    return (
                      <li key={mode.slug}>
                        <Link
                          href={href}
                          className={`text-sm block py-1 pl-3 border-l-2 transition-colors ${
                            isActive
                              ? 'border-current font-medium'
                              : 'border-transparent text-gray-500 hover:text-current hover:border-gray-300'
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
                className={`text-sm font-medium block py-1 pl-3 border-l-2 transition-colors ${
                  isSystemActive
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-current hover:border-gray-300'
                }`}
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
