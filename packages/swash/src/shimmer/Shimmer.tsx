"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import { useStyle } from "../shared/style";
import type { ShimmerProps } from "./types";

/**
 * Sweeps a highlight across the child text. The beam itself lives in a
 * pseudo-element painted with `background-clip: text`, and the animation
 * shifts only `transform: translate3d` on that layer, so the browser keeps it
 * on the compositor and does not re-rasterise the glyphs each frame.
 *
 * Selection colour is restored through an explicit `::selection` rule; without
 * it, `color: transparent` makes the highlight invisible on macOS.
 */

const SHIMMER_CSS = [
  ".swash-shimmer{position:relative;display:inline-block}",
  ".swash-shimmer .swash-shimmer-base{color:var(--swash-shimmer-base,#888)}",
  ".swash-shimmer .swash-shimmer-beam{",
  "  position:absolute;inset:0;",
  "  color:transparent;",
  "  background-image:linear-gradient(100deg,transparent 0,transparent calc(50% - var(--swash-shimmer-spread,240px)),var(--swash-shimmer-color,rgba(255,255,255,0.85)) 50%,transparent calc(50% + var(--swash-shimmer-spread,240px)),transparent 100%);",
  "  background-repeat:no-repeat;",
  "  background-size:200% 100%;",
  "  -webkit-background-clip:text;",
  "  background-clip:text;",
  "  will-change:transform,background-position;",
  "  pointer-events:none;",
  "  animation:swash-shimmer-sweep var(--swash-shimmer-duration,2400ms) linear infinite;",
  "}",
  ".swash-shimmer .swash-shimmer-beam.paused{animation-play-state:paused}",
  ".swash-shimmer .swash-shimmer-beam.reduced{animation:none}",
  "@keyframes swash-shimmer-sweep{0%{background-position:150% 0}100%{background-position:-50% 0}}",
  // Preserve a readable selection for both the base and the beam copy; the
  // beam has `pointer-events:none` so only the base is actually selectable.
  ".swash-shimmer .swash-shimmer-base::selection{background:Highlight;color:HighlightText;-webkit-text-fill-color:HighlightText}",
].join("\n");

export function Shimmer(props: ShimmerProps) {
  const {
    children,
    spread,
    duration,
    color = "rgba(255, 255, 255, 0.85)",
    baseColor = "#888888",
    pauseWhenHidden = true,
    className,
    style,
  } = props;

  const beamSpread = pixels(spread, 240, "spread", "Shimmer");
  const sweep = ms(duration, 2400, "duration", "Shimmer");
  const reduced = useReducedMotion();

  useStyle("swash-shimmer", SHIMMER_CSS);

  const rootRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<HTMLSpanElement>(null);

  // Off-screen pause: IntersectionObserver only fires for visible states, so
  // a manual `isIntersecting` listener is required to flip the play-state
  // back on. Bypass the shared registry for that because it is enter-only.
  useEffect(() => {
    if (!pauseWhenHidden || reduced) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (records) => {
        const beam = beamRef.current;
        if (!beam) return;
        for (const r of records) {
          beam.classList.toggle("paused", !r.isIntersecting);
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pauseWhenHidden, reduced]);

  // When pause-when-hidden is off, make sure no stale `.paused` class
  // sticks around from a previous mount (React Fast Refresh keeps DOM).
  useEffect(() => {
    const beam = beamRef.current;
    if (beam && !pauseWhenHidden) beam.classList.remove("paused");
  }, [pauseWhenHidden]);

  const vars = {
    ["--swash-shimmer-color" as string]: color,
    ["--swash-shimmer-base" as string]: baseColor,
    ["--swash-shimmer-spread" as string]: `${beamSpread}px`,
    ["--swash-shimmer-duration" as string]: `${sweep}ms`,
  } as React.CSSProperties;

  const merged = { ...vars, ...style };
  const cls = className ? `swash-shimmer ${className}` : "swash-shimmer";

  return (
    <span ref={rootRef} className={cls} style={merged}>
      <span className="swash-shimmer-base">{children}</span>
      <span
        ref={beamRef}
        aria-hidden="true"
        className={reduced ? "swash-shimmer-beam reduced" : "swash-shimmer-beam"}
      >
        {children}
      </span>
    </span>
  );
}
