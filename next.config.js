/** @type {import('next').NextConfig} */

module.exports = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  reactStrictMode: true,
  experimental: {
    agentUpgrade: 'security',
  },
  async redirects() {
    return [
      {
        source: '/lesson/intervals',
        destination: '/lesson/foundations/intervals-and-root-note',
        permanent: true,
      },
      {
        source: '/lesson/4-note-voicing',
        destination: '/lesson/chord-voicings/four-note-voicings',
        permanent: true,
      },
      {
        source: '/lesson/intro-pentatonic-scale',
        destination: '/lesson/foundations/pentatonic',
        permanent: true,
      },
      {
        source: '/lesson/movable-shapes',
        destination: '/lesson/foundations/triads',
        permanent: true,
      },
      {
        source: '/scale/harmonic-minor/harmonic-minor',
        destination: '/scale/harmonic-minor/aeolian-augmented-7',
        permanent: true,
      },
      {
        source: '/scale/harmonic-minor/ionian-augmented',
        destination: '/scale/harmonic-minor/ionian-sharp-5',
        permanent: true,
      },
      {
        source: '/scale/harmonic-minor/phrygian-dominant',
        destination: '/scale/harmonic-minor/mixolydian-flat-9-flat-13',
        permanent: true,
      },
      {
        source: '/scale/harmonic-minor/ultra-locrian',
        destination: '/scale/harmonic-minor/locrian-diminished',
        permanent: true,
      },
    ];
  },
};
