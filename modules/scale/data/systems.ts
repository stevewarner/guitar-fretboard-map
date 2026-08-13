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
          "The major pentatonic removes the 4th and 7th from the major scale — the two notes most likely to clash — leaving five notes that always sound consonant together. It's the fastest way to start improvising over a major-key progression.",
      },
      {
        slug: 'minor',
        displayName: 'Minor',
        pageTitle: 'Minor Pentatonic',
        degree: 0,
        dbName: 'pentatonic_minor',
        description:
          'The minor pentatonic removes the 2nd and 6th from natural minor, leaving the five notes most associated with blues and rock soloing. The "box shape" is this scale in one position.',
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
          "Ionian is the brightest mode of the major scale — it's the major scale itself, the one most guitarists already know by ear. Every other mode here is the same seven notes, just starting from a different degree.",
      },
      {
        slug: 'dorian',
        displayName: 'Dorian',
        degree: 1,
        description:
          'Dorian is a minor mode with a natural 6th instead of a b6, one shade brighter than natural minor. That raised 6th gives it a hopeful, non-heavy sound used throughout jazz, funk, and modal rock.',
      },
      {
        slug: 'phrygian',
        displayName: 'Phrygian',
        degree: 2,
        description:
          'Phrygian is a minor mode with a b2 instead of a natural 2, the darkest of the common minor modes. That half-step above the root gives Phrygian its flamenco-adjacent, tense sound.',
      },
      {
        slug: 'lydian',
        displayName: 'Lydian',
        degree: 3,
        description:
          'Lydian is a major mode with a #4 instead of a natural 4, one shade brighter than Ionian. That raised 4th is also why a fully extended IV chord in any major key has no avoid notes.',
      },
      {
        slug: 'mixolydian',
        displayName: 'Mixolydian',
        degree: 4,
        description:
          'Mixolydian is a major mode with a b7 instead of a natural 7, one shade darker than Ionian. That flattened 7th is the sound of the dominant chord and of countless blues and rock melodies.',
      },
      {
        slug: 'aeolian',
        displayName: 'Aeolian',
        degree: 5,
        description:
          'Aeolian is the direct minor counterpart to Ionian, and what most people mean when they just say "minor" — it\'s the natural minor scale itself. It shares every note with its relative major, starting from the 6th degree.',
      },
      {
        slug: 'locrian',
        displayName: 'Locrian',
        degree: 6,
        description:
          "Locrian is a minor mode with both a b2 and a b5, the darkest mode of the major scale, built on a diminished triad. It's rarely a tonal center on its own, but it explains why the vii° chord in any key is diminished.",
      },
    ],
  },
  {
    slug: 'harmonic-minor',
    displayName: 'Harmonic Minor',
    dbName: 'harmonic_minor',
    showModes: false,
    modes: [
      {
        slug: 'harmonic-minor',
        displayName: 'Harmonic Minor',
        degree: 0,
        description:
          "Harmonic minor is natural minor with a raised 7th, giving it a dominant V chord that resolves strongly to a minor i. That raised 7th also creates the scale's signature augmented 2nd gap, for a distinctive, exotic sound.",
      },
      {
        slug: 'locrian-natural-6',
        displayName: 'Locrian ♮6',
        degree: 1,
        description:
          "Locrian ♮6 is the 2nd mode of harmonic minor — Locrian with a raised 6th instead of the usual b6. It softens Locrian's usual instability slightly, though it's still built on a diminished triad.",
      },
      {
        slug: 'ionian-augmented',
        displayName: 'Ionian Augmented',
        degree: 2,
        description:
          "Ionian Augmented is the 3rd mode of harmonic minor — Ionian with a #5 instead of a natural 5, producing an augmented triad on the root. It's a tense, uncommon color outside of jazz and classical contexts.",
      },
      {
        slug: 'dorian-sharp-4',
        displayName: 'Dorian ♯4',
        degree: 3,
        description:
          'Dorian ♯4 is the 4th mode of harmonic minor — Dorian with a raised 4th, adding an augmented 2nd between the b3 and #4. That gap gives it a Middle Eastern, exotic character.',
      },
      {
        slug: 'phrygian-dominant',
        displayName: 'Phrygian Dominant',
        degree: 4,
        description:
          "Phrygian Dominant is the most recognizable mode of harmonic minor — Mixolydian with a b2 and b6. It's the sound of flamenco and klezmer, and functions as the V chord of the parent harmonic minor scale.",
      },
      {
        slug: 'lydian-sharp-2',
        displayName: 'Lydian ♯2',
        degree: 5,
        description:
          "Lydian ♯2 is the 6th mode of harmonic minor — Lydian with a raised 2nd, adding another augmented-2nd gap for an unresolved brightness. It's an uncommon color used mostly in modern jazz.",
      },
      {
        slug: 'ultra-locrian',
        displayName: 'Ultra Locrian',
        degree: 6,
        description:
          "Ultra Locrian is the darkest mode of harmonic minor — Locrian with an even further lowered 7th on top of its already-flat 2nd and 5th. It's almost never used as a tonal center.",
      },
    ],
  },
  {
    slug: 'melodic-minor',
    displayName: 'Melodic Minor',
    dbName: 'melodic_minor',
    showModes: false,
    modes: [
      {
        slug: 'melodic-minor',
        displayName: 'Melodic Minor',
        degree: 0,
        description:
          "Melodic minor (the jazz form) is natural minor with both the 6th and 7th raised — a minor scale with a major scale's upper half. That combination gives it a sound that's simultaneously minor and bright.",
      },
      {
        slug: 'dorian-flat-2',
        displayName: 'Dorian ♭2',
        degree: 1,
        description:
          "Dorian ♭2 is the 2nd mode of melodic minor — Dorian with a b2 instead of a natural 2, blending Dorian's brightness with Phrygian's dark half-step above the root.",
      },
      {
        slug: 'lydian-augmented',
        displayName: 'Lydian Augmented',
        degree: 2,
        description:
          'Lydian Augmented is the 3rd mode of melodic minor — Lydian with a #5 instead of a natural 5, stacking two of the brightest, most unresolved-sounding raised tones available.',
      },
      {
        slug: 'lydian-dominant',
        displayName: 'Lydian Dominant',
        degree: 3,
        description:
          "Lydian Dominant is the 4th mode of melodic minor — Mixolydian with a #4, combining a dominant 7th sound with Lydian's brightness. It's the standard choice over dominant 7#11 chords.",
      },
      {
        slug: 'mixolydian-flat-6',
        displayName: 'Mixolydian ♭6',
        degree: 4,
        description:
          'Mixolydian ♭6 is the 5th mode of melodic minor — Mixolydian with a b6 instead of a natural 6, darkening the dominant sound. It works well over dominant chords resolving to a minor key.',
      },
      {
        slug: 'locrian-natural-2',
        displayName: 'Locrian ♮2',
        degree: 5,
        description:
          "Locrian ♮2 is the 6th mode of melodic minor — Locrian with a natural 2 instead of b2. It's the standard choice over half-diminished chords in a minor ii–V–i progression.",
      },
      {
        slug: 'altered',
        displayName: 'Altered',
        degree: 6,
        description:
          "The Altered scale is the 7th and most dissonant mode of melodic minor, packing every common alteration on a dominant chord — b9, #9, #11, b13 — into one scale. It's the go-to choice for maximum tension before resolving to a minor key.",
      },
    ],
  },
];
