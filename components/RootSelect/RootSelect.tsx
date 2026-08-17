import { NOTE_OPTIONS } from '@/app/utils/constants';
import { PillSelect } from '@/components/PillSelect';

interface RootSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  describedBy?: string;
  // A leading option (e.g. "Any key") rendered before the note list.
  extraOption?: { value: string; label: string };
}

export function RootSelect({
  id,
  value,
  onChange,
  label = 'Root',
  describedBy,
  extraOption,
}: RootSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-fg-secondary" htmlFor={id}>
        {label}
      </label>
      <PillSelect
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy}
      >
        {extraOption && (
          <option value={extraOption.value}>{extraOption.label}</option>
        )}
        {NOTE_OPTIONS.map(({ value: v, label: l }) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </PillSelect>
    </div>
  );
}
