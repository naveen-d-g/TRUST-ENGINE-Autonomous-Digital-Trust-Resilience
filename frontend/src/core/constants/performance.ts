/**
 * Performance optimization standards and utilities
 */

/**
 * Animation duration constants
 * Use these instead of magic numbers
 */
export const ANIMATION_DURATION = {
  fast: 200,      // 0.2s - Quick interactions
  normal: 400,    // 0.4s - Standard transitions
  slow: 600,      // 0.6s - Emphasis animations
} as const;

/**
 * Debounce delay constants
 */
export const DEBOUNCE_DELAY = {
  search: 500,    // Search input
  filter: 300,    // Filter inputs
  resize: 150,    // Window resize
} as const;

/**
 * Memoization helper - checks if deps have changed
 */
export function depsChanged(prevDeps: unknown[], nextDeps: unknown[]): boolean {
  if (prevDeps.length !== nextDeps.length) return true;
  return prevDeps.some((dep, i) => !Object.is(dep, nextDeps[i]));
}

/**
 * Performance monitoring hook helper
 */
export function measurePerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  if (duration > 16.67) { // Slower than 60fps
    console.warn(`⚠️ Performance: ${label} took ${duration.toFixed(2)}ms`);
  }
}

/**
 * Lazy load component helper
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = React.lazy(factory);
  (Component as any).preload = factory;
  return Component;
}

import React from 'react';
