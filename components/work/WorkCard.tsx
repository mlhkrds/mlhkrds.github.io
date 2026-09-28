'use client';

import type { PointerEvent } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import { WorkAreaIcon } from '@/components/ui/Icons';
import type { WorkArea } from '@/lib/content';
import { useFinePointer, useMotionOK } from '@/lib/hooks';
import styles from './Work.module.css';

const spring = { stiffness: 300, damping: 20, mass: 0.5 };

/** The icon drifts toward the pointer; the card only lifts, since 3D tilt blurs text on glass. */
export function WorkCard({ area }: { area: WorkArea }) {
  const motionOK = useMotionOK();
  const finePointer = useFinePointer();
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!motionOK || !finePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 14);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 14);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <article className={`panel ${styles.card}`} data-glass="" onPointerMove={onPointerMove} onPointerLeave={reset}>
      <m.span className={styles.icon} style={{ x, y }}>
        <WorkAreaIcon icon={area.icon} />
      </m.span>
      <h3>{area.title}</h3>
      <p>{area.text}</p>
    </article>
  );
}
