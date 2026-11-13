"use client";
import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import {
  createScrambler,
  DEFAULT_CHARSET,
  type ScrambleController as Scrambler,
  type ScrambleRun as Run,
} from "../core/scramble";
import type { ScrambleProps } from "./types";

/**
 * Decodes a line out of noise. The markup carries the final text, so a reader
 * without motion, or one who never triggers a run, is left with the sentence
 * rather than a placeholder, and a run only ever replaces graphemes with the
 * same number of graphemes.
 *
 * The churn itself lives in the framework-free `createScrambler`; this file is
 * only the React binding, so the same engine can drive Vue and Svelte too.
 */
export function Scramble(props: ScrambleProps) {
  const {
    text,
    charset = DEFAULT_CHARSET,
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
