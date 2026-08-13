import { permanentRedirect } from 'next/navigation';

// Old slug, kept as a redirect stub rather than deleted outright — unlike
// four-note-chord-positions (untracked, never indexed), this one is a real,
// presumably-indexed URL (see docs/LESSONS.md's now-resolved "Open
// question" note). Same permanentRedirect pattern already used by
// redirectToFirstLesson and the V1 compound-chord-URL recovery in
// app/chord/[quality]/page.tsx.
export default function ChordPositionsRedirect(): never {
  permanentRedirect('/lesson/learning-the-fretboard/chord-shapes');
}
