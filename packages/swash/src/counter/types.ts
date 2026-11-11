import type { CSSProperties } from "react";

export interface CounterProps {
  /** The number to land on. */
  to: number;
  /** The number to start from. Default 0. */
  from?: number;
  /** Count time in ms. Default 1500. */
  duration?: number;
  /** Wait before counting, in ms. Default 0. */
  delay?: number;
  /** Printed before the number, like "$". */
  prefix?: string;
  /** Printed after the number, like "%". */
  suffix?: string;
  /** Turns the running value into text. Defaults to rounding plus thousands separators. */
  format?: (n: number) => string;
  /** Wait for the element to scroll into view before counting. Default true. */
  startOnView?: boolean;
  /** With startOnView, count on the first appearance only. Default true; off means it recounts each time it appears. */
  once?: boolean;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}
