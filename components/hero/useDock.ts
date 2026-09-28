'use client';

import { type RefObject, useEffect, useRef } from 'react';
import { type MotionValue, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Scroll distance over which the portrait pours into the nav avatar. */
export const dockDistance = () => Math.max(320, innerHeight * 0.75);

/**
 * Scroll progress of the hero hand-off: 0 with the portrait in place, 1 once it has poured into the nav
 * avatar. The portrait scene turns it into motion; this hook only measures it and flags the docked state.
 */
export function useDock(ref: RefObject<HTMLElement | null>, enabled: boolean): MotionValue<number> {
  const distance = useRef(0);
  const enabledRef = useRef(enabled);
  const { scrollY } = useScroll();
  // Bumped after every measurement, so progress recomputes without waiting for the next scroll.
  const measured = useMotionValue(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;

    if (!enabled) {
      // Reduced motion: no stars, the nav avatar simply appears once the portrait is out of view.
      const observer = new IntersectionObserver(([entry]) => {
        if (entry) root.toggleAttribute('data-docked', !entry.isIntersecting);
      });
      observer.observe(element);
      return () => {
        observer.disconnect();
        root.removeAttribute('data-docked');
      };
    }

    const measure = () => {
      distance.current = dockDistance();
      measured.set(measured.get() + 1);
    };
    measure();
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [ref, enabled, measured]);

  // Motion recomputes a value only on the motion values it read, so they are read before anything else.
  const progress = useTransform(() => {
    measured.get();
    const scroll = scrollY.get();
    return enabled && distance.current ? clamp01(scroll / distance.current) : 0;
  });

  useMotionValueEvent(progress, 'change', (p) => {
    // With reduced motion the IntersectionObserver above owns data-docked. The avatar fades in a little
    // before the end, under the landed head, so the scene can let go of it without a gap.
    if (enabledRef.current) document.documentElement.toggleAttribute('data-docked', p >= 0.96);
  });

  return progress;
}
