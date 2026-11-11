import type { CSSProperties, ReactNode } from "react";

export interface FrameProps {
  /**
   * Draws the frame. The outline and badge stay in the DOM either way, so the
   * sweep always has something to animate and a toggle never remounts them.
   */
  show?: boolean;
  /** Text for the badge on the top-right corner. No label, no badge. */
  label?: string;
  /** The colour the outline and badge are drawn in. Any CSS colour; the text's own by default. */
  color?: string;
  /** Corner radius of the outline, in px. */
  radius?: number;
  /** Thickness of the outline, in px. */
  width?: number;
  /** How long the frame takes to draw itself in, in ms. */
  duration?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
