"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes, splitWordTokens } from "../shared/grapheme";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import { useStyle } from "../shared/style";
import type { BlurRevealProps } from "./types";

/**
 * Cinematic blur-to-focus reveal. Words (or lines, or graphemes) start out
 * blurred and slightly scaled up, then transition to sharp. Uses one CSS
 * transition per word rather than per-letter animation loops so GPU work
 * stays bounded on mobile.
 */

const BLUR_REVEAL_CSS = [
  ".swash-blur-reveal{display:inline}",
  ".swash-blur-reveal .swash-blur-piece{",
  "  display:inline-block;",
  "  will-change:filter,transform,opacity;",
  "  filter:blur(var(--swash-blur-radius,10px));",
  "  opacity:0;",
  "  transform:translate3d(0,0,0) scale(1.05);",
  "  transition:filter var(--swash-blur-duration,500ms) cubic-bezier(0.16,1,0.3,1) var(--swash-blur-delay,0ms),",
  "             opacity var(--swash-blur-duration,500ms) cubic-bezier(0.16,1,0.3,1) var(--swash-blur-delay,0ms),",
  "             transform var(--swash-blur-duration,500ms) cubic-bezier(0.16,1,0.3,1) var(--swash-blur-delay,0ms);",
  "}",
  ".swash-blur-reveal.shown .swash-blur-piece{",
  "  filter:blur(0px);",
  "  opacity:1;",
  "  transform:translate3d(0,0,0) scale(1);",
  "}",
  // Once shown and reduced, skip the transition entirely.
  ".swash-blur-reveal.reduced .swash-blur-piece{",
  "  filter:none;opacity:1;transform:none;transition:none;",
  "}",
].join("\n");

type Piece = { text: string; space: boolean };

function tokenize(text: string, by: "word" | "line" | "char"): Piece[] {
  if (by === "word") return splitWordTokens(text);
  if (by === "char") {
    return splitGraphemes(text).map((g) => ({ text: g, space: /^\s+$/.test(g) }));
  }
  // line
  return text
    .split(/(\n+)/)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, space: /^\n+$/.test(t) }));
}

export function BlurReveal(props: BlurRevealProps) {
  const {
    children,
    by = "word",
    blur,
    stagger,
    duration,
    startOnView = true,
    once = true,
    className,
    style,
  } = props;

  const radius = pixels(blur, 10, "blur", "BlurReveal");
  const take = ms(duration, 500, "duration", "BlurReveal");
  const gap = ms(stagger, 60, "stagger", "BlurReveal");

  const pieces = useMemo(() => tokenize(children, by), [children, by]);
  const reduced = useReducedMotion();

  useStyle("swash-blur-reveal", BLUR_REVEAL_CSS);

  const rootRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView) {
      setVisible(true);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    return observeInview(root, { once, ratio: 0.1 }, () => setVisible(true));
  }, [startOnView, once]);

  // Reduced-motion flips straight to shown; no per-piece transition.
  useIsomorphicLayoutEffect(() => {
    if (reduced) setVisible(true);
  }, [reduced]);

  // Count only animated pieces for the stagger delay so spaces don't
  // consume a slot (they aren't rendered as pieces anyway).
  let animatedIndex = -1;

  const rootCls = [
    "swash-blur-reveal",
    visible ? "shown" : "",
    reduced ? "reduced" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const vars = {
    ["--swash-blur-radius" as string]: `${radius}px`,
    ["--swash-blur-duration" as string]: `${take}ms`,
  } as React.CSSProperties;

  const mergedStyle = { ...vars, ...style };

  return (
    <span
      ref={rootRef}
      className={rootCls}
      style={mergedStyle}
      aria-label={children}
    >
      {pieces.map((p, i) => {
        if (p.space) {
          // Bare text between animated pieces would still be read by a
          // screen reader on top of the aria-label, so hide it explicitly.
          return (
            <span key={i} aria-hidden="true">
              {p.text}
            </span>
          );
        }
        animatedIndex += 1;
        const pieceStyle = {
          ["--swash-blur-delay" as string]: `${animatedIndex * gap}ms`,
        } as React.CSSProperties;
        return (
          <span
            key={i}
            className="swash-blur-piece"
            style={pieceStyle}
            aria-hidden="true"
          >
            {p.text}
          </span>
        );
      })}
    </span>
  );
}
