"use client";
import { useId } from "react";
import { useReducedMotion } from "../shared/motion";
import { pixels } from "../shared/number";
import { useStyle } from "../shared/style";
import type { CurvedTextProps } from "./types";

/**
 * Circular path text. The circle geometry is a native SVG `<path>` and the
 * text is placed along it with `<textPath>`, so glyph spacing, kerning and
 * hinting are handled by the SVG renderer rather than a per-span
 * `cos(θ)/sin(θ)` calculation that would pixelate the baseline.
 *
 * The rotation is one CSS keyframe on the whole SVG group, so it stays on
 * the compositor regardless of how many letters the phrase contains.
 */

const CURVED_TEXT_CSS = [
  ".swash-curved-text{display:inline-block;line-height:0}",
  ".swash-curved-text svg{display:block;overflow:visible}",
  ".swash-curved-text .swash-curved-rotor{",
  "  transform-origin:50% 50%;",
  "  animation:swash-curved-spin var(--swash-curved-speed,12s) linear infinite;",
  "  will-change:transform;",
  "}",
  ".swash-curved-text.reverse .swash-curved-rotor{animation-direction:reverse}",
  ".swash-curved-text.reduced .swash-curved-rotor{animation:none}",
  "@keyframes swash-curved-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}",
].join("\n");

export function CurvedText(props: CurvedTextProps) {
  const {
    text,
    radius,
    speed = 12,
    reverse = false,
    spacing,
    className,
    style,
  } = props;

  const r = pixels(radius, 60, "radius", "CurvedText");
  const ls = pixels(spacing, 0, "spacing", "CurvedText");
  const reduced = useReducedMotion();
  useStyle("swash-curved-text", CURVED_TEXT_CSS);

  // Stable, collision-free id for the path so multiple instances on one
  // page can each be referenced by their own textPath.
  const uid = useId();
  const pathId = `swash-curved-path-${uid.replace(/:/g, "")}`;

  // A circle drawn as a single arc so textPath can flow along it.
  // Starts at (0, -r) top and sweeps the full circumference clockwise.
  const size = r * 2;
  const d = [
    `M ${r} 0`,
    `A ${r} ${r} 0 1 1 ${r} ${size}`,
    `A ${r} ${r} 0 1 1 ${r} 0`,
  ].join(" ");

  const vars = {
    ["--swash-curved-speed" as string]: `${speed}s`,
  } as React.CSSProperties;

  const cls = [
    "swash-curved-text",
    reverse ? "reverse" : "",
    reduced ? "reduced" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={cls}
      style={{ ...vars, ...style }}
      role="img"
      aria-label={text}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        <title>{text}</title>
        <defs>
          <path id={pathId} d={d} fill="none" />
        </defs>
        <g className="swash-curved-rotor">
          <text>
            <textPath href={`#${pathId}`} startOffset="0%" letterSpacing={ls || undefined}>
              {text}
            </textPath>
          </text>
        </g>
      </svg>
    </span>
  );
}
