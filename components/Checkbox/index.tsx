interface CheckboxProps {
  id: string;
  label: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Include when the checkbox needs to participate in native form submission
  // (e.g. a `useActionState` form action reading FormData). Without a name,
  // a checkbox's checked state never appears in FormData at all.
  name?: string;
}

export const Checkbox = ({
  id,
  label,
  isChecked,
  onChange,
  name,
}: CheckboxProps) => (
  <>
    <label
      htmlFor={id}
      className="flex items-center justify-between text-sm font-semibold leading-6 text-fg"
    >
      {label}
      <div className="relative">
        <input
          id={id}
          name={name}
          type="checkbox"
          role="switch"
          value="true"
          checked={isChecked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div
          className={`block h-8 w-14 rounded-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
            isChecked ? 'bg-accent' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-surface transition ${
            isChecked ? 'translate-x-full' : ''
          }`}
        ></div>
      </div>
    </label>
  </>
);
