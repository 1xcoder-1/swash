import { warnOnce } from "./warn";

export type FeelName = "cinematic" | "snappy" | "playful";

export interface Feel {
  charDelay: number;
  jitter: number;
  deleteRatio: number;
  pause: number;
}

export const FEELS: Record<FeelName, Feel> = {
  cinematic: { charDelay: 42, jitter: 0.1, deleteRatio: 0.45, pause: 1400 },
  snappy: { charDelay: 18, jitter: 0.05, deleteRatio: 0.3, pause: 700 },
  playful: { charDelay: 55, jitter: 0.2, deleteRatio: 0.6, pause: 1000 },
};

/**
 * Turns a feel name or custom object into a usable timing object. A name that
 * does not exist warns once in development and falls back to cinematic rather
 * than returning undefined, because a missing timing object crashes the caller
 * mid-animation.
 */
export function resolveFeel(feel?: FeelName | Feel): Feel {
  if (typeof feel === "object" && feel) return feel;
  if (feel === undefined) return FEELS.cinematic;
  const found: Feel | undefined = FEELS[feel as FeelName];
  if (!found) {
    warnOnce(`feel:${String(feel)}`, `unknown feel "${String(feel)}", using cinematic`);
    return FEELS.cinematic;
  }
  return found;
}
