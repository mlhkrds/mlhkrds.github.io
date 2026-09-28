'use client';

import { type RefObject, useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import { useFinePointer } from '@/lib/hooks';
import { fragment, vertex } from './shaders';
import styles from './HeroPortrait.module.css';

type PortraitGLProps = {
  imageRef: RefObject<HTMLImageElement | null>;
  dockProgress: MotionValue<number>;
  onReady: (ready: boolean) => void;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  return image.decode().then(() => image);
}

/** Draws the portrait with depth parallax. The static <img> underneath stays the LCP and the fallback. */
export default function PortraitGL({ imageRef, dockProgress, onReady }: PortraitGLProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();

  useEffect(() => {
    const host = hostRef.current;
    const photo = imageRef.current;
    if (!host || !photo) return;

    const renderer = new Renderer({
      dpr: Math.min(devicePixelRatio, 1.5),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    gl.clearColor(0, 0, 0, 0);
    canvas.className = styles.canvas;

    const color = new Texture(gl, { generateMipmaps: false });
    const depth = new Texture(gl, { generateMipmaps: false });
    const offset = [0, 0];
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: { uColor: { value: color }, uDepth: { value: depth }, uOffset: { value: offset }, uStrength: { value: 0.045 } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const target = [0, 0];
    let frame = 0;
    let visible = true;
    let disposed = false;

    const draw = () => renderer.render({ scene: mesh });
    const tick = () => {
      frame = 0;
      const docking = dockProgress.get() > 0.001;
      const tx = docking ? 0 : target[0];
      const ty = docking ? 0 : target[1];
      offset[0] += (tx - offset[0]) * 0.08;
      offset[1] += (ty - offset[1]) * 0.08;
      draw();
      if (Math.abs(tx - offset[0]) > 0.0005 || Math.abs(ty - offset[1]) > 0.0005) wake();
    };
    const wake = () => {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      target[0] = (event.clientX / innerWidth) * 2 - 1;
      target[1] = -((event.clientY / innerHeight) * 2 - 1);
      wake();
    };
    const onScroll = () => {
      target[1] = Math.min(1, scrollY / innerHeight) * -1.2;
      wake();
    };
    const onVisibility = () => {
      visible = !document.hidden;
      wake();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      disposed = true;
      cancelAnimationFrame(frame);
      onReady(false);
    };

    const resize = new ResizeObserver(() => {
      renderer.setSize(host.offsetWidth, host.offsetHeight);
      draw();
    });
    const inView = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && !document.hidden;
      wake();
    });

    Promise.all([photo.decode().then(() => photo), loadImage('/portrait/depth-512.webp')])
      .then(([colorImage, depthImage]) => {
        if (disposed) return;
        color.image = colorImage;
        depth.image = depthImage;
        host.appendChild(canvas);
        renderer.setSize(host.offsetWidth, host.offsetHeight);
        draw();
        host.dataset.ready = '';
        onReady(true);
        resize.observe(host);
        inView.observe(host);
        if (finePointer) addEventListener('pointermove', onPointer, { passive: true });
        else addEventListener('scroll', onScroll, { passive: true });
      })
      .catch(() => onReady(false));

    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      inView.disconnect();
      removeEventListener('pointermove', onPointer);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      delete host.dataset.ready;
      onReady(false);
    };
  }, [imageRef, dockProgress, onReady, finePointer]);

  return <div ref={hostRef} className={styles.gl} aria-hidden="true" />;
}
