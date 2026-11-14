"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { observeInview } from "../shared/inview";
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
  ".swash-echo{position:relative;display:inline-block}",
  ".swash-echo .swash-echo-copy{",
  "  position:absolute;inset:0;",
  "  pointer-events:none;user-select:none;",
  "  will-change:transform,opacity;",
  "  animation:swash-echo var(--swash-echo-duration,1600ms) ease-out infinite;",
  "  animation-delay:calc(var(--swash-echo-i,0) * var(--swash-echo-delay,400ms) * -1);",
  "}",
  ".swash-echo.reduced .swash-echo-copy{animation:none;opacity:0}",
  ".swash-echo.idle .swash-echo-copy{animation:none;opacity:0}",
  "@keyframes swash-echo{",
  "  0%{opacity:.5;transform:scale(1)}",
  "  100%{opacity:0;transform:scale(var(--swash-echo-spread,1.16))}",
  "}",
].join("\n");

export function Echo(props: EchoProps) {
  const {
    children,
    count = 3,
    delay = 400,
    duration = 1600,
    spread = 1.16,
    color = "currentColor",
    trigger = "always",
    className,
    style,
  } = props;

  useStyle("swash-echo", ECHO_CSS);
  const reduced = useReducedMotion();

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

  const playing =
    !reduced &&
    (trigger === "always" ||
      (trigger === "hover" && hovering) ||
      (trigger === "view" && inview));

  const vars = {
    "--swash-echo-delay": `${delay}ms`,
    "--swash-echo-duration": `${duration}ms`,
    "--swash-echo-spread": String(spread),
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
      {Array.from({ length: playing ? copies : 0 }, (_, i) => (
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
