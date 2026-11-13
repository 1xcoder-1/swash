import { EASE_CSS } from "../shared/bezier";
import { contentOverhang } from "../frame/metrics";

/** A frame should leave faster than it arrives, however long the arrival is. */
const LEAVE = 200;
/** Sub-pixel churn is not a resize, and re-rendering on it would never settle. */
const EPSILON = 0.5;
/** The badge rides in once the border closes, short enough to feel part of it. */
const BADGE_MS = 220;

/**
 * The two ends of each pass, split across two elements on purpose. The layer
 * only fades; the sweep is a clip on the outline. The badge overflows the box
 * (it sits on the corner, half outside), so a clip on the layer would cut it
 * for the whole pass and then snap it whole at the end. Clipping the outline —
 * which the badge is a sibling of, not a child of — leaves the badge free to
 * fade in with the layer instead.
 */
const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
const CLIPPED = { clipPath: "inset(0 100% 0 0)" };
const DRAWN = { clipPath: "inset(0 0 0 0)" };

type Phase = "hidden" | "entering" | "shown" | "leaving";

export interface FrameMeasurement {
  /** How far the outline has to reach past the line box, per side, in px. */
  bleed: number;
  /** The letter-space the element carries but the text does not, in px. */
  trail: number;
}

/** True when two measurements are close enough that a re-render would be churn. */
export const sameMeasurement = (a: FrameMeasurement | null, b: FrameMeasurement) =>
  a !== null &&
  Math.abs(a.bleed - b.bleed) < EPSILON &&
  Math.abs(a.trail - b.trail) < EPSILON;

export interface FrameController {
  measure(): FrameMeasurement | null;
  remeasure(): void;
  show(ms: number, reduced: boolean): void;
  hide(ms: number, reduced: boolean): void;
  dispose(): void;
}

export interface FrameControllerArgs {
  /** The element the frame is drawn around, read lazily so it can mount late. */
  getRoot: () => HTMLElement | null;
  /** The decoration layer, always in the DOM, that fades in and out. */
  getLayer: () => HTMLElement | null;
  /** The outline the sweep clips, a sibling of the badge so the clip misses it. */
  getOutline: () => HTMLElement | null;
  /** The corner badge, held back until the sweep is done and then faded in. */
  getBadge?: () => HTMLElement | null;
  /** Called with a fresh measurement; the host decides whether to re-render. */
  onMeasure: (measurement: FrameMeasurement) => void;
}

/**
 * The pass, as imperative work against the DOM. The host framework is only
 * asked about the box itself, and only when the frame is at rest: a state
 * update per frame of the sweep would be a re-render per frame, and the
 * animation is the only reason not to have one. Everything it touches is a DOM
 * element reached through the getters above, so the same engine drives React,
 * Vue and Svelte bindings.
 */
