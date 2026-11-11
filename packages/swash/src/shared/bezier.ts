/**
 * Cubic bezier easing, ported from the ram animation module. Newton-Raphson
 * with a binary-subdivide fallback covers the flat-slope cases where Newton
 * alone stops converging.
 */

const EPSILON = 1e-6;
const NEWTON_ITERATIONS = 8;
const SUBDIVIDE_PRECISION = 30;

const numbersEqual = (a: number, b: number): boolean => Math.abs(a - b) < EPSILON;

export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  // A curve whose control points sit on the diagonal is the identity.
  if (numbersEqual(x1, y1) && numbersEqual(x2, y2)) return (t) => t;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const subdivide = (x: number, lo: number, hi: number): number => {
    let t = x;
    for (let i = 0; i < SUBDIVIDE_PRECISION; i++) {
      t = (lo + hi) / 2;
      const estimate = sampleX(t);
      if (numbersEqual(estimate, x)) return t;
      if (estimate > x) hi = t;
      else lo = t;
    }
    return t;
  };

  const solveT = (x: number): number => {
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const slope = slopeX(t);
      if (numbersEqual(slope, 0)) return subdivide(x, 0, 1);
      const error = sampleX(t) - x;
      if (numbersEqual(error, 0)) return t;
      t -= error / slope;
    }
    return subdivide(x, 0, 1);
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleY(solveT(x));
  };
}

/** The two curves the package ships with, so callers never pass raw numbers. */
export const EASE = {
  out: cubicBezier(0.16, 1, 0.3, 1),
  inOut: cubicBezier(0.65, 0, 0.35, 1),
};

/**
 * The same curves as strings, because CSS and the Web Animations API take an
 * easing as text and cannot be handed the function above.
 */
export const EASE_CSS = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;
