import { InputHTMLAttributes } from 'react';
import SearchIcon from '@/svgs/search.svg';
import CloseIcon from '@/svgs/close.svg';
import styles from './SearchInput.module.css';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  showLabel?: boolean;
  onClear?: () => void;
}

export const SearchInput = ({
  id,
  label = 'Search',
  showLabel = false,
  placeholder = 'Search',
  value = '',
  onChange,
  onClear,
  ...props
}: SearchInputProps) => (
  <div className={styles.container}>
    {showLabel && (
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    )}
    <div className={styles.inputRow}>
      <SearchIcon aria-hidden="true" className={styles.searchIcon} height={20} width={20} />
      {!showLabel && (
        <label htmlFor={id} className={styles.srOnly}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          aria-label="Clear search"
          className={styles.clearButton}
          onClick={() => onClear()}
        >
          <CloseIcon aria-hidden="true" height={16} width={16} />
        </button>
      )}
    </div>
  </div>
);
