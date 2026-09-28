'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';
import { usePreferences } from './preferences';

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/** True once the page is hydrated and neither the OS nor the palette asks for reduced motion. */
export function useMotionOK(): boolean {
  const osReduce = useReducedMotion();
  const { motion } = usePreferences();
  const mounted = useMounted();
  return mounted && osReduce !== true && motion !== 'reduce';
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Becomes true when the browser is idle, so heavy extras never compete with first paint. */
export function useIdle(timeout = 1200): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = setTimeout(() => setIdle(true), timeout);
    return () => clearTimeout(handle);
  }, [timeout]);
  return idle;
}
