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
    ];
  },
};
