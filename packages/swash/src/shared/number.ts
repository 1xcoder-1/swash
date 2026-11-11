import { warnOnce } from "./warn";

/**
 * Reads a prop that wants a number, the one way every component reads it.
 *
 * A negative duration is not a small duration: it is an animation that never
 * finishes, and a reader never finds out why the text stopped moving. So the
 * value falls back to the component's default and says so once, in dev, which
 * is the fourth engine rule with a single implementation rather than seven.
 */
function read(
  value: number | undefined,
  fallback: number,
  unit: string,
  who: string,
  name: string,
): number {
  if (value === undefined) return fallback;
  if (Number.isFinite(value) && value >= 0) return value;
  warnOnce(
    `${who.toLowerCase()}:${name}`,
    `${who} ${name} wants a number of ${unit}, got ${value}. Using ${fallback}.`,
  );
  return fallback;
}

/** Milliseconds, for anything that takes time. */
export const ms = (value: number | undefined, fallback: number, name: string, who: string) =>
  read(value, fallback, "ms", who, name);

/** Pixels, for anything that takes space. */
export const pixels = (value: number | undefined, fallback: number, name: string, who: string) =>
  read(value, fallback, "pixels", who, name);
