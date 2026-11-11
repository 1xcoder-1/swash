import { splitGraphemes } from "../shared/grapheme";

export interface MorphPlan {
  /** How many graphemes at the front both strings agree on. Those never move. */
  keep: number;
  /** The tail only the first string has. */
  out: string[];
  /** The tail only the second string has. Named with an underscore because
   * `in` is a reserved word. */
  in_: string[];
}

/**
 * Splits a change into what stays and what moves, over graphemes rather than
 * code units so a shared emoji is kept rather than cut in half. The common
 * ending is counted after the common beginning, and never over it: a grapheme
 * can only be kept once.
 */
export function planTransition(from: string, to: string): MorphPlan {
  const before = splitGraphemes(from);
  const after = splitGraphemes(to);

  let keep = 0;
  while (keep < before.length && keep < after.length && before[keep] === after[keep]) keep++;

  let shared = 0;
  while (
    shared + keep < before.length &&
    shared + keep < after.length &&
    before[before.length - 1 - shared] === after[after.length - 1 - shared]
  ) {
    shared++;
  }

  const end = (list: string[]) => list.length - shared;
  return { keep, out: before.slice(keep, end(before)), in_: after.slice(keep, end(after)) };
}
