"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { NeonProps } from "./types";

/**
 * A neon tube: the glyphs carry the colour, and the glow lives in two
 * text-shadow layers around them — a tight one that reads as the gas lit
 * close to the glass, and a wide one that washes the wall behind. Both are
 * derived from one ink through `color-mix`, so a name or a raw CSS colour
 * makes the whole sign.
 *
 * Flicker is a steps() keyframe on an opacity of the glow layer only — the
 * letters themselves hold steady, because a tube that loses its glyphs reads
 * as a broken page, not a broken sign.
 */

const NEON_CSS = [
  ".swash-neon{",
  "  position:relative;display:inline-block;",
  "  color:var(--swash-neon-lit,#fff);",
  "  text-shadow:",
  "    0 0 1px color-mix(in srgb, var(--swash-neon-ink) 60%, #fff),",
  "    0 0 8px color-mix(in srgb, var(--swash-neon-ink) 85%, transparent),",
  "    0 0 24px color-mix(in srgb, var(--swash-neon-ink) 55%, transparent),",
  "    0 0 64px color-mix(in srgb, var(--swash-neon-ink) 35%, transparent);",
  "}",
  // The unlit tube: the glass is still there, the gas is not.
  ".swash-neon.swash-neon-dim{",
  "  color:color-mix(in srgb, var(--swash-neon-ink) 30%, transparent);",
  "  text-shadow:0 0 1px color-mix(in srgb, var(--swash-neon-ink) 25%, transparent);",
  "}",
  ".swash-neon-flicker{animation:swash-neon-flicker-soft 6s steps(1,end) infinite}",
  ".swash-neon-flicker-hard{animation:swash-neon-flicker-hard 3.4s steps(1,end) infinite}",
  "@keyframes swash-neon-flicker-soft{",
  "  0%,79%,100%{opacity:1}",
  "  80%{opacity:.55}",
  "  81%,85%{opacity:1}",
  "  86%{opacity:.7}",
  "  87%,100.1%{opacity:1}",
  "}",
  "@keyframes swash-neon-flicker-hard{",
  "  0%,38%,41%,63%,66%,100%{opacity:1}",
  "  39%,40%{opacity:.35}",
  "  64%,65%{opacity:.5}",
  "}",
  "@media (prefers-reduced-motion: reduce){",
  "  .swash-neon-flicker,.swash-neon-flicker-hard{animation:none}",
  "}",
].join("\n");

/** Light-paintable tube inks. Anything else goes through as a CSS colour. */
const NEON_INKS: Record<string, string> = {
  amber: "#fbbf24",
  cyan: "#22d3ee",
  magenta: "#f472b6",
  lime: "#a3e635",
  violet: "#a78bfa",
  red: "#fb7185",
};

function neonInk(color: string): string {
  if (color in NEON_INKS) return NEON_INKS[color]!;
  return color;
}

export function Neon(props: NeonProps) {
  const {
    text,
    color = "cyan",
    flicker = "soft",
    trigger = "always",
    className,
    style,
  } = props;

  useStyle("swash-neon", NEON_CSS);
  const reduced = useReducedMotion();

  const ink = neonInk(color);
  const known = ["none", "soft", "hard"] as const;
  let flick = flicker;
  if (!known.includes(flicker)) {
    warnOnce(
      `neon:flicker:${String(flicker)}`,
      `Neon flicker "${String(flicker)}" is not one of ${known.join(", ")}. Using "soft".`,
    );
    flick = "soft";
  }

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "scroll");

  useEffect(() => {
    if (trigger !== "scroll") return;
    const root = rootRef.current;
    if (!root) return;
    // Both edges: a sign that has scrolled past stops drawing, instead of
    // humming somewhere below the fold for the rest of the page's life.
    return observeInview(
      root,
      { once: false, ratio: 0.3 },
      () => setInview(true),
      () => setInview(false),
    );
  }, [trigger]);

  // The setting kills the flicker, never the glow: a static sign is still a
  // lit sign, and dimming it would take the text's meaning away with the
  // motion.
  const lit =
    trigger === "always" ||
    (trigger === "hover" && hovering) ||
    (trigger === "scroll" && inview);

  const vars = {
    "--swash-neon-ink": ink,
    // The lit glyph colour leans on the tube ink, so a raw colour input still
    // lights the letters rather than fighting them.
    "--swash-neon-lit": "color-mix(in srgb, " + ink + " 35%, #fff)",
  } as CSSProperties;

  const cls = [
    "swash-neon",
    lit ? "" : "swash-neon-dim",
    lit && !reduced && flick === "soft" ? "swash-neon-flicker" : "",
    lit && !reduced && flick === "hard" ? "swash-neon-flicker-hard" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={rootRef}
      className={cls}
      style={{ ...vars, ...style }}
      onMouseEnter={() => trigger === "hover" && setHovering(true)}
      onMouseLeave={() => trigger === "hover" && setHovering(false)}
    >
      <span data-swash-sr="" style={srOnlyStyle}>{text}</span>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
