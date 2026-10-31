interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

export const NumberField = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
}: NumberFieldProps) => (
  <div className="flex items-center gap-2">
    <label htmlFor={id} className="text-sm text-fg-secondary">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 rounded-full bg-surface-raised px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      min={min}
      max={max}
    />
  </div>
);
