import { EASE_CSS, EASE } from "../shared/bezier";
import { tween, type TweenController } from "../shared/tween";
import { wobblyBox, wobblyEllipse, wobblyLine } from "../marker/paths";
import type { MarkerAction } from "../marker/types";

/** Air between the words and the line drawn under them, in px. */
const UNDER = 3;
/** How far the strike cuts through the letter, as a share of the line box. */
const THROUGH = 0.56;
/** How much room the pen leaves between the words and a ring around them. */
const AROUND = 5;
/** Sub-pixel churn is not a reflow, and redrawing on it would never settle. */
const EPSILON = 0.5;

const SVG = "http://www.w3.org/2000/svg";

/** Marks one instance differently from the next, so two rings on a page are not twins. */
let instances = 0;

/** The marks the pen knows. Anything else falls back to highlight. */
export const MARKER_ACTIONS = ["highlight", "underline", "strike", "circle", "box"] as const;

/** Light value first, dark value second, for each ink the palette knows. */
export const MARKER_PALETTE: Record<string, [string, string]> = {
  amber: ["#fcd34d", "#f59e0b"],
  emerald: ["#6ee7b7", "#10b981"],
  sky: ["#7dd3fc", "#0ea5e9"],
  rose: ["#fda4af", "#f43f5e"],
  violet: ["#c4b5fd", "#8b5cf6"],
};

/**
 * The palette rides on the page as custom properties so dark mode is picked by
 * the browser rather than a second pass over the DOM. One sheet serves every
 * framework binding.
 */
export const MARKER_SHEET = [
  ":root{",
  ...Object.entries(MARKER_PALETTE).map(([name, pair]) => `--swash-marker-${name}:${pair[0]};`),
  "}",
  "@media (prefers-color-scheme: dark){:root{",
  ...Object.entries(MARKER_PALETTE).map(([name, pair]) => `--swash-marker-${name}:${pair[1]};`),
  "}}",
].join("");

/**
 * Names resolve to a variable so the dark-mode value is picked by the browser
 * rather than by a second pass over the DOM. Anything else is already a CSS
 * colour and goes through untouched.
 */
export function markerInk(color: string): string {
  if (color === "primary") return "var(--swash-primary, currentColor)";
  if (color in MARKER_PALETTE) return `var(--swash-marker-${color})`;
  return color;
}

type Box = { x: number; y: number; w: number; h: number };

interface Mark {
  d: string;
  box: Box;
}

/** The two ends of the wash: nothing at all, and the whole phrase. */
const WASH_FRAMES = [{ backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%" }];

export interface MarkerLive {
  action: MarkerAction;
  reduced: boolean;
  duration: number;
  delay: number;
}

export interface MarkerController {
  draw(live: MarkerLive): void;
  finish(live: MarkerLive): void;
  wipe(): void;
  refit(): void;
  dispose(): void;
}

export interface MarkerControllerArgs {
  /** The wrapper the mark is measured against, read lazily so it can mount late. */
  getRoot: () => HTMLElement | null;
  /** The inline span carrying the words (and a wash when the action is one). */
  getText: () => HTMLElement | null;
  /** The svg layer the pen strokes are drawn into. */
  getLayer: () => SVGSVGElement | null;
}

/**
 * The drawing, as imperative work against the DOM. The host framework writes
 * the layer once, as an empty svg, and never arranges the paths inside it: a
 * re-render that left the mark alone should not redraw it. Every element the
 * engine touches comes through the getters above, so the same machine drives
 * React, Vue and Svelte bindings.
 */
export function createMarkerController({
  getRoot,
  getText,
  getLayer,
}: MarkerControllerArgs): MarkerController {
  const seed = ++instances * 7919;
  let state: "off" | "drawing" | "on" = "off";
  let run: TweenController | null = null;
  let anim: Animation | null = null;
  let resize: ResizeObserver | undefined;
  let last: { width: number; height: number } | null = null;
  let current: MarkerLive | null = null;

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
    const root = getRoot();
    const text = getText();
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
    // Two lines sit on their own leading, and a ring measured from the ink alone
    // would cut through the line above the phrase. The air the browser left
    // between the lines is the air the ring needs back.
    const [first, second] = boxes;
    const leading =
      first && second ? Math.max(0, second.y - first.y - first.h) : 0;
    const clear = AROUND + Math.round(leading / 2);
    const box = {
      x: union.x - AROUND,
      y: union.y - clear,
      w: union.w + AROUND * 2,
      h: union.h + clear * 2,
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
    const text = getText();
    if (text) text.style.backgroundSize = "100% 100%";
  };

  /** Paints the finished mark, or the in-progress one, with no animation. */
  const stamp = (marks: Mark[]) => {
    const layer = getLayer();
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
    const root = getRoot();
    if (!root || resize || typeof ResizeObserver === "undefined") return;
    resize = new ResizeObserver(() => refit());
    resize.observe(root);
  };

  /** A reflow moves the line boxes, so the stroke has to move with them. */
  const refit = () => {
    if (state !== "on" || !current) return;
    const root = getRoot();
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

  const draw = (live: MarkerLive) => {
    if (state !== "off") return;
    current = live;
    stopWork();
    const take = Math.round(live.duration);
    const wait = Math.round(live.delay);
    const instant = live.reduced || take <= 0;
    // Remembered now so that the callback a real ResizeObserver fires straight
    // after observe is not read as a reflow.
    const root = getRoot();
    if (root) {
      const box = root.getBoundingClientRect();
      last = { width: box.width, height: box.height };
    }

    if (live.action === "highlight") {
      const text = getText();
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
    const layer = getLayer();
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
  const finish = (live: MarkerLive) => {
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
    const text = getText();
    // Only a span that was carrying a wash is put back: an underlined one never
    // had the property, and writing it would be decoration for nothing.
    if (text && text.style.backgroundSize) text.style.backgroundSize = "0% 100%";
    getLayer()?.replaceChildren();
  };

  const dispose = () => {
    // A mount that is thrown away and put back, which StrictMode does to every
    // component in development, has to leave the machine at rest. A wipe does,
    // and a half-finished pass left pointing at a cancelled tween does not: the
    // second mount would find a mark already "drawing" and draw nothing.
    wipe();
  };

  return { draw, finish, wipe, refit, dispose };
}
