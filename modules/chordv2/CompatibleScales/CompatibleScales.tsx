import Link from 'next/link';
import { PageSection } from '@/components/PageSection';
import {
  getAllScaleModeOptions,
  isScaleCompatibleWithChord,
  type ScaleModeOption,
} from '@/modules/scale/utils/scaleCompatibility';
import {
  scaleRootName,
  spellScaleIntervals,
} from '@/modules/scale/utils/scaleUtils';
import { parseNote } from '@/app/utils/noteSpelling';
import { getOrdinal } from '@/app/utils';

// "2nd mode of Major scale" — matches the phrasing of the scale pages'
// subtitle (app/scale/[system]/[mode]/page.tsx). Pentatonic's 2 entries are independent
// scales, not modes of one another (same distinction ScaleViewer's
// patternKind prop already draws), so it gets its own plain phrasing.
function describeSystem(opt: ScaleModeOption): string {
  if (opt.systemSlug === 'pentatonic') return `${opt.systemName} scale`;
  const degree = opt.degree + 1;
  return `${degree}${getOrdinal(degree)} mode of ${opt.systemName} scale`;
}

const SEMITONES = Array.from({ length: 12 }, (_, pc) => pc);

const GRID = 'grid grid-cols-[repeat(12,26px)] sm:grid-cols-[repeat(12,44px)]';
const CELL =
  'flex h-[30px] items-center justify-center font-mono text-xs sm:h-9 sm:text-[15px]';
const ROW = 'flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-4';
const NAME_COLUMN = 'sm:w-[220px] sm:shrink-0';

interface Props {
  compactName: string;
  rootNote: string;
  // qualityMeta.intervals — quality-level, so this section holds regardless
  // of which shape/position is currently on screen (unlike OtherKeys, this
  // isn't gated on a shape existing at all).
  chordIntervals: number[];
  // Degree labels for chordIntervals, same order (intervalsToDegrees).
  chordDegrees: string[];
}

// Every scale on the site whose notes don't contradict this chord — see
// modules/scale/utils/scaleCompatibility.ts for the exact rule (no
// conflicting notes, not "must contain every chord tone": a scale that
// simply omits a chord tone, like major pentatonic omitting the 7th, still
// qualifies).
//
// Laid out as a fill-in-the-blanks grid on the 12 semitones from the root:
// the first row is the chord (1 _ _ _ 3 _ _ 5 _ _ _ 7), and each scale row
// is one way to fill in the blanks. The notes a scale adds are in the
// accent color, the chord tones it shares are muted, and a chord tone the
// scale leaves out stays a blank. Every row links to that scale's page.
export function CompatibleScales({
  compactName,
  rootNote,
  chordIntervals,
  chordDegrees,
}: Props) {
  const options = getAllScaleModeOptions().filter((opt) =>
    isScaleCompatibleWithChord(chordIntervals, chordDegrees, opt.intervals),
  );

  if (options.length === 0) return null;

  // Extensions fold into the octave here (a 9 sits in the 2's column), since
  // the scales are only spelled within one octave.
  const chordLabelByPc = new Map<number, string>();
  chordIntervals.forEach((interval, i) =>
    chordLabelByPc.set(interval % 12, chordDegrees[i]),
  );

  return (
    <PageSection
      title={`Scales to play over ${compactName}`}
      lessons={[
        'foundations/diatonic-harmony',
        'understanding-modes/comparing-modes',
      ]}
    >
      {/* Shrinks to its content on desktop so each row's arrow sits right
          after the last column. */}
      <div className="flex max-w-full flex-col overflow-x-auto sm:w-fit">
        <div className={`${ROW} pb-3`}>
          <p className={`${NAME_COLUMN} text-sm font-bold`}>{compactName}</p>
          <p className={GRID}>
            <span className="sr-only">
              {SEMITONES.map((pc) => chordLabelByPc.get(pc) ?? 'blank').join(
                ', ',
              )}
            </span>
            {SEMITONES.map((pc) => {
              const label = chordLabelByPc.get(pc);
              return (
                <span
                  key={pc}
                  aria-hidden="true"
                  className={`${CELL} text-base font-bold sm:text-xl`}
                >
                  {label ?? (
                    <span className="font-normal text-fg-secondary">_</span>
                  )}
                </span>
              );
            })}
          </p>
        </div>

        {options.map((opt) => {
          // Named the scale's own way: a Bb chord's Locrian is A# Locrian.
          const scaleRoot = scaleRootName(
            parseNote(rootNote).pc,
            opt.intervals,
          );
          const name = `${scaleRoot} ${opt.displayName}`;
          const system = describeSystem(opt);
          const labels = spellScaleIntervals(opt.intervals);
          const added = labels.filter(
            (_, i) => !chordLabelByPc.has(opt.intervals[i]),
          );
          const leftOut = [...chordLabelByPc.entries()]
            .filter(([pc]) => !opt.intervals.includes(pc))
            .map(([, label]) => label);

          return (
            <Link
              key={`${opt.systemSlug}-${opt.modeSlug}`}
              href={`/scale/${opt.systemSlug}/${opt.modeSlug}?root=${encodeURIComponent(scaleRoot)}`}
              aria-label={`${name}, ${system}: ${labels.join(' ')}. Adds ${added.join(', ')}.${leftOut.length > 0 ? ` Leaves out the ${leftOut.join(', ')}.` : ''}`}
              className={`${ROW} border-t border-line hover:bg-surface-raised hover:no-underline`}
            >
              <span
                className={`${NAME_COLUMN} flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:gap-0`}
              >
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-xs text-fg-secondary">{system}</span>
              </span>
              <span className={GRID} aria-hidden="true">
                {SEMITONES.map((pc) => {
                  const i = opt.intervals.indexOf(pc);
                  const isChordTone = chordLabelByPc.has(pc);
                  return (
                    <span key={pc} className={CELL}>
                      {i >= 0 ? (
                        <span
                          className={
                            isChordTone
                              ? 'text-fg-secondary'
                              : 'font-bold text-accent'
                          }
                        >
                          {labels[i]}
                        </span>
                      ) : isChordTone ? (
                        <span className="text-fg-secondary">_</span>
                      ) : (
                        <span className="text-line">·</span>
                      )}
                    </span>
                  );
                })}
              </span>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
