import React from 'react';
import ThumbsUpIcon from '@/svgs/thumbsup.svg';

export interface SentimentOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const DEFAULT_OPTIONS: SentimentOption[] = [
  {
    value: 'positive',
    label: 'Thumbs up',
    icon: <ThumbsUpIcon height="20" width="20" />,
  },
  {
    value: 'negative',
    label: 'Thumbs down',
    icon: <ThumbsUpIcon className="rotate-180" height="20" width="20" />,
  },
];

interface SentimentInputProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'defaultValue'
> {
  name: string;
  label: string;
  options?: SentimentOption[];
  required?: boolean;
  defaultValue?: string;
  inputClassName?: string;
  optionClassName?: string;
}

export const SentimentInput = ({
  name,
  label,
  options = DEFAULT_OPTIONS,
  required,
  defaultValue,
  className,
  inputClassName,
  optionClassName,
  ...props
}: SentimentInputProps) => (
  <fieldset className={className} {...props}>
    <legend className="text-sm font-semibold text-fg">{label}</legend>
    <div className="mt-2 flex gap-3">
      {options.map(({ value, label: optionLabel, icon }) => (
        <label
          key={value}
          className={`flex size-10 cursor-pointer items-center justify-center rounded-full border border-transparent transition-colors hover:bg-surface-sunken has-[:checked]:bg-fg has-[:checked]:text-fg-inverted has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${optionClassName ?? ''}`}
        >
          <input
            type="radio"
            name={name}
            value={value}
            defaultChecked={defaultValue === value}
            required={required}
            className={`sr-only ${inputClassName ?? ''}`}
          />
          {icon}
          <span className="sr-only">{optionLabel}</span>
        </label>
      ))}
    </div>
  </fieldset>
);
