import type { CSSProperties } from "react";

/**
 * Rolling-digits text component. Digits animate as vertical odometer strips;
 * punctuation ($ . , % /) sits still. Column widths are tabular so "199" to
 * "200" doesn't shift the surrounding text.
 */
export interface TickerProps {
  /** The number being shown. */
  value: number;
  /** Static string printed before the digits, e.g. "$". */
  prefix?: string;
  /** Static string printed after the digits, e.g. "%". */
  suffix?: string;
  /** Total animation time for the last column, in ms. Default 500. */
  duration?: number;
  /** Per-column delay, in ms. Default 40. */
  stagger?: number;
  /** Rolling direction. Default "auto". */
  direction?: "up" | "down" | "auto";
  /** Fixed decimals. If omitted, natural decimals from the value. */
  decimals?: number;
  /** Thousands separator; "" to disable. Default ",". */
  separator?: string;
  /** Fires when every column has landed on the new value. */
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}
