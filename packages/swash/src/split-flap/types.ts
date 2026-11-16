import type { CSSProperties } from "react";

export interface SplitFlapProps {
  /** The line on the board. Changing it flips the board to it. */
  text: string;
  /** The characters the cells cycle through on the way. Default: A-Z, 0-9. */
  charset?: string;
  /** Time for one flip of a cell, in ms. Default 90. */
  interval?: number;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}
