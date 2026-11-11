"use client";
import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useRef,
} from "react";
import { EASE_CSS, EASE } from "../shared/bezier";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { observeInview } from "../shared/inview";
import { useStyle } from "../shared/style";
import { tween, type TweenController } from "../shared/tween";
import { warnOnce } from "../shared/warn";
import { wobblyBox, wobblyEllipse, wobblyLine } from "./paths";
import type { MarkerAction, MarkerProps } from "./types";

/** The wash is see-through enough to read through; the pen is not. */
const WASH = 30;
/** Air between the words and the line drawn under them, in px. */
const UNDER = 3;
/** How far the strike cuts through the letter, as a share of the line box. */
const THROUGH = 0.56;
/** Pen weight, in px. */
const PEN = 2.5;
/** How much of the phrase has to be on screen before the pen comes down. */
const SEE = 0.25;
/** How much room the pen leaves between the words and a ring around them. */
const AROUND = 5;
/** Sub-pixel churn is not a reflow, and redrawing on it would never settle. */
const EPSILON = 0.5;

const SVG = "http://www.w3.org/2000/svg";

/** Light value first, dark value second, for each ink the palette knows. */
const PALETTE: Record<string, [string, string]> = {
  amber: ["#fcd34d", "#f59e0b"],
  emerald: ["#6ee7b7", "#10b981"],
  sky: ["#7dd3fc", "#0ea5e9"],
  rose: ["#fda4af", "#f43f5e"],
  violet: ["#c4b5fd", "#8b5cf6"],
};

const ACTIONS: MarkerAction[] = ["highlight", "underline", "strike", "circle", "box"];

const SHEET = [
  ":root{",
  ...Object.entries(PALETTE).map(([name, pair]) => `--swash-marker-${name}:${pair[0]};`),
  "}",
  "@media (prefers-color-scheme: dark){:root{",
  ...Object.entries(PALETTE).map(([name, pair]) => `--swash-marker-${name}:${pair[1]};`),
  "}}",
].join("");

/**
 * Names resolve to a variable so the dark-mode value is picked by the browser
 * rather than by a second pass over the DOM. Anything else is already a CSS
 * colour and goes through untouched.
 */
function ink(color: string): string {
  if (color === "primary") return "var(--swash-primary, currentColor)";
  if (color in PALETTE) return `var(--swash-marker-${color})`;
  return color;
}

function ms(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (Number.isFinite(value) && value >= 0) return value;
  warnOnce(`marker:${name}`, `Marker ${name} wants a number of ms, got ${value}. Using ${fallback}.`);
  return fallback;
}

/** Marks one instance differently from the next, so two rings on a page are not twins. */
let instances = 0;

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

  useStyle("swash-marker", SHEET);

  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const controller = useRef<ReturnType<typeof createMarker> | null>(null);
  if (controller.current === null) {
    controller.current = createMarker({ rootRef, textRef, layerRef });
  }
  const ctrl = controller.current;

  // A mark that is not on the list would draw nothing at all, which is the kind
  // of silence a reader never finds out about.
  let known = action;
  if (!ACTIONS.includes(known)) {
    warnOnce(
      `marker:action:${String(action)}`,
      `Marker action "${String(action)}" is not one of ${ACTIONS.join(", ")}. Using highlight.`,
    );
    known = "highlight";
  }
  const take = ms(duration, 800, "duration");
  const wait = ms(delay, 0, "delay");

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
    "--swash-marker-ink": ink(color),
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

type Box = { x: number; y: number; w: number; h: number };

interface Mark {
  d: string;
  box: Box;
}

type ControllerArgs = {
  rootRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
  layerRef: RefObject<SVGSVGElement | null>;
};

type Live = {
  children: string;
  action: MarkerAction;
  reduced: boolean;
  duration: number;
  delay: number;
};

