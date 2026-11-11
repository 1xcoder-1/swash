import type { CSSProperties } from "react";

/** How the words get their emphasis. */
export type MarkerAction = "highlight" | "underline" | "strike" | "circle" | "box";

/** Named inks, so a page can say "amber" and get the dark-mode version too. */
export type MarkerColor =
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "violet"
  | "primary"
  | (string & {});

export interface MarkerProps {
  /**
   * The words being marked. They are in the markup as plain text: the drawing
   * is decoration over them, never a replacement for them.
   */
  children: string;
  /** Which mark to draw. */
  action?: MarkerAction;
  /** A named ink, or any CSS colour. */
  color?: MarkerColor;
  /**
   * Draw the mark. Leave it undefined and the mark draws itself when the text
   * scrolls into view.
   */
  show?: boolean;
  /** When uncontrolled, wait for the text to come on screen. Default true. */
  startOnView?: boolean;
  /** How long the mark takes to draw, in ms. */
  duration?: number;
  /** Wait this long before the pen touches down, in ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}
