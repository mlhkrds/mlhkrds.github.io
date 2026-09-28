/** The photo gives way to stars over this band of the portrait height (0 top, 1 bottom). */
export const DISSOLVE = { start: 0.44, end: 0.68 } as const;

/**
 * The scene's smoothstep fade as CSS stops. The <img> wears it from first paint, so the body is already
 * left to the stars before they arrive and the hand-over to WebGL shows no seam.
 */
export const dissolveMask = (() => {
  const steps = 8;
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const keep = 1 - t * t * (3 - 2 * t);
    const at = (DISSOLVE.start + t * (DISSOLVE.end - DISSOLVE.start)) * 100;
    return `rgb(0 0 0 / ${keep.toFixed(3)}) ${at.toFixed(2)}%`;
  });
  return `linear-gradient(180deg, ${stops.join(', ')})`;
})();
