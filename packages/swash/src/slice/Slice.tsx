"use client";
import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { ms, pixels } from "../shared/number";
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
  // The two clips meet on the shared centre line, but they overlap by a
  // hair rather than butt up against it: a clip-path edge is anti-aliased,
  // and when the seam lands on a fractional device pixel (as it does for any
  // odd line-height) two edge-to-edge clips leave a bright ~1px line cut
  // across the middle of the closed word. Extending each half a pixel past
  // the centre makes the seam row fully covered by at least one copy; since
  // both halves paint the same opaque text, the overlap is invisible.
  ".swash-slice .swash-slice-top{clip-path:inset(0 0 calc(50% - 1px) 0)}",
  ".swash-slice .swash-slice-bottom{clip-path:inset(calc(50% - 1px) 0 0 0)}",
  // The second copy sits exactly on the first, so both move as one until the
  // seam opens.
  ".swash-slice .swash-slice-ghost{position:absolute;inset:0}",
  ".swash-slice.open .swash-slice-top{",
  "  transform:translateX(calc(var(--swash-slice-amount,14px) * -1));",
  "}",
  ".swash-slice.open .swash-slice-bottom{transform:translateX(var(--swash-slice-amount,14px))}",
  "@media (prefers-reduced-motion: reduce){",
  // Under reduced motion nothing moves and nothing hides: a faded top half
  // would leave the reader looking at the bottom half of every glyph.
  "  .swash-slice .swash-slice-half{transition:none}",
  "  .swash-slice.open .swash-slice-top,.swash-slice.open .swash-slice-bottom{transform:none}",
  "}",
].join("\n");

export function Slice(props: SliceProps) {
  const {
    text,
    amount,
    duration,
    trigger = "hover",
    hold,
    className,
    style,
  } = props;

  useStyle("swash-slice", SLICE_CSS);
  const reduced = useReducedMotion();
  // A negative or non-numeric distance would make the transition property
  // invalid and the halves would snap with nothing said; the shared readers
  // fall back and warn instead.
  const shift = pixels(amount, 14, "amount", "Slice");
  const slide = ms(duration, 420, "duration", "Slice");
  const rest = ms(hold, 1400, "hold", "Slice");

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "view");
  const [open, setOpen] = useState(false);
  // The halves are two clipped copies stacked by client-injected CSS; in
  // the server markup they flowed inline and painted the phrase twice until
  // hydration. The server ships plain text and the layout effect upgrades it
  // to the halves before the first paint.
  const [mounted, setMounted] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

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
      timer = setTimeout(() => toggle(!next, next ? slide + 20 : rest), wait);
    };
    toggle(true, rest);
    return () => {
      alive = false;
      if (timer !== null) clearTimeout(timer);
      // Whatever phase the clock was in, the cycle is over: a trigger that
      // changed mid-hold (or an OS reduced-motion flip) must not leave the
      // halves parted forever with nothing left to close them.
      setOpen(false);
    };
  }, [trigger, reduced, rest, slide]);

  // The trigger can change while mounted (hover to view to loop): the old
  // cue's state must not survive it — a hover that is no longer a hover
  // would keep the halves parted, and a stale inview would cue a view
  // trigger before its observer has spoken.
  useEffect(() => {
    setHovering(false);
    setInview(trigger !== "view");
  }, [trigger]);

  const parted = open || (trigger === "hover" && hovering) || (trigger === "view" && inview);

  const vars = {
    "--swash-slice-amount": `${shift}px`,
    "--swash-slice-duration": `${slide}ms`,
  } as React.CSSProperties;

  const cls = ["swash-slice", parted ? "open" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (!mounted) {
    return (
      <span ref={rootRef} className={cls} style={{ ...vars, ...style }}>
        {text}
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      className={cls}
      style={{ ...vars, ...style }}
      onMouseEnter={() => trigger === "hover" && setHovering(true)}
      onMouseLeave={() => trigger === "hover" && setHovering(false)}
      onPointerDown={() => trigger === "hover" && setHovering(true)}
      onPointerUp={() => trigger === "hover" && setHovering(false)}
      onPointerCancel={() => trigger === "hover" && setHovering(false)}
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
