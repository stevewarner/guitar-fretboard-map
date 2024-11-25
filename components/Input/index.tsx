interface InputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helpText?: string;
  type?: 'text' | 'number';
  min?: number;
  name: string;
}

export const Input = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  helpText,
  type = 'text',
  min,
  name,
}: InputProps) => (
  <>
    <label
      htmlFor={id}
      className="block text-sm font-semibold leading-6 text-gray-900"
    >
      {label}
    </label>
    <div className="mt-2.5">
      <input
        type={type}
        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        name={name}
      />
    </div>
    {helpText && <p className="mt-2 text-sm">{helpText}</p>}
  </>
);
