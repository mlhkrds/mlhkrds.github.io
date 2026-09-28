'use client';

import { useSyncExternalStore } from 'react';

export type Preferences = { motion: 'auto' | 'reduce'; glass: 'clear' | 'tinted' };

const STORAGE_KEY = 'mk-prefs';
const DEFAULTS: Preferences = { motion: 'auto', glass: 'clear' };
const listeners = new Set<() => void>();
let current: Preferences | null = null;

function read(): Preferences {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    const value = typeof saved === 'object' && saved !== null ? (saved as Partial<Preferences>) : {};
    return {
      motion: value.motion === 'reduce' ? 'reduce' : 'auto',
      glass: value.glass === 'tinted' ? 'tinted' : 'clear',
    };
  } catch {
    return DEFAULTS;
  }
}

function snapshot(): Preferences {
  current ??= read();
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPreferences(patch: Partial<Preferences>): void {
  current = { ...snapshot(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Private mode or blocked storage: the toggle still works for this visit.
  }
  const root = document.documentElement;
  root.dataset.motion = current.motion === 'reduce' ? 'reduce' : '';
  root.dataset.glass = current.glass === 'tinted' ? 'tinted' : '';
  listeners.forEach((listener) => listener());
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, snapshot, () => DEFAULTS);
}
