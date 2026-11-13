/**
 * Reads the writing direction that actually applies to an element.
 *
 * `getComputedStyle` returns the inherited `direction`, so this respects both a
 * `dir="rtl"` attribute on any ancestor and a CSS `direction: rtl` rule, without
 * the caller having to walk the tree itself. Physical transforms (`left`,
 * `translateX`) are wrong for right-to-left text; a component asks this which
 * way to point them.
 */
export function isRtl(el: Element | null): boolean {
  if (!el || typeof getComputedStyle !== "function") return false;
  return getComputedStyle(el).direction === "rtl";
}
