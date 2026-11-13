import { tween } from "../shared/tween";
import type { TweenController } from "../shared/tween";

const defaultFormat = (n: number) => Math.round(n).toLocaleString("en-US");

/** The count's resting display, shared by the engine and each framework's first paint. */
export { defaultFormat };

export interface CounterRun {
  from: number;
  to: number;
  duration: number;
  delay: number;
  reduced: boolean;
  /** Start over from `from` before counting, used when a count replays. */
  restart?: boolean;
  format?: (n: number) => string;
  onDone?: () => void;
}

export interface CounterController {
  /** Counts toward `to`, resuming from the value already on screen. */
  run(cfg: CounterRun): void;
  dispose(): void;
}

/**
 * The framework-free counting engine. It owns the number and writes it straight
 * to one element, and remembers where the count stands so a resume continues
 * rather than jumping. Deciding *when* to run (scroll, visibility, reduced
 * motion) is left to the framework binding, which is what lets React, Vue and
 * Svelte all drive the same counter.
 */
export function createCounter(valueEl: HTMLElement): CounterController {
  let ctrl: TweenController | null = null;
  let value = 0;
  let started = false;
  let initialised = false;

  const write = (n: number, format?: (n: number) => string) => {
    valueEl.textContent = (format ?? defaultFormat)(n);
  };
  const settle = (n: number, format?: (n: number) => string) => {
    value = n;
    write(n, format);
  };

  return {
    run(cfg) {
      // One count at a time: a re-run replaces whatever was mid-flight, resuming
      // from the value the last pass left on screen.
      ctrl?.cancel();
      ctrl = null;

      // The first run adopts the low end so a resume mid-count is continuous.
      if (!initialised) {
        value = cfg.from;
        initialised = true;
      }
      if (cfg.restart) value = cfg.from;

      // Reduced motion wants the answer without the journey, and the journey is
      // over the moment the answer is on screen, so the caller hears about it.
      if (cfg.reduced) {
        settle(cfg.to, cfg.format);
        cfg.onDone?.();
        return;
      }
      if (value === cfg.to) return;

      ctrl = tween({
        from: value,
        to: cfg.to,
        duration: cfg.duration,
        delay: started ? 0 : cfg.delay,
        onUpdate: (n) => {
          value = n;
          write(n, cfg.format);
        },
        onComplete: () => {
          settle(cfg.to, cfg.format);
          ctrl = null;
          cfg.onDone?.();
        },
      });
      started = true;
    },
    dispose() {
      ctrl?.cancel();
      ctrl = null;
    },
  };
}
