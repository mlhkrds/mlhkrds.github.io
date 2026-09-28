'use client';

import { useEffect } from 'react';
import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useFinePointer, useMotionOK } from '@/lib/hooks';
import styles from './Backdrop.module.css';

const orbSpring = { stiffness: 50, damping: 20 };
const SPOT = 340;

/** Fixed colour field behind everything: orbs drift against the pointer and slowly with the page. */
export function Backdrop() {
  const motionOK = useMotionOK();
  const finePointer = useFinePointer();
  const px = useSpring(useMotionValue(0), orbSpring);
  const py = useSpring(useMotionValue(0), orbSpring);
  const spotX = useSpring(useMotionValue(-SPOT * 2), { stiffness: 120, damping: 24 });
  const spotY = useSpring(useMotionValue(-SPOT * 2), { stiffness: 120, damping: 24 });
  const { scrollYProgress } = useScroll();

  const drift = useTransform(scrollYProgress, [0, 1], [0, motionOK ? -120 : 0]);
  const blueX = useTransform(px, (v) => v * -70);
  const blueY = useTransform(() => py.get() * -70 + drift.get());
  const violetX = useTransform(px, (v) => v * -110);
  const violetY = useTransform(() => py.get() * -110 - drift.get() * 0.6);
  const cyanX = useTransform(px, (v) => v * -50);
  const cyanY = useTransform(() => py.get() * -50 + drift.get() * 0.4);

  useEffect(() => {
    if (!motionOK || !finePointer) return;
    const onMove = (event: PointerEvent) => {
      px.set(event.clientX / innerWidth - 0.5);
      py.set(event.clientY / innerHeight - 0.5);
      spotX.set(event.clientX - SPOT);
      spotY.set(event.clientY - SPOT);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, [motionOK, finePointer, px, py, spotX, spotY]);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <m.div className={`${styles.orb} ${styles.blue}`} style={{ x: blueX, y: blueY }} />
      <m.div className={`${styles.orb} ${styles.violet}`} style={{ x: violetX, y: violetY }} />
      <m.div className={`${styles.orb} ${styles.cyan}`} style={{ x: cyanX, y: cyanY }} />
      {motionOK && finePointer && <m.div className={styles.spotlight} style={{ x: spotX, y: spotY }} />}
    </div>
  );
}
