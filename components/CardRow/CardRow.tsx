import type { ReactNode } from 'react';

interface CardRowProps {
  children: ReactNode;
  label?: string;
}

export const CardRow = ({
  children,
  label = 'Scrollable list',
}: CardRowProps) => {
  return (
    <section
      className="flex flex-nowrap gap-4 overflow-x-auto p-1 pb-4"
      tabIndex={0}
      aria-label={label}
    >
      {children}
    </section>
  );
};
