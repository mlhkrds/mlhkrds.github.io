'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useMotionValueEvent, useScroll } from 'motion/react';
import { usePalette } from '@/components/providers/Providers';
import { GitHubIcon, LinkedInIcon, XIcon } from '@/components/ui/Icons';
import { useLens } from '@/lib/lens';
import { type SectionId, sections, site } from '@/lib/site';
import styles from './Nav.module.css';

const navSections = sections.filter((section) => section.inNav);

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const { setOpen } = usePalette();
  const { scrollY, scrollYProgress } = useScroll();
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [shortcut, setShortcut] = useState('⌘K');

  useLens(navRef, 'lens-nav', 29);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut('Ctrl K');
  }, []);

  // iOS 26 tab bar behaviour: tighten while reading down, open up again on the way back. It waits until the
  // portrait has docked, because shrinking moves the avatar socket out from under the landing portrait.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    const docked = document.documentElement.hasAttribute('data-docked');
    setCompact(docked && y > 160 && y > previous);
  });

  // Every section is watched, so the pill clears while reading one that isn't in the nav (story, now).
  useEffect(() => {
    const targets = sections.map((section) => document.getElementById(section.id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id as SectionId;
        setActive(navSections.some((section) => section.id === id) ? id : null);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.shell}>
      <nav ref={navRef} className={`glass ${styles.nav}`} data-glass="" data-compact={compact || undefined} aria-label="Main">
        <a className={styles.brand} href="#top" aria-label="mlhkrds.dev, back to top">
          <span className={styles.avatar} data-avatar-slot="" aria-hidden="true">
            <span className={styles.monogram}>m</span>
            <img src="/portrait/avatar-128.webp" alt="" width={32} height={32} />
          </span>
          <span className={styles.brandText}>
            mlhkrds<span>.dev</span>
          </span>
        </a>

        <ul className={styles.links}>
          {navSections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined}>
                {active === section.id && <m.span layoutId="nav-pill" className={styles.pill} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                <span className={styles.label}>{section.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.command} onClick={() => setOpen(true)} aria-label="Open command palette">
            <span className={styles.menuIcon} aria-hidden="true" />
            <kbd>{shortcut}</kbd>
          </button>
          <a className={styles.icon} href={site.links.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer">
            <GitHubIcon />
          </a>
          <a className={styles.icon} href={site.links.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <LinkedInIcon />
          </a>
          <a className={styles.icon} href={site.links.x} aria-label="X" target="_blank" rel="noopener noreferrer">
            <XIcon />
          </a>
        </div>

        <m.span className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </nav>
    </header>
  );
}
