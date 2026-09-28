import { DISSOLVE } from './dissolve';

/** What a point is; the shader moves each kind differently at rest. */
export const KIND = { body: 0, photo: 1, flow: 2, nebula: 3 } as const;

export type StarField = {
  count: number;
  /** Rest position in portrait units: u across, v down, 0..1 inside the frame. */
  home: Float32Array;
  /** Size in CSS px, brightness, twinkle phase, arrival delay (0..1, the top of the body first). */
  props: Float32Array;
  /** Kind, then for the skirt: lifetime in s, sideways reach (signed, frame widths), fall (frame heights). */
  motion: Float32Array;
  /** 1 when the star breaks off into the page instead of pouring into the avatar, then three random numbers. */
  fate: Float32Array;
  color: Float32Array;
};

type Pixels = {
  width: number;
  height: number;
  solid: Uint8Array;
  luminance: Float32Array;
  edge: Uint8Array;
  gradient: Float32Array;
};
type Weight = (i: number, v: number) => number;

const SAMPLE_WIDTH = 360;
/** Luminance of the brightest sweater folds; anything above (the hands) counts as fully lit. */
const SWEATER_WHITE = 0.11;
const ESCAPE_RATE = 0.06;

// A galaxy palette drawn from the site's blue, violet and cyan.
const WHITE = [0.95, 0.96, 1];
const BLUE = [0.62, 0.72, 1];
const VIOLET = [0.78, 0.66, 1];
const CYAN = [0.6, 0.92, 1];
const WARM = [1, 0.82, 0.64];
const NEBULA = [
  [0.36, 0.49, 1],
  [0.55, 0.36, 0.96],
  [0.2, 0.75, 0.9],
];

/**
 * Builds every point of the portrait scene from the photo: the stars that complete the body below it, the
 * hidden stars the photo itself breaks into on scroll, a slow skirt of stardust flaring out from the bottom,
 * and a few large soft glows that give it the colour of a galaxy.
 */
export function sampleStars(image: HTMLImageElement, density: number): StarField {
  const px = readPixels(image);
  const [bodyCount, photoCount, flowCount, nebulaCount] = [15000, 11000, 7000, 90].map((n) => Math.round(n * density));
  const count = bodyCount + photoCount + flowCount + nebulaCount;
  const home = new Float32Array(count * 2);
  const props = new Float32Array(count * 4);
  const motion = new Float32Array(count * 4);
  const fate = new Float32Array(count * 4);
  const color = new Float32Array(count * 3);

  // The sweater is nearly black, so its tones are stretched to full range: the folds and the crossed
  // arms then show through the star density, and the silhouette gets a dense bright rim.
  const tone = (i: number) => Math.min(1, px.luminance[i] / SWEATER_WHITE) ** 0.8;
  const skin = (i: number) => smoothstep(0.2, 0.6, px.luminance[i]);
  const bodyBand = (v: number) => smoothstep(DISSOLVE.start - 0.04, DISSOLVE.start + 0.14, v) * Math.min(1, (1 - v) / 0.1);
  const bodyWeight: Weight = (i, v) => (0.25 + tone(i) * 1.3 + px.edge[i] * 2.2 + px.gradient[i] * 0.9) * bodyBand(v);
  const photoWeight: Weight = (i, v) =>
    (0.15 + px.luminance[i] * 1.6 + px.edge[i] * 0.5 + px.gradient[i] * 0.6) * (1 - smoothstep(DISSOLVE.start, DISSOLVE.end + 0.04, v));
  const pickBody = sampler(px, bodyWeight);
  const pickPhoto = sampler(px, photoWeight);
  const pickFlow = sampler(px, (i, v) => bodyWeight(i, v) * smoothstep(0.7, 0.9, v));

  let s = 0;
  const begin = (u: number, v: number, kind: number, escapes: boolean) => {
    home[s * 2] = u;
    home[s * 2 + 1] = v;
    props[s * 4 + 2] = Math.random() * Math.PI * 2;
    motion[s * 4] = kind;
    fate.set([escapes ? 1 : 0, Math.random(), Math.random(), Math.random()], s * 4);
  };

  for (let n = 0; n < bodyCount; n++, s++) {
    const i = pickBody();
    const [u, v] = spot(px, i);
    const lit = tone(i);
    const warm = skin(i);
    const rim = px.edge[i];
    const flare = Math.random() < 0.0015;
    begin(u, v, KIND.body, Math.random() < ESCAPE_RATE);
    props[s * 4] = flare ? 8 + Math.random() * 5 : (1.5 + lit * 1.2 + warm + rim * 0.5) * (0.7 + Math.random() * 0.6);
    props[s * 4 + 1] = flare ? 1 : Math.min(1, 0.28 + lit * 0.4 + rim * 0.25 + warm * 0.15);
    props[s * 4 + 3] = 0.65 * clamp01((v - 0.4) / 0.6) + 0.35 * Math.random();
    color.set(hue(warm * 0.35, [0.4, 0.25, 0.2, 0.15]), s * 3);
  }

  for (let n = 0; n < photoCount; n++, s++) {
    const i = pickPhoto();
    const [u, v] = spot(px, i);
    const lum = px.luminance[i];
    begin(u, v, KIND.photo, Math.random() < ESCAPE_RATE);
    props[s * 4] = (1.3 + lum * 2.4) * (0.75 + Math.random() * 0.5);
    props[s * 4 + 1] = Math.min(1, 0.25 + lum * 0.85);
    color.set(hue(skin(i) * 0.4, [0.55, 0.2, 0.15, 0.1]), s * 3);
  }

  for (let n = 0; n < flowCount; n++, s++) {
    const i = pickFlow();
    const [u, v] = spot(px, i);
    const side = Math.sign(u - 0.5 + (Math.random() - 0.5) * 0.2) || 1;
    const flare = Math.random() < 0.002;
    begin(u, v, KIND.flow, false);
    props[s * 4] = flare ? 8 + Math.random() * 4 : 1.4 + Math.random() * 2;
    props[s * 4 + 1] = flare ? 0.9 : 0.35 + Math.random() * 0.4;
    // Slowly down and a little out to its own side, further the lower it starts, so it flares like a hem.
    const low = clamp01((v - 0.7) / 0.28);
    motion.set([KIND.flow, 10 + Math.random() * 8, side * (0.04 + low * 0.16) * (0.6 + Math.random() * 0.8), 0.03 + Math.random() * 0.06], s * 4);
    color.set(hue(0, [0.15, 0.3, 0.3, 0.25]), s * 3);
  }

  for (let n = 0; n < nebulaCount; n++, s++) {
    const i = pickBody();
    const [u, v] = spot(px, i);
    // Some glows sit out along the skirt, so the stardust has colour around it too.
    const out = Math.random() < 0.4 ? (Math.random() - 0.5) * 0.6 : 0;
    begin(u + out, Math.max(v, 0.6) + Math.random() * 0.06, KIND.nebula, false);
    props[s * 4] = 60 + Math.random() * 50;
    props[s * 4 + 1] = 0.035 + Math.random() * 0.035;
    color.set(NEBULA[Math.floor(Math.random() * NEBULA.length)], s * 3);
  }

  return { count, home, props, motion, fate, color };
}

