import { Reveal } from '@/components/ui/Reveal';
import { about } from '@/lib/content';
import styles from './About.module.css';

export function About() {
  return (
    <section id="about" className="container section">
      <Reveal>
        <div className={`panel ${styles.about}`} data-glass="">
          <div>
            <p className="kicker">{about.kicker}</p>
            <h2>{about.title}</h2>
          </div>
          <div className={styles.prose}>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
