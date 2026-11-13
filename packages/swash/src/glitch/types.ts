import type { CSSProperties } from "react";

/**
 * Chromatic-aberration glitch. The RGB channel split and horizontal slice
 * jitter are entirely CSS pseudo-elements driven by `attr(data-text)`, so the
 * DOM carries one semantic text node and screen readers announce the phrase
 * exactly once.
 */
export interface GlitchProps {
  text: string;
  /** When to run the animation. Default "hover". */
  trigger?: "hover" | "always" | "scroll";
  /** Slice offset magnitude. Default "medium". */
  intensity?: "subtle" | "medium" | "heavy";
  /** Two channel colours: [cyan-like, magenta-like]. */
  colors?: [string, string];
  className?: string;
  style?: CSSProperties;
}
