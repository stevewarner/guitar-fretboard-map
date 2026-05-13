export type FlatTabValue = 'x' | number | undefined;
export type TabProp = (string | number | undefined)[] | (string | number | undefined)[][];

export type ChordType = {
  created_at: Date;
  finger_position: number;
  id: number;
  intervals: string[];
  name: string;
  notes: string[];
  num_frets: number;
  start_fret: number;
  string_position: number;
  tab: FlatTabValue[];
  tab_id: string;
  inversion: number;
  description: string | null;
};