export function createFrameController({
  getRoot,
  getLayer,
  getOutline,
  getBadge,
  onMeasure,
}: FrameControllerArgs): FrameController {
  let phase: Phase = "hidden";
  let animations: Animation[] | null = null;
  let badgeAnimation: Animation | null = null;
  let resize: ResizeObserver | undefined;

  const measure = (): FrameMeasurement | null => {
    const root = getRoot();
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const bleed = contentOverhang(root, rect.height);
    // Reads "normal" when nothing has set the tracking, which parses to NaN.
    const trail = Number.parseFloat(getComputedStyle(root).letterSpacing) || 0;
    const next = { bleed, trail };
    onMeasure(next);
    return next;
  };

  /** A late webfont should not cost a layout read while nothing is on screen. */
  const remeasure = () => {
    if (phase !== "hidden") measure();
  };

  const dropAnimation = () => {
    for (const anim of animations ?? []) anim.cancel();
    animations = null;
    if (badgeAnimation) {
      badgeAnimation.cancel();
      badgeAnimation = null;
    }
  };

  const stopWork = () => {
    dropAnimation();
    resize?.disconnect();
    resize = undefined;
  };

  const watch = () => {
    const root = getRoot();
    // Attached at rest only. Through the sweep the box is a different size on
    // every frame, so watching it there would measure and render on every one.
    if (!root || resize || typeof ResizeObserver === "undefined") return;
    resize = new ResizeObserver(() => measure());
    resize.observe(root);
  };

  const hold = () => {
    const layer = getLayer();
    const outline = getOutline();
    const badge = getBadge?.();
    if (layer) layer.style.opacity = "1";
    if (outline) outline.style.clipPath = "none";
    if (badge) badge.style.opacity = "1";
    phase = "shown";
    watch();
  };

  const tuck = () => {
    const layer = getLayer();
    const outline = getOutline();
    const badge = getBadge?.();
    if (layer) {
      layer.style.opacity = "0";
      layer.style.visibility = "hidden";
    }
    if (outline) outline.style.clipPath = "";
    if (badge) badge.style.opacity = "0";
    phase = "hidden";
  };

  const play = (
    fade: [typeof HIDDEN, typeof VISIBLE],
    sweep: [typeof CLIPPED, typeof DRAWN],
    time: number,
    done: () => void,
    reveal: HTMLElement | null = null,
  ) => {
    const layer = getLayer();
    if (!layer) {
      done();
      return;
    }
    const outline = getOutline();
    const timing: KeyframeAnimationOptions = {
      duration: time,
      easing: EASE_CSS.out,
      fill: "forwards",
    };
    const layerAnim = layer.animate([fade[0], fade[1]], timing);
    // The outline carries the sweep. Without one (no frame to clip) the fade
    // alone is the pass, and finishing is still driven off the layer.
    const running: Animation[] = outline
      ? [layerAnim, outline.animate([sweep[0], sweep[1]], timing)]
      : [layerAnim];
    // The badge waits out the sweep on its own timeline rather than riding in
    // `running`, whose end settles the frame: the hold writes its inline style
    // while this one is still fading, and the fill keeps it on its own curve.
    if (reveal) {
      const badgeAnim = reveal.animate([HIDDEN, VISIBLE], {
        delay: time,
        duration: BADGE_MS,
        easing: EASE_CSS.out,
        fill: "forwards",
      });
      badgeAnimation = badgeAnim;
      badgeAnim.onfinish = () => {
        // A reveal cancelled or superseded on the way here has already settled.
        if (badgeAnimation !== badgeAnim) return;
        badgeAnimation = null;
        reveal.style.opacity = "1";
        badgeAnim.cancel();
      };
    }
    animations = running;
    layerAnim.onfinish = () => {
      // A pass that was cancelled on the way here has nothing left to settle.
      if (animations !== running) return;
      animations = null;
      done();
      // The held fill effects have written their last style; hand the look to
      // the inline styles above and let the animations go.
      for (const anim of running) anim.cancel();
    };
  };

  const show = (ms: number, reduced: boolean) => {
    if (phase === "shown") return;
    if (phase === "entering") {
      // The setting can be flipped mid-sweep. The frame should be up rather
      // than carry on drawing for the rest of the duration.
      if (reduced) {
        dropAnimation();
        hold();
      }
      return;
    }
    stopWork();
    const layer = getLayer();
    if (!layer) return;
    if (measure() === null) return;
    layer.style.visibility = "visible";
    if (reduced || ms <= 0) {
      hold();
      return;
    }
    phase = "entering";
    const badge = getBadge?.() ?? null;
    // Invisible through the fade and the sweep, whatever its last pass left;
    // the delayed animation in play is what brings it in.
    if (badge) badge.style.opacity = "0";
    play([HIDDEN, VISIBLE], [CLIPPED, DRAWN], ms, hold, badge);
  };

  const hide = (ms: number, reduced: boolean) => {
    if (phase === "hidden" || phase === "leaving") return;
    const midSweep = phase === "entering";
    stopWork();
    // Half-drawn, or motion reduced, and there is no pass worth watching: the
    // frame was never properly up, so it goes rather than fades.
    if (midSweep || reduced || !getLayer()) {
      tuck();
      return;
    }
    phase = "leaving";
    play([VISIBLE, HIDDEN], [DRAWN, CLIPPED], Math.min(ms, LEAVE), tuck);
  };

  const dispose = () => {
    stopWork();
    tuck();
  };

  return { measure, remeasure, show, hide, dispose };
}
