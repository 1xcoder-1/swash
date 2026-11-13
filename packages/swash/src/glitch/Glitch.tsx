"use client";
import { useEffect, useRef, useState } from "react";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { useStyle } from "../shared/style";
import type { GlitchProps } from "./types";

/**
 * Sci-fi glitch: two colour-offset copies of the text drawn through CSS
 * `::before` / `::after` pseudo-elements from `attr(data-text)`, plus a
 * `clip-path` slicing keyframe. Nothing here duplicates the DOM text node,
 * so screen readers read the phrase once and copy/paste stays clean.
 *
 * The three intensities are just different max offsets and slice counts
 * baked into the keyframes; the animation is on the compositor.
 */

const GLITCH_CSS = [
  ".swash-glitch{",
  "  position:relative;",
  "  display:inline-block;",
  "  color:inherit;",
  "}",
  ".swash-glitch::before,",
  ".swash-glitch::after{",
  "  content:attr(data-text);",
  "  position:absolute;",
  "  inset:0;",
  "  pointer-events:none;",
  "  mix-blend-mode:screen;",
  "}",
  ".swash-glitch::before{color:var(--swash-glitch-a,#0ff);}",
  ".swash-glitch::after{color:var(--swash-glitch-b,#f0f);}",
  // Only the "playing" state animates the pseudo-elements.
  ".swash-glitch.playing::before{animation:swash-glitch-a var(--swash-glitch-dur,900ms) steps(2,end) infinite;}",
  ".swash-glitch.playing::after{animation:swash-glitch-b var(--swash-glitch-dur,900ms) steps(2,end) infinite;}",
  // Subtle / medium / heavy change the max translate distance.
  ".swash-glitch.subtle{--swash-glitch-x:2px;--swash-glitch-y:1px;}",
  ".swash-glitch.medium{--swash-glitch-x:4px;--swash-glitch-y:2px;}",
  ".swash-glitch.heavy{--swash-glitch-x:8px;--swash-glitch-y:4px;}",
  "@keyframes swash-glitch-a{",
  "  0%   {transform:translate3d(calc(var(--swash-glitch-x)*-1),calc(var(--swash-glitch-y)*-1),0);clip-path:polygon(0 0,100% 0,100% 35%,0 35%)}",
  "  25%  {transform:translate3d(var(--swash-glitch-x),0,0);clip-path:polygon(0 40%,100% 40%,100% 65%,0 65%)}",
  "  50%  {transform:translate3d(calc(var(--swash-glitch-x)*-1),var(--swash-glitch-y),0);clip-path:polygon(0 70%,100% 70%,100% 100%,0 100%)}",
  "  75%  {transform:translate3d(0,calc(var(--swash-glitch-y)*-1),0);clip-path:polygon(0 20%,100% 20%,100% 45%,0 45%)}",
  "  100% {transform:translate3d(var(--swash-glitch-x),var(--swash-glitch-y),0);clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}",
  "}",
  "@keyframes swash-glitch-b{",
  "  0%   {transform:translate3d(var(--swash-glitch-x),var(--swash-glitch-y),0);clip-path:polygon(0 60%,100% 60%,100% 100%,0 100%)}",
  "  25%  {transform:translate3d(calc(var(--swash-glitch-x)*-1),0,0);clip-path:polygon(0 0,100% 0,100% 30%,0 30%)}",
  "  50%  {transform:translate3d(var(--swash-glitch-x),calc(var(--swash-glitch-y)*-1),0);clip-path:polygon(0 30%,100% 30%,100% 55%,0 55%)}",
  "  75%  {transform:translate3d(calc(var(--swash-glitch-x)*-1),var(--swash-glitch-y),0);clip-path:polygon(0 65%,100% 65%,100% 90%,0 90%)}",
  "  100% {transform:translate3d(calc(var(--swash-glitch-x)*-1),calc(var(--swash-glitch-y)*-1),0);clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}",
  "}",
  // Reduced motion: never play.
  ".swash-glitch.reduced::before,.swash-glitch.reduced::after{display:none}",
].join("\n");

export function Glitch(props: GlitchProps) {
  const {
    text,
    trigger = "hover",
    intensity = "medium",
    colors = ["#00ffff", "#ff00ff"],
    className,
    style,
  } = props;

  useStyle("swash-glitch", GLITCH_CSS);
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "scroll");

  useEffect(() => {
    if (trigger !== "scroll") return;
    const root = rootRef.current;
    if (!root) return;
    return observeInview(root, { once: false, ratio: 0.25 }, () => setInview(true));
  }, [trigger]);

  const playing = !reduced && (trigger === "always" || (trigger === "hover" && hovering) || (trigger === "scroll" && inview));

  const vars = {
    ["--swash-glitch-a" as string]: colors[0],
    ["--swash-glitch-b" as string]: colors[1],
  } as React.CSSProperties;

  const cls = [
    "swash-glitch",
    intensity,
    playing ? "playing" : "",
    reduced ? "reduced" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={rootRef}
      className={cls}
      data-text={text}
      style={{ ...vars, ...style }}
      onMouseEnter={() => trigger === "hover" && setHovering(true)}
      onMouseLeave={() => trigger === "hover" && setHovering(false)}
      onFocus={() => trigger === "hover" && setHovering(true)}
      onBlur={() => trigger === "hover" && setHovering(false)}
      aria-label={text}
    >
      {text}
    </span>
  );
}
