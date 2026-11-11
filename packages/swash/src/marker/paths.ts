/**
 * The marks a person would draw over a sentence with a pen: a line, a ring, a
 * box. None of them is straight, which is the whole point, and none of them is
 * random either. A wobble that changed on every render would twitch while the
 * reader was just scrolling, so every builder takes a seed and returns the same
 * path for it.
 *
 * Everything here is pure arithmetic on a box, so nothing needs a browser to
 * test it, and the caller decides where the box sits.
 */

/** Wobble amplitude for a stroke, in px. Enough to read as a hand, not a shake. */
const DRIFT = 1.4;

/**
 * mulberry32. A 32-bit state and four operations: enough to make a mark look
 * scruffy, cheap enough to rebuild on every measurement.
 */
function rng(seed: number): () => number {
  let state = (Math.trunc(seed) || 0x9e3779b9) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two decimals are enough for a stroke and short enough to keep the path tidy. */
const n = (value: number) => Math.round(value * 100) / 100;

/**
 * A path made of straight segments between jittered points. Rounded joins turn
 * the corners into a curve, so a dozen points read as one pen stroke.
 */
function stroke(points: Array<[number, number]>, close: boolean): string {
  const [first, ...rest] = points;
  let d = `M${n(first![0])} ${n(first![1])}`;
  for (const [x, y] of rest) d += `L${n(x)} ${n(y)}`;
  if (close) d += `L${n(first![0])} ${n(first![1])}`;
  return close ? `${d}Z` : d;
}

/**
 * A stroke under something, drawn from x=0 to x=width. The ends are held close
 * to the edges so the mark lines up with the text it sits under, while the
 * middle of the run is free to wander.
 */
export function wobblyLine(width: number, seed: number): string {
  const rand = rng(seed);
  const run = Math.max(0, width);
  const steps = Math.max(2, Math.round(run / 36));
  const drift = (scale: number) => (rand() * 2 - 1) * scale;

  const points: Array<[number, number]> = [[drift(0.6), drift(DRIFT)]];
  for (let i = 1; i < steps; i++) points.push([(i * run) / steps, drift(DRIFT)]);
  points.push([run + drift(0.6), drift(DRIFT)]);
  return stroke(points, false);
}

/**
 * A ring around a box, drawn clockwise from the top. The cardinal points of the
 * ellipse are always sampled, so the widest point of the ring is the widest
 * point of the box plus a wobble rather than whatever the sampling landed on.
 */
export function wobblyEllipse(w: number, h: number, seed: number): string {
  const rand = rng(seed + 101);
  const rx = Math.max(0, w) / 2;
  const ry = Math.max(0, h) / 2;
  const drift = (scale: number) => (rand() * 2 - 1) * scale;

  const points: Array<[number, number]> = [];
  const samples = 24;
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2 - Math.PI / 2;
    points.push([
      rx + rx * Math.cos(angle) + drift(DRIFT),
      ry + ry * Math.sin(angle) + drift(DRIFT),
    ]);
  }
  return stroke(points, true);
}

/**
 * A box around something, drawn as four sides with a few points along each so
 * no edge is dead straight. The corners stay within a pixel or two of the box,
 * because a box that misses its corners looks sloppier than a line that does.
 */
export function wobblyBox(w: number, h: number, seed: number): string {
  const rand = rng(seed + 37);
  const width = Math.max(0, w);
  const height = Math.max(0, h);
  const drift = (scale: number) => (rand() * 2 - 1) * scale;
  const corner = (x: number, y: number): [number, number] => [
    x + drift(1.1),
    y + drift(1.1),
  ];

  const points: Array<[number, number]> = [corner(0, 0)];
  const sides: Array<[[number, number], [number, number]]> = [
    [corner(width, 0), corner(width, height)],
    [corner(0, height), corner(0, 0)],
  ];
  for (const [from, to] of sides) {
    for (let i = 1; i <= 2; i++) {
      const t = i / 3;
      points.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    }
    points.push(to);
  }
  return stroke(points, true);
}
