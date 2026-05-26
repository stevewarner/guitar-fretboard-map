import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { ScalesNav } from '@/modules/scale/ScalesNav';

export default function ScalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      <aside className="shrink-0 md:w-44">
        <ScalesNav systems={SCALE_SYSTEMS} />
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
