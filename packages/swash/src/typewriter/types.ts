import type { CSSProperties } from "react";
import type { Feel, FeelName } from "../shared/presets";

export interface TypewriterProps {
  /** One phrase, typed once. Ignored when `loop` is set. */
  text?: string;
  /** Phrases to rotate through, holding and erasing each one. */
  loop?: string[];
  /** Typing rhythm: a preset name or your own delays. Default "cinematic". */
  feel?: FeelName | Feel;
  /** Show the blinking caret. Default true. */
  cursor?: boolean;
  /** Wait until the text scrolls into view before typing. Default false. */
  startOnView?: boolean;
  /** The single phrase is fully typed (or, with reduced motion, printed). */
  onDone?: () => void;
  /** One full turn of `loop` finished: last phrase erased, pointer back at the start. */
  onLoopDone?: (phrase: string, index: number) => void;
  className?: string;
  style?: CSSProperties;
}

export interface UseTypewriterOptions {
  /** Phrases to type, already resolved from `text` or `loop`. */
  phrases: string[];
  /** Rotate through `phrases` forever, rather than typing the first and stopping. */
  looping: boolean;
  feel?: FeelName | Feel;
  /** False while a startOnView typewriter is still off screen. */
  enabled: boolean;
  reduced: boolean;
  onDone?: () => void;
  onLoopDone?: (phrase: string, index: number) => void;
}

export interface TypewriterView {
  /** Graphemes of the phrase being typed right now. */
  graphemes: string[];
  /** How many of them are on screen. */
  count: number;
  /** The phrase as text, for the accessible name. */
  phrase: string;
  /** Stable ref callback for grapheme `index`. */
  charRef: (index: number) => (el: HTMLElement | null) => void;
}