/** The two ends of the wash: nothing at all, and the whole phrase. */
const WASH_FRAMES = [{ backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%" }];

/**
 * The drawing, as imperative work against the DOM. React writes the layer once,
 * as an empty svg, and never arranges the paths inside it: a re-render that
 * left the mark alone should not redraw it.
 */
function createMarker({ rootRef, textRef, layerRef }: ControllerArgs) {
  const seed = ++instances * 7919;
  let state: "off" | "drawing" | "on" = "off";
  let run: TweenController | null = null;
  let anim: Animation | null = null;
  let resize: ResizeObserver | undefined;
  let last: { width: number; height: number } | null = null;
  let current: Live | null = null;

  const stopWork = () => {
    run?.cancel();
    run = null;
    if (anim) {
      anim.cancel();
      anim = null;
    }
  };

  const dropWork = () => {
    resize?.disconnect();
    resize = undefined;
    last = null;
  };

  /** The line boxes the words actually occupy, in the root's own space. */
  const lines = (): Box[] => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return [];
    const origin = root.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(text);
    const found: Box[] = [];
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      found.push({
        x: rect.left - origin.left,
        y: rect.top - origin.top,
        w: rect.width,
        h: rect.height,
      });
    }
    return found;
  };

  const around = (list: Box[]): Box => {
    let x = Infinity;
    let y = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const box of list) {
      x = Math.min(x, box.x);
      y = Math.min(y, box.y);
      right = Math.max(right, box.x + box.w);
      bottom = Math.max(bottom, box.y + box.h);
    }
    return { x, y, w: right - x, h: bottom - y };
  };

  /** What has to be drawn, in the order a hand would draw it. */
  const plan = (action: MarkerAction): Mark[] => {
    // The wash is paint on the words themselves, so it has no geometry to work
    // out and wraps over lines the way the text does.
    if (action === "highlight") return [];
    const boxes = lines();
    if (boxes.length === 0) return [];
    if (action === "underline" || action === "strike") {
      return boxes.map((box, i) => ({
        d: wobblyLine(box.w, seed + i * 13),
        box: {
          x: box.x,
          y: box.y + (action === "underline" ? box.h + UNDER : box.h * THROUGH),
          w: box.w,
          h: 0,
        },
      }));
    }
    // A ring goes round the whole phrase, so one closed stroke covers every
    // line it spans rather than one stroke per line.
    const union = around(boxes);
    const box = {
      x: union.x - AROUND,
      y: union.y - AROUND,
      w: union.w + AROUND * 2,
      h: union.h + AROUND * 2,
    };
    const d =
      action === "box"
        ? wobblyBox(box.w, box.h, seed)
        : wobblyEllipse(box.w, box.h, seed);
    return [{ d, box }];
  };

  const pathFor = (mark: Mark): SVGPathElement => {
    const el = document.createElementNS(SVG, "path");
    el.setAttribute("d", mark.d);
    el.setAttribute(
      "transform",
      `translate(${Math.round(mark.box.x)} ${Math.round(mark.box.y)})`,
    );
    return el;
  };

  /** jsdom has no path geometry, and a stroke with no length has nothing to draw on. */
  const lengthOf = (el: SVGPathElement): number => {
    if (typeof el.getTotalLength !== "function") return 0;
    const value = el.getTotalLength();
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const holdWash = () => {
    const text = textRef.current;
    if (text) text.style.backgroundSize = "100% 100%";
  };

  /** Paints the finished mark, or the in-progress one, with no animation. */
  const stamp = (marks: Mark[]) => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.replaceChildren();
    for (const mark of marks) {
      const el = pathFor(mark);
      const length = lengthOf(el);
      if (length > 0) {
        el.style.strokeDasharray = `${Math.round(length)}`;
        el.style.strokeDashoffset = "0";
      }
      layer.appendChild(el);
    }
  };

  const watch = () => {
    const root = rootRef.current;
    if (!root || resize || typeof ResizeObserver === "undefined") return;
    resize = new ResizeObserver(() => refit());
    resize.observe(root);
  };

  /** A reflow moves the line boxes, so the stroke has to move with them. */
  const refit = () => {
    if (state !== "on" || !current) return;
    const root = rootRef.current;
    if (root) {
      const rect = root.getBoundingClientRect();
      if (
        last &&
        Math.abs(rect.width - last.width) < EPSILON &&
        Math.abs(rect.height - last.height) < EPSILON
      ) {
        return;
      }
      last = { width: rect.width, height: rect.height };
    }
    stamp(plan(current.action));
  };

  const draw = (live: Live) => {
    if (state !== "off") return;
    current = live;
    stopWork();
    const take = Math.round(live.duration);
    const wait = Math.round(live.delay);
    const instant = live.reduced || take <= 0;
    // Remembered now so that the callback a real ResizeObserver fires straight
    // after observe is not read as a reflow.
    const root = rootRef.current;
    if (root) {
      const box = root.getBoundingClientRect();
      last = { width: box.width, height: box.height };
    }

    if (live.action === "highlight") {
      const text = textRef.current;
      if (!text) return;
      if (instant) {
        holdWash();
        state = "on";
        return;
      }
      state = "drawing";
      text.style.backgroundSize = "0% 100%";
      const pass = text.animate(WASH_FRAMES, {
        duration: take,
        delay: wait,
        easing: EASE_CSS.out,
        fill: "forwards",
      });
      anim = pass;
      pass.onfinish = () => {
        // A wash that was wiped on the way here has nothing left to settle.
        if (anim !== pass) return;
        anim = null;
        holdWash();
        state = "on";
        // The held fill effect has written its last style; hand the look to the
        // inline style above and let the animation go.
        pass.cancel();
      };
      return;
    }

    const marks = plan(live.action);
    if (marks.length === 0) return;
    watch();
    const layer = layerRef.current;
    if (!layer) return;
    if (instant) {
      stamp(marks);
      state = "on";
      return;
    }

    state = "drawing";
    layer.replaceChildren();
    const drawn = marks.map((mark) => {
      const el = pathFor(mark);
      const length = lengthOf(el);
      if (length > 0) {
        el.style.strokeDasharray = `${Math.round(length)}`;
        el.style.strokeDashoffset = `${Math.round(length)}`;
      }
      layer.appendChild(el);
      return { el, length };
    });

    // A phrase over three lines is drawn line by line, in the order it reads.
    run = tween({
      from: 0,
      to: 1,
      duration: take,
      delay: wait,
      easing: EASE.out,
      onUpdate: (value) => {
        const share = drawn.length;
        drawn.forEach(({ el, length }, i) => {
          const local = Math.min(1, Math.max(0, value * share - i));
          el.style.strokeDashoffset = `${Math.round(length * (1 - local))}`;
        });
      },
      onComplete: () => {
        run = null;
        // The box can be a different size from the one the stroke was fitted to
        // while the pen was moving: a resize listener that is only attached
        // once the pass ends would have missed it.
        state = "on";
        refit();
      },
    });
  };

  /** Brings a mark that is still on its way to an immediate end. */
  const finish = (live: Live) => {
    if (state === "off") return;
    stopWork();
    if (live.action === "highlight") {
      holdWash();
    } else {
      const marks = plan(live.action);
      if (marks.length > 0) {
        watch();
        stamp(marks);
      }
    }
    state = "on";
  };

  const wipe = () => {
    stopWork();
    dropWork();
    state = "off";
    current = null;
    const text = textRef.current;
    // Only a span that was carrying a wash is put back: an underlined one never
    // had the property, and writing it would be decoration for nothing.
    if (text && text.style.backgroundSize) text.style.backgroundSize = "0% 100%";
    layerRef.current?.replaceChildren();
  };

  const dispose = () => {
    stopWork();
    dropWork();
  };

  return { draw, finish, wipe, refit, dispose };
}
