# Guitar chords and scales site

Guitar diagrams are dynamically created with SVGs. Chords are stored as an array of strings and numbers (ex. ['x', 3, 2, 0, 1, 0]). Scales are nested array. (Parent array for each string, and sub array for each note on a string)

The goal of this project is to display all possible ways to play each chord. Eventually I want to add relationships between chords / chords with shared notes.

This project uses

- Next.js
- PostgreSQL DB
- Tailwind CSS

The fretboard chart is created with SVG using a composition pattern. Fretboard is a component that creates the base SVG and grid for the fretboard. Pattern (dots to represent finger placement) is passed in separately so it can be dynamically updated (or even animated). Any SVG element could be passed in children.

Folowing this pattern separates logic and makes it easier to implement across the app. Fretboard and Pattern share a context for base dimensions to keep all math / coordinates in sync.

```
<Fretboard numFrets={4}>
    <Pattern
      tab={['x',3,2,0,1,0]}
    />
</Fretboard>
```

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

## Want to contribute to this project?

Submit a Pull Request