function readPixels(image: HTMLImageElement): Pixels {
  const width = SAMPLE_WIDTH;
  const height = Math.round((width * image.naturalHeight) / image.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('2D canvas unavailable');
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);

  const pixels = width * height;
  const solid = new Uint8Array(pixels);
  const luminance = new Float32Array(pixels);
  for (let i = 0; i < pixels; i++) {
    solid[i] = data[i * 4 + 3] > 127 ? 1 : 0;
    luminance[i] = solid[i] ? (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255 : 0;
  }

  const edge = new Uint8Array(pixels);
  const gradient = new Float32Array(pixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!solid[i]) continue;
      edge[i] = solid[i - 1] && solid[i + 1] && solid[i - width] && solid[i + width] ? 0 : 1;
      const gx = luminance[i + 1] - luminance[i - 1];
      const gy = luminance[i + width] - luminance[i - width];
      gradient[i] = Math.min(1, Math.hypot(gx, gy) / 0.04);
    }
  }
  return { width, height, solid, luminance, edge, gradient };
}

/** Weighted random pixel picker over the solid part of the photo. */
function sampler(px: Pixels, weight: Weight): () => number {
  const cumulative = new Float64Array(px.width * px.height);
  let total = 0;
  for (let i = 0; i < cumulative.length; i++) {
    if (px.solid[i]) total += Math.max(0, weight(i, Math.floor(i / px.width) / px.height));
    cumulative[i] = total;
  }
  return () => pick(cumulative, Math.random() * total);
}

function spot(px: Pixels, i: number): [number, number] {
  return [((i % px.width) + Math.random()) / px.width, (Math.floor(i / px.width) + Math.random()) / px.height];
}

/** Warm with the given chance, otherwise white, blue, violet or cyan by weight. */
function hue(warmChance: number, weights: number[]): number[] {
  if (Math.random() < warmChance) return WARM;
  let roll = Math.random();
  const palette = [WHITE, BLUE, VIOLET, CYAN];
  for (let i = 0; i < palette.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return palette[i];
  }
  return WHITE;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function pick(cumulative: Float64Array, target: number): number {
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (cumulative[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low;
}
