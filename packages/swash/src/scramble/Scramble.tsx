"use client";
import { useEffect, useRef } from "react";
import { EASE } from "../shared/bezier";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { warnOnce } from "../shared/warn";
import { tween } from "../shared/tween";
import type { ScrambleProps } from "./types";

const CHARSET = "!<>-_\\/[]{}=+*^?#0123456789ABCDEF";

/** A short line gets a short run, so the churn never looks like it stalled. */
const BASE_MS = 900;
const PER_GRAPHEME_MS = 30;
const MIN_SPEED = 0.5;
const MAX_SPEED = 3;

interface Run {
  text: string;
  charset: string;
  speed: number;
  reduced: boolean;
  onDone?: () => void;
}

interface Scrambler {
  start(run: Run): void;
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

function createScrambler(el: HTMLElement): Scrambler {
  let current: ReturnType<typeof tween> | null = null;

  return {
    start(run) {
      // One run at a time: a new target replaces whatever was mid-churn, so a
      // fast typist retyping a live value never stacks two loops.
      current?.cancel();
      current = null;
      el.textContent = run.text;

      const target = splitGraphemes(run.text);
      const glyphs = splitGraphemes(run.charset === "" ? CHARSET : run.charset);
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

/**
 * Decodes a line out of noise. The markup carries the final text, so a reader
 * without motion, or one who never triggers a run, is left with the sentence
 * rather than a placeholder, and a run only ever replaces graphemes with the
 * same number of graphemes.
 */
export function Scramble(props: ScrambleProps) {
  const {
    text,
    charset = CHARSET,
    speed = 1,
    trigger = "mount",
    onDone,
    className,
    style,
  } = props;

  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  // A run reads its text, charset, pace and the motion setting when it starts,
  // not when the effect around it was built, so retuning any of them cannot
  // restart the churn behind the reader's back.
  const live = useRef<Run>({ text, charset, speed, reduced, onDone });
  useIsomorphicLayoutEffect(() => {
    live.current = { text, charset, speed, reduced, onDone };
  });

  const scrambler = useRef<Scrambler | null>(null);
  useIsomorphicLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const controller = createScrambler(el);
    scrambler.current = controller;
    return () => {
      if (scrambler.current === controller) scrambler.current = null;
      controller.dispose();
    };
  }, []);

  const start = () => scrambler.current?.start(live.current);

  useIsomorphicLayoutEffect(() => {
    if (trigger === "mount") start();
  }, [trigger]);

  // Under `prop` the text is the whole point, so a change to it is the start
  // signal and a re-render that leaves it alone is nothing at all.
  const landed = useRef(text);
  useIsomorphicLayoutEffect(() => {
    if (trigger !== "prop") {
      landed.current = text;
      return;
    }
    if (text === landed.current) return;
    landed.current = text;
    start();
  }, [trigger, text]);

  // Turning reduced motion on lands the line where it was already heading
  // instead of leaving it mid-churn. Turning it back off starts nothing.
  const wasReduced = useRef(reduced);
  useIsomorphicLayoutEffect(() => {
    const flipped = wasReduced.current !== reduced;
    wasReduced.current = reduced;
    if (!flipped || !reduced) return;
    start();
  }, [reduced]);

  useEffect(() => {
    if (trigger !== "view") return;
    const el = rootRef.current;
    if (!el) return;
    return observeInview(el, { once: true, ratio: 0.3 }, start);
  }, [trigger]);

  useEffect(() => {
    if (trigger !== "click") return;
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener("click", start);
    return () => el.removeEventListener("click", start);
  }, [trigger]);

  return (
    <span ref={rootRef} className={className} style={style} aria-label={text}>
      <span ref={textRef} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
