"use client";
import { useEffect, useRef, useState } from "react";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { LiquidProps } from "./types";

/**
 * A glass of text: the glyphs are the vessel, and the liquid rises inside
 * them from an empty state, with a surface that keeps bobbing after the
 * pour. The reader's copy is plain ink; the liquid is a second copy painted
 * with `background-clip: text`.
 *
 * The level lives in a registered custom property (`@property`), which is
 * what makes a hard-edged fill line inside a gradient animatable without
 * JavaScript frames: the rise is a transition on `--swash-liquid-level`, and
 * the bob is a keyframe on `--swash-liquid-swell` added to it through calc.
 * Engines without `@property` skip the animation and show the filled state —
 * a level that is wrong for one frame is never worth a crash over.
 */

const LIQUID_CSS = [
  "@property --swash-liquid-level{syntax:'<percentage>';inherits:false;initial-value:0%}",
  "@property --swash-liquid-swell{syntax:'<percentage>';inherits:false;initial-value:0%}",
  ".swash-liquid{position:relative;display:inline-block}",
  ".swash-liquid .swash-liquid-fill{",
  "  position:absolute;inset:0;",
  "  color:transparent;",
  "  background-clip:text;",
  "  -webkit-background-clip:text;",
  // The hard edge is the surface. `calc(100% - level)` measured from the
  // top, plus the swell, is the waterline inside the glyphs.
  "  background-image:",
  "    linear-gradient(180deg,",
  "      transparent calc(100% - var(--swash-liquid-level) + var(--swash-liquid-swell)),",
  "      color-mix(in srgb, var(--swash-liquid-color) 55%, white) calc(100% - var(--swash-liquid-level) + var(--swash-liquid-swell)),",
  "      color-mix(in srgb, var(--swash-liquid-color) 72%, white) calc(100% - var(--swash-liquid-level) + var(--swash-liquid-swell) + 4%),",
  "      var(--swash-liquid-color) calc(100% - var(--swash-liquid-level) + var(--swash-liquid-swell) + 9%),",
  "      color-mix(in srgb, var(--swash-liquid-color) 78%, black) 100%);",
  "  background-repeat:no-repeat;",
  "  pointer-events:none;",
  "  transition:--swash-liquid-level var(--swash-liquid-duration,1500ms) cubic-bezier(0.16,1,0.3,1);",
  "}",
  ".swash-liquid.filled .swash-liquid-fill{--swash-liquid-level:var(--swash-liquid-final,100%)}",
  ".swash-liquid.bob .swash-liquid-fill{animation:swash-liquid-swell var(--swash-liquid-wave,2600ms) ease-in-out infinite}",
  "@keyframes swash-liquid-swell{",
  "  0%,100%{--swash-liquid-swell:0%}",
  "  50%{--swash-liquid-swell:-3%}",
  "}",
  "@media (prefers-reduced-motion: reduce){",
  "  .swash-liquid .swash-liquid-fill{transition:none}",
  "  .swash-liquid.bob .swash-liquid-fill{animation:none}",
  "}",
].join("\n");

export function Liquid(props: LiquidProps) {
  const {
    children,
    color = "#38bdf8",
    level = 1,
    duration = 1500,
    wave = 2600,
    trigger = "view",
    hold = 2400,
    className,
    style,
  } = props;

  useStyle("swash-liquid", LIQUID_CSS);
  const reduced = useReducedMotion();

  const share = level;
  if (!(Number.isFinite(share) && share > 0 && share <= 1)) {
    warnOnce(
      "liquid:level",
      `Liquid level wants a number from 0 to 1, got ${level}. Using 1.`,
    );
  }
  const final = Number.isFinite(share) && share > 0 && share <= 1 ? share : 1;

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "view");
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (trigger !== "view") return;
    const root = rootRef.current;
    if (!root) return;
    return observeInview(
      root,
      { once: false, ratio: 0.4 },
      () => setInview(true),
      () => setInview(false),
    );
  }, [trigger]);

  // The pour runs once per visit; the loop pours, holds and drains.
  useEffect(() => {
    if (reduced) {
      setFilled(true);
      return;
    }
    if (trigger === "hover") {
      setFilled(hovering);
      return;
    }
    if (trigger === "view") {
      setFilled(inview);
      return;
    }
    // Loop: rise, hold, drain, rise again. One timer, rescheduled from
    // whatever state it just left.
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const step = (up: boolean, wait: number) => {
      if (!alive) return;
      setFilled(up);
      timer = setTimeout(() => step(!up, up ? hold : duration), wait);
    };
    step(true, duration + hold);
    return () => {
      alive = false;
      if (timer !== null) clearTimeout(timer);
    };
  }, [trigger, reduced, hovering, inview, hold, duration]);

  const vars = {
    "--swash-liquid-color": color,
    "--swash-liquid-final": `${Math.round(final * 100)}%`,
    "--swash-liquid-duration": `${duration}ms`,
    "--swash-liquid-wave": `${wave}ms`,
  } as React.CSSProperties;

  const cls = [
    "swash-liquid",
    filled ? "filled" : "",
    filled && !reduced ? "bob" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={rootRef} className={cls} style={{ ...vars, ...style }}>
      <span data-swash-sr="" style={srOnlyStyle}>{children}</span>
      <span aria-hidden="true">{children}</span>
      <span className="swash-liquid-fill" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
