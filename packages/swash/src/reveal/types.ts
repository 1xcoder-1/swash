import type { CSSProperties, ReactNode } from "react";

/** How a line is cut into pieces that arrive one after another. */
export type RevealBy = "fade" | "word" | "letter" | "line";

/** The way a piece arrives. */
export type RevealEffect = "rise" | "blur";

export interface RevealProps {
  /**
   * The text to reveal. v1 takes a string, because splitting a line into
   * pieces is a text operation; anything else renders as it is, unanimated.
   */
  children: ReactNode;
  /** Size of one piece of the line. `line` staggers by line rather than by word. */
  by?: RevealBy;
  /** How each piece arrives. Default "rise". */
  effect?: RevealEffect;
  /** Milliseconds between one piece and the next. */
  stagger?: number;
  /** How long one piece takes to arrive. */
  duration?: number;
  /** How far each piece rises from, in px. 0.35em by default; rise effect only. */
  y?: number;
  /** The blur the blur effect starts from, in px. Default 10; blur effect only. */
  blur?: number;
  /** Wait for the line to scroll into view before revealing it. */
  startOnView?: boolean;
  /** Stay revealed once it has arrived, rather than replaying on every visit. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}
