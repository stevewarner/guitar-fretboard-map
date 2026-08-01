import type { ReactNode } from 'react';

interface CardRowProps {
  children: ReactNode;
}

export const CardRow = ({ children }: CardRowProps) => {
  return (
    <div className="flex flex-nowrap gap-4 overflow-x-auto p-1 pb-4">
      {children}
    </div>
  );
};
