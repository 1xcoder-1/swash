import { EASE_CSS } from "../shared/bezier";
import { splitGraphemes, splitWordTokens } from "../shared/grapheme";
import { offset } from "../shared/number";
import type { RevealBy } from "../reveal/types";

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
  duration: number;
  stagger: number;
  y?: number;
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
 * disposer that cancels whatever is mid-flight — so React, Vue and Svelte each
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
  const rise = offset(cfg.y, Math.round(fontSize * 0.35), "y", "Reveal");

  const animations = elements.map((el, i) => {
    el.style.willChange = "opacity, transform";
    return el.animate(
      [
        { opacity: 0, transform: `translateY(${rise}px)` },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: cfg.duration,
        delay: steps[i]! * cfg.stagger,
        easing: EASE_CSS.out,
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
