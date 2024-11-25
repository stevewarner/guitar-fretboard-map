import SearchIcon from '@/svgs/search.svg';

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
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
        onChange={onChange}
      />
    </div>
  );
};
