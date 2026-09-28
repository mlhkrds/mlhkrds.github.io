import type { CSSProperties } from 'react';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { hero } from '@/lib/content';
import portrait from '@/lib/portrait-meta.json';
import { site } from '@/lib/site';
import { HeroPortrait } from './HeroPortrait';
import styles from './Hero.module.css';

type HeroVars = CSSProperties & { '--ratio': number };

export function Hero() {
  const vars: HeroVars = { '--ratio': portrait.width / portrait.height };
  return (
    <section id="top" className={styles.hero} style={vars} aria-labelledby="hero-title">
      {/* The name sits behind the portrait, like the clock on an iOS 26 lock screen. */}
      <h1 id="hero-title" className={styles.name}>
        <span>{hero.firstName}</span> <span>{hero.lastName}</span>
      </h1>
      <HeroPortrait />
      <div className={styles.copy}>
        <p className="badge">
          <span className="dot" />
          {hero.badge}
        </p>
        <p className={styles.lead}>{hero.lead}</p>
        <div className="actions">
          <MagneticLink href={site.links.linkedin} className="btn btn-primary" external>
            {hero.primaryCta}
          </MagneticLink>
          <MagneticLink href={site.links.github} className="btn btn-glass" external>
            {hero.secondaryCta}
          </MagneticLink>
        </div>
      </div>
      <p className={styles.scroll} aria-hidden="true">
        <span />
        Scroll
      </p>
    </section>
  );
}
