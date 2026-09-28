'use client';

import dynamic from 'next/dynamic';
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import { useFinePointer, useMotionOK } from '@/lib/hooks';
import { usePreferences } from '@/lib/preferences';

const CommandPalette = dynamic(() => import('@/components/palette/CommandPalette'), { ssr: false });
const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

type PaletteState = { open: boolean; setOpen: (open: boolean) => void };

const PaletteContext = createContext<PaletteState>({ open: false, setOpen: () => undefined });

export const usePalette = (): PaletteState => useContext(PaletteContext);

export function Providers({ children }: { children: ReactNode }) {
  const motionOK = useMotionOK();
  const { motion } = usePreferences();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setLoaded(true);
        setOpen((value) => !value);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useGlassPointer();

  const palette = useMemo<PaletteState>(
    () => ({
      open,
      setOpen: (next) => {
        if (next) setLoaded(true);
        setOpen(next);
      },
    }),
    [open],
  );

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={motion === 'reduce' ? 'always' : 'user'}>
        <PaletteContext.Provider value={palette}>
          {motionOK && <ReactLenis root options={{ anchors: true, lerp: 0.12 }} />}
          {children}
          {loaded && <CommandPalette open={open} onOpenChange={palette.setOpen} />}
        </PaletteContext.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}

/** Moves the rim light and sheen of any [data-glass] surface to follow the pointer. */
function useGlassPointer(): void {
  const finePointer = useFinePointer();
  useEffect(() => {
    if (!finePointer) return;
    const onMove = (event: PointerEvent) => {
      const surface = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-glass]') : null;
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
      surface.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, [finePointer]);
}
