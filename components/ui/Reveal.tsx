'use client';

import type { ReactNode } from 'react';
import { m } from 'motion/react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article' | 'header';
};

/**
 * Fades a block up once it enters the viewport. Never wrap a `.glass` element with it: animating a
 * parent's opacity makes the glass sample only that parent and look flat.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const Component = m[as];
  return (
    <Component
      className={className}
      data-reveal=""
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </Component>
  );
}
