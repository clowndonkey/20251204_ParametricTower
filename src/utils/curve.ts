import type { GradientCurve } from '../types/params';

const easeInQuad = (t: number) => t * t;
const easeOutQuad = (t: number) => t * (2 - t);
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const applyCurve = (t: number, curve: GradientCurve): number => {
  const clamped = Math.min(Math.max(t, 0), 1);

  switch (curve) {
    case 'easeInQuad':
      return easeInQuad(clamped);
    case 'easeOutQuad':
      return easeOutQuad(clamped);
    case 'easeInOutQuad':
      return easeInOutQuad(clamped);
    case 'linear':
    default:
      return clamped;
  }
};
