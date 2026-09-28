'use client';

import { type RefObject, useEffect } from 'react';

type UserAgentDataNavigator = Navigator & { userAgentData?: { brands: { brand: string }[] } };

const isChromium = (): boolean =>
  (navigator as UserAgentDataNavigator).userAgentData?.brands.some((entry) => entry.brand === 'Chromium') ?? false;

const LENS_EXTRA = 'saturate(180%) brightness(1.08)';

/**
 * Chromium can bend the backdrop through an SVG displacement map, the closest web match to Liquid Glass.
 * Other browsers keep the plain frosted glass from CSS. Returns a cleanup function.
 */
export function applyLens(element: HTMLElement, filterId: string, radius: number): () => void {
  const map = document.getElementById(`${filterId}-map`);
  if (!map || !isChromium()) return () => undefined;

  let size = '';
  const update = () => {
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    if (!width || `${width}x${height}` === size) return;
    size = `${width}x${height}`;
    map.setAttribute('width', String(width));
    map.setAttribute('height', String(height));
    map.setAttribute('href', lensMap(width, height, Math.min(height / 2, radius), Math.min(16, height / 2)));
    element.style.backdropFilter = `blur(3px) url(#${filterId}) ${LENS_EXTRA}`;
  };

  update();
  const observer = new ResizeObserver(update);
  observer.observe(element);
  return () => {
    observer.disconnect();
    element.style.backdropFilter = '';
  };
}

export function useLens(ref: RefObject<HTMLElement | null>, filterId: string, radius: number): void {
  useEffect(() => {
    const element = ref.current;
    return element ? applyLens(element, filterId, radius) : undefined;
  }, [ref, filterId, radius]);
}

// Encodes an inward push along the rounded edge: red is the x offset, green the y offset, 128 means none.
function lensMap(width: number, height: number, radius: number, band: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(width, height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - halfWidth;
      const py = y + 0.5 - halfHeight;
      const qx = Math.abs(px) - (halfWidth - radius);
      const qy = Math.abs(py) - (halfHeight - radius);
      const depth = radius - Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - Math.min(Math.max(qx, qy), 0);
      let dx = 0;
      let dy = 0;

      if (depth > 0 && depth < band) {
        let nx = 0;
        let ny = 1;
        if (qx > 0 && qy > 0) {
          const length = Math.hypot(qx, qy);
          nx = qx / length;
          ny = qy / length;
        } else if (qx > qy) {
          nx = 1;
          ny = 0;
        }
        const strength = (1 - depth / band) ** 2;
        dx = -nx * Math.sign(px || 1) * strength;
        dy = -ny * Math.sign(py || 1) * strength;
      }

      const i = (y * width + x) * 4;
      image.data[i] = 128 + dx * 127;
      image.data[i + 1] = 128 + dy * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
