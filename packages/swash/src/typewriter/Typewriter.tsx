"use client";
import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import { CARET_CSS } from "../core/typewriter";
import { useTypewriter } from "./useTypewriter";
import type { TypewriterProps } from "./types";

export function Typewriter(props: TypewriterProps) {
  const {
    text,
    loop,
    feel,
    cursor = true,
    startOnView = false,
    onDone,
    onLoopDone,
    className,
    style,
  } = props;

  const phrases = loop && loop.length > 0 ? loop : [text ?? ""];
  const looping = loop !== undefined && loop.length > 0;

  const root = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  // Read on every render instead of latched at mount: a page that turns
  // startOnView off has to get going, even though the observer it had asked
  // for is unregistered by then.
  const visible = !startOnView || entered;

  useEffect(() => {
    if (!startOnView || !root.current) return;
    return observeInview(root.current, { once: true, ratio: 0.3 }, () => setEntered(true));
  }, [startOnView]);

  useIsomorphicLayoutEffect(() => {
    if (looping && text !== undefined) {
      warnOnce("typewriter:loop-and-text", "loop is set, so text is ignored");
    }
  }, [looping, text]);

  useStyle("swash-caret", CARET_CSS);
  const typed = useTypewriter({
    phrases,
    looping,
    feel,
    enabled: visible,
    reduced,
    onDone,
    onLoopDone,
  });

  return (
    <span ref={root} className={className} style={{ display: "inline", ...style }} aria-label={typed.phrase}>
      {typed.graphemes.map((char, index) => (
        <span
          key={index}
          ref={typed.charRef(index)}
          data-swash-char=""
          aria-hidden="true"
          style={{ visibility: index < typed.count ? "visible" : "hidden" }}
        >
          {char}
        </span>
      ))}
      {cursor ? <span data-swash-caret="" aria-hidden="true" /> : null}
    </span>
  );
}
