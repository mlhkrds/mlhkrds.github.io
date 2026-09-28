'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties, useRef } from 'react';
import { useIdle, useMotionOK } from '@/lib/hooks';
import portrait from '@/lib/portrait-meta.json';
import { dissolveMask } from './dissolve';
import { useDock } from './useDock';
import styles from './HeroPortrait.module.css';

const PortraitScene = dynamic(() => import('./PortraitScene'), { ssr: false });

const widths = [640, 960, 1440];
const srcSet = (format: 'avif' | 'webp') => widths.map((w) => `/portrait/portrait-${w}.${format} ${w}w`).join(', ');
const sizes = '(max-width: 900px) 92vw, 620px';
const frameStyle: CSSProperties = { maskImage: dissolveMask, WebkitMaskImage: dissolveMask };

export function HeroPortrait() {
  const motionOK = useMotionOK();
  const idle = useIdle();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const progress = useDock(frameRef, motionOK);
  const saveData = typeof navigator !== 'undefined' && 'connection' in navigator && (navigator.connection as { saveData?: boolean }).saveData === true;

  return (
    <>
      <div ref={frameRef} className={styles.portrait} style={frameStyle}>
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
          />
        </picture>
      </div>
      {/* Reduced motion still gets the stars, as one settled frame; the key swaps modes cleanly at runtime. */}
      {idle && !saveData && (
        <PortraitScene key={motionOK ? 'live' : 'still'} still={!motionOK} imageRef={imageRef} frameRef={frameRef} progress={progress} />
      )}
    </>
  );
}
