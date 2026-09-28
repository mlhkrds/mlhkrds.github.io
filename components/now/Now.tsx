import { Reveal } from '@/components/ui/Reveal';
import { now, principles } from '@/lib/content';
import styles from './Now.module.css';

/** "Now" and "Principles" side by side: what I'm doing, and how I like to do it. */
export function Now() {
  return (
    <section id="now" className={`container section ${styles.section}`}>
      <Reveal className={styles.nowCell}>
        <div className={`panel ${styles.now}`} data-glass="">
          <p className="kicker">{now.kicker}</p>
          <h2>{now.title}</h2>
          <p className={styles.updated}>
            <span className={styles.pulse} aria-hidden="true" />
            {now.updated}
          </p>
          <ul className={styles.items}>
            {now.items.map((item) => (
              <li key={item.label}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.text}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <div id="principles" className={styles.principles}>
        <Reveal>
          <p className="kicker">{principles.kicker}</p>
          <h2>{principles.title}</h2>
        </Reveal>
        <ol className={styles.list}>
          {principles.items.map((item, index) => (
            <Reveal key={item.title} as="li" delay={index * 0.06}>
              <div className={`panel ${styles.principle}`} data-glass="">
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
