import type { CSSProperties } from "react";

/** When the flicker runs. Default "always" — a neon sign hums. */
export type NeonTrigger = "always" | "hover" | "scroll";

export interface NeonProps {
  text: string;
  /** A named tube colour, or any CSS colour. Default "cyan". */
  color?: string;
  /** How the tube flickers. "none" holds a steady glow. Default "soft". */
  flicker?: "none" | "soft" | "hard";
  /** When the tube is lit. Default "always". */
  trigger?: NeonTrigger;
  className?: string;
  style?: CSSProperties;
}
