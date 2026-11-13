import type { CSSProperties } from "react";

/**
 * Words or lines fade into focus from a Gaussian blur, staggered. Splitting
 * is by word by default so OpenType kerning pairs survive; going letter-by-
 * letter destroys the "AV"/"To" spacing that a designer spent time on.
 */
export interface BlurRevealProps {
  children: string;
  /** Split granularity. Default "word". */
  by?: "word" | "line" | "char";
  /** Blur radius to start from, in px. Default 10. */
  blur?: number;
  /** Per-piece delay, in ms. Default 60. */
  stagger?: number;
  /** Per-piece transition time, in ms. Default 500. */
  duration?: number;
  /** Fire when the block enters the viewport. Default true. */
  startOnView?: boolean;
  /** Only play once. Default true. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}
