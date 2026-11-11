"use client";
import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import { useTypewriter } from "./useTypewriter";
import type { TypewriterProps } from "./types";

/**
 * The caret lives on the element after the last grapheme, so it travels with
 * the text. Blinking is CSS: a timer would be one more thing to pause when the
 * tab goes away and one more reason to re-render.
 */
const CARET_CSS = `@keyframes swash-caret-blink { 0%, 45% { opacity: 1 } 55%, 100% { opacity: 0 } }
[data-swash-caret] {
  display: inline-block;
  width: 0;
  border-left: 1px solid currentColor;
  margin-left: 1px;
  animation: swash-caret-blink 1.05s steps(1, end) infinite;
}`;

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
  const [visible, setVisible] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView || !root.current) return;
    return observeInview(root.current, { once: true, ratio: 0.3 }, () => setVisible(true));
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
