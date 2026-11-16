import type { CSSProperties } from "react";

export type SliceTrigger = "hover" | "view" | "loop";

export interface SliceProps {
  text: string;
  /** How far each half slides from the seam, in px. Default 14. */
  amount?: number;
  /** How long one slide takes, in ms. Default 420. */
  duration?: number;
  /** When the halves part. Default "hover". */
  trigger?: SliceTrigger;
  /** With "loop", how long the halves stay parted, in ms. Default 1400. */
  hold?: number;
  className?: string;
  style?: CSSProperties;
}
