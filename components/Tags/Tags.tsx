import Link from 'next/link';

export type Tag = {
  label: string;
  href: string;
};

interface Props {
  tags: Tag[];
}

export function Tags({ tags }: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.label}
          href={tag.href}
          className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
