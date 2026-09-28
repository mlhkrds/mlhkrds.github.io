import { footer } from '@/lib/content';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={`container ${styles.footer}`}>
      <p>{footer.copyright}</p>
      <p>{footer.note}</p>
    </footer>
  );
}
