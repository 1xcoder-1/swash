type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };

const segmenter: SegmenterLike | null =
  typeof Intl !== "undefined" && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: "grapheme" })
    : null;

/**
 * Fallback clusterer for engines without Intl.Segmenter. A code-point split
 * is not good enough: a family emoji is four people joined by ZWJ code
 * points, and a bare code-point split cuts it into surrogate halves
 * mid-bounce. This regex walks the same clusters the segmenter would: base
 * glyph plus its combining marks, regional-indicator pairs (flags), a base
 * emoji extended by variation selectors and emoji modifiers, and ZWJ
 * sequences that chain any of the above. It is not the full UAX #29 rule
 * set, but it covers the clusters real copy contains.
 */
const CLUSTER_RE = new RegExp(
  [
    "\\p{RI}\\p{RI}", // regional pairs: one flag
    "\\p{M}+", // combining marks attach to whatever precedes
    "(?:\\p{Emoji}(?:\\p{EMod}|\\uFE0F|\\u200D\\u20E3)?)(?:\\u200D(?:\\p{Emoji}(?:\\p{EMod}|\\uFE0F)?))*", // emoji + ZWJ chains
    "\\p{L}\\p{M}*", // letters with their marks (é as e + U+0301)
    ".", // anything else, one code point
  ].join("|"),
  "gsu",
);

export function splitGraphemesFallback(text: string): string[] {
  return text.match(CLUSTER_RE) ?? Array.from(text);
}

/**
 * Splits text into user-perceived characters. Never use string splitting on
 * code units here: emoji families and combining marks fall apart that way.
 */
export function splitGraphemes(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment);
  return splitGraphemesFallback(text); // cluster-aware fallback for old engines
}

/**
 * Splits text into word tokens, with whitespace runs flagged so callers can
 * keep them unanimated.
 */
export function splitWordTokens(text: string): Array<{ text: string; space: boolean }> {
  return text
    .split(/(\s+)/)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, space: /^\s+$/.test(t) }));
}
