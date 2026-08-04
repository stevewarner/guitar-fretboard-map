'use client';
import { useState } from 'react';
import styles from './ColorInput.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const HEX_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export const ColorInput = ({ value, onChange, label }: Props) => {
  const [textValue, setTextValue] = useState(value);
  // Keep the text field in sync when the color is changed via the swatch
  // (or by the parent), without clobbering in-progress typing. Adjusted
  // during render (React's recommended pattern) rather than an effect,
  // which would cause an extra cascading render.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setTextValue(value);
  }

  return (
    <span className={styles.wrapper}>
      <label>
        <span className="sr-only">{label}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
      </label>
      <input
        type="text"
        value={textValue}
        onChange={(e) => {
          const next = e.target.value;
          setTextValue(next);
          if (HEX_PATTERN.test(next)) onChange(next);
        }}
        onBlur={() => setTextValue(value)}
        aria-label={`${label} hex value`}
        placeholder="#000000"
        spellCheck={false}
        className="w-20 rounded border border-line px-2 py-1 font-mono text-xs"
      />
    </span>
  );
};
