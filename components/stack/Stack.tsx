'use client';

import { useEffect, useRef } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { stack } from '@/lib/content';
import { useFinePointer, useMotionOK } from '@/lib/hooks';
import styles from './Stack.module.css';

/** Technologies as tinted glass app icons; the ones nearest the pointer swell like the macOS Dock. */
export function Stack() {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionOK = useMotionOK();
  const finePointer = useFinePointer();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !motionOK || !finePointer) return;
    const lists = Array.from(root.querySelectorAll<HTMLElement>('[data-dock]'));
    const cleanups = lists.map((list) => {
      const icons = Array.from(list.querySelectorAll<HTMLElement>('[data-dock-icon]'));
      let centres: [number, number][] = [];
      let measuredAt = Number.NaN;

      const onMove = (event: PointerEvent) => {
        if (measuredAt !== scrollY) {
          centres = icons.map((icon) => {
            const rect = icon.getBoundingClientRect();
            return [rect.left + rect.width / 2, rect.top + rect.height / 2];
          });
          measuredAt = scrollY;
        }
        icons.forEach((icon, index) => {
          const [cx, cy] = centres[index] ?? [0, 0];
          const near = Math.max(0, 1 - Math.hypot(event.clientX - cx, event.clientY - cy) / 160);
          icon.style.setProperty('--near', (near * near).toFixed(3));
        });
      };
      const onLeave = () => {
        measuredAt = Number.NaN;
        icons.forEach((icon) => icon.style.removeProperty('--near'));
      };

      list.addEventListener('pointermove', onMove);
      list.addEventListener('pointerleave', onLeave);
      return () => {
        list.removeEventListener('pointermove', onMove);
        list.removeEventListener('pointerleave', onLeave);
        onLeave();
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [motionOK, finePointer]);

  return (
    <section id="stack" className="container section">
      <header className="section-head">
        <p className="kicker">{stack.kicker}</p>
        <h2>{stack.title}</h2>
      </header>
      <div ref={rootRef} className={styles.groups}>
        {stack.groups.map((group, index) => (
          <Reveal key={group.id} delay={index * 0.05} className={styles[group.id]}>
            <div className={`panel ${styles.group}`} data-glass="" data-sheen="off">
              <h3>{group.title}</h3>
              <ul className={styles.apps} data-dock="">
                {group.apps.map((app) => (
                  <li key={`${group.id}-${app.name}`} className={styles.app}>
                    <span className={styles.icon} data-dock-icon="">
                      <img src={`/icons/${app.icon}.svg`} alt="" width={30} height={30} loading="lazy" />
                    </span>
                    <span className={styles.name}>{app.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
