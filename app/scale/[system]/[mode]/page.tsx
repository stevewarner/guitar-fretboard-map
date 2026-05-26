import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { SCALE_SYSTEMS } from '@/app/data/modes';
import { INTERVAL_LABELS } from '@/app/utils/constants';
import { getModeIntervals } from '@/app/utils/scaleUtils';
import { ScaleViewer } from '@/modules/ScaleViewer';

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
}

type Props = {
  params: Promise<{ system: string; mode: string }>;
};

export function generateStaticParams() {
  return SCALE_SYSTEMS.flatMap((s) =>
    s.modes.map((m) => ({ system: s.slug, mode: m.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { system: systemSlug, mode: modeSlug } = await params;
  const system = SCALE_SYSTEMS.find((s) => s.slug === systemSlug);
  const mode = system?.modes.find((m) => m.slug === modeSlug);
  if (!system || !mode) return {};
  return { title: `${mode.displayName} — ${system.displayName}` };
}

type ScaleRow = { intervals: number[] };

export default async function ScaleModePage({ params }: Props) {
  const { system: systemSlug, mode: modeSlug } = await params;

  const system = SCALE_SYSTEMS.find((s) => s.slug === systemSlug);
  const modeData = system?.modes.find((m) => m.slug === modeSlug);
  if (!system || !modeData) notFound();

  const dbName = modeData.dbName ?? system.dbName;
  const { rows } = await sql<ScaleRow>`
    SELECT intervals FROM scales WHERE name = ${dbName} LIMIT 1
  `;
  if (!rows.length) notFound();

  const parentIntervals = rows[0].intervals as number[];
  const modeIntervals = getModeIntervals(parentIntervals, modeData.degree);
  const intervalFormula = modeIntervals.map((i) => INTERVAL_LABELS[i]).join('  ');
  const quality = modeIntervals.includes(4) && !modeIntervals.includes(3)
    ? 'Major'
    : modeIntervals.includes(3)
    ? 'Minor'
    : null;

  return (
    <div>
      <h1 className={system.showModeInfo ? 'mb-1' : 'mb-4'}>{modeData.pageTitle ?? modeData.displayName}</h1>
      {system.showModeInfo && (
        <>
          <p className="text-sm text-gray-500">
            {ordinal(modeData.degree + 1)} mode of the {system.displayName} scale
          </p>
          <p className="text-sm text-gray-500 mb-4">{quality}</p>
        </>
      )}
      <p className="text-sm font-medium mb-1">Intervals</p>
      <p className="font-mono text-sm mb-6 tracking-wider">{intervalFormula}</p>
      <ScaleViewer modeIntervals={modeIntervals} />
    </div>
  );
}
