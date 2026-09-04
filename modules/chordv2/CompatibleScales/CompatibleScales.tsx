import { CardRow } from '@/components/CardRow';
import { ScalePreviewCard } from '@/components/ScalePreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import {
  getAllScaleModeOptions,
  isScaleCompatibleWithChord,
  type ScaleModeOption,
} from '@/modules/scale/utils/scaleCompatibility';
import { INTERVAL_LABELS } from '@/app/utils/constants';
import { getOrdinal } from '@/app/utils';

// "2nd mode of Major scale" — matches the phrasing the scale pages'
// showModeInfo line already uses (app/scale/[system]/[mode]/page.tsx),
// except applied uniformly to every rotation-based system here (that page
// only shows it for major-scale). Pentatonic's 2 entries are independent
// scales, not modes of one another (same distinction ScaleViewer's
// patternKind prop already draws), so it gets its own plain phrasing.
function describeSystem(opt: ScaleModeOption): string {
  if (opt.systemSlug === 'pentatonic') return `${opt.systemName} scale`;
  const degree = opt.degree + 1;
  return `${degree}${getOrdinal(degree)} mode of ${opt.systemName} scale`;
}

interface Props {
  compactName: string;
  rootNote: string;
  rootPc: number;
  // qualityMeta.intervals — quality-level, so this section holds regardless
  // of which shape/position is currently on screen (unlike OtherKeys, this
  // isn't gated on a shape existing at all).
  chordIntervals: number[];
}

// Every scale on the site whose notes don't contradict this chord — see
// modules/scale/utils/scaleCompatibility.ts for the exact rule (no
// conflicting notes, not "must contain every chord tone": a scale that
// simply omits a chord tone, like major pentatonic omitting the 7th, still
// qualifies). Compares by interval/semitone only, never by note name. Same
// card style as every other section on this page (ChordPreviewCard's scale
// counterpart, already used this same way on the homepage).
export function CompatibleScales({
  compactName,
  rootNote,
  rootPc,
  chordIntervals,
}: Props) {
  const chordPcs = new Set(chordIntervals.map((i) => i % 12));
  const options = getAllScaleModeOptions().filter((opt) =>
    isScaleCompatibleWithChord(chordIntervals, opt.intervals),
  );

  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* uppercase off: compactName is a case-sensitive chord symbol ("Dm"),
          and the CSS transform would collapse it to "DM" — indistinguishable
          from D major. See docs/STYLE_GUIDE.md's "Chord symbols" section. */}
      <SectionLabel as="h2" uppercase={false}>
        Scales for {compactName}
      </SectionLabel>
      <CardRow>
        {options.map((opt) => (
          <ScalePreviewCard
            key={`${opt.systemSlug}-${opt.modeSlug}`}
            variant="raised"
            className="w-40 shrink-0"
            href={`/scale/${opt.systemSlug}/${opt.modeSlug}?root=${encodeURIComponent(rootNote)}`}
            // Root + mode as the bold headline ("D Dorian"), then which
            // mode of which parent scale this actually is ("2nd mode of
            // Major scale") — the piece that was missing before, so two
            // modes sharing a word ("Lydian" vs "Lydian ♯2") read as
            // visibly different scales, not near-duplicates.
            label={`${rootNote} ${opt.displayName}`}
            sublabel={
              <span className="flex flex-col items-center gap-0.5">
                <span>{describeSystem(opt)}</span>
                <span>
                  {opt.intervals.map((interval, i) => (
                    <span
                      key={i}
                      className={
                        chordPcs.has(interval) ? 'font-bold text-fg' : undefined
                      }
                    >
                      {i > 0 && ' '}
                      {INTERVAL_LABELS[interval]}
                    </span>
                  ))}
                </span>
              </span>
            }
            modeIntervals={opt.intervals}
            rootPc={rootPc}
          />
        ))}
      </CardRow>
    </div>
  );
}
