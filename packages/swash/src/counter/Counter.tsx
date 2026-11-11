"use client";
import { useEffect, useRef, useState } from "react";
import { observeInview } from "../shared/inview";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { tween } from "../shared/tween";
import type { TweenController } from "../shared/tween";
import type { CounterProps } from "./types";

const defaultFormat = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Counts from `from` to `to` without handing the number to React once per
 * frame. The tween lives in a ref and writes through another ref, so a parent
 * that re-renders while the count is running changes nothing, which is the
 * failure people hit with the popular counter components.
 */
export function Counter(props: CounterProps) {
  const {
    to,
    from = 0,
    duration = 1500,
    delay = 0,
    prefix = "",
    suffix = "",
    startOnView = true,
    once = true,
    className,
    style,
  } = props;

  const root = useRef<HTMLSpanElement>(null);
  const valueEl = useRef<HTMLSpanElement>(null);
  const ctrl = useRef<TweenController | null>(null);
  /** Where the count stands, so a pause resumes from the shown value. */
  const value = useRef(from);
  /** `delay` belongs to the first count only, not to every resume or replay. */
  const started = useRef(false);
  const latest = useRef(props);

  const reduced = useReducedMotion();
  /** How many counts this element has asked for; zero while off screen. */
  const [run, setRun] = useState(startOnView ? 0 : 1);
  const [background, setBackground] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  // Keeps the running tween pointed at the current `format` and `onDone`
  // without listing them as effect dependencies.
  useIsomorphicLayoutEffect(() => {
    latest.current = props;
  });

  useIsomorphicLayoutEffect(() => {
    const write = (n: number) => {
      const el = valueEl.current;
      if (el) el.textContent = (latest.current.format ?? defaultFormat)(n);
    };
    const settle = (n: number) => {
      value.current = n;
      write(n);
    };
    // Reduced motion wants the answer without the journey, and a number that
    // already sits on the target wants no journey either way.
    if (reduced) settle(to);
    if (!run || background || value.current === to) return;

    ctrl.current = tween({
      from: value.current,
      to,
      duration,
      delay: started.current ? 0 : delay,
      onUpdate: (n) => {
        value.current = n;
        write(n);
      },
      onComplete: () => {
        settle(to);
        ctrl.current = null;
        latest.current.onDone?.();
      },
    });
    started.current = true;

    return () => {
      ctrl.current?.cancel();
      ctrl.current = null;
    };
  }, [run, background, reduced, to, duration, delay]);

  useEffect(() => {
    if (!startOnView || !root.current) return;
    return observeInview(root.current, { once, ratio: 0.3 }, () => {
      // With `once` off, coming back into view means counting again from the
      // beginning rather than picking up where the last pass stopped.
      if (!once) value.current = from;
      setRun((n) => n + 1);
    });
  }, [startOnView, once, from]);

  // A hidden tab throttles frames, which makes the next visible frame look
  // like a giant jump. Better to freeze on the value the reader last saw.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibilityChange = () => setBackground(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <span ref={root} className={className} style={style}>
      {prefix}
      <span ref={valueEl}>{(props.format ?? defaultFormat)(from)}</span>
      {suffix}
    </span>
  );
}
