"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { useStyle } from "../shared/style";
import type { FlipWordsProps } from "./types";

/**
 * 3D flip word cycler. Each tick flips the previous word out and the new
 * word in along the chosen axis. Two properties drive the guard rails:
 *
 * - `preserveSpace` measures the widest word once on mount and holds the box
 *   at that width so surrounding layout never jumps.
 * - `visibilitychange` freezes the timer when the tab is backgrounded so
 *   coming back does not queue up a seizure-like burst of catch-up flips.
 */

const FLIP_WORDS_CSS = [
  ".swash-flip-words{",
  "  display:inline-block;",
  "  position:relative;",
  "  perspective:1000px;",
  "  vertical-align:bottom;",
  "}",
  ".swash-flip-words .swash-flip-word{",
  "  display:inline-block;",
  "  backface-visibility:hidden;",
  "  transform-style:preserve-3d;",
  "  will-change:transform,opacity;",
  "  transition:transform var(--swash-flip-duration,400ms) cubic-bezier(0.32,0.72,0,1),",
  "             opacity var(--swash-flip-duration,400ms) cubic-bezier(0.32,0.72,0,1);",
  "}",
  ".swash-flip-words.vertical .swash-flip-word.out{transform:rotateX(90deg);opacity:0}",
  ".swash-flip-words.vertical .swash-flip-word.in{transform:rotateX(-90deg);opacity:0}",
  ".swash-flip-words.horizontal .swash-flip-word.out{transform:rotateY(90deg);opacity:0}",
  ".swash-flip-words.horizontal .swash-flip-word.in{transform:rotateY(-90deg);opacity:0}",
  ".swash-flip-words.reduced .swash-flip-word{transition:opacity 200ms linear}",
  ".swash-flip-words .swash-flip-measure{",
  "  position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;top:0;left:0;",
  "}",
].join("\n");

type Phase = "idle" | "out" | "in";

export function FlipWords(props: FlipWordsProps) {
  const {
    words,
    duration,
    direction = "vertical",
    preserveSpace = true,
    startAtIndex = 0,
    className,
    style,
  } = props;

  const dwell = ms(duration, 2500, "duration", "FlipWords");
  const reduced = useReducedMotion();
  useStyle("swash-flip-words", FLIP_WORDS_CSS);

  const safeWords = words && words.length > 0 ? words : [""];
  // Signature of the words array so the effect deps ignore identity churn
  // from a parent re-render that produces a fresh array with the same items.
  const wordsKey = safeWords.join("\u0000");

  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(startAtIndex, safeWords.length - 1)),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [reserved, setReserved] = useState<number | null>(null);

  const measureRef = useRef<HTMLSpanElement>(null);
  // Timers for the flip-out and flip-in legs. Both are cleared on unmount
  // and before every new tick, so a rapid tab return or a value change
  // cannot stack half-finished flips.
  const outTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFlipTimers = useCallback(() => {
    if (outTimerRef.current !== null) {
      clearTimeout(outTimerRef.current);
      outTimerRef.current = null;
    }
    if (inTimerRef.current !== null) {
      clearTimeout(inTimerRef.current);
      inTimerRef.current = null;
    }
  }, []);

  // Measure widest word once (and again if the list changes).
  useEffect(() => {
    if (!preserveSpace) {
      setReserved(null);
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    let max = 0;
    for (const child of Array.from(el.children)) {
      const w = (child as HTMLElement).offsetWidth;
      if (w > max) max = w;
    }
    setReserved(max);
  }, [preserveSpace, wordsKey]);

  // The index is advanced when the flip-in leg *settles*, not when it
  // starts. During the "in" leg `shown` reads `next` (the word after the
  // still-unchanged `index`), so the arriving word is the correct one; if
  // we advanced here the `next` lookup would be two words ahead and the
  // whole in-leg would flash the wrong word before snapping back.
  const tick = useCallback(() => {
    clearFlipTimers();
    const leg = reduced ? 220 : 400;
    setPhase("out");
    outTimerRef.current = setTimeout(() => {
      outTimerRef.current = null;
      setPhase("in");
      inTimerRef.current = setTimeout(() => {
        inTimerRef.current = null;
        setIndex((i) => (i + 1) % safeWords.length);
        setPhase("idle");
      }, leg);
    }, leg);
  }, [clearFlipTimers, reduced, safeWords.length]);

  // Timer, paused while the tab is hidden.
  useEffect(() => {
    if (safeWords.length <= 1) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    let paused = false;

    const start = () => {
      if (timer !== null) return;
      timer = setInterval(tick, dwell);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (typeof document === "undefined") return;
      const hidden = document.hidden;
      if (hidden && !paused) {
        paused = true;
        stop();
        // Any in-flight flip would look like a catch-up burst on return.
        clearFlipTimers();
        setPhase("idle");
      } else if (!hidden && paused) {
        paused = false;
        start();
      }
    };

    if (typeof document !== "undefined") {
      paused = Boolean(document.hidden);
    }
    if (!paused) start();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    return () => {
      stop();
      clearFlipTimers();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [dwell, tick, clearFlipTimers, safeWords.length]);

  const current = safeWords[index] ?? "";
  const next = safeWords[(index + 1) % safeWords.length] ?? "";
  const shown = phase === "in" ? next : current;
  const classWord =
    phase === "out"
      ? "swash-flip-word out"
      : phase === "in"
        ? "swash-flip-word in"
        : "swash-flip-word";

  const vars = useMemo(() => {
    const v: Record<string, string> = {
      "--swash-flip-duration": reduced ? "200ms" : "400ms",
    };
    if (reserved !== null) {
      v["minWidth"] = `${reserved}px`;
    }
    return v as unknown as React.CSSProperties;
  }, [reduced, reserved]);

  const rootCls = [
    "swash-flip-words",
    direction,
    reduced ? "reduced" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootCls} style={{ ...vars, ...style }} aria-label={current}>
      {preserveSpace ? (
        <span ref={measureRef} className="swash-flip-measure" aria-hidden="true">
          {safeWords.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </span>
      ) : null}
      <span className={classWord} aria-hidden="true">
        {shown}
      </span>
    </span>
  );
}
