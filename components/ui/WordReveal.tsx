'use client';

import { type MotionValue, m, useTransform } from 'motion/react';

type WordRevealProps = {
  text: string;
  progress: MotionValue<number>;
  className?: string;
};

/**
 * Lights words up one by one as `progress` goes from 0 to 1. Screen readers get the sentence once from
 * the hidden copy; the animated words are aria-hidden.
 */
export function WordReveal({ text, progress, className }: WordRevealProps) {
  const words = text.split(' ');
  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Word key={`${word}-${index}`} progress={progress} range={[index / words.length, (index + 1) / words.length]}>
            {word}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <m.span style={{ opacity }}>{children}</m.span>{' '}
    </>
  );
}
