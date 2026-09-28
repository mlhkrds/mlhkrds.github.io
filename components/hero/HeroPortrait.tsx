'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { m } from 'motion/react';
import { useIdle, useMotionOK } from '@/lib/hooks';
import portrait from '@/lib/portrait-meta.json';
import { useDock } from './useDock';
import styles from './HeroPortrait.module.css';

const PortraitGL = dynamic(() => import('./PortraitGL'), { ssr: false });

const widths = [640, 960, 1440];
const srcSet = (format: 'avif' | 'webp') => widths.map((w) => `/portrait/portrait-${w}.${format} ${w}w`).join(', ');
const sizes = '(max-width: 900px) 92vw, 620px';

export function HeroPortrait() {
  const motionOK = useMotionOK();
  const idle = useIdle();
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [glReady, setGlReady] = useState(false);
  const dock = useDock(wrapRef, motionOK);
  const saveData = typeof navigator !== 'undefined' && 'connection' in navigator && (navigator.connection as { saveData?: boolean }).saveData === true;

  return (
    // Remounted when the motion mode flips, so Motion starts from clean styles instead of stale ones.
    <m.div key={motionOK ? 'motion' : 'static'} ref={wrapRef} className={styles.portrait} style={dock.style}>
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          ref={imageRef}
          className={styles.image}
          src="/portrait/portrait-960.webp"
          alt="Melih Karadaş"
          width={portrait.width}
          height={portrait.height}
          fetchPriority="high"
          data-hidden={glReady || undefined}
        />
      </picture>
      {motionOK && idle && !saveData && <PortraitGL imageRef={imageRef} dockProgress={dock.progress} onReady={setGlReady} />}
    </m.div>
  );
}
