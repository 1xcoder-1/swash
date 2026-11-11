import { ms } from "./number";
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

/** Reads a proportion the way the timing fields want one: finite, and under 1. */
function ratio(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (Number.isFinite(value) && value >= 0 && value < 1) return value;
  warnOnce(
    `feel:${name}`,
    `Feel ${name} wants a number from 0 up to 1, got ${value}. Using ${fallback}.`,
  );
  return fallback;
}

/**
 * Turns a feel name or custom object into a usable timing object. A name that
 * does not exist warns once in development and falls back to cinematic rather
 * than returning undefined, because a missing timing object crashes the caller
 * mid-animation.
 *
 * A custom object is read field by field for the same reason: one NaN in it
 * would otherwise reach a setTimeout, where it degrades to an immediate call
 * and the text types itself as fast as the loop can run.
 */
export function resolveFeel(feel?: FeelName | Feel): Feel {
  if (feel !== null && typeof feel === "object") {
    const base = FEELS.cinematic;
    return {
      charDelay: ms(feel.charDelay, base.charDelay, "charDelay", "Feel"),
      jitter: ratio(feel.jitter, base.jitter, "jitter"),
      deleteRatio: ratio(feel.deleteRatio, base.deleteRatio, "deleteRatio"),
      pause: ms(feel.pause, base.pause, "pause", "Feel"),
    };
  }
  if (feel === undefined) return FEELS.cinematic;
  // A plain bracket read would find Object.prototype members through a prop
  // like "constructor", and hand back a function with no timing in it.
  const found: Feel | undefined = Object.hasOwn(FEELS, feel) ? FEELS[feel as FeelName] : undefined;
  if (!found) {
    warnOnce(`feel:${String(feel)}`, `unknown feel "${String(feel)}", using cinematic`);
    return FEELS.cinematic;
  }
  return found;
}
