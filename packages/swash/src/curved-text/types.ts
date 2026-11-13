import type { CSSProperties } from "react";

/**
 * Circular path text, drawn as an SVG `<textPath>` on a circle and rotated
 * with a CSS keyframe so it runs on the compositor. Native SVG glyph
 * placement keeps letters crisp at any radius, unlike the
 * absolute-position-and-rotate-each-span trick.
 */
export interface CurvedTextProps {
  text: string;
  /** Circle radius in user units. Default 60. */
  radius?: number;
  /** Seconds for a full revolution. Default 12. */
  speed?: number;
  /** Rotate counter-clockwise. Default false. */
  reverse?: boolean;
  /** Letter spacing along the path, in user units. Default 0. */
  spacing?: number;
  className?: string;
  style?: CSSProperties;
}
