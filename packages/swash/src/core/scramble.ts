import { EASE } from "../shared/bezier";
import { splitGraphemes } from "../shared/grapheme";
import { warnOnce } from "../shared/warn";
import { tween } from "../shared/tween";

export const DEFAULT_CHARSET = "!<>-_\\/[]{}=+*^?#0123456789ABCDEF";

/** A short line gets a short run, so the churn never looks like it stalled. */
const BASE_MS = 900;
const PER_GRAPHEME_MS = 30;
const MIN_SPEED = 0.5;
const MAX_SPEED = 3;

/** Everything a run reads at the moment it starts, so tuning a prop mid-churn
 *  cannot restart the noise behind the reader's back. */
export interface ScrambleRun {
  text: string;
  charset: string;
  speed: number;
  reduced: boolean;
  onDone?: () => void;
}

export interface ScrambleController {
  start(run: ScrambleRun): void;
  dispose(): void;
}

/** Outside the range the effect was tuned for, the run stops looking right. */
function pace(speed: number): number {
  if (Number.isFinite(speed) && speed >= MIN_SPEED && speed <= MAX_SPEED) return speed;
  warnOnce(
    "scramble:speed",
    `speed has to sit between ${MIN_SPEED} and ${MAX_SPEED}; using the closest end of that range`,
  );
  if (!Number.isFinite(speed)) return 1;
  return speed < MIN_SPEED ? MIN_SPEED : MAX_SPEED;
}

/**
 * The framework-free scramble engine. It owns a single element's text and does
 * one run at a time, so it can be driven from React, Vue or Svelte without any
 * of it depending on a framework.
 */
export function createScrambler(el: HTMLElement): ScrambleController {
  let current: ReturnType<typeof tween> | null = null;

  return {
    start(run) {
      // One run at a time: a new target replaces whatever was mid-churn, so a
      // fast typist retyping a live value never stacks two loops.
      current?.cancel();
      current = null;
      el.textContent = run.text;

      const target = splitGraphemes(run.text);
      const glyphs = splitGraphemes(run.charset === "" ? DEFAULT_CHARSET : run.charset);
      if (run.reduced || target.length === 0 || glyphs.length === 0) {
        run.onDone?.();
        return;
      }

      const duration = (BASE_MS + target.length * PER_GRAPHEME_MS) / pace(run.speed);
      // Left to right, and the first grapheme settles after a slice of the run
      // rather than at once: a share of zero would leave it still.
      const settlesAt = (index: number) => ((index + 1) / target.length) * duration;
      const pick = () => glyphs[Math.floor(Math.random() * glyphs.length)]!;

      current = tween({
        from: 0,
        to: duration,
        duration,
        easing: EASE.linear,
        onUpdate: (elapsed) => {
          let frame = "";
          for (let index = 0; index < target.length; index++) {
            const grapheme = target[index]!;
            // A space stays a space, or the line re-wraps mid-run.
            frame += grapheme.trim() === "" || elapsed >= settlesAt(index) ? grapheme : pick();
          }
          el.textContent = frame;
        },
        onComplete: () => {
          current = null;
          el.textContent = run.text;
          run.onDone?.();
        },
      });
    },
    dispose() {
      current?.cancel();
      current = null;
    },
  };
}
