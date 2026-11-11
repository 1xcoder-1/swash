import { EASE } from "./bezier";

export interface TweenOptions {
  from: number;
  to: number;
  duration: number; // ms, >= 0; 0 completes on the first frame
  easing?: (t: number) => number;
  delay?: number; // ms
  onUpdate: (value: number, progress: number) => void;
  onComplete?: () => void;
}

export interface TweenController {
  cancel(): void;
}

/**
 * Drives one value on requestAnimationFrame. Callers write the result straight
 * to the DOM through a ref, which is what keeps a parent re-render from
 * restarting an in-flight animation.
 */
export function tween(o: TweenOptions): TweenController {
  const ease = o.easing ?? EASE.out;
  let raf = 0;
  let start: number | null = null;
  let cancelled = false;

  const frame = (now: number) => {
    if (cancelled) return;
    if (start === null) start = now + (o.delay ?? 0);
    if (now < start) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const t = o.duration <= 0 ? 1 : Math.min(1, (now - start) / o.duration);
    o.onUpdate(o.from + (o.to - o.from) * ease(t), t);
    if (t === 1) o.onComplete?.();
    else raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return {
    cancel() {
      cancelled = true;
      cancelAnimationFrame(raf);
    },
  };
}
