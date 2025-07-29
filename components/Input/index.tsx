import { InputHTMLAttributes, useState, useRef } from 'react';

interface InputProps {
  label: string;
  helpText?: string;
  errorText?: string;
}

export const Input = ({
  id,
  label,
  value,
  onChange,
  required = false,
  helpText,
  errorText,
  pattern,
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) => {
  const [error, setError] = useState(false);
  const [showErrorText, setShowErrorText] = useState(false);

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <label
        htmlFor={id}
        className={`block text-sm font-semibold leading-6 text-gray-900 ${error && 'text-red-600'}`}
      >
        {label}
      </label>
      <div className="mt-2.5">
        <input
          className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 ${error && 'ring-red-600'}`}
          id={id}
          ref={ref}
          required={required}
          pattern={pattern}
          value={value}
          onChange={(event) => {
            // remove error if valid
            if (!event.target.validity.patternMismatch) {
              setError(false);
              setShowErrorText(false);
            }
            onChange?.(event);
          }}
          onFocus={() => {
            if (error) {
              setShowErrorText(true);
            }
          }}
          onBlur={(event) => {
            if (!error) {
              if (event.target.validity.patternMismatch) {
                ref.current?.select();
                setError(true);
                setShowErrorText(true);
              }
            } else {
              setShowErrorText(false);
            }
          }}
          {...rest}
        />
      </div>
      {helpText && <p className="mt-2 text-sm">{helpText}</p>}
      {showErrorText && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorText
            ? `Error: ${errorText}`
            : `Error: value must be ${pattern}`}
        </p>
      )}
    </>
  );
};
