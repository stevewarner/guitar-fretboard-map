/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: 'rgb(255, 255, 255)',
      black: 'rgb(22, 22, 22)',
      yellow: 'rgb(255 229 0)',
    },
    extend: {
      fontFamily: {
        sans: ['Assistant', ...defaultTheme.fontFamily.sans],
      },
      screens: {
        ios: { raw: 'only screen and (-webkit-min-device-pixel-ratio: 3)' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
