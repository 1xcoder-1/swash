import type { CSSProperties, ReactNode } from "react";

/**
 * Iridescent light beam that sweeps across a title or badge. The gradient is
 * painted through `background-clip: text`, and the sweep runs on the
 * compositor via a translated gradient layer rather than a repainted
 * background-position, so the browser is not re-rasterising the text on every
 * frame. Selection is preserved by an explicit `::selection` rule.
 */
export interface ShimmerProps {
  children: ReactNode;
  /** Half-width of the highlight along the sweep, in px. Default 240. */
  spread?: number;
  /** Full sweep time in ms. Default 2400. */
  duration?: number;
  /** Colour of the highlight itself. Default `rgba(255,255,255,0.85)`. */
  color?: string;
  /** Colour of the unlit text. Default `#888888`. */
  baseColor?: string;
  /** Pause the sweep when off-screen. Default true. */
  pauseWhenHidden?: boolean;
  className?: string;
  style?: CSSProperties;
}
