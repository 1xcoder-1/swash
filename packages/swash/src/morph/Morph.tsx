"use client";
import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { warnOnce } from "../shared/warn";
import {
  createMorpher,
  type MorphLive as Live,
  type MorphController as Morpher,
} from "../core/morph";
import type { MorphProps } from "./types";

const DEFAULT_DURATION = 600;
const DEFAULT_HOLD = 1200;

/**
 * Changes one word into another by moving only the part of it that differs:
 * the shared beginning holds still, the tail that leaves squeezes out and the
 * tail that arrives squeezes in, and the whole thing keeps the width it
 * measured so the sentence around it never flinches.
 *
 * The morphing itself lives in the framework-free `createMorpher`; this file is
 * only the React binding around it, so the same engine can drive Vue and
 * Svelte too.
 */
export function Morph(props: MorphProps) {
  const {
    values,
    duration,
    hold,
    loop = false,
    step,
    onMorphed,
    className,
    style,
  } = props;

  const bodyRef = useRef<HTMLSpanElement>(null);
  const rulerTextRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  // The markup carries the first value, so a reader without script still gets
  // a word rather than a gap. It is never written again; from here the effect
  // owns what is on screen.
  const [first] = useState(() => values[0] ?? "");

  const live = useRef<Live>({
    values,
    duration: ms(duration, DEFAULT_DURATION, "duration", "Morph"),
    hold: ms(hold, DEFAULT_HOLD, "hold", "Morph"),
    loop,
    step: step ?? 1,
    reduced,
    onMorphed,
  });
  useIsomorphicLayoutEffect(() => {
    live.current = {
      values,
      duration: ms(duration, DEFAULT_DURATION, "duration", "Morph"),
      hold: ms(hold, DEFAULT_HOLD, "hold", "Morph"),
      loop,
      step: step ?? 1,
      reduced,
      onMorphed,
    };
  });

  const morpher = useRef<Morpher | null>(null);
  useIsomorphicLayoutEffect(() => {
    const body = bodyRef.current;
    const text = rulerTextRef.current;
    if (!body || !text) return;
    const controller = createMorpher(body, text, () => live.current);
    morpher.current = controller;
    return () => {
      if (morpher.current === controller) morpher.current = null;
      controller.dispose();
    };
  }, []);

  // The list is compared by what is in it, so a parent that rebuilds the array
  // on every render cannot take the cycle back to its first word.
  const list = values.join("\u0000");
  useIsomorphicLayoutEffect(() => {
    if (values.length < 2) {
      warnOnce("morph:values", "Morph needs at least two values to move between");
      return;
    }
    const controller = morpher.current;
    if (!controller) return;
    if (loop) controller.cycle();
    else controller.go(step ?? 1);
  }, [list, loop, step]);

  // Turning reduced motion on finishes the swap that is on screen rather than
  // letting it ease to a stop. Turning it back off starts nothing new.
  const wasReduced = useRef(reduced);
  useIsomorphicLayoutEffect(() => {
    const flipped = wasReduced.current !== reduced;
    wasReduced.current = reduced;
    if (flipped && reduced) morpher.current?.settle();
  }, [reduced]);

  return (
    <span className={className} style={{ display: "inline-block", position: "relative", ...style }}>
      <span ref={bodyRef} data-swash-morph="" style={{ display: "inline-block" }}>
        {first}
      </span>
      {/* Zero box, so the wide word inside it adds nothing to the page's
          scrollable area: an invisible element still lays out, and a long value
          measured next to the last one of a line would push a scrollbar onto
          the document for as long as the swap lasted. The inner span is what
          gets measured, and it is measured at the size its own text wants. */}
      <span
        data-swash-morph-ruler=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: "hidden",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <span ref={rulerTextRef} style={{ display: "inline-block", whiteSpace: "pre" }} />
      </span>
    </span>
  );
}
