"use client";
import {
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { EASE_CSS } from "../shared/bezier";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { ms, pixels } from "../shared/number";
import { contentOverhang } from "./metrics";
import type { FrameProps } from "./types";

/** Air between the text box and the outline, in px. */
const INSET = 4;
/** A frame should leave faster than it arrives, however long the arrival is. */
const LEAVE = 200;
/** The badge is tracked like a chip, and given the last step back. */
const LABEL_TRACKING = "0.08em";
/** Sub-pixel churn is not a resize, and re-rendering on it would never settle. */
const EPSILON = 0.5;

/** The two ends of the sweep: nothing, and the whole outline. */
const CLIPPED = { opacity: 0, clipPath: "inset(0 100% 0 0)" };
const DRAWN = { opacity: 1, clipPath: "inset(0 0 0 0)" };

type Phase = "hidden" | "entering" | "shown" | "leaving";

interface Measurement {
  /** How far the outline has to reach past the line box, per side, in px. */
  bleed: number;
  /** The letter-space the element carries but the text does not, in px. */
  trail: number;
}

const same = (a: Measurement | null, b: Measurement) =>
  a !== null &&
  Math.abs(a.bleed - b.bleed) < EPSILON &&
  Math.abs(a.trail - b.trail) < EPSILON;

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
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  const controller = useRef<ReturnType<typeof createController> | null>(null);
  if (controller.current === null) {
    controller.current = createController({ rootRef, layerRef, setMeasurement });
  }
  const ctrl = controller.current;

  const reduced = useReducedMotion();
  const take = ms(duration, 500, "duration", "Frame");

  // Measure whenever the content it sits around changes, and once more when a
  // webfont finishes swapping in, because the fallback's leading is not the
  // loaded font's and the outline would still be sized for the first.
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
  }, [ctrl, children]);

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
        <span data-swash-frame-outline="" style={outlineStyle} />
        {label ? (
          <span data-swash-frame-label="" style={badgeStyle}>
            <span style={badgeInkStyle}>{label}</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}

type ControllerArgs = {
  rootRef: RefObject<HTMLSpanElement | null>;
  layerRef: RefObject<HTMLSpanElement | null>;
  setMeasurement: Dispatch<SetStateAction<Measurement | null>>;
};

/**
 * The pass, as imperative work against the DOM. React is only asked about the
 * box itself, and only when the frame is at rest: a state update per frame of
 * the sweep would be a re-render per frame, and the animation is the only
 * reason not to have one.
 */
function createController({ rootRef, layerRef, setMeasurement }: ControllerArgs) {
  let phase: Phase = "hidden";
  let animation: Animation | null = null;
  let resize: ResizeObserver | undefined;

  const measure = (): Measurement | null => {
    const root = rootRef.current;
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const bleed = contentOverhang(root, rect.height);
    // Reads "normal" when nothing has set the tracking, which parses to NaN.
    const trail = Number.parseFloat(getComputedStyle(root).letterSpacing) || 0;
    const next = { bleed, trail };
    setMeasurement((previous) => (same(previous, next) ? previous : next));
    return next;
  };

  /** A late webfont should not cost a layout read while nothing is on screen. */
  const remeasure = () => {
    if (phase !== "hidden") measure();
  };

  const dropAnimation = () => {
    animation?.cancel();
    animation = null;
  };

  const stopWork = () => {
    dropAnimation();
    resize?.disconnect();
    resize = undefined;
  };

  const watch = () => {
    const root = rootRef.current;
    // Attached at rest only. Through the sweep the box is a different size on
    // every frame, so watching it there would measure and render on every one.
    if (!root || resize || typeof ResizeObserver === "undefined") return;
    resize = new ResizeObserver(() => measure());
    resize.observe(root);
  };

  const hold = () => {
    const layer = layerRef.current;
    if (layer) {
      layer.style.opacity = "1";
      layer.style.clipPath = "none";
    }
    phase = "shown";
    watch();
  };

  const tuck = () => {
    const layer = layerRef.current;
    if (layer) {
      layer.style.opacity = "0";
      layer.style.clipPath = "";
      layer.style.visibility = "hidden";
    }
    phase = "hidden";
  };

  const play = (
    from: typeof DRAWN,
    to: typeof DRAWN,
    time: number,
    done: () => void,
  ) => {
    const layer = layerRef.current;
    if (!layer) {
      done();
      return;
    }
    const anim = layer.animate([from, to], {
      duration: time,
      easing: EASE_CSS.out,
      fill: "forwards",
    });
    animation = anim;
    anim.onfinish = () => {
      // A pass that was cancelled on the way here has nothing left to settle.
      if (animation !== anim) return;
      animation = null;
      done();
      // The held fill effect has written its last style; hand the look to the
      // inline styles above and let the animation go.
      anim.cancel();
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
    const layer = layerRef.current;
    if (!layer) return;
    if (measure() === null) return;
    layer.style.visibility = "visible";
    if (reduced || ms <= 0) {
      hold();
      return;
    }
    phase = "entering";
    play(CLIPPED, DRAWN, ms, hold);
  };

  const hide = (ms: number, reduced: boolean) => {
    if (phase === "hidden" || phase === "leaving") return;
    const midSweep = phase === "entering";
    stopWork();
    // Half-drawn, or motion reduced, and there is no pass worth watching: the
    // frame was never properly up, so it goes rather than fades.
    if (midSweep || reduced || !layerRef.current) {
      tuck();
      return;
    }
    phase = "leaving";
    play(DRAWN, CLIPPED, Math.min(ms, LEAVE), tuck);
  };

  const dispose = () => {
    stopWork();
    tuck();
  };

  return { measure, remeasure, show, hide, dispose };
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
