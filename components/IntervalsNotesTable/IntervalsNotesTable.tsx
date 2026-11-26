interface Props {
  // Same order: one entry per chord or scale tone.
  degrees: string[];
  notes: string[];
  // Tones the chord shape on screen leaves out, shown in parentheses.
  omitted?: boolean[];
  // "x-x-3-5-5-5" — the chord shape on screen, as a third row.
  tab?: string | null;
}

// Intervals over notes (and a chord shape's tab) beside the chord or scale
// diagram on the detail pages.
export function IntervalsNotesTable({ degrees, notes, omitted, tab }: Props) {
  const cell = (value: string, i: number) => (
    <td key={i} className="w-10 pt-1 text-center text-base font-semibold">
      {omitted?.[i] ? `(${value})` : value}
    </td>
  );
  const rowHeading =
    'pr-4 text-left font-sans text-xs font-semibold text-fg-secondary';

  return (
    <table className="border-collapse font-mono">
      <caption className="sr-only">
        {tab ? 'Intervals, notes and tab' : 'Intervals and notes'}
      </caption>
      <tbody>
        <tr>
          <th scope="row" className={rowHeading}>
            Intervals
          </th>
          {degrees.map(cell)}
        </tr>
        <tr>
          <th scope="row" className={rowHeading}>
            Notes
          </th>
          {notes.map(cell)}
        </tr>
        {tab && (
          <tr>
            <th scope="row" className={`${rowHeading} pt-3`}>
              Tab
            </th>
            <td colSpan={degrees.length} className="pt-3 text-sm tracking-wide">
              {tab}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
