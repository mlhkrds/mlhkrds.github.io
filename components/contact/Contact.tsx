import { MagneticLink } from '@/components/ui/MagneticLink';
import { contact } from '@/lib/content';
import { site } from '@/lib/site';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <section id="contact" className="container section">
      <div className={`glass ${styles.cta}`} data-glass="">
        <div className={styles.glow} aria-hidden="true" />
        <p className="kicker">{contact.kicker}</p>
        <h2>{contact.title}</h2>
        <p className={styles.text}>{contact.text}</p>
        <div className={`actions ${styles.actions}`}>
          <MagneticLink href={site.links.linkedin} className="btn btn-primary" external>
            {contact.linkedin}
          </MagneticLink>
          <MagneticLink href={site.links.github} className="btn btn-glass" external>
            {contact.github}
          </MagneticLink>
          <MagneticLink href={site.links.x} className="btn btn-glass" external>
            {contact.x}
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
