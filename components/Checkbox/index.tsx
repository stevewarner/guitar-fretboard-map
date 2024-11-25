interface CheckboxProps {
  id: string;
  label: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = ({ id, label, isChecked, onChange }: CheckboxProps) => (
  <>
    <label
      htmlFor="isOpenChord"
      className="flex items-center justify-between text-sm font-semibold leading-6 text-gray-900"
    >
      {label}
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`block h-8 w-14 rounded-full ${
            isChecked ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
            isChecked ? 'translate-x-full' : ''
          }`}
        ></div>
      </div>
    </label>
  </>
);
