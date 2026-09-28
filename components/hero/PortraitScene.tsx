'use client';

import { type RefObject, useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { Geometry, Mesh, Plane, Program, Renderer, Texture } from 'ogl';
import { useFinePointer } from '@/lib/hooks';
import { sampleStars } from './starField';
import { dockDistance } from './useDock';
import { photoFragment, photoVertex, starFragment, starVertex } from './portraitShaders';
import { WindField } from './windField';
import styles from './HeroPortrait.module.css';

type PortraitSceneProps = {
  imageRef: RefObject<HTMLImageElement | null>;
  frameRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  /** Reduced motion: one settled frame with no intro, pointer or docking. */
  still: boolean;
};

const smooth = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/**
 * Takes over from the <img> once it has decoded. The photo stays sharp down to the shoulders, stars climb in
 * to complete the body and a slow skirt of stardust flares from the bottom; the pointer blows through them
 * like wind. On scroll the whole photo breaks into stars that pour into the nav avatar, with a few left
 * drifting in the page. The <img> stays the LCP element and the fallback.
 */
export default function PortraitScene({ imageRef, frameRef, progress, still }: PortraitSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();

  useEffect(() => {
    const host = hostRef.current;
    const photo = imageRef.current;
    const frame = frameRef.current;
    if (!host || !photo || !frame) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    } catch {
      return; // No WebGL: the <img> simply stays.
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = styles.sceneCanvas;
    gl.clearColor(0, 0, 0, 0);
    const pointRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | null;
    const windy = !still && finePointer && (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number) > 0;
    const wind = new WindField();
    const windTexture = new Texture(gl, {
      image: wind.data,
      width: wind.columns,
      height: wind.rows,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      flipY: false,
    });
    const shared = {
      uRect: { value: [0, 0, 1, 1] },
      uViewport: { value: [1, 1] },
      uDock: { value: 0 },
      uDistance: { value: dockDistance() },
      uTime: { value: still ? 60 : 0 },
    };
    const slot = { value: [0, 0, 19] };
    const shield = { value: [-9999, -9999, 0, 0] };
    const live = { value: 0 };

    let stars: Mesh | null = null;
    let picture: Mesh | null = null;
    let socket: HTMLElement | null = null;
    let copyBlock: Element | null = null;
    let frameId = 0;
    let visible = true;
    let disposed = false;
    let started = 0;
    let lastFrame = 0;
    let last = { x: 0, y: 0, time: -1 };
    let stopProgress = () => {};

    const resize = () => {
      renderer.setSize(host.offsetWidth, host.offsetHeight);
      shared.uViewport.value = [host.offsetWidth, host.offsetHeight];
      shared.uDistance.value = dockDistance();
    };

    // Measured every frame: the portrait scrolls with the page while the nav avatar stays put.
    const place = () => {
      const hostRect = host.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      shared.uRect.value = [frameRect.left - hostRect.left, frameRect.top - hostRect.top, frameRect.width, frameRect.height];
      if (!copyBlock?.isConnected) copyBlock = host.parentElement?.querySelector('[data-hero-copy]') ?? null;
      const copy = copyBlock?.getBoundingClientRect();
      if (copy) shield.value = [copy.left + copy.width / 2 - hostRect.left, copy.top + copy.height / 2 - hostRect.top, copy.width / 2, copy.height / 2];
      if (!socket?.isConnected) socket = document.querySelector<HTMLElement>('[data-avatar-slot]');
      if (!socket) return;
      const rect = socket.getBoundingClientRect();
      slot.value = [rect.left + rect.width / 2 - hostRect.left, rect.top + rect.height / 2 - hostRect.top, rect.width / 2];
    };

    // The avatar glows while the stars pour in and its "m" fades as it fills.
    const fill = (p: number) => {
      socket?.style.setProperty('--fill', smooth(0.45, 0.92, p).toFixed(3));
      socket?.style.setProperty('--glow', (smooth(0.35, 0.8, p) * (1 - smooth(0.93, 1, p))).toFixed(3));
    };

    const render = (now: number) => {
      frameId = 0;
      if (disposed || !stars) return;
      const p = still ? 0 : progress.get();
      const t = (now - started) / 1000;
      // The skirt never stops, but once nothing else moves 30 fps is plenty for it and keeps laptops cool.
      if (!still && p === 0 && t > 4 && !wind.active && now - lastFrame < 30) {
        wake();
        return;
      }

      if (wind.active) {
        wind.step(Math.min(0.05, (now - (lastFrame || now - 16)) / 1000));
        windTexture.needsUpdate = true;
      }
      lastFrame = now;

      place();
      if (!still) fill(p);
      // Once docked the avatar has the portrait, so the full-screen layer steps aside until the page
      // comes back up.
      const away = !still && p >= 0.999;
      host.style.visibility = away ? 'hidden' : '';
      if (away) return;

      shared.uDock.value = p;
      if (!still) {
        shared.uTime.value = t;
        live.value = smooth(0, 2, t);
      }
      // Above the nav glass only while the stars pour into the avatar.
      host.style.zIndex = p > 0.05 ? '60' : '';
      renderer.render({ scene: stars });
      if (picture) renderer.render({ scene: picture, clear: false });
      if (!still) wake();
    };
    const wake = () => {
      if (!frameId && visible && !disposed) frameId = requestAnimationFrame(render);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const elapsed = event.timeStamp - last.time;
      const dx = x - last.x;
      const dy = y - last.y;
      // The first move, or one after a pause, only sets the starting point: a jump is not a gust.
      const fresh = last.time < 0 || elapsed > 200;
      last = { x, y, time: event.timeStamp };
      const moved = Math.hypot(dx, dy);
      if (fresh || moved < 2) return;
      wind.blow(x, y, dx, dy, (moved / Math.max(8, elapsed)) * 1000, host.offsetWidth, host.offsetHeight);
      wake();
    };
    const onVisibility = () => {
      visible = !document.hidden;
      wake();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      disposed = true;
      cancelAnimationFrame(frameId);
      photo.removeAttribute('data-hidden');
      canvas.remove();
    };
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (still) render(performance.now());
      else wake();
    });

    const start = () => {
      const field = sampleStars(photo, innerWidth < 900 ? 0.45 : 1);
      const starProgram = new Program(gl, {
        vertex: starVertex(windy),
        fragment: starFragment,
        uniforms: {
          ...shared,
          uSlot: slot,
          uShield: shield,
          uPixelRatio: { value: renderer.dpr },
          uMaxPoint: { value: pointRange?.[1] ?? 64 },
          uWind: { value: windTexture },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      starProgram.setBlendFunc(gl.ONE, gl.ONE);
      const starGeometry = new Geometry(gl, {
        position: { size: 2, data: field.home },
        props: { size: 4, data: field.props },
        motion: { size: 4, data: field.motion },
        fate: { size: 4, data: field.fate },
        color: { size: 3, data: field.color },
      });
      stars = new Mesh(gl, { mode: gl.POINTS, geometry: starGeometry, program: starProgram });

      // The photo only moves into WebGL when it has to break apart on scroll. Still, the <img> stays and
      // the stars simply fade in beneath it.
      if (!still) {
        const texture = new Texture(gl, { image: photo, generateMipmaps: false, minFilter: gl.LINEAR, premultiplyAlpha: true });
        const photoProgram = new Program(gl, {
          vertex: photoVertex,
          fragment: photoFragment,
          uniforms: { ...shared, uImage: { value: texture }, uLive: live },
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });
        picture = new Mesh(gl, { geometry: new Plane(gl), program: photoProgram });
      }

      // Drawn once before it is shown, so the hand-over from the <img> cannot be seen.
      host.appendChild(canvas);
      resize();
      started = performance.now();
      render(started);
      host.dataset.ready = '';
      resizeObserver.observe(host);
      if (!still) {
        photo.setAttribute('data-hidden', '');
        if (windy) addEventListener('pointermove', onPointer, { passive: true });
        stopProgress = progress.on('change', wake);
      }
    };

    photo
      .decode()
      .then(() => {
        if (!disposed) start();
      })
      .catch(() => undefined);

    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      stopProgress();
      removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      photo.removeAttribute('data-hidden');
      socket?.style.removeProperty('--fill');
      socket?.style.removeProperty('--glow');
      delete host.dataset.ready;
      host.style.zIndex = '';
      host.style.visibility = '';
    };
  }, [imageRef, frameRef, progress, still, finePointer]);

  return <div ref={hostRef} className={styles.scene} data-still={still ? '' : undefined} aria-hidden="true" />;
}
