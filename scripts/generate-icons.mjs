#!/usr/bin/env node
// Regenerates the static favicon/icon set from svgs/chord.svg, so a change
// to the icon's design or the brand accent color doesn't require hand-
// editing raster files again (see docs/TODO.md-adjacent history: the
// accent color rebrand from #4F46E5 to #2563EB had to be done as a one-off
// pixel recolor on committed PNGs/ICO because no pipeline existed).
//
// svgs/chord.svg itself is unaffected — it's imported live by
// app/opengraph-image.tsx (via @svgr/webpack) and needs no regeneration.
// This script only rebuilds the separately-committed static files:
//   app/icon.png, app/apple-icon.png, app/favicon.ico, app/icon.svg,
//   public/web-app-manifest-{192x192,512x512}.png
//
// Run: node scripts/generate-icons.mjs  (or `npm run generate-icons`)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHORD_SVG_PATH = join(ROOT, 'svgs/chord.svg');

// Mirrors tailwind.config.js's `accent.DEFAULT` / app/utils/constants.ts's
// ACCENT_HEX. Kept as a literal here too, same reason those files note:
// this script runs outside Next.js/Tailwind's build, so it can't import
// either.
const ACCENT_HEX = '#2563EB';

// Fraction of the square's own size, not the chord icon's — tuned to
// roughly match the icon's previous proportions. Adjust and re-run if the
// icon looks cramped or lost in its background after editing chord.svg.
const PADDING_RATIO = 0.08;
const CORNER_RADIUS_RATIO = 0.18;

function chordMarkup() {
  const svg = readFileSync(CHORD_SVG_PATH, 'utf8');
  const viewBoxMatch = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!viewBoxMatch) {
    throw new Error(`Couldn't find a "0 0 W H" viewBox in ${CHORD_SVG_PATH}`);
  }
  const [, vbWidth, vbHeight] = viewBoxMatch;

  // chord.svg sets stroke/fill defaults on its own root <svg> so its
  // children can inherit them instead of repeating the attribute on every
  // <line>/<circle>. This script discards that root tag below and re-wraps
  // the inner markup in its own <g> — carry those attributes over so they
  // aren't silently lost (children would otherwise fall back to the SVG
  // spec defaults: stroke="none", fill="black").
  const openTag = svg.match(/<svg[^>]*>/)[0];
  const presentationAttrs = ['stroke', 'stroke-width', 'fill']
    .map((attr) => openTag.match(new RegExp(`${attr}="([^"]*)"`))?.[0])
    .filter(Boolean)
    .join(' ')
    // The site renders this icon with `color: #fff` (via opengraph-image's
    // parent div) rather than a hardcoded fill — do the same here so a
    // future currentColor tweak in chord.svg doesn't need a matching edit
    // in this script.
    .replace(/currentColor/g, '#ffffff');

  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/currentColor/g, '#ffffff');
  return {
    inner,
    presentationAttrs,
    vbWidth: Number(vbWidth),
    vbHeight: Number(vbHeight),
  };
}

// Builds one square icon (rounded, accent-colored background + centered
// chord glyph) as a real SVG string, at the given pixel size.
function buildIconSvg(size) {
  const { inner, presentationAttrs, vbWidth, vbHeight } = chordMarkup();
  const padding = size * PADDING_RATIO;
  const contentSize = size - padding * 2;
  const scale = contentSize / Math.max(vbWidth, vbHeight);
  const radius = size * CORNER_RADIUS_RATIO;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${ACCENT_HEX}" />
  <g transform="translate(${padding}, ${padding}) scale(${scale})" ${presentationAttrs}>
    ${inner}
  </g>
</svg>`;
}

async function svgToPngBuffer(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

async function writePng(size, outPath) {
  const buf = await svgToPngBuffer(buildIconSvg(size), size);
  writeFileSync(outPath, buf);
  console.log(`wrote ${outPath} (${size}x${size})`);
}

// Minimal "PNG-in-ICO" (Vista-style) encoder — every entry is a full PNG
// file rather than a legacy BMP bitmap, which every modern ICO reader
// (Windows Vista+, browsers) accepts, and is far simpler to hand-write than
// real BMP-based ICO entries. No extra npm dependency needed for this.
function buildIco(pngBuffers) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = HEADER_SIZE + ENTRY_SIZE * pngBuffers.length;
  const entries = [];
  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(ENTRY_SIZE);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(buf.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buf)]);
}

async function writeFavicon(sizes, outPath) {
  const pngBuffers = await Promise.all(
    sizes.map(async (size) => ({
      size,
      buf: await svgToPngBuffer(buildIconSvg(size), size),
    })),
  );
  writeFileSync(outPath, buildIco(pngBuffers));
  console.log(`wrote ${outPath} (sizes: ${sizes.join(', ')})`);
}

function writeIconSvg(outPath) {
  // A real vector favicon (Next.js's app/icon.svg convention) — not a
  // base64-embedded raster, which is what was there before and doesn't
  // scale as cleanly. Size is arbitrary for a vector; browsers scale it.
  const svg = buildIconSvg(192);
  writeFileSync(outPath, svg + '\n');
  console.log(`wrote ${outPath} (vector)`);
}

async function main() {
  await writePng(96, join(ROOT, 'app/icon.png'));
  await writePng(180, join(ROOT, 'app/apple-icon.png'));
  await writePng(192, join(ROOT, 'public/web-app-manifest-192x192.png'));
  await writePng(512, join(ROOT, 'public/web-app-manifest-512x512.png'));
  await writeFavicon([16, 32, 48], join(ROOT, 'app/favicon.ico'));
  writeIconSvg(join(ROOT, 'app/icon.svg'));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
