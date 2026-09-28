'use client';

import { useRef, useState } from 'react';
import { type MotionValue, m, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { WordReveal } from '@/components/ui/WordReveal';
import { type StoryStep, story } from '@/lib/content';
import { useMotionOK } from '@/lib/hooks';
import styles from './Story.module.css';

const STEPS = story.steps.length;

/** A pinned stage: scrolling opens the SDK layers one by one while the matching step is narrated. */
export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  const spread = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.3, 0.8, 1.4, 1.4]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [60, 50]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-42, -30]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setActive(Math.min(STEPS - 1, Math.floor(value * STEPS)));
  });

  return (
    <section id="story" ref={sectionRef} className={styles.story} data-static={motionOK ? undefined : ''}>
      <div className={styles.stage}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.copy}>
            <p className="kicker">{story.kicker}</p>
            <h2>{story.title}</h2>
            <ol className={styles.steps}>
              {story.steps.map((step, index) => (
                <Step key={step.title} step={step} index={index} progress={scrollYProgress} active={!motionOK || index === active} animate={motionOK} />
              ))}
            </ol>
          </div>
          <div className={styles.visual} aria-hidden="true">
            <m.div key={motionOK ? 'motion' : 'static'} className={styles.stack} style={motionOK ? { rotateX, rotateZ } : undefined}>
              {story.steps.map((step, index) => (
                <Plate key={step.title} step={step} index={index} spread={spread} active={!motionOK || index === active} animate={motionOK} />
              ))}
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}

type StepProps = { step: StoryStep; index: number; progress: MotionValue<number>; active: boolean; animate: boolean };

function Step({ step, index, progress, active, animate }: StepProps) {
  const start = index / STEPS;
  const words = useTransform(progress, [start, start + 0.8 / STEPS], [0, 1]);
  return (
    <li className={styles.step} data-active={active ? '' : undefined}>
      <p className={styles.stepKicker}>{step.plate}</p>
      <h3>{step.title}</h3>
      {animate ? <WordReveal text={step.text} progress={words} className={styles.text} /> : <p className={styles.text}>{step.text}</p>}
    </li>
  );
}

type PlateProps = { step: StoryStep; index: number; spread: MotionValue<number>; active: boolean; animate: boolean };

function Plate({ step, index, spread, active, animate }: PlateProps) {
  const z = useTransform(spread, (value) => index * 110 * value);
  const [number, name] = step.plate.split(' · ');
  return (
    <m.div className={`${styles.plate} ${styles[`plate${index}`]}`} data-active={active ? '' : undefined} style={{ z: animate ? z : index * 130 }}>
      <span className={styles.plateKicker}>{number}</span>
      <strong>{name}</strong>
      <span className={styles.plateMeta}>{step.meta}</span>
    </m.div>
  );
}
