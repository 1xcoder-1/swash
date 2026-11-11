import { useCallback, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { resolveFeel } from "../shared/presets";
import type { Feel } from "../shared/presets";
import type { TypewriterView, UseTypewriterOptions } from "./types";

type Phase = "typing" | "pausing" | "deleting" | "done";

/** How far a grapheme blurs in and out, in px and ms. */
const BLUR_PX = 8;
const BLUR_MS = 300;

/**
 * A hand is not a metronome: it settles into a line and slows down as it
 * reaches the end of it. The middle of a phrase therefore types a little
 * faster than the first and last graphemes.
 */
function rhythm(progress: number) {
  return 1 - 0.35 * Math.sin(progress * Math.PI);
}

/**
 * Deterministic wobble in [-1, 1]. Random jitter per step would give a
 * restarted run timings that differ from the run it replaced, and a re-render
 * could not tell the two apart.
 */
function jitterFor(index: number, seed: number) {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** The gap in ms before grapheme `index` of a phrase of `total` graphemes. */
function beat(index: number, total: number, feel: Feel, phrase: number, ratio = 1) {
  const progress = total <= 1 ? 0 : index / (total - 1);
  const base = feel.charDelay * rhythm(progress) * ratio;
  const wobble = 1 + jitterFor(index, phrase) * feel.jitter;
  return Math.max(1, Math.round(base * wobble));
}

/**
 * The typing machine: graphemes appear one at a time, a finished phrase holds,
 * then erases, and the pointer moves on. One timer drives it, and the only
 * thing it publishes is how much of the phrase is on screen, so a parent
 * re-render can neither speed the run up, slow it down, nor freeze it.
 */
export function useTypewriter(o: UseTypewriterOptions): TypewriterView {
  const feel = resolveFeel(o.feel);
  // Content, not array identity: a parent that rebuilds `loop` inline on every
  // render must not look like a new phrase list to the machine.
  const key = o.phrases.join("\u0000");
  const units = useMemo(() => o.phrases.map((phrase) => splitGraphemes(phrase)), [key]);

  const [shown, setShown] = useState({ phrase: 0, count: 0 });
  const elements = useRef(new Map<number, HTMLElement>());
  const animations = useRef(new Map<number, Animation>());
  const refCache = useRef(new Map<number, (el: HTMLElement | null) => void>());
  const latest = useRef(o);
  useIsomorphicLayoutEffect(() => {
    latest.current = o;
  });

  useIsomorphicLayoutEffect(() => {
    if (!o.enabled) return;
    const first = units[0] ?? [];

    // Reduced motion gets the finished line, not a faster version of the run.
    if (o.reduced) {
      setShown({ phrase: 0, count: first.length });
      latest.current.onDone?.();
      return;
    }

    const machine = { phrase: 0, count: 0, phase: "typing" as Phase };
    setShown({ phrase: 0, count: 0 });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const publish = () => setShown({ phrase: machine.phrase, count: machine.count });
    const rest = (ms: number) => {
      timer = setTimeout(tick, ms);
    };
    const typeBeat = (index: number, total: number) =>
      beat(index, total, feel, machine.phrase);
    const eraseBeat = (index: number, total: number) =>
      beat(index, total, feel, machine.phrase, feel.deleteRatio);

    const blur = (index: number, out: boolean) => {
      const el = elements.current.get(index);
      if (!el?.animate) return;
      animations.current.get(index)?.cancel();
      const frames = out
        ? [{ filter: "blur(0px)", opacity: 1 }, { filter: `blur(${BLUR_PX / 2}px)`, opacity: 0 }]
        : [{ filter: `blur(${BLUR_PX}px)`, opacity: 0.4 }, { filter: "blur(0px)", opacity: 1 }];
      const anim = el.animate(frames, {
        duration: out ? BLUR_MS * 0.6 : BLUR_MS,
        easing: "ease-out",
        fill: "forwards",
      });
      animations.current.set(index, anim);
    };

    /** Last grapheme erased: hand the line to the next phrase, or wrap. */
    const nextPhrase = () => {
      const wrapped = machine.phrase + 1 >= units.length;
      if (wrapped) latest.current.onLoopDone?.(o.phrases[machine.phrase] ?? "", machine.phrase);
      machine.phrase = wrapped ? 0 : machine.phrase + 1;
      machine.phase = "typing";
      publish();
      rest(typeBeat(0, (units[machine.phrase] ?? []).length));
    };

    function tick() {
      const chars = units[machine.phrase] ?? [];

      if (machine.phase === "typing") {
        if (machine.count >= chars.length) {
          // Nothing to type: an empty phrase holds, then moves on.
          if (!o.looping) {
            machine.phase = "done";
            latest.current.onDone?.();
            return;
          }
          machine.phase = "pausing";
          rest(feel.pause);
          return;
        }
        const index = machine.count;
        machine.count = index + 1;
        publish();
        blur(index, false);
        if (machine.count < chars.length) rest(typeBeat(machine.count, chars.length));
        else if (o.looping) {
          machine.phase = "pausing";
          rest(feel.pause);
        } else {
          machine.phase = "done";
          latest.current.onDone?.();
        }
        return;
      }

      if (machine.phase === "pausing") {
        machine.phase = "deleting";
        if (machine.count === 0) nextPhrase();
        else rest(eraseBeat(machine.count - 1, chars.length));
        return;
      }

      // Deleting, which only a looping typewriter can reach.
      const index = machine.count - 1;
      if (index >= 0) {
        machine.count = index;
        publish();
        blur(index, true);
      }
      if (machine.count > 0) rest(eraseBeat(machine.count - 1, chars.length));
      else nextPhrase();
    }

    rest(typeBeat(0, first.length));
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      animations.current.forEach((anim) => anim.cancel());
      animations.current.clear();
    };
  }, [
    key,
    units,
    o.enabled,
    o.reduced,
    o.looping,
    feel.charDelay,
    feel.jitter,
    feel.deleteRatio,
    feel.pause,
  ]);

  // Ref callbacks are cached per index so React sees the same function on every
  // render. A fresh closure each time makes React call the previous one with
  // null, which would forget the element a blur is still running on.
  const charRef = useCallback((index: number) => {
    const cached = refCache.current.get(index);
    if (cached) return cached;
    const attach = (el: HTMLElement | null) => {
      if (el) elements.current.set(index, el);
      else elements.current.delete(index);
    };
    refCache.current.set(index, attach);
    return attach;
  }, []);

  return {
    graphemes: units[shown.phrase] ?? [],
    count: shown.count,
    phrase: o.phrases[shown.phrase] ?? "",
    charRef,
  };
}
