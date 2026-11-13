import type { CSSProperties, ReactNode } from "react";

/**
 * Kinetic sine-wave text. Each grapheme gets an index CSS variable so the
 * browser's keyframe engine, not a per-frame React state loop, drives the
 * wave. Emoji and combining marks survive because the tokenizer goes
 * through `Intl.Segmenter`.
 */
export interface WaveProps {
  children: ReactNode;
  /** Vertical peak, in px. Default 8. */
  amplitude?: number;
  /** Phase shift between neighbours, in ms. Default 120. */
  interval?: number;
  /** Full oscillation time for one grapheme, in ms. Default 800. */
  duration?: number;
  /** When to play. Default "hover". */
  trigger?: "hover" | "view" | "loop";
  className?: string;
  style?: CSSProperties;
}
