"use client";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { MarqueeProps } from "./types";

/**
 * An endless belt of text: two identical copies sit side by side on one
 * track, and the track slides exactly half its own width before snapping
 * back to the start — which is invisible, because the second copy is standing
 * exactly where the first was. One keyframe, on the compositor, however long
 * the line is.
 *
 * The reader's copy is the first one, so a screen reader hears the line once;
 * the second copy is a node purely for the eye.
 */

const MARQUEE_CSS = [
  ".swash-marquee{",
  "  display:flex;overflow:hidden;user-select:none;",
  "  -webkit-mask-image:var(--swash-marquee-mask,none);",
  "  mask-image:var(--swash-marquee-mask,none);",
  "}",
  ".swash-marquee .swash-marquee-track{",
  "  display:flex;flex-shrink:0;align-items:center;",
  "  gap:var(--swash-marquee-gap,48px);",
  "  padding-inline-end:var(--swash-marquee-gap,48px);",
  "  min-width:100%;",
  "  animation:swash-marquee-slide var(--swash-marquee-duration,12000ms) linear infinite;",
  "  will-change:transform;",
  "}",
  ".swash-marquee.reverse .swash-marquee-track{animation-direction:reverse}",
  ".swash-marquee:hover .swash-marquee-track.pause-on-hover{animation-play-state:paused}",
  ".swash-marquee.pause .swash-marquee-track{animation-play-state:paused}",
  "@media (prefers-reduced-motion: reduce){",
  "  .swash-marquee .swash-marquee-track{animation:none}",
  "}",
  "@keyframes swash-marquee-slide{from{transform:translateX(0)}to{transform:translateX(-100%)}}",
].join("\n");

export function Marquee(props: MarqueeProps) {
  const {
    children,
    duration = 12000,
    gap = 48,
    reverse = false,
    pauseOnHover = true,
    fade = true,
    className,
    style,
  } = props;

  const loop = ms(duration, 12000, "duration", "Marquee");
  const space = pixels(gap, 48, "gap", "Marquee");
  const reduced = useReducedMotion();
  useStyle("swash-marquee", MARQUEE_CSS);

  // A zero-length loop is a division, not a pause: an invalid duration warns
  // and falls back, the way every other component reads one.
  if (!(Number.isFinite(loop) && loop > 0)) {
    warnOnce("marquee:duration", `Marquee duration wants a positive number of ms, got ${duration}. Using 12000.`);
  }

  const vars = {
    "--swash-marquee-gap": `${space}px`,
    "--swash-marquee-duration": `${loop}ms`,
    "--swash-marquee-mask":
      fade === false
        ? "none"
        : "linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%)",
  } as React.CSSProperties;

  const cls = [
    "swash-marquee",
    reverse ? "reverse" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={{ ...vars, ...style }}>
      <div className={pauseOnHover ? "swash-marquee-track pause-on-hover" : "swash-marquee-track"}>
        {children}
      </div>
      <div className="swash-marquee-track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
