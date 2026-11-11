/**
 * One canvas, made on the first measurement and kept for the life of the page.
 * A 2D context costs more to build than it costs to reuse, and the two numbers
 * read out of it belong to the font rather than to the string. `undefined`
 * means not tried yet, `null` means tried and unavailable.
 */
let metricsContext: CanvasRenderingContext2D | null | undefined;

/**
 * How far the glyphs reach past the line box, in px, per side.
 *
 * Tight display leading is shorter than the letters themselves need, so a box
 * drawn flush to the line box clips the tail of a `g`. The browser centres the
 * font's content area in the line box, which makes the shortfall even, so half
 * of it is the distance to push the outline out on the top and the bottom.
 * Asking the font instead of hard-coding a number means the consumer can set
 * the leading to anything without the word getting cropped.
 *
 * Returns 0 when the metrics cannot be read, which draws the flush box rather
 * than guessing at a bigger one.
 */
export function contentOverhang(element: HTMLElement, lineBox: number): number {
  if (metricsContext === undefined) {
    metricsContext = document.createElement("canvas").getContext("2d");
  }
  const context = metricsContext;
  if (!context) return 0;

  const style = getComputedStyle(element);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = context.measureText("x");
  const content =
    (metrics.fontBoundingBoxAscent ?? 0) + (metrics.fontBoundingBoxDescent ?? 0);

  return Math.max(0, (content - lineBox) / 2);
}
