"use client";
import { type CSSProperties, useEffect, useRef } from "react";
import {
  createMarkerController,
  MARKER_ACTIONS,
  MARKER_SHEET,
  markerInk,
  type MarkerController,
} from "../core/marker";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { observeInview } from "../shared/inview";
import { ms } from "../shared/number";
import { useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { MarkerAction, MarkerProps } from "./types";

/** The wash is see-through enough to read through; the pen is not. */
const WASH = 30;
/** Pen weight, in px. */
const PEN = 2.5;
/** How much of the phrase has to be on screen before the pen comes down. */
const SEE = 0.25;

/**
 * Draws a hand-drawn mark over a phrase: a highlighter wash, an underline, a
 * strike, a ring or a box.
 *
 * The wash needs no measurement at all, which is why it is the default: a
 * gradient painted across an inline box wraps over lines on its own. The pen
 * marks do have to know where the words ended up, so they are drawn from the
 * line boxes a Range reports, one stroke per line, and are re-fit when the text
 * reflows. The words themselves are never touched, and the drawing is a layer
 * out of the reading order.
 */
export function Marker(props: MarkerProps) {
  const {
    children,
    action = "highlight",
    color = "amber",
    show,
    startOnView = true,
    duration,
    delay,
    className,
    style,
  } = props;

  useStyle("swash-marker", MARKER_SHEET);

  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const controller = useRef<MarkerController | null>(null);
  if (controller.current === null) {
    controller.current = createMarkerController({
      getRoot: () => rootRef.current,
      getText: () => textRef.current,
      getLayer: () => layerRef.current,
    });
  }
  const ctrl = controller.current;

  // A mark that is not on the list would draw nothing at all, which is the kind
  // of silence a reader never finds out about.
  let known = action;
  if (!(MARKER_ACTIONS as readonly string[]).includes(known)) {
    warnOnce(
      `marker:action:${String(action)}`,
      `Marker action "${String(action)}" is not one of ${MARKER_ACTIONS.join(", ")}. Using highlight.`,
    );
    known = "highlight";
  }
  const take = ms(duration, 800, "duration", "Marker");
  const wait = ms(delay, 0, "delay", "Marker");

  // Everything a pass needs is read at the start of it, so changing the text,
  // the ink or the timing halfway through lands on the next pass rather than
  // restarting this one.
  const live = useRef({ children, action: known, reduced, duration: take, delay: wait });
  useIsomorphicLayoutEffect(() => {
    live.current = { children, action: known, reduced, duration: take, delay: wait };
  });

  useIsomorphicLayoutEffect(() => {
    if (show === undefined) return;
    if (show) ctrl.draw(live.current);
    else ctrl.wipe();
  }, [ctrl, show]);

  // Uncontrolled: the pen comes down when the phrase is on screen, once.
  const uncontrolled = show === undefined;
  useEffect(() => {
    const root = rootRef.current;
    if (!uncontrolled || !root) return;
    if (!startOnView) {
      ctrl.draw(live.current);
      return;
    }
    return observeInview(root, { once: true, ratio: SEE }, () => {
      ctrl.draw(live.current);
    });
  }, [ctrl, uncontrolled, startOnView]);

  // Flipping the setting while a mark is on its way should land the mark, not
  // replay it, and turning it off should not start anything new.
  const wasReduced = useRef(reduced);
  useEffect(() => {
    const flipped = wasReduced.current !== reduced;
    wasReduced.current = reduced;
    if (flipped && reduced) ctrl.finish(live.current);
  }, [ctrl, reduced]);

  useEffect(
    () => () => {
      ctrl.dispose();
    },
    [ctrl],
  );

  // A webfont that arrives late brings different metrics with it, and the line
  // boxes the stroke was fitted to move when it swaps in.
  useEffect(() => {
    const ready = (document as unknown as { fonts?: { ready?: Promise<unknown> } })
      .fonts?.ready;
    if (!ready) return;
    let watching = true;
    ready.then(() => {
      if (watching) ctrl.refit();
    });
    return () => {
      watching = false;
    };
  }, [ctrl, children]);

  const vars = {
    "--swash-marker-ink": markerInk(color),
  } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={className}
      style={{ position: "relative", display: "inline-block", ...vars, ...style }}
    >
      <span ref={textRef} data-swash-marker="text" style={washStyle(known)}>
        {children}
      </span>
      <svg
        ref={layerRef}
        data-swash-marker="layer"
        aria-hidden="true"
        focusable="false"
        style={layerStyle}
        fill="none"
        strokeWidth={PEN}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </span>
  );
}

/**
 * Only the wash rides on the text, and only when it is the asked-for mark:
 * putting a repeat rule on a span that is being underlined would change how the
 * line box looks for no reason.
 */
function washStyle(action: MarkerAction): CSSProperties {
  if (action !== "highlight") return {};
  const tint = `color-mix(in srgb, var(--swash-marker-ink, currentColor) ${WASH}%, transparent)`;
  return {
    backgroundImage: `linear-gradient(${tint}, ${tint})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "0% 100%",
    // Each fragment of a wrapped phrase carries the whole gradient, rather
    // than a slice of it, so the second line starts as solidly as the first.
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  };
}

const layerStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  // A ring is drawn around the outside of the box it was measured from.
  overflow: "visible",
  pointerEvents: "none",
  userSelect: "none",
  // The ink goes through a style rather than a presentation attribute, because
  // an attribute is not read as CSS and would not see the variable.
  stroke: "var(--swash-marker-ink, currentColor)",
};
