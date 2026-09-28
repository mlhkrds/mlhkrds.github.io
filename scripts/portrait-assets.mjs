// Encodes the prepared portrait (scripts/portrait/work) into web assets under public/portrait.
// Run after scripts/portrait/prepare.py: `npm run portrait:assets`.
import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const work = new URL('./portrait/work/', import.meta.url);
const out = new URL('../public/portrait/', import.meta.url);
const meta = JSON.parse(await readFile(new URL('../lib/portrait-meta.json', import.meta.url), 'utf8'));
const cutout = new URL('cutout.png', work).pathname;

await mkdir(out, { recursive: true });

for (const width of [640, 960, 1440]) {
  const base = sharp(cutout).resize({ width });
  await base.clone().avif({ quality: 55, effort: 6 }).toFile(new URL(`portrait-${width}.avif`, out).pathname);
  await base.clone().webp({ quality: 80, alphaQuality: 90 }).toFile(new URL(`portrait-${width}.webp`, out).pathname);
}

// Avatars are cut from the head circle prepare.py found, on the same backdrop as the nav socket.
const { cx, cy, r } = meta.head;
const side = Math.round(r * 2);
const left = Math.max(0, Math.round(cx - r));
const top = Math.max(0, Math.round(cy - r));
const head = await sharp(cutout).extract({ left, top, width: side, height: side }).toBuffer();

for (const size of [64, 128]) {
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
  await sharp(head)
    .resize(size, size)
    .flatten({ background: '#1a1d24' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .webp({ quality: 85 })
    .toFile(new URL(`avatar-${size}.webp`, out).pathname);
}

console.log('portrait assets written to public/portrait');
