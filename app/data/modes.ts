export type ModeDefinition = {
  slug: string;
  displayName: string;
  pageTitle?: string;
  degree: number;
  dbName?: string;
};

export type ScaleSystem = {
  slug: string;
  displayName: string;
  dbName: string;
  showModes: boolean;
  showModeInfo?: boolean;
  modes: ModeDefinition[];
};

export const SCALE_SYSTEMS: ScaleSystem[] = [
  {
    slug: 'pentatonic',
    displayName: 'Pentatonic',
    dbName: 'pentatonic',
    showModes: true,
    modes: [
      {
        slug: 'major',
        displayName: 'Major',
        pageTitle: 'Major Pentatonic',
        degree: 0,
        dbName: 'pentatonic_major',
      },
      {
        slug: 'minor',
        displayName: 'Minor',
        pageTitle: 'Minor Pentatonic',
        degree: 0,
        dbName: 'pentatonic_minor',
      },
    ],
  },
  {
    slug: 'major-scale',
    displayName: 'Major',
    dbName: 'major',
    showModes: true,
    showModeInfo: true,
    modes: [
      { slug: 'ionian', displayName: 'Ionian', degree: 0 },
      { slug: 'dorian', displayName: 'Dorian', degree: 1 },
      { slug: 'phrygian', displayName: 'Phrygian', degree: 2 },
      { slug: 'lydian', displayName: 'Lydian', degree: 3 },
      { slug: 'mixolydian', displayName: 'Mixolydian', degree: 4 },
      { slug: 'aeolian', displayName: 'Aeolian', degree: 5 },
      { slug: 'locrian', displayName: 'Locrian', degree: 6 },
    ],
  },
  {
    slug: 'harmonic-minor',
    displayName: 'Harmonic Minor',
    dbName: 'harmonic_minor',
    showModes: false,
    modes: [
      { slug: 'harmonic-minor', displayName: 'Harmonic Minor', degree: 0 },
      { slug: 'locrian-natural-6', displayName: 'Locrian ♮6', degree: 1 },
      { slug: 'ionian-augmented', displayName: 'Ionian Augmented', degree: 2 },
      { slug: 'dorian-sharp-4', displayName: 'Dorian ♯4', degree: 3 },
      {
        slug: 'phrygian-dominant',
        displayName: 'Phrygian Dominant',
        degree: 4,
      },
      { slug: 'lydian-sharp-2', displayName: 'Lydian ♯2', degree: 5 },
      { slug: 'ultra-locrian', displayName: 'Ultra Locrian', degree: 6 },
    ],
  },
  {
    slug: 'melodic-minor',
    displayName: 'Melodic Minor',
    dbName: 'melodic_minor',
    showModes: false,
    modes: [
      { slug: 'melodic-minor', displayName: 'Melodic Minor', degree: 0 },
      { slug: 'dorian-flat-2', displayName: 'Dorian ♭2', degree: 1 },
      { slug: 'lydian-augmented', displayName: 'Lydian Augmented', degree: 2 },
      { slug: 'lydian-dominant', displayName: 'Lydian Dominant', degree: 3 },
      { slug: 'mixolydian-flat-6', displayName: 'Mixolydian ♭6', degree: 4 },
      { slug: 'locrian-natural-2', displayName: 'Locrian ♮2', degree: 5 },
      { slug: 'altered', displayName: 'Altered', degree: 6 },
    ],
  },
];
