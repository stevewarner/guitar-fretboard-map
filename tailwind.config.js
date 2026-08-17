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
          DEFAULT: '#2563EB', // bg-accent, text-accent (blue-600)
          hover: '#1D4ED8', // hover:bg-accent-hover (blue-700)
          subtle: '#EFF6FF', // bg-accent-subtle (blue-50)
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
        success: '#15803d', // ~5:1 against white (was #16a34a at ~3.3:1, failed AA)
        error: '#dc2626',
      },
      fontFamily: {
        // CSS vars set by next/font in app/layout.tsx; fall back to the
        // system stack Tailwind ships by default if the var is unset.
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
