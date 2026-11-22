export type ModeDefinition = {
  slug: string;
  displayName: string;
  pageTitle?: string;
  degree: number;
  dbName?: string;
  description: string;
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
        description:
          'The major pentatonic scale consists of 5 notes with a natural third. Compared to a 7 note major scale, it is missing the 4 and 7 intervals.',
      },
      {
        slug: 'minor',
        displayName: 'Minor',
        pageTitle: 'Minor Pentatonic',
        degree: 0,
        dbName: 'pentatonic_minor',
        description:
          'The minor pentatonic scale consists of 5 notes with a flat third and flat seventh. Compared to a 7 note minor scale, it is missing the 2 and 6 intervals.',
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
      {
        slug: 'ionian',
        displayName: 'Ionian',
        degree: 0,
        description:
          "Ionian (aka Major Scale) is the first mode of the major scale system. Its step pattern is W W H W W W H, and its intervals are the reference that every other mode's intervals are compared against.",
      },
      {
        slug: 'dorian',
        displayName: 'Dorian',
        degree: 1,
        description:
          'Dorian is the second mode of the major scale system. Its step pattern is W H W W W H W. Compared to Ionian, it has a flat 3 and a flat 7.',
      },
      {
        slug: 'phrygian',
        displayName: 'Phrygian',
        degree: 2,
        description:
          'Phrygian is the third mode of the major scale system. Its step pattern is H W W W H W W. Compared to Ionian, it has a flat 2, flat 3, flat 6, and flat 7.',
      },
      {
        slug: 'lydian',
        displayName: 'Lydian',
        degree: 3,
        description:
          'Lydian is the fourth mode of the major scale system. Its step pattern is W W W H W W H. Compared to Ionian, it has a sharp 4.',
      },
      {
        slug: 'mixolydian',
        displayName: 'Mixolydian',
        degree: 4,
        description:
          'Mixolydian is the fifth mode of the major scale system. Its step pattern is W W H W W H W. Compared to Ionian, it has a flat 7.',
      },
      {
        slug: 'aeolian',
        displayName: 'Aeolian',
        degree: 5,
        description:
          'Aeolian (aka Natural Minor) is the sixth mode of the major scale system. Its step pattern is W H W W H W W. Compared to Ionian, it has a flat 3, flat 6, and flat 7.',
      },
      {
        slug: 'locrian',
        displayName: 'Locrian',
        degree: 6,
        description:
          'Locrian is the seventh mode of the major scale system. Its step pattern is H W W H W W W. Compared to Ionian, it has a flat 2, flat 3, flat 5, flat 6, and flat 7.',
      },
    ],
  },
  {
    slug: 'harmonic-minor',
    displayName: 'Harmonic Minor',
    dbName: 'harmonic_minor',
    showModes: true,
    modes: [
      {
        slug: 'aeolian-augmented-7',
        displayName: 'Aeolian ♮7',
        degree: 0,
        description:
          'Aeolian ♮7 (aka Harmonic Minor) is the first mode of Harmonic Minor. It most closely resembles the Aeolian mode of the major scale system, but with a natural 7.',
      },
      {
        slug: 'locrian-natural-6',
        displayName: 'Locrian ♮6',
        degree: 1,
        description:
          'Locrian ♮6 is the second mode of Harmonic Minor. It most closely resembles the Locrian mode of the major scale system, but with a natural 6.',
      },
      {
        slug: 'ionian-sharp-5',
        displayName: 'Ionian ♯5',
        degree: 2,
        description:
          'Ionian ♯5 (aka Ionian Augmented) is the third mode of Harmonic Minor. It most closely resembles the Ionian mode of the major scale system, but with a sharp 5.',
      },
      {
        slug: 'dorian-sharp-4',
        displayName: 'Dorian ♯4',
        degree: 3,
        description:
          'Dorian ♯4 is the fourth mode of Harmonic Minor. It most closely resembles the Dorian mode of the major scale system, but with a sharp 4.',
      },
      {
        slug: 'mixolydian-flat-9-flat-13',
        displayName: 'Mixolydian ♭9 ♭13',
        degree: 4,
        description:
          'Mixolydian ♭9 ♭13 (aka Phrygian Dominant) is the fifth mode of Harmonic Minor. It most closely resembles the Mixolydian mode of the major scale system, but with a flat 9 and a flat 13.',
      },
      {
        slug: 'lydian-sharp-2',
        displayName: 'Lydian ♯2',
        degree: 5,
        description:
          'Lydian ♯2 is the sixth mode of Harmonic Minor. It most closely resembles the Lydian mode of the major scale system, but with a sharp 2.',
      },
      {
        slug: 'locrian-diminished',
        displayName: 'Locrian Diminished',
        degree: 6,
        description:
          'Locrian Diminished (aka Ultra Locrian) is the seventh mode of Harmonic Minor. It most closely resembles the Locrian mode of the major scale system, but with a flat 4 and a double-flat 7.',
      },
    ],
  },
  {
    slug: 'melodic-minor',
    displayName: 'Melodic Minor',
    dbName: 'melodic_minor',
    showModes: true,
    modes: [
      {
        slug: 'melodic-minor',
        displayName: 'Melodic Minor',
        degree: 0,
        description:
          'Melodic Minor is the first mode of Melodic Minor. It is one alteration away from two modes of the major scale system: the Dorian mode with a natural 7, or the Ionian mode with a flat 3.',
      },
      {
        slug: 'dorian-flat-2',
        displayName: 'Dorian ♭2',
        degree: 1,
        description:
          'Dorian ♭2 is the second mode of Melodic Minor. It most closely resembles the Dorian mode of the major scale system, but with a flat 2.',
      },
      {
        slug: 'lydian-augmented',
        displayName: 'Lydian Augmented',
        degree: 2,
        description:
          'Lydian Augmented is the third mode of Melodic Minor. It most closely resembles the Lydian mode of the major scale system, but with a sharp 5.',
      },
      {
        slug: 'lydian-dominant',
        displayName: 'Lydian Dominant',
        degree: 3,
        description:
          'Lydian Dominant is the fourth mode of Melodic Minor. It most closely resembles the Lydian mode of the major scale system, but with a flat 7.',
      },
      {
        slug: 'mixolydian-flat-6',
        displayName: 'Mixolydian ♭6',
        degree: 4,
        description:
          'Mixolydian ♭6 is the fifth mode of Melodic Minor. It most closely resembles the Mixolydian mode of the major scale system, but with a flat 6.',
      },
      {
        slug: 'locrian-natural-2',
        displayName: 'Locrian ♮2',
        degree: 5,
        description:
          'Locrian ♮2 is the sixth mode of Melodic Minor. It most closely resembles the Locrian mode of the major scale system, but with a natural 2.',
      },
      {
        slug: 'altered',
        displayName: 'Altered',
        degree: 6,
        description:
          'Altered is the seventh mode of Melodic Minor. It most closely resembles the Locrian mode of the major scale system, but with a flat 4.',
      },
    ],
  },
];
