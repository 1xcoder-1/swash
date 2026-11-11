import type { CSSProperties } from "react";

/** What starts the effect. Each one is a different promise about the text. */
export type ScrambleTrigger = "mount" | "view" | "click" | "prop";

export interface ScrambleProps {
  /** The line the effect decodes to. It is also what the markup carries. */
  text: string;
  /** The glyphs the churn draws from. Only used while a run is going. */
  charset?: string;
  /** Runs at half to three times the pace. Anything outside that is clamped. */
  speed?: number;
  /** `prop` waits for `text` to change; `mount` does not. */
  trigger?: ScrambleTrigger;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}
