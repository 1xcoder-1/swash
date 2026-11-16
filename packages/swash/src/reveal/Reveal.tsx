"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import {
  REVEAL_CSS,
  REVEAL_RATIO,
  REVEAL_ROOT_MARGIN,
  runReveal,
  tokenize,
} from "../core/reveal";
import type { RevealEffect } from "./types";
import type { RevealProps } from "./types";

/**
 * Brings a line of text in piece by piece: the whole thing is in the markup the
 * server sent, and only after mount does each piece get its animation, so
 * hydration never sees a difference and the reader never sees a flash.
 *
 * One component carries both entrances: `effect="rise"` moves each piece up
 * from below, `effect="blur"` pulls it into focus from a Gaussian blur and a
 * slight scale — the depth-of-field entrance — and both run on the same
 * engine, with no second stylesheet and no second markup shape.
 *
 * The animating lives in the framework-free `runReveal`; this file only renders
 * the pieces and drives it, so the same engine can drive other bindings too.
 */
export function Reveal(props: RevealProps) {
  const {
    children,
    by = "word",
    effect = "rise",
    stagger,
    duration,
    y,
    blur,
    startOnView = true,
    once = true,
    className,
    style,
  } = props;

  const text = typeof children === "string" ? children : null;
  // A negative duration is not a shorter reveal: Web Animations throws on it,
  // which would take the page down over a typo in a prop.
  const take = ms(duration, 400, "duration", "Reveal");
  const gap = ms(stagger, 40, "stagger", "Reveal");
  // An effect nobody on the list knows would fall through the keyframe
  // switch and rise silently, so it is named as the mistake it is.
  const kind: RevealEffect = effect === "blur" ? "blur" : "rise";
  if (effect !== "rise" && effect !== "blur") {
    warnOnce(
      `reveal:effect:${String(effect)}`,
      `Reveal effect "${String(effect)}" is not one of "rise", "blur". Using "rise".`,
    );
  }
  const pieces = useMemo(
    () => (text === null ? [] : tokenize(text, by)),
    [text, by],
  );

  const rootRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [visits, setVisits] = useState(0);
  const shown = !startOnView || visits > 0;

  // Timing and the motion setting are read when a pass starts rather than
  // when its effect was built, so retuning either one cannot restart a line
  // that is already on its way.
  const live = useRef({ duration: take, stagger: gap, y, blur, effect: kind, reduced });
  useIsomorphicLayoutEffect(() => {
    live.current = { duration: take, stagger: gap, y, blur, effect: kind, reduced };
  });

  useIsomorphicLayoutEffect(() => {
    if (text === null) {
      warnOnce("reveal:children", "Reveal takes a string in v1; children are rendered as they are");
    }
  }, [text]);

  useStyle("swash-reveal", REVEAL_CSS);

  const dispose = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !shown) return;
    const cleanup = runReveal(root, {
      by,
      effect: live.current.effect,
      duration: live.current.duration,
      stagger: live.current.stagger,
      y: live.current.y,
      blur: live.current.blur,
      reduced: live.current.reduced,
    });
    dispose.current = cleanup;
    return () => {
      cleanup();
      if (dispose.current === cleanup) dispose.current = null;
    };
  }, [shown, visits, by, text]);

  // Turning reduced motion on stops whatever is mid-flight. Turning it back
  // off does not send the line away and bring it again.
  useIsomorphicLayoutEffect(() => {
    if (!reduced) return;
    dispose.current?.();
    dispose.current = null;
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    if (!startOnView || !root) return;
    return observeInview(
      root,
      { once, ratio: REVEAL_RATIO, rootMargin: REVEAL_ROOT_MARGIN },
      () => setVisits((n) => n + 1),
    );
  }, [startOnView, once]);

  return (
    <span ref={rootRef} className={className} style={style}>
      {/* A real node carries the line for assistive tech; the split pieces are
          hidden from it, so a heading is announced once, never spelled out. */}
      {text !== null ? <span data-swash-sr="" style={srOnlyStyle}>{text}</span> : null}
      {pieces.map((piece, i) =>
        piece.animated ? (
          <span key={i} data-swash-reveal="" aria-hidden="true">
            {piece.text}
          </span>
        ) : (
          <Fragment key={i}>{piece.text}</Fragment>
        ),
      )}
      {text === null ? children : null}
    </span>
  );
}
