"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { EASE_CSS } from "../shared/bezier";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes, splitWordTokens } from "../shared/grapheme";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { RevealBy, RevealProps } from "./types";

/**
 * A piece arrives as one box, and an inline span is not a box a transform can
 * move. The pieces get this and the spaces between them stay plain text, so
 * the line still wraps where the reader's font wants it to.
 */
const REVEAL_CSS = `[data-swash-reveal] { display: inline-block; }`;

/** The line is subordinate to the scroll that brings it, so it asks for less of the viewport than it takes. */
const RATIO = 0.2;
const ROOT_MARGIN = "0px 0px -10% 0px";

/** Two pieces this close to the same height are the same line. */
const LINE_EPSILON = 1;

interface Piece {
  text: string;
  /** False for the whitespace between pieces, which is never animated. */
  animated: boolean;
}

function tokenize(text: string, by: RevealBy): Piece[] {
  if (by === "fade") return [{ text, animated: true }];
  if (by === "letter") {
    return splitGraphemes(text).map((grapheme) => ({
      text: grapheme,
      animated: grapheme.trim() !== "",
    }));
  }
  return splitWordTokens(text).map((token) => ({
    text: token.text,
    animated: !token.space,
  }));
}

/**
 * Which line each piece ended up on, read from where it landed rather than
 * guessed from the text: only the browser knows where a paragraph wraps.
 */
function lineSteps(elements: HTMLElement[]): number[] {
  const tops: number[] = [];
  return elements.map((el) => {
    const top = el.getBoundingClientRect().top;
    const found = tops.findIndex((t) => Math.abs(t - top) < LINE_EPSILON);
    if (found >= 0) return found;
    tops.push(top);
    return tops.length - 1;
  });
}

/**
 * Brings a line of text in piece by piece: the whole thing is in the markup the
 * server sent, and only after mount does each piece get its animation, so
 * hydration never sees a difference and the reader never sees a flash.
 */
export function Reveal(props: RevealProps) {
  const {
    children,
    by = "word",
    stagger = 40,
    duration = 400,
    y,
    startOnView = true,
    once = true,
    className,
    style,
  } = props;

  const text = typeof children === "string" ? children : null;
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
  const live = useRef({ duration, stagger, y, reduced });
  useIsomorphicLayoutEffect(() => {
    live.current = { duration, stagger, y, reduced };
  });

  useIsomorphicLayoutEffect(() => {
    if (text === null) {
      warnOnce("reveal:children", "Reveal takes a string in v1; children are rendered as they are");
    }
  }, [text]);

  useStyle("swash-reveal", REVEAL_CSS);

  const moving = useRef<Animation[]>([]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !shown || live.current.reduced) return;
    const elements = [...root.querySelectorAll<HTMLElement>("[data-swash-reveal]")];
    if (elements.length === 0) return;

    const steps = by === "line" ? lineSteps(elements) : elements.map((_, i) => i);
    const fontSize = Number.parseFloat(getComputedStyle(root).fontSize) || 0;
    const rise = live.current.y ?? Math.round(fontSize * 0.35);

    const animations = elements.map((el, i) => {
      el.style.willChange = "opacity, transform";
      return el.animate(
        [
          { opacity: 0, transform: `translateY(${rise}px)` },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: live.current.duration,
          delay: steps[i]! * live.current.stagger,
          easing: EASE_CSS.out,
          // Both, so the gap between the trigger and a staggered piece's turn
          // is spent invisible rather than showing the finished line first.
          fill: "both",
        },
      );
    });

    const clear = () => {
      for (const el of elements) el.style.willChange = "";
    };
    moving.current = animations;
    // The pieces before it started sooner and finish sooner, so nothing is
    // still moving by the time this one stops.
    animations[animations.length - 1]?.finished.then(clear, () => {});

    return () => {
      for (const animation of animations) animation.cancel();
      clear();
    };
  }, [shown, visits, by, text]);

  // Turning reduced motion on stops whatever is mid-flight. Turning it back
  // off does not send the line away and bring it again.
  useIsomorphicLayoutEffect(() => {
    if (!reduced) return;
    for (const animation of moving.current) animation.cancel();
    moving.current = [];
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    if (!startOnView || !root) return;
    return observeInview(
      root,
      { once, ratio: RATIO, rootMargin: ROOT_MARGIN },
      () => setVisits((n) => n + 1),
    );
  }, [startOnView, once]);

  return (
    <span ref={rootRef} className={className} style={style}>
      {pieces.map((piece, i) =>
        piece.animated ? (
          <span key={i} data-swash-reveal="">
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
