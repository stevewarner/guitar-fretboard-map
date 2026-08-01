export type FlatTabValue = 'x' | number | undefined;
export type TabProp =
  | (string | number | undefined)[]
  | (string | number | undefined)[][];

export type ChordQuality = {
  id: number;
  symbol: string;
  full_name: string;
  intervals: number[];
  degrees: string[];
  category: string | null;
};
