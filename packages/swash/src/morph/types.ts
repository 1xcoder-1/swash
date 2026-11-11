import type { CSSProperties } from "react";

export interface MorphProps {
  /** The words to move between. Fewer than two and there is nothing to morph. */
  values: string[];
  /** How long one swap takes. */
  duration?: number;
  /** How long the word sits still before the next swap. */
  hold?: number;
  /** Keeps going through the list, or steps once. */
  loop?: boolean;
  /** Which value to be on, for a list that is paged rather than looped. */
  step?: number;
  onMorphed?: (value: string, index: number) => void;
  className?: string;
  style?: CSSProperties;
}
