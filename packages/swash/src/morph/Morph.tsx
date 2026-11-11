"use client";
import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { tween } from "../shared/tween";
import { warnOnce } from "../shared/warn";
import { planTransition } from "./transition";
import type { MorphProps } from "./types";

const DEFAULT_DURATION = 600;
const DEFAULT_HOLD = 1200;

/** The word is squeezed through the seam it changes at, not swapped for it. */
const SQUASH = 0.5;
const TAIL_SQUEEZE = 0.4;

interface Live {
  values: string[];
  duration: number;
  hold: number;
  loop: boolean;
  step: number;
  reduced: boolean;
  onMorphed?: (value: string, index: number) => void;
}

interface Morpher {
  /** Moves to one value, and keeps the list turning when it is looping. */
  go(next: number): void;
  /** Waits out the hold, then starts the turn. */
  cycle(): void;
  /** Puts the word the in-flight swap is heading for straight on screen. */
  settle(): void;
  dispose(): void;
}

/** A box a transform can work on, holding the graphemes it was handed. */
function span(text: string): HTMLSpanElement {
  const el = document.createElement("span");
  el.textContent = text;
  el.style.display = "inline-block";
  return el;
}

function createMorpher(
  body: HTMLElement,
  ruler: HTMLElement,
  read: () => Live,
): Morpher {
  let index = 0;
  let run: ReturnType<typeof tween> | null = null;
  let timer: number | null = null;
  let heading: string | null = null;

  const clear = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    run?.cancel();
    run = null;
  };

  /** Reads a width from a span that is laid out but never seen. */
  const measure = (text: string) => {
    ruler.textContent = text;
    return ruler.getBoundingClientRect().width;
  };

  /** The resting state: plain text, no width of its own, free to wrap. */
  const rest = (text: string) => {
    body.textContent = text;
    body.style.width = "";
    body.style.overflow = "";
    body.style.whiteSpace = "";
    body.style.verticalAlign = "";
  };

  const landed = (text: string) => {
    heading = null;
    rest(text);
    const live = read();
    live.onMorphed?.(text, index);
    if (live.loop) timer = window.setTimeout(() => go((index + 1) % live.values.length), live.hold);
  };

  const go = (next: number) => {
    const live = read();
    const to = live.values[next] ?? "";
    // Read from what is on screen rather than from an index: the list may have
    // changed underneath this run, and the reader's eye is still on the old word.
    const from = body.textContent ?? "";
    index = next;
    clear();

    if (to === from) {
      rest(to);
      return;
    }
    if (live.reduced || live.duration <= 0) {
      landed(to);
      return;
    }

    const plan = planTransition(from, to);
    const kept = splitGraphemes(from).slice(0, plan.keep);
    const pivot = kept.pop();
    const prefix = kept.join("");

    const pivotEl = pivot === undefined ? null : span(pivot);
    const outEl = plan.out.length > 0 ? span(plan.out.join("")) : null;
    if (outEl) outEl.style.transformOrigin = "right center";
    const inEl = plan.in_.length > 0 ? span(plan.in_.join("")) : null;
    if (inEl) {
      // Invisible before the first frame, or one frame shows both tails at
      // full weight and the swap reads as a doubling.
      inEl.style.transformOrigin = "left center";
      inEl.style.opacity = "0";
      inEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE})`;
    }

    const width = measure(from);
    const target = measure(to);
    body.replaceChildren();
    if (prefix.length > 0) body.append(prefix);
    if (pivotEl) body.append(pivotEl);
    if (outEl) body.append(outEl);
    if (inEl) body.append(inEl);

    // Clipped to a width that is tweened, so the words either side of it never
    // shift, and un-clipped again the moment the swap is over.
    body.style.whiteSpace = "nowrap";
    body.style.overflow = "hidden";
    body.style.verticalAlign = "bottom";
    body.style.width = `${width}px`;
    heading = to;

    run = tween({
      from: 0,
      to: 1,
      duration: live.duration,
      onUpdate: (p) => {
        body.style.width = `${width + (target - width) * p}px`;
        // The seam pinches in the middle of the swap and lets go by the end.
        const pinch = 1 - SQUASH * Math.sin(p * Math.PI);
        if (pivotEl) pivotEl.style.transform = `scaleX(${pinch})`;
        if (outEl) {
          outEl.style.opacity = `${1 - p}`;
          outEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE * p})`;
        }
        if (inEl) {
          inEl.style.opacity = `${p}`;
          inEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE + TAIL_SQUEEZE * p})`;
        }
      },
      onComplete: () => {
        run = null;
        landed(to);
      },
    });
  };

  return {
    go,
    cycle() {
      const live = read();
      clear();
      timer = window.setTimeout(() => go((index + 1) % live.values.length), live.hold);
    },
    settle() {
      if (heading === null) return;
      const to = heading;
      clear();
      landed(to);
    },
    dispose: clear,
  };
}

/**
 * Changes one word into another by moving only the part of it that differs:
 * the shared beginning holds still, the tail that leaves squeezes out and the
 * tail that arrives squeezes in, and the whole thing keeps the width it
 * measured so the sentence around it never flinches.
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
  const rulerRef = useRef<HTMLSpanElement>(null);
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
    const ruler = rulerRef.current;
    if (!body || !ruler) return;
    const controller = createMorpher(body, ruler, () => live.current);
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
    <span className={className} style={{ display: "inline-block", ...style }}>
      <span ref={bodyRef} data-swash-morph="" style={{ display: "inline-block" }}>
        {first}
      </span>
      <span
        ref={rulerRef}
        data-swash-morph-ruler=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          whiteSpace: "pre",
          pointerEvents: "none",
        }}
      />
    </span>
  );
}
