'use client';

import { type RefObject, useEffect, useRef } from 'react';
import { type MotionStyle, type MotionValue, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import portrait from '@/lib/portrait-meta.json';

type Geometry = {
  headX: number;
  headY: number;
  headR: number;
  docX: number;
  docY: number;
  slotX: number;
  slotY: number;
  slotR: number;
  distance: number;
  cover: number;
};

type Dock = { style: MotionStyle; progress: MotionValue<number> };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// Starts moving the moment you scroll and lands softly, so the flight never feels like it lags behind.
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function documentOffset(element: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { left, top };
}

/**
 * Scrolling the hero shrinks the portrait onto its head and flies it into the nav's avatar socket.
 * The maths runs on scroll-linked motion values, so React never re-renders during the scroll.
 */
export function useDock(ref: RefObject<HTMLElement | null>, enabled: boolean): Dock {
  const geometry = useRef<Geometry | null>(null);
  const enabledRef = useRef(enabled);
  const { scrollY } = useScroll();
  // Bumped after every measurement, so the flight recomputes without waiting for the next scroll.
  const measured = useMotionValue(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;

    if (!enabled) {
      // Reduced motion: no flight, the nav avatar simply appears once the portrait is out of view.
      const observer = new IntersectionObserver(([entry]) => {
        if (entry) root.toggleAttribute('data-docked', !entry.isIntersecting);
      });
      observer.observe(element);
      return () => {
        observer.disconnect();
        root.removeAttribute('data-docked');
      };
    }

    let width = 0;
    const measure = () => {
      const slot = document.querySelector<HTMLElement>('[data-avatar-slot]');
      if (!slot || element.offsetWidth === 0) return;
      width = innerWidth;
      const scale = element.offsetWidth / portrait.width;
      const { left, top } = documentOffset(element);
      const slotRect = slot.getBoundingClientRect();
      geometry.current = {
        headX: portrait.head.cx * scale,
        headY: portrait.head.cy * scale,
        headR: portrait.head.r * scale,
        docX: left + portrait.head.cx * scale,
        docY: top + portrait.head.cy * scale,
        slotX: slotRect.left + slotRect.width / 2,
        slotY: slotRect.top + slotRect.height / 2,
        slotR: slotRect.width / 2,
        distance: Math.max(200, element.offsetHeight * 0.35),
        cover: Math.hypot(element.offsetWidth, element.offsetHeight),
      };
      measured.set(measured.get() + 1);
    };
    const onResize = () => {
      if (innerWidth !== width) measure();
    };

    measure();
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, [ref, enabled, measured]);

  // Motion recomputes a value only on the motion values it read, so each one reads them before any early return.
  const progress = useTransform(() => {
    measured.get();
    const scroll = scrollY.get();
    const g = geometry.current;
    return enabled && g ? easeOut(clamp01(scroll / g.distance)) : 0;
  });

  const x = useTransform(() => {
    const p = progress.get();
    const g = geometry.current;
    return g ? p * (g.slotX - g.docX) : 0;
  });
  const y = useTransform(() => {
    const p = progress.get();
    const scroll = scrollY.get();
    const g = geometry.current;
    return g ? p * (g.slotY - (g.docY - scroll)) : 0;
  });
  const scale = useTransform(() => {
    const p = progress.get();
    const g = geometry.current;
    return g ? 1 + (g.slotR / g.headR - 1) * p : 1;
  });
  const clipPath = useTransform(() => {
    const p = progress.get();
    const g = geometry.current;
    if (!g) return 'none';
    const t = clamp01((p - 0.1) / 0.75);
    const radius = g.cover + (g.headR - g.cover) * t;
    return `circle(${radius.toFixed(1)}px at ${g.headX.toFixed(1)}px ${g.headY.toFixed(1)}px)`;
  });
  const opacity = useTransform(progress, (p) => (p >= 0.999 ? 0 : 1));
  // Above the nav (z-index 50) while flying, so it lands on the socket instead of sliding under the glass.
  const zIndex = useTransform(progress, (p) => (p > 0.001 ? 60 : 1));

  useMotionValueEvent(progress, 'change', (p) => {
    // With reduced motion the IntersectionObserver above owns data-docked.
    if (enabledRef.current) document.documentElement.toggleAttribute('data-docked', p >= 0.999);
  });

  // The box has the photo's aspect ratio, so a percentage origin always sits on the head centre.
  const transformOrigin = `${(portrait.head.cx / portrait.width) * 100}% ${(portrait.head.cy / portrait.height) * 100}%`;

  return {
    style: enabled ? { x, y, scale, clipPath, opacity, zIndex, transformOrigin } : {},
    progress,
  };
}
