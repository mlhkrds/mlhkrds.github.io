import { Reveal } from '@/components/ui/Reveal';
import { work } from '@/lib/content';
import { WorkCard } from './WorkCard';
import styles from './Work.module.css';

export function Work() {
  return (
    <section id="work" className="container section">
      <header className="section-head">
        <p className="kicker">{work.kicker}</p>
        <h2>{work.title}</h2>
      </header>
      <div className={styles.cards}>
        {work.areas.map((area, index) => (
          <Reveal key={area.title} delay={(index % 3) * 0.06}>
            <WorkCard area={area} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
