'use client';

import { useEffect, useRef } from 'react';
import { useIdle, useMotionOK } from '@/lib/hooks';
import styles from './Backdrop.module.css';

type Star = { x: number; y: number; depth: number; size: number; sprite: number; alpha: number; phase: number; rate: number };

// White, blue, violet and cyan, as in the hero's stars.
const PALETTE = ['242 245 255', '158 184 255', '199 168 255', '153 235 255'];
const DEPTHS = [0.06, 0.14, 0.28];
const AREA_PER_STAR = 45000;

/**
 * Stars left in the page once the portrait has poured into the nav: a faint few, behind the content,
 * drifting with the scroll at three depths. They appear as the hero leaves, so the hero keeps its own star field.
 */
export function PageStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionOK = useMotionOK();
  const idle = useIdle();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!idle || !canvas || !context) return;

    const sprites = PALETTE.flatMap((rgb) => [sprite(rgb, false), sprite(rgb, true)]);
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    let lastScroll = 0;

    const seed = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      width = innerWidth;
      height = innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round((width * height) / AREA_PER_STAR) }, () => {
        const flare = Math.random() < 0.03;
        return {
          x: Math.random(),
          y: Math.random(),
          depth: DEPTHS[Math.floor(Math.random() * DEPTHS.length)],
          size: flare ? 18 + Math.random() * 10 : 5 + Math.random() * 5,
          sprite: Math.floor(Math.random() * PALETTE.length) * 2 + (flare ? 1 : 0),
          alpha: 0.15 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
          rate: 0.6 + Math.random() * 1.4,
        };
      });
    };

    const draw = (now: number) => {
      frameId = 0;
      const scroll = scrollY;
      // Fades in while the portrait docks, over the first screen of scrolling.
      const fade = Math.min(1, Math.max(0, (scroll - height * 0.35) / (height * 0.45)));
      context.clearRect(0, 0, width, height);
      if (fade === 0) return;
      context.globalCompositeOperation = 'lighter';
      const span = height + 80;
      for (const star of stars) {
        const shift = motionOK ? scroll * star.depth : 0;
        const y = ((((star.y * span - shift) % span) + span) % span) - 40;
        const twinkle = motionOK ? 0.75 + 0.25 * Math.sin((now / 1000) * star.rate + star.phase) : 1;
        context.globalAlpha = fade * star.alpha * twinkle;
        context.drawImage(sprites[star.sprite], star.x * width - star.size / 2, y - star.size / 2, star.size, star.size);
      }
      context.globalAlpha = 1;
      if (motionOK) loop();
    };

    // Every frame while scrolling, 30 fps for the twinkle otherwise.
    const loop = () => {
      if (frameId || document.hidden) return;
      frameId = requestAnimationFrame((now) => {
        frameId = 0;
        if (now - lastScroll > 200 && now - lastFrame < 32) {
          loop();
          return;
        }
        lastFrame = now;
        draw(now);
      });
    };
    const onScroll = () => {
      lastScroll = performance.now();
      if (!frameId) frameId = requestAnimationFrame(draw);
    };
    const onResize = () => {
      seed();
      onScroll();
    };

    seed();
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onScroll);
    return () => {
      cancelAnimationFrame(frameId);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onScroll);
    };
  }, [idle, motionOK]);

  return <canvas ref={canvasRef} className={styles.stars} />;
}

/** A soft star with a white core; flares get a faint diffraction cross. */
function sprite(rgb: string, flare: boolean): HTMLCanvasElement {
  const size = flare ? 96 : 48;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const glow = context.createRadialGradient(half, half, 0, half, half, half);
  glow.addColorStop(0, 'rgb(255 255 255 / 1)');
  glow.addColorStop(0.08, `rgb(${rgb} / 0.9)`);
  glow.addColorStop(0.3, `rgb(${rgb} / 0.22)`);
  glow.addColorStop(1, `rgb(${rgb} / 0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);
  if (flare) {
    context.globalCompositeOperation = 'lighter';
    for (const horizontal of [true, false]) {
      const ray = horizontal ? context.createLinearGradient(0, half, size, half) : context.createLinearGradient(half, 0, half, size);
      ray.addColorStop(0, `rgb(${rgb} / 0)`);
      ray.addColorStop(0.5, 'rgb(255 255 255 / 0.85)');
      ray.addColorStop(1, `rgb(${rgb} / 0)`);
      context.fillStyle = ray;
      if (horizontal) context.fillRect(0, half - 0.75, size, 1.5);
      else context.fillRect(half - 0.75, 0, 1.5, size);
    }
  }
  return canvas;
}
