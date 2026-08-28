import { Fretboard } from './Fretboard';
import { Pattern } from './Pattern';
import { buildChart, type ChartSource } from './buildChart';
import { describeChartForScreenReaders } from './describeChartForScreenReaders';

interface StaticChartProps {
  source: ChartSource;
  rootPc: number;
  title: string;
  label: string;
  className?: string;
}

// A single non-interactive chart at one fixed root — for lesson pages that
// want one hardcoded example (e.g. "here it is in the key of C") rather than
// RootPickerCharts' reader-facing root selector.
export function StaticChart({
  source,
  rootPc,
  title,
  label,
  className = 'w-40',
}: StaticChartProps) {
  const built = buildChart(source, rootPc);
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-fg-secondary">
        {label}
      </p>
      <div className={className}>
        <Fretboard
          numFrets={built.numFrets}
          startFret={built.startFret > 1 ? built.startFret : undefined}
          title={title}
        >
          {built.layers.map((layer, i) => (
            <Pattern key={i} {...layer} />
          ))}
        </Fretboard>
      </div>
      <p className="sr-only">{describeChartForScreenReaders(built.layers)}</p>
    </div>
  );
}
