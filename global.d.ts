type ChordValue = {
  name: string;
  tab: string[] | number[];
};

type IChordData = {
  openChords: Record<string, ChordValue>;
};
