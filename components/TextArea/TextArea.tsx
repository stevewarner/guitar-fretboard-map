'use client';
import React, { useId, useRef, useState } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorText?: string;
}

export const TextArea = ({
  label,
  id,
  maxLength,
  defaultValue,
  onChange,
  wrapperClassName,
  labelClassName,
  className,
  required,
  errorText,
  ...props
}: TextAreaProps) => {
  const [length, setLength] = useState(() => {
    const initial = defaultValue ?? props.value;
    return typeof initial === 'string' ? initial.length : 0;
  });
  const [error, setError] = useState(false);
  const [showErrorText, setShowErrorText] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const ref = useRef<HTMLTextAreaElement>(null);
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const countId = `${textareaId}-count`;
  const describedBy =
    [showErrorText && errorId, maxLength != null && countId]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName ?? ''}`}>
      <label
        htmlFor={textareaId}
        className={`text-sm font-semibold text-fg ${error ? 'text-error' : ''} ${labelClassName ?? ''}`}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-error">
            {' '}
            *
          </span>
        )}
      </label>
      <textarea
        id={textareaId}
        ref={ref}
        maxLength={maxLength}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          setLength(e.target.value.length);
          setIsDirty(true);
          if (e.target.validity.valid) {
            setError(false);
            setShowErrorText(false);
          }
          onChange?.(e);
        }}
        onFocus={() => {
          if (error) setShowErrorText(true);
        }}
        onBlur={(e) => {
          if (!isDirty) return;
          if (!error) {
            if (!e.target.validity.valid) {
              setError(true);
              setShowErrorText(true);
            }
          } else {
            setShowErrorText(false);
          }
        }}
        className={`block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-fg-secondary sm:text-sm ${error ? 'ring-error' : ''} ${className ?? ''}`}
        {...props}
      />
      <div className="flex items-start justify-between gap-2">
        {showErrorText && (
          <p id={errorId} role="alert" className="text-sm text-error">
            {errorText
              ? `Error: ${errorText}`
              : required
                ? `${label} is required`
                : 'Please enter a valid value.'}
          </p>
        )}
        {maxLength != null && (
          <span
            id={countId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="ml-auto block text-right text-xs text-fg-secondary"
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
