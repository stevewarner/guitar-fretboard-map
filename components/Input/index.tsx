import { InputHTMLAttributes, useState, useRef } from 'react';

interface InputProps {
  id: string;
  required?: boolean;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helpText?: string;
  min?: number;
}

export const Input = ({
  id,
  label,
  value,
  onChange,
  required = false,
  helpText,
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) => {
  const [error, setError] = useState(false);

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-semibold leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2.5">
        <input
          className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
          id={id}
          ref={ref}
          value={value}
          onChange={(event) => {
            // remove error if valid
            if (!event.target.validity.patternMismatch) {
              setError(false);
            }
            onChange(event);
          }}
          onBlur={(event) => {
            if (event.target.validity.patternMismatch) {
              setError(true);
              ref.current && ref.current.select();
            } else {
              setError(false);
            }
          }}
          {...rest}
        />
      </div>
      {helpText && <p className="mt-2 text-sm">{helpText}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          Error: invalid field value
        </p>
      )}
    </>
  );
};
