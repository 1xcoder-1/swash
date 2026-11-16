import { EASE_CSS } from "../shared/bezier";
import { splitGraphemes, splitWordTokens } from "../shared/grapheme";
import { warnOnce } from "../shared/warn";
import type { RevealBy, RevealEffect } from "../reveal/types";

/** The line is subordinate to the scroll that brings it, so it asks for less of the viewport than it takes. */
export const REVEAL_RATIO = 0.2;
export const REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";

/** Two pieces this close to the same height are the same line. */
const LINE_EPSILON = 1;

/** The attribute a rendered piece carries so the engine can find it in the DOM. */
export const REVEAL_ATTR = "data-swash-reveal";

/**
 * A piece arrives as one box, and an inline span is not a box a transform can
 * move. The pieces get this and the spaces between them stay plain text, so
 * the line still wraps where the reader's font wants it to.
 */
export const REVEAL_CSS = `[${REVEAL_ATTR}] { display: inline-block; }`;

export interface RevealPiece {
  text: string;
  /** False for the whitespace between pieces, which is never animated. */
  animated: boolean;
}

export interface RevealRun {
  by: RevealBy;
  /** "rise" moves each piece up from below; "blur" pulls it into focus from
   *  a Gaussian blur and a slight scale, the depth-of-field entrance. */
  effect: RevealEffect;
  duration: number;
  stagger: number;
  y?: number;
  /** Blur radius the blur effect starts from, in px. */
  blur?: number;
  reduced: boolean;
}

export function tokenize(text: string, by: RevealBy): RevealPiece[] {
  if (by === "fade") return [{ text, animated: true }];
  if (by === "letter") {
    return splitGraphemes(text).map((grapheme) => ({
      text: grapheme,
      animated: grapheme.trim() !== "",
    }));
  }
  return splitWordTokens(text).map((token) => ({
    text: token.text,
    animated: !token.space,
  }));
}

/**
 * Which line each piece ended up on, read from where it landed rather than
 * guessed from the text: only the browser knows where a paragraph wraps.
 */
function lineSteps(elements: HTMLElement[]): number[] {
  const tops: number[] = [];
  return elements.map((el) => {
    const top = el.getBoundingClientRect().top;
    const found = tops.findIndex((t) => Math.abs(t - top) < LINE_EPSILON);
    if (found >= 0) return found;
    tops.push(top);
    return tops.length - 1;
  });
}

/**
 * The framework-free reveal engine. It finds the pieces the host markup already
 * rendered, animates them in with the Web Animations API, and hands back a
 * disposer that cancels whatever is mid-flight — so any framework binding each
 * just render the pieces and call this on mount.
 */
export function runReveal(root: HTMLElement, cfg: RevealRun): () => void {
  if (cfg.reduced) return () => {};
  const elements = [...root.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`)];
  if (elements.length === 0) return () => {};

  const steps = cfg.by === "line" ? lineSteps(elements) : elements.map((_, i) => i);
  const fontSize = Number.parseFloat(getComputedStyle(root).fontSize) || 0;
  // A distance that is not a usable number would land inside the transform
  // string, and one invalid property throws the whole keyframe away: the
  // pieces would fade in place instead of rising, with nothing said about it.
  // Zero is read here, though, and not sent back as a miss: "rise nothing but
  // fade" is a distance a developer is allowed to ask for, and only a
  // distance that means nothing (NaN, Infinity) falls back, said out loud.
  const defaultRise = Math.round(fontSize * 0.35);
  let rise = defaultRise;
  if (cfg.y !== undefined) {
    if (Number.isFinite(cfg.y)) rise = cfg.y;
    else
      warnOnce(
        "reveal:y",
        `Reveal y wants a number of pixels, got ${cfg.y}. Using ${defaultRise}.`,
      );
  }
  // A blur radius the caller never asked for would still be read here, and
  // clamped so a typo cannot hand the filter an unusable number.
  const blur = Math.max(0, cfg.blur ?? 10);
  // A zero duration is valid Web Animations (the piece lands at its end
  // state), but the stagger multiplies into each piece's delay, and a fill of
  // both with a delay that outlives a zero-length run would park the later
  // pieces on their invisible start frame for the rest of the page's life.
  const duration = Math.max(0, cfg.duration);
  const stagger = Math.max(0, cfg.stagger);

  const from: Keyframe =
    cfg.effect === "blur"
      ? { opacity: 0, filter: `blur(${blur}px)`, transform: "scale(1.04)" }
      : { opacity: 0, transform: `translateY(${rise}px)` };
  const to: Keyframe = { opacity: 1, filter: "blur(0px)", transform: "none" };

  const animations = elements.map((el, i) => {
    el.style.willChange =
      cfg.effect === "blur" ? "opacity, transform, filter" : "opacity, transform";
    return el.animate(
      [from, to],
      {
        duration,
        delay: steps[i]! * stagger,
        // The rise entrance wants the expo-out: it arrives fast and settles.
        // The blur entrance does not — under that curve the radius is spent
        // inside the first third of the run, so the piece pops in faintly
        // soft instead of pulling into focus. An in-out holds the blur while
        // the piece fades up, then resolves it through the rest of the run,
        // which is how a depth-of-field rack actually reads.
        easing: cfg.effect === "blur" ? EASE_CSS.inOut : EASE_CSS.out,
        // Both, so the gap between the trigger and a staggered piece's turn
        // is spent invisible rather than showing the finished line first.
        fill: "both",
      },
    );
  });

  const clear = () => {
    for (const el of elements) el.style.willChange = "";
  };
  // The pieces before it started sooner and finish sooner, so nothing is
  // still moving by the time this one stops.
  animations[animations.length - 1]?.finished.then(clear, () => {});

  return () => {
    for (const animation of animations) animation.cancel();
    clear();
  };
}
