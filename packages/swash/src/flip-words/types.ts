import type { CSSProperties } from "react";

/**
 * Cycles through a list of phrases with a 3D flip. The rotating box reserves
 * the widest phrase so neighbouring layout never jumps between words of
 * different lengths.
 */
export interface FlipWordsProps {
  words: string[];
  /** Dwell per word, in ms. Default 2500. */
  duration?: number;
  /** Flip along the X axis (vertical) or Y (horizontal). Default "vertical". */
  direction?: "vertical" | "horizontal";
  /** Reserve the widest word's box so nothing shifts. Default true. */
  preserveSpace?: boolean;
  /** Starting index into `words`. Default 0. */
  startAtIndex?: number;
  className?: string;
  style?: CSSProperties;
}
