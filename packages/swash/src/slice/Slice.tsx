"use client";
import { useEffect, useRef, useState } from "react";
import { observeInview } from "../shared/inview";
import { useReducedMotion } from "../shared/motion";
import { srOnlyStyle, useStyle } from "../shared/style";
import type { SliceProps } from "./types";

/**
 * Bisected text: the phrase is cut along its middle, and on cue the halves
 * slide apart — the top to one side, the bottom to the other — and come back.
 *
 * The halves are two copies of the same text, each clipped to half the box
 * with `clip-path: inset`, stacked exactly over one another. The seam never
 * has to be measured: the clips meet on the shared centre line, so the two
 * copies always read as one until they move. The reader's text is a real
 * node; both halves are decorative copies over it.
 */

const SLICE_CSS = [
  ".swash-slice{position:relative;display:inline-block}",
  ".swash-slice .swash-slice-half{",
  "  display:inline-block;",
  "  transition:transform var(--swash-slice-duration,420ms) cubic-bezier(0.16,1,0.3,1);",
  "  will-change:transform;",
  "}",
  ".swash-slice .swash-slice-top{clip-path:inset(0 0 50% 0)}",
  ".swash-slice .swash-slice-bottom{clip-path:inset(50% 0 0 0)}",
  // The second copy sits exactly on the first, so both move as one until the
  // seam opens.
  ".swash-slice .swash-slice-ghost{position:absolute;inset:0}",
  ".swash-slice.open .swash-slice-top{",
  "  transform:translateX(calc(var(--swash-slice-amount,14px) * -1));",
  "}",
  ".swash-slice.open .swash-slice-bottom{transform:translateX(var(--swash-slice-amount,14px))}",
  "@media (prefers-reduced-motion: reduce){",
  "  .swash-slice .swash-slice-half{transition:opacity 180ms linear}",
  "  .swash-slice.open .swash-slice-top,.swash-slice.open .swash-slice-bottom{transform:none}",
  "  .swash-slice.open .swash-slice-top{opacity:0}",
  "}",
].join("\n");

export function Slice(props: SliceProps) {
  const {
    text,
    amount = 14,
    duration = 420,
    trigger = "hover",
    hold = 1400,
    className,
    style,
  } = props;

  useStyle("swash-slice", SLICE_CSS);
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "view");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (trigger !== "view") return;
    const root = rootRef.current;
    if (!root) return;
    // Parted while on screen, closed again when it leaves — the halves only
    // read as one word while the reader is not looking anyway.
    return observeInview(
      root,
      { once: false, ratio: 0.3 },
      () => setInview(true),
      () => setInview(false),
    );
  }, [trigger]);

  // The loop cues itself: open for `hold`, closed for the slide back, then
  // again. One timer, cleared before every state change and on unmount.
  useEffect(() => {
    if (trigger !== "loop" || reduced) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const toggle = (next: boolean, wait: number) => {
      if (!alive) return;
      setOpen(next);
      timer = setTimeout(() => toggle(!next, next ? duration + 20 : hold), wait);
    };
    toggle(true, hold);
    return () => {
      alive = false;
      if (timer !== null) clearTimeout(timer);
    };
  }, [trigger, reduced, hold, duration]);

  const parted = open || (trigger === "hover" && hovering) || (trigger === "view" && inview);

  const vars = {
    "--swash-slice-amount": `${amount}px`,
    "--swash-slice-duration": `${duration}ms`,
  } as React.CSSProperties;

  const cls = ["swash-slice", parted ? "open" : "", className ?? ""]
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
      <span className="swash-slice-half swash-slice-top" aria-hidden="true">
        {text}
      </span>
      <span className="swash-slice-half swash-slice-bottom swash-slice-ghost" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
