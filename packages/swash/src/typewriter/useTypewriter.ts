import { useCallback, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { resolveFeel } from "../shared/presets";
import { runTypewriter } from "../core/typewriter";
import type { TypewriterView, UseTypewriterOptions } from "./types";

/**
 * The React binding around the framework-free typing machine in
 * `../core/typewriter`. It owns only what React needs to own: the state to
 * publish into, the per-grapheme element registry the machine blurs through,
 * and the decision of when to start or stop a run. The typing itself, and the
 * timing that made it breakable elsewhere, live in the shared engine so Vue and
 * Svelte drive the exact same machine.
 */
export function useTypewriter(o: UseTypewriterOptions): TypewriterView {
  const feel = resolveFeel(o.feel);
  // Content, not array identity: a parent that rebuilds `loop` inline on every
  // render must not look like a new phrase list to the machine.
  const key = o.phrases.join("\u0000");
  const units = useMemo(() => o.phrases.map((phrase) => splitGraphemes(phrase)), [key]);

  const [shown, setShown] = useState({ phrase: 0, count: 0 });
  const elements = useRef(new Map<number, HTMLElement>());
  const refCache = useRef(new Map<number, (el: HTMLElement | null) => void>());
  // Reads the current callbacks without listing them as effect dependencies, so
  // a re-render that only swaps `onDone` never restarts the run.
  const latest = useRef(o);
  useIsomorphicLayoutEffect(() => {
    latest.current = o;
  });

  useIsomorphicLayoutEffect(() => {
    if (!o.enabled) return;
    return runTypewriter({
      phrases: o.phrases,
      feel,
      looping: o.looping,
      reduced: o.reduced,
      publish: setShown,
      elementFor: (index) => elements.current.get(index) ?? null,
      onDone: () => latest.current.onDone?.(),
      onLoopDone: (phrase, index) => latest.current.onLoopDone?.(phrase, index),
    });
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
