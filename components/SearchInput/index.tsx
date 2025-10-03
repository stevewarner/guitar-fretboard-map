import { InputHTMLAttributes } from 'react';
import SearchIcon from '@/svgs/search.svg';
import CloseIcon from '@/svgs/close.svg';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onClear?: () => void;
}

export const SearchInput = ({
  id,
  label = 'Search',
  placeholder = 'Search',
  value = '',
  onChange,
  onClear,
  ...props
}: SearchInputProps) => (
  <div className="relative">
    <SearchIcon
      className="absolute left-4 top-1/2 translate-y-[-50%]"
      height={20}
      width={20}
    />
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <input
      id={id}
      className="h-10 rounded border border-current pl-11 pr-6 placeholder:text-current"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
    {value && onClear && (
      <button
        type="button"
        className="absolute right-2 top-1/2 translate-y-[-50%] cursor-pointer hover:opacity-70"
        onClick={() => onClear()}
      >
        <CloseIcon height={16} width={16} />
      </button>
    )}
  </div>
);
