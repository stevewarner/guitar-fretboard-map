/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Accent — interactive elements
        accent: {
          DEFAULT: '#4F46E5', // bg-accent, text-accent (indigo-600)
          hover: '#3730A3', // hover:bg-accent-hover (indigo-800)
          subtle: '#EEF2FF', // bg-accent-subtle (indigo-50)
          fg: '#ffffff', // text-accent-fg (text on accent bg)
        },
        // Surfaces — backgrounds
        surface: {
          DEFAULT: '#ffffff', // bg-surface
          raised: '#f9fafb', // bg-surface-raised (cards, panels)
          sunken: '#f3f4f6', // bg-surface-sunken (inputs, chips)
        },
        // Lines — borders and dividers (named 'line' to avoid border-border)
        line: {
          subtle: '#f3f4f6', // border-line-subtle
          DEFAULT: '#e5e7eb', // border-line
          strong: '#9ca3af', // border-line-strong
        },
        // Foreground — text (named 'fg' to avoid text-text-primary)
        fg: {
          DEFAULT: '#111827', // text-fg
          secondary: '#4b5563', // text-fg-secondary
          muted: '#9ca3af', // text-fg-muted
          inverted: '#ffffff', // text-fg-inverted
        },
        // Feedback
        success: '#16a34a',
        error: '#dc2626',
      },
    },
  },
  plugins: [],
};
