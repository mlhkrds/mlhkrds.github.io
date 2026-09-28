'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useLenis } from 'lenis/react';
import { applyLens } from '@/lib/lens';
import { setPreferences, usePreferences } from '@/lib/preferences';
import { sections, site } from '@/lib/site';
import styles from './CommandPalette.module.css';

type CommandPaletteProps = { open: boolean; onOpenChange: (open: boolean) => void };

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const lenis = useLenis();
  const preferences = usePreferences();
  const [copied, setCopied] = useState(false);

  // Lenis would otherwise keep scrolling the page under the open dialog.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    let cleanup: () => void = () => undefined;
    const frame = requestAnimationFrame(() => {
      const content = document.querySelector<HTMLElement>('[cmdk-dialog]');
      if (content) cleanup = applyLens(content, 'lens-palette', 24);
    });
    return () => {
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [open]);

  const close = () => onOpenChange(false);

  const goTo = (id: string) => {
    close();
    // Wait a frame so the dialog's scroll lock is gone before scrolling.
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView();
    });
  };

  const openLink = (url: string) => {
    close();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      overlayClassName={styles.overlay}
      contentClassName={`glass ${styles.content}`}
      className={styles.command}
      loop
    >
      <Command.Input className={styles.input} placeholder="Jump to a section or open a link…" />
      <Command.List className={styles.list} data-lenis-prevent="">
        <Command.Empty className={styles.empty}>No results.</Command.Empty>

        <Command.Group heading="Navigate" className={styles.group}>
          {sections.map((section) => (
            <Command.Item key={section.id} value={`go to ${section.label}`} onSelect={() => goTo(section.id)} className={styles.item}>
              {section.label}
              <span className={styles.hint}>Section</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Links" className={styles.group}>
          <Command.Item value="linkedin" onSelect={() => openLink(site.links.linkedin)} className={styles.item}>
            LinkedIn<span className={styles.hint}>Opens in a new tab</span>
          </Command.Item>
          <Command.Item value="github" onSelect={() => openLink(site.links.github)} className={styles.item}>
            GitHub<span className={styles.hint}>Opens in a new tab</span>
          </Command.Item>
          <Command.Item value="x twitter" onSelect={() => openLink(site.links.x)} className={styles.item}>
            X<span className={styles.hint}>Opens in a new tab</span>
          </Command.Item>
          {site.email && (
            <Command.Item value="copy email" onSelect={() => copy(site.email ?? '')} className={styles.item}>
              Copy email<span className={styles.hint}>{site.email}</span>
            </Command.Item>
          )}
          {site.cvUrl && (
            <Command.Item value="download cv" onSelect={() => openLink(site.cvUrl ?? '')} className={styles.item}>
              Download CV<span className={styles.hint}>PDF</span>
            </Command.Item>
          )}
        </Command.Group>

        <Command.Group heading="Preferences" className={styles.group}>
          <Command.Item value="copy site link" onSelect={() => copy(site.url)} className={styles.item}>
            {copied ? 'Copied' : 'Copy site link'}
            <span className={styles.hint}>mlhkrds.dev</span>
          </Command.Item>
          <Command.Item
            value="reduce motion"
            onSelect={() => setPreferences({ motion: preferences.motion === 'reduce' ? 'auto' : 'reduce' })}
            className={styles.item}
          >
            Reduce motion<span className={styles.hint}>{preferences.motion === 'reduce' ? 'On' : 'Off'}</span>
          </Command.Item>
          <Command.Item
            value="glass clear tinted"
            onSelect={() => setPreferences({ glass: preferences.glass === 'tinted' ? 'clear' : 'tinted' })}
            className={styles.item}
          >
            Glass<span className={styles.hint}>{preferences.glass === 'tinted' ? 'Tinted' : 'Clear'}</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
      <footer className={styles.footer} aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> select</span>
        <span><kbd>esc</kbd> close</span>
      </footer>
    </Command.Dialog>
  );
}
