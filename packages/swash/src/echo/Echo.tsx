"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { observeInview } from "../shared/inview";
import { ms, pixels } from "../shared/number";
import { useReducedMotion } from "../shared/motion";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { EchoProps } from "./types";

/**
 * A trail of echoes: the text sits still, and copies of it expand out from
 * under it and fade, staggered so the trail reads as one pulse travelling
 * rather than N pulsing in step.
 *
 * The copies are real spans rather than pseudo-elements, because a trail
 * deeper than two needs more than ::before and ::after — and rendering them
 * as nodes keeps the effect inside the component's own markup, with no
 * `attr(data-text)` dependency and no third DOM copy of the phrase. The
 * reader's text is the first span in the flow, so selection and copy stay
 * clean; the echoes are absolute and out of the way.
 */

const ECHO_CSS = [
  // The root opts into a stacking context (z-index:0) so the copies can sit
  // *under* the reader's text with z-index:-1 without escaping behind the
  // page: the contract says the trail expands from under the phrase, and a
  // same-colour copy painted over opaque text is invisible where it overlaps.
  ".swash-echo{position:relative;display:inline-block;z-index:0}",
  ".swash-echo .swash-echo-copy{",
  "  position:absolute;inset:0;",
  "  z-index:-1;",
  "  pointer-events:none;user-select:none;",
  "  will-change:transform,opacity;",
  "  animation:swash-echo var(--swash-echo-duration,1600ms) ease-out infinite;",
  "  animation-delay:calc(var(--swash-echo-i,0) * var(--swash-echo-delay,400ms) * -1);",
  "}",
  ".swash-echo.reduced .swash-echo-copy{animation:none;opacity:0}",
  ".swash-echo.idle .swash-echo-copy{animation:none;opacity:0}",
  // The opacity holds through the first third so the rim is still bright
  // while the copy is travelling; a plain .5-to-0 ease-out faded the trail
  // out before it grew, which read as a static word.
  "@keyframes swash-echo{",
  "  0%{opacity:.55;transform:scale(1)}",
  "  35%{opacity:.4}",
  "  100%{opacity:0;transform:scale(var(--swash-echo-spread,1.16))}",
  "}",
].join("\n");

export function Echo(props: EchoProps) {
  const {
    children,
    count = 3,
    delay,
    duration,
    spread,
    color = "currentColor",
    trigger = "always",
    className,
    style,
  } = props;

  useStyle("swash-echo", ECHO_CSS);
  const reduced = useReducedMotion();
  // Timing and distance go into keyframe variables: an invalid value kills
  // the animation silently, so they go through the shared readers that fall
  // back and warn.
  const pause = ms(delay, 400, "delay", "Echo");
  const take = ms(duration, 1600, "duration", "Echo");
  const reach = pixels(spread, 1.16, "spread", "Echo");

  const depth = count;
  if (!(Number.isFinite(depth) && depth >= 1 && depth <= 6)) {
    warnOnce(
      "echo:count",
      `Echo count wants a number from 1 to 6, got ${count}. Using 3.`,
    );
  }
  const copies = Number.isFinite(depth) && depth >= 1 && depth <= 6 ? Math.floor(depth) : 3;

  const text = typeof children === "string" ? children : null;

  const rootRef = useRef<HTMLSpanElement>(null);
  const [hovering, setHovering] = useState(false);
  const [inview, setInview] = useState(trigger !== "view");
  // The copies are stacked over the text by client-injected CSS; shipped
  // from the server they would flow inline and paint the phrase several
  // times until hydration. They are pure animation layers, so they mount
  // with the client, in the layout phase before the first paint.
  const [mounted, setMounted] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (trigger !== "view") return;
    const root = rootRef.current;
    if (!root) return;
    // Both edges, so a trail below the fold is not still pulsing unseen.
    return observeInview(
      root,
      { once: false, ratio: 0.3 },
      () => setInview(true),
      () => setInview(false),
    );
  }, [trigger]);

  // The trigger can change while mounted (always to hover to view): the old
  // cue's state must not survive it, or a hover that is no longer a hover
  // keeps the trail running and a stale inview starts one off-screen.
  useEffect(() => {
    setHovering(false);
    setInview(trigger !== "view");
  }, [trigger]);

  const playing =
    !reduced &&
    (trigger === "always" ||
      (trigger === "hover" && hovering) ||
      (trigger === "view" && inview));

  const vars = {
    "--swash-echo-delay": `${pause}ms`,
    "--swash-echo-duration": `${take}ms`,
    "--swash-echo-spread": String(reach),
  } as React.CSSProperties;

  const cls = [
    "swash-echo",
    playing ? "" : "idle",
    reduced ? "reduced" : "",
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
      onPointerDown={() => trigger === "hover" && setHovering(true)}
      onPointerUp={() => trigger === "hover" && setHovering(false)}
      onPointerCancel={() => trigger === "hover" && setHovering(false)}
    >
      {/* One accessible copy of the text; the echoes are decorative nodes. */}
      {text !== null ? (
        <span data-swash-sr="" style={srOnlyStyle}>{text}</span>
      ) : (
        <span className="swash-echo-sr" style={srOnlyStyle}>
          {children}
        </span>
      )}
      <span aria-hidden="true" style={{ display: "inline-block" }}>
        {children}
      </span>
      {Array.from({ length: mounted && playing ? copies : 0 }, (_, i) => (
        <span
          key={i}
          className="swash-echo-copy"
          aria-hidden="true"
          style={{ ["--swash-echo-i" as string]: String(i), color }}
        >
          {children}
        </span>
      ))}
    </span>
  );
}
