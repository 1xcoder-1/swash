"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  createFrameController,
  sameMeasurement,
  type FrameController,
  type FrameMeasurement,
} from "../core/frame";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import type { FrameProps } from "./types";

/** Air between the text box and the outline, in px. */
const INSET = 4;
/** The badge is tracked like a chip, and given the last step back. */
const LABEL_TRACKING = "0.08em";

/**
 * Draws a selection frame over its children, the way a design tool draws one
 * over a text layer: an outline that sweeps in, and an optional badge on the
 * top-right corner.
 *
 * The children are never re-rendered by the frame. The outline is a sibling
 * painted on top of them, and the only measurement it takes of them happens at
 * rest rather than on the animation path.
 */
export function Frame(props: FrameProps) {
  const {
    show = false,
    label,
    color = "currentColor",
    radius = 4,
    width = 2,
    duration,
    children,
    className,
    style,
  } = props;

  const rootRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const outlineRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [measurement, setMeasurement] = useState<FrameMeasurement | null>(null);

  // The engine is framework-free; this binding only hands it the elements and a
  // measurement callback that skips a re-render when nothing changed.
  const controller = useRef<FrameController | null>(null);
  if (controller.current === null) {
    controller.current = createFrameController({
      getRoot: () => rootRef.current,
      getLayer: () => layerRef.current,
      getOutline: () => outlineRef.current,
      getBadge: () => badgeRef.current,
      onMeasure: (next) =>
        setMeasurement((previous) => (sameMeasurement(previous, next) ? previous : next)),
    });
  }
  const ctrl = controller.current;

  const reduced = useReducedMotion();
  const take = ms(duration, 500, "duration", "Frame");

  // Measure whenever the content it sits around changes, and once more when a
  // webfont finishes swapping in, because the fallback's leading is not the
  // loaded font's and the outline would still be sized for the first.
  // An element child is a new object on every parent render, which is not a
  // content change: the resize watcher the controller keeps at rest is what
  // notices an element child growing.
  const content = typeof children === "string" ? children : null;
  useIsomorphicLayoutEffect(() => {
    ctrl.measure();
    const ready = (document as unknown as { fonts?: { ready?: Promise<unknown> } })
      .fonts?.ready;
    if (!ready) return;
    let live = true;
    ready.then(() => {
      if (live) ctrl.remeasure();
    });
    return () => {
      live = false;
    };
  }, [ctrl, content]);

  // Only `show` and the motion setting can start or stop a pass, so a parent
  // re-render that leaves both alone leaves the frame alone with them.
  useIsomorphicLayoutEffect(() => {
    if (show) ctrl.show(take, reduced);
    else ctrl.hide(take, reduced);
  }, [ctrl, show, reduced, take]);

  useEffect(
    () => () => {
      ctrl.dispose();
    },
    [ctrl],
  );

  const stroke = pixels(width, 2, "width", "Frame");
  const corner = pixels(radius, 4, "radius", "Frame");
  const bleed = measurement?.bleed ?? 0;
  const trail = measurement?.trail ?? 0;

  // Appearance goes through custom properties so that a `style` override and a
  // prop are the same mechanism, with `style` winning by landing last.
  const vars = {
    "--frame-color": color,
    "--frame-radius": `${corner}px`,
    "--frame-width": `${stroke}px`,
  } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={className}
      style={{ position: "relative", display: "inline-block", ...vars, ...style }}
    >
      {children}
      {/* Decoration throughout: out of the accessibility tree, takes no
          pointer, and never comes along when the reader selects the text.
          Always in the DOM, so showing has an element to animate rather than
          one to mount in the middle of a paint. */}
      <span
        ref={layerRef}
        aria-hidden="true"
        data-swash-frame=""
        style={{
          ...layerStyle,
          top: -INSET - bleed,
          bottom: -INSET - bleed,
          right: -INSET + trail,
        }}
      >
        <span ref={outlineRef} data-swash-frame-outline="" style={outlineStyle} />
        {label ? (
          <span ref={badgeRef} data-swash-frame-label="" style={badgeStyle}>
            <span style={badgeInkStyle}>{label}</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}

const layerStyle: CSSProperties = {
  position: "absolute",
  top: -INSET,
  right: -INSET,
  bottom: -INSET,
  left: -INSET,
  color: "var(--frame-color, currentColor)",
  pointerEvents: "none",
  userSelect: "none",
  opacity: 0,
  visibility: "hidden",
  // The frame sits inside whoever's text it is drawn over, and letter-spacing,
  // font-style and the rest of it inherit. Without this the badge is handed
  // the display tracking of a word it is not part of.
  letterSpacing: "normal",
  fontStyle: "normal",
  textTransform: "none",
  textDecoration: "none",
};

/**
 * A child rather than a border on the layer, so the badge is placed from the
 * stroke itself and not from a box already widened by its own thickness.
 */
const outlineStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  border: "var(--frame-width, 2px) solid currentColor",
  borderRadius: "var(--frame-radius, 4px)",
};

const badgeStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  transform: "translate(50%, -50%)",
  boxSizing: "border-box",
  padding: "1px 5px",
  borderRadius: 999,
  // The chip is filled with the frame's own colour, which the layer above has
  // already resolved out of --frame-color.
  background: "currentColor",
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.3,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/**
 * The label is a second element, not a second property, because currentColor is
 * always the colour of the element carrying it: an ink set on the chip would
 * have painted the chip's own background with itself, and the word would be
 * invisible in both themes. White on the accent by default, and overridable.
 */
const badgeInkStyle: CSSProperties = {
  color: "var(--frame-label-color, light-dark(#fff, #111))",
  // letter-spacing puts a step after the last character as well as between
  // them, and a chip centred by a percentage is centred on that step: the
  // text sits left of the middle. Giving one step back as a margin lands the
  // glyphs on the centre line the outline was drawn around.
  letterSpacing: LABEL_TRACKING,
  marginRight: `-${LABEL_TRACKING}`,
};
