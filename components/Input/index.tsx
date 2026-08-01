'use client';
import { InputHTMLAttributes, useState, useRef, useEffect, useId } from 'react';

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
  const [isDirty, setIsDirty] = useState(false);

  const ref = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [helpText && helpId, showErrorText && errorId].filter(Boolean).join(' ') ||
    undefined;

  useEffect(() => {
    if (error && ref.current?.validity.valid) {
      setError(false);
      setShowErrorText(false);
    }
  }, [value, error]);

  return (
    <>
      <label
        htmlFor={inputId}
        className={`block text-sm font-semibold leading-6 text-fg ${error && 'text-error'}`}
      >
        {label}
      </label>
      <div className="mt-2.5">
        <input
          className={`block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-fg-secondary sm:text-sm sm:leading-6 ${error && 'ring-error'}`}
          id={inputId}
          ref={ref}
          required={required}
          pattern={pattern}
          value={value}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            setIsDirty(true);
            if (event.target.validity.valid) {
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
            if (!isDirty) return;
            if (!error) {
              if (!event.target.validity.valid) {
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
      {helpText && (
        <p id={helpId} className="mt-2 text-sm">
          {helpText}
        </p>
      )}
      {showErrorText && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-error">
          {errorText
            ? `Error: ${errorText}`
            : required
              ? `${label} is required`
              : 'Please enter a valid value.'}
        </p>
      )}
    </>
  );
};
