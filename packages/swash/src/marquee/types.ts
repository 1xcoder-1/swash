import type { CSSProperties, ReactNode } from "react";

export interface MarqueeProps {
  children: ReactNode;
  /** Time for one full loop of the content, in ms. Default 12000. */
  duration?: number;
  /** Gap between the repeating copies, in px. Default 48. */
  gap?: number;
  /** Scrolls the other way. Default false. */
  reverse?: boolean;
  /** Stops the belt while the pointer is over it. Default true. */
  pauseOnHover?: boolean;
  /** Fades the belt out at each side. Default true. */
  fade?: boolean;
  className?: string;
  style?: CSSProperties;
}
