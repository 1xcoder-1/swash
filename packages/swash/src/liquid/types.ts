import type { CSSProperties, ReactNode } from "react";

export type LiquidTrigger = "hover" | "view" | "loop";

export interface LiquidProps {
  children: string;
  /** The liquid's colour. Default "#38bdf8". */
  color?: string;
  /** The level the liquid settles at, as a share of the glyph height. Default 1 (full). */
  level?: number;
  /** How long the rise takes, in ms. Default 1500. */
  duration?: number;
  /** How fast the surface bobs, in ms. Default 2600. */
  wave?: number;
  /** When the liquid rises. Default "view". */
  trigger?: LiquidTrigger;
  /** With "loop", how long the liquid stays up before it drains, in ms. Default 2400. */
  hold?: number;
  className?: string;
  style?: CSSProperties;
}
