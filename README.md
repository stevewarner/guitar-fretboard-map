# Guitar chords and scales site

Guitar diagrams are dynamically created with SVGs. Chords are stored as an array of strings and numbers (ex. ['x', 3, 2, 0, 1, 0]). Scales are nested array. (Parent array for each string, and sub array for each note on a string)

The goal of this project is to display all possible ways to play each chord. Eventually I want to add relationships between chords / chords with shared notes.

This project uses

- Next.js
- PostgreSQL DB
- Tailwind CSS

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

[http://localhost:3000](http://localhost:3000)
