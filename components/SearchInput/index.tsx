import { InputHTMLAttributes } from 'react';
import SearchIcon from '@/svgs/search.svg';

export const SearchInput = ({
  value,
  defaultValue,
  onChange,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative">
      <SearchIcon
        className="absolute left-4 top-1/2 translate-y-[-50%]"
        height={20}
        width={20}
      />
      <input
        className="h-10 rounded border border-current pl-11 placeholder:text-current"
        placeholder="Search"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};
