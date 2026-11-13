"use client";
import { useEffect, useRef, useState } from "react";
import { observeInview } from "../shared/inview";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import {
  createCounter,
  defaultFormat,
  type CounterController,
} from "../core/counter";
import type { CounterProps } from "./types";

/**
 * Counts from `from` to `to` without handing the number to React once per
 * frame. The count lives in the framework-free `createCounter`, which writes
 * straight to the element, so a parent that re-renders while the count is
 * running changes nothing — the failure people hit with popular counters.
 */
export function Counter(props: CounterProps) {
  const {
    to,
    from = 0,
    duration,
    delay,
    prefix = "",
    suffix = "",
    startOnView = true,
    once = true,
    className,
    style,
  } = props;

  const root = useRef<HTMLSpanElement>(null);
  const valueEl = useRef<HTMLSpanElement>(null);
  const ctrl = useRef<CounterController | null>(null);
  const latest = useRef(props);

  // A negative duration would leave the number stuck wherever the first frame
  // put it, so it is read the way every other component reads one.
  const take = ms(duration, 1500, "duration", "Counter");
  const wait = ms(delay, 0, "delay", "Counter");

  const reduced = useReducedMotion();
  /** How many times this element has come into view; the run is derived from it. */
  const [visits, setVisits] = useState(0);
  // Derived rather than latched: flip startOnView off and the number has to
  // count now, with the observer it had asked for already unregistered.
  const run = !startOnView || visits > 0;
  const [background, setBackground] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );
  /** With `once` off, the next entry counts from the beginning, not a resume. */
  const restart = useRef(false);

  // Keeps the running count pointed at the current `format` and `onDone`
  // without listing them as effect dependencies.
  useIsomorphicLayoutEffect(() => {
    latest.current = props;
  });

  useIsomorphicLayoutEffect(() => {
    const el = valueEl.current;
    if (!el) return;
    const controller = createCounter(el);
    ctrl.current = controller;
    return () => {
      controller.dispose();
      if (ctrl.current === controller) ctrl.current = null;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const controller = ctrl.current;
    if (!controller) return;
    // Reduced motion wants the answer without the journey, and the journey is
    // over the moment the answer is on screen, so it settles even off-view.
    if (reduced) {
      controller.run({
        from,
        to,
        duration: take,
        delay: wait,
        reduced,
        format: latest.current.format,
        onDone: latest.current.onDone,
      });
      return;
    }
    if (!run || background) return;
    controller.run({
      from,
      to,
      duration: take,
      delay: wait,
      reduced,
      restart: restart.current,
      format: latest.current.format,
      onDone: latest.current.onDone,
    });
    restart.current = false;
    return () => controller.dispose();
    // `from` is read through the controller's own resume, not as a trigger: a
    // parent changing it mid-count must not send the number back to a new low.
  }, [visits, run, background, reduced, to, take, wait]);

  useEffect(() => {
    if (!startOnView || !root.current) return;
    return observeInview(root.current, { once, ratio: 0.3 }, () => {
      // With `once` off, coming back into view means counting again from the
      // beginning rather than picking up where the last pass stopped.
      if (!once) restart.current = true;
      setVisits((n) => n + 1);
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
