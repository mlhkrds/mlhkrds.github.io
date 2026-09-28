'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useScroll } from 'motion/react';
import { experience } from '@/lib/content';
import { useMotionOK } from '@/lib/hooks';
import styles from './Experience.module.css';

/** A timeline whose line fills as you read; the row nearest the centre of the screen lights up. */
export function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const motionOK = useMotionOK();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>(':scope > li') ?? []);
    const observer = new IntersectionObserver(
      (entries) => {
        const centred = entries.find((entry) => entry.isIntersecting);
        if (centred) setActive(rows.indexOf(centred.target as HTMLElement));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" className="container section">
      <div className={styles.grid}>
        <header className={styles.head}>
          <p className="kicker">{experience.kicker}</p>
          <h2>{experience.title}</h2>
        </header>
        <div className={styles.timeline}>
          <span className={styles.rail} aria-hidden="true">
            <m.span key={motionOK ? 'motion' : 'static'} className={styles.fill} style={{ scaleY: motionOK ? scrollYProgress : 1 }} />
          </span>
          <ol ref={listRef} className={styles.list}>
            {experience.jobs.map((job, index) => (
              <li key={job.company} className={styles.row} data-active={index === active ? '' : undefined}>
                <span className={styles.node} aria-hidden="true" />
                <img className={styles.logo} src={job.logo} alt={job.company} style={{ width: job.logoWidth }} />
                <ul className={styles.roles}>
                  {job.roles.map((role) => (
                    <li key={role.title}>
                      <span className={styles.role}>{role.title}</span>
                      <span className={styles.period}>{role.period}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.summary}>{job.summary}</p>
                {job.tags.length > 0 && (
                  <ul className={styles.tags}>
                    {job.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
