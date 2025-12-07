import type { BezierGraphState } from '../types/params';

const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const calcBezier = (t: number, a: number, b: number) =>
  ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;

const getSlope = (t: number, a: number, b: number) =>
  3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;

const binarySubdivide = (x: number, a: number, b: number, mX1: number, mX2: number) => {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = a + (b - a) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0) {
      b = currentT;
    } else {
      a = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
};

const solveCurveX = (x: number, mX1: number, mX2: number): number => {
  let guessT = x;
  for (let i = 0; i < 8; i += 1) {
    const currentSlope = getSlope(guessT, mX1, mX2);
    const currentX = calcBezier(guessT, mX1, mX2) - x;
    if (Math.abs(currentX) < SUBDIVISION_PRECISION) {
      return guessT;
    }
    if (Math.abs(currentSlope) < NEWTON_MIN_SLOPE) {
      break;
    }
    guessT -= currentX / currentSlope;
  }
  return binarySubdivide(x, 0, 1, mX1, mX2);
};

export const evaluateBezier = (t: number, curve: BezierGraphState): number => {
  const clampedT = Math.min(Math.max(t, 0), 1);
  const solvedT = solveCurveX(clampedT, curve.x1, curve.x2);
  return calcBezier(solvedT, curve.y1, curve.y2);
};
