"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { WaveProps } from "./types";

/**
 * Sine-wave text. The React tree renders each grapheme with an index
 * variable, and the actual up-and-down motion is a single shared keyframe
 * with a per-letter negative `animation-delay` — that is what turns a plain
 * bounce into a travelling wave without any per-frame JS.
 *
 * Graphemes come from `splitGraphemes` so a family emoji stays one
 * animated unit and does not fall apart into surrogate halves mid-bounce.
 */

const WAVE_CSS = [
  ".swash-wave{display:inline-block}",
  ".swash-wave .swash-wave-piece{",
  "  display:inline-block;",
  "  will-change:transform;",
  "}",
  ".swash-wave.playing .swash-wave-piece{",
  "  animation:swash-wave-bounce var(--swash-wave-duration,800ms) ease-in-out infinite;",
  "  animation-delay:calc(var(--swash-wave-i,0) * var(--swash-wave-interval,120ms) * -1);",
  "}",
  ".swash-wave.reduced .swash-wave-piece{animation:none}",
  "@keyframes swash-wave-bounce{",
  "  0%,100%{transform:translateY(0)}",
  "  50%{transform:translateY(calc(var(--swash-wave-amp,8px) * -1))}",
  "}",
].join("\n");

/** Flattens React children to a single plain-text string for wave splitting. */
function flatten(children: ReactNode): string | null {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  return null;
}

export function Wave(props: WaveProps) {
  const {
    children,
    amplitude,
    interval,
    duration,
    trigger = "hover",
    className,
    style,
  } = props;

  const amp = pixels(amplitude, 8, "amplitude", "Wave");
  const gap = ms(interval, 120, "interval", "Wave");
  const take = ms(duration, 800, "duration", "Wave");
  const reduced = useReducedMotion();
  useStyle("swash-wave", WAVE_CSS);

  const text = flatten(children);
  useIsomorphicLayoutEffect(() => {
    if (text === null) {
      warnOnce("wave:children", "Wave takes a string in v1; children are rendered as they are");
    }
  }, [text]);

  const graphemes = useMemo(
    () => (text === null ? [] : splitGraphemes(text)),
    [text],
  );

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    if (trigger !== "view") return;
    const root = rootRef.current;
    if (!root) return;
    return observeInview(root, { once: false, ratio: 0.25 }, () => setInview(true));
  }, [trigger]);

  const playing =
    !reduced &&
    (trigger === "loop" ||
      (trigger === "hover" && hovering) ||
      (trigger === "view" && inview));

  const vars = {
    ["--swash-wave-amp" as string]: `${amp}px`,
    ["--swash-wave-interval" as string]: `${gap}ms`,
    ["--swash-wave-duration" as string]: `${take}ms`,
  } as React.CSSProperties;

  const rootCls = [
    "swash-wave",
    playing ? "playing" : "",
    reduced ? "reduced" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (text === null) {
    return (
      <span ref={rootRef} className={rootCls} style={{ ...vars, ...style }}>
        {children}
      </span>
    );
  }

  let animatedIndex = -1;
  const rendered = graphemes.map((g, i) => {
    // Every Unicode whitespace (space, tab, newline, NBSP, ideographic space)
    // stays outside the animated track. Comparing to " " alone would let a
    // tab or NBSP bounce as if it were a letter, which reads as a layout glitch.
    if (/^\s+$/.test(g)) {
      return (
        <span key={i} aria-hidden="true">
          {g}
        </span>
      );
    }
    animatedIndex += 1;
    const pieceVars = {
      ["--swash-wave-i" as string]: String(animatedIndex),
    } as React.CSSProperties;
    return (
      <span
        key={i}
        className="swash-wave-piece"
        style={pieceVars}
        aria-hidden="true"
      >
        {g}
      </span>
    );
  });

  return (
    <span
      ref={rootRef}
      className={rootCls}
      style={{ ...vars, ...style }}
      aria-label={text}
      onMouseEnter={() => trigger === "hover" && setHovering(true)}
      onMouseLeave={() => trigger === "hover" && setHovering(false)}
      onFocus={() => trigger === "hover" && setHovering(true)}
      onBlur={() => trigger === "hover" && setHovering(false)}
    >
      {rendered}
    </span>
  );
}
