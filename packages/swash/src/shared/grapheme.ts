type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };

const segmenter: SegmenterLike | null =
  typeof Intl !== "undefined" && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: "grapheme" })
    : null;

/**
 * Splits text into user-perceived characters. Never use string splitting on
 * code units here: emoji families and combining marks fall apart that way.
 */
export function splitGraphemes(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment);
  return Array.from(text); // code-point fallback for old engines
}

/** Splits text into word tokens, with whitespace runs flagged so callers can keep them unanimated. */
export function splitWordTokens(text: string): Array<{ text: string; space: boolean }> {
  return text
    .split(/(\s+)/)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, space: /^\s+$/.test(t) }));
}
