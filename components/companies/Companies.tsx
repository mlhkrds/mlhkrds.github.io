import type { CSSProperties } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { companies } from '@/lib/content';
import styles from './Companies.module.css';

type LogoVars = CSSProperties & { '--w': string };

export function Companies() {
  return (
    <section className={`container ${styles.companies}`} aria-labelledby="companies-title">
      <p className={`kicker ${styles.kicker}`} id="companies-title">
        {companies.kicker}
      </p>
      <Reveal>
        <ul className={`panel ${styles.row}`} data-glass="" data-sheen="off">
          {companies.items.map((company) => {
            const vars: LogoVars = { '--w': `${company.width}px` };
            return (
              <li key={company.name} className={company.current ? styles.current : undefined}>
                <img src={company.logo} alt={company.name} width={company.width} height={company.height} style={vars} />
                {company.current && (
                  <span className={styles.pill}>
                    <span className={styles.dot} aria-hidden="true" />
                    Current
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
