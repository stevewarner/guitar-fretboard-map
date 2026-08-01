'use client';
import React, { useState, useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wrapperClassName?: string;
  labelClassName?: string;
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
  ...props
}: TextAreaProps) => {
  const [length, setLength] = useState(() => {
    const initial = defaultValue ?? props.value;
    return typeof initial === 'string' ? initial.length : 0;
  });

  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName ?? ''}`}>
      <label
        htmlFor={textareaId}
        className={`text-sm font-semibold text-fg ${labelClassName ?? ''}`}
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        maxLength={maxLength}
        defaultValue={defaultValue}
        onChange={(e) => {
          setLength(e.target.value.length);
          onChange?.(e);
        }}
        className={`block w-full rounded-md border-0 px-3.5 py-2 text-fg shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-fg-secondary sm:text-sm ${className ?? ''}`}
        {...props}
      />
      {maxLength != null && (
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-1 block text-right text-xs text-fg-secondary"
        >
          {length}/{maxLength}
        </span>
      )}
    </div>
  );
};
