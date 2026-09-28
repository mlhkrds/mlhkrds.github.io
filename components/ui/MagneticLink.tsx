'use client';

import type { PointerEvent, ReactNode } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, useMotionOK } from '@/lib/hooks';

type MagneticLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  external?: boolean;
};

const spring = { stiffness: 300, damping: 20, mass: 0.5 };

/** A link that leans toward the pointer. */
export function MagneticLink({ href, className, children, external }: MagneticLinkProps) {
  const motionOK = useMotionOK();
  const finePointer = useFinePointer();
  const enabled = motionOK && finePointer;
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.32);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.a
      href={href}
      className={className}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </m.a>
  );
}
