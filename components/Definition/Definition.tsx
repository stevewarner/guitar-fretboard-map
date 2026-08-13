import type { ReactNode } from 'react';

interface DefinitionProps {
  term: string;
  children: ReactNode;
}

// A single term/definition pair, set apart from the surrounding prose —
// term bolded on its own line, definition below it. Plain <dl>/<dt>/<dd>,
// the correct semantic element for this, not a repurposed <p>.
export function Definition({ term, children }: DefinitionProps) {
  return (
    <dl className="my-4 border-l-2 border-line pl-4">
      <dt>
        <strong>{term}</strong>
      </dt>
      <dd className="mt-1">{children}</dd>
    </dl>
  );
}
