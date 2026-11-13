import { isRtl } from "../shared/direction";
import { splitGraphemes } from "../shared/grapheme";
import { tween } from "../shared/tween";
import { planTransition } from "../morph/transition";

/** The word is squeezed through the seam it changes at, not swapped for it. */
const SQUASH = 0.5;
const TAIL_SQUEEZE = 0.4;

/** The live props a controller reads at the moment it acts, so a re-render
 *  between frames cannot take a running swap back to stale values. */
export interface MorphLive {
  values: string[];
  duration: number;
  hold: number;
  loop: boolean;
  step: number;
  reduced: boolean;
  onMorphed?: (value: string, index: number) => void;
}

export interface MorphController {
  /** Moves to one value, and keeps the list turning when it is looping. */
  go(next: number): void;
  /** Waits out the hold, then starts the turn. */
  cycle(): void;
  /** Puts the word the in-flight swap is heading for straight on screen. */
  settle(): void;
  dispose(): void;
}

/** A box a transform can work on, holding the graphemes it was handed. */
function span(text: string): HTMLSpanElement {
  const el = document.createElement("span");
  el.textContent = text;
  el.style.display = "inline-block";
  return el;
}

/**
 * The framework-free morphing engine. It owns nothing but the two elements it
 * is handed — the body that shows the word and the hidden ruler that measures
 * it — and reads its current configuration through `read` each time it acts,
 * so React, Vue and Svelte can all drive the same machine from their own
 * lifecycle without any of it depending on React.
 */
export function createMorpher(
  body: HTMLElement,
  /** The span inside the ruler, which is the only part allowed to be wide. */
  ruler: HTMLSpanElement,
  read: () => MorphLive,
): MorphController {
  let index = 0;
  let run: ReturnType<typeof tween> | null = null;
  let timer: number | null = null;
  let heading: string | null = null;

  const clear = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    run?.cancel();
    run = null;
  };

  /** Reads a width from a span that is laid out but never seen. */
  const measure = (text: string) => {
    ruler.textContent = text;
    return ruler.getBoundingClientRect().width;
  };

  /** The resting state: plain text, no width of its own, free to wrap. */
  const rest = (text: string) => {
    body.textContent = text;
    body.style.width = "";
    body.style.overflow = "";
    body.style.whiteSpace = "";
    body.style.verticalAlign = "";
  };

  /** Hands the next turn to the clock, when the list is long enough for one. */
  const arm = (live: MorphLive) => {
    // One value left in the list is not a cycle: the modulo would be a division
    // by zero, and the timer would keep handing the same word over forever.
    if (!live.loop || live.values.length < 2) return;
    timer = window.setTimeout(() => go((index + 1) % live.values.length), live.hold);
  };

  const landed = (text: string) => {
    heading = null;
    rest(text);
    const live = read();
    live.onMorphed?.(text, index);
    arm(live);
  };

  const go = (next: number) => {
    const live = read();
    if (live.values.length < 2) {
      // The list shrank under a pass that was already scheduled.
      clear();
      rest(live.values[0] ?? "");
      return;
    }
    const to = live.values[next] ?? "";
    // Read from what is on screen rather than from an index: the list may have
    // changed underneath this run, and the reader's eye is still on the old word.
    const from = body.textContent ?? "";
    index = next;
    clear();

    if (to === from) {
      // A list that comes back round to the word already on screen is still a
      // turn of it, and a turn is what keeps a loop alive: walking out of here
      // without arming the next one would stop a rotator for the rest of the
      // page's life, quietly. Nothing changed under the reader's eye, so
      // nothing is reported as having landed.
      rest(to);
      arm(read());
      return;
    }
    if (live.reduced || live.duration <= 0) {
      landed(to);
      return;
    }

    const plan = planTransition(from, to);
    const rtl = isRtl(body);
    const kept = splitGraphemes(from).slice(0, plan.keep);
    const pivot = kept.pop();
    const prefix = kept.join("");

    const pivotEl = pivot === undefined ? null : span(pivot);
    const outEl = plan.out.length > 0 ? span(plan.out.join("")) : null;
    const inEl = plan.in_.length > 0 ? span(plan.in_.join("")) : null;

    const width = measure(from);
    const target = measure(to);
    // The seam is the inline edge both tails meet at: everything shared up front
    // plus the pivoting character. Measured off the real words, not guessed, so
    // it lands exactly where the two diverge.
    const seam = width - (outEl ? measure(plan.out.join("")) : 0);

    // The outgoing tail is lifted out of the flow so the incoming tail can take
    // the seam's own space. Left in the line the two tails sit end to end and the
    // clipped box hides the incoming word for the whole swap — which is what made
    // an unrelated pair ("Copy" into "Be there soon") look like it only snapped in
    // at the last frame. Pinned absolute at the seam, they cross-fade in place.
    // With no incoming tail a shortening has nothing to overlap, so the outgoing
    // one stays in flow and simply retracts.
    if (outEl) {
      // A tail draws from the seam, the inline edge it starts on.
      outEl.style.transformOrigin = rtl ? "right center" : "left center";
      if (inEl) {
        outEl.style.position = "absolute";
        outEl.style.top = "0";
        outEl.style.insetInlineStart = `${seam}px`;
      }
    }
    if (inEl) {
      // Invisible before the first frame, or one frame shows both tails at
      // full weight and the swap reads as a doubling.
      inEl.style.transformOrigin = rtl ? "right center" : "left center";
      inEl.style.opacity = "0";
      inEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE})`;
    }

    body.replaceChildren();
    if (prefix.length > 0) body.append(prefix);
    if (pivotEl) body.append(pivotEl);
    if (outEl) body.append(outEl);
    if (inEl) body.append(inEl);

    // Clipped to a width that is tweened, so the words either side of it never
    // shift, and un-clipped again the moment the swap is over. Relative so the
    // absolute outgoing tail measures the seam from this box, not the page.
    body.style.position = "relative";
    body.style.whiteSpace = "nowrap";
    body.style.overflow = "hidden";
    body.style.verticalAlign = "bottom";
    body.style.width = `${width}px`;
    heading = to;

    run = tween({
      from: 0,
      to: 1,
      duration: live.duration,
      onUpdate: (p) => {
        body.style.width = `${width + (target - width) * p}px`;
        // The seam pinches in the middle of the swap and lets go by the end.
        const pinch = 1 - SQUASH * Math.sin(p * Math.PI);
        if (pivotEl) pivotEl.style.transform = `scaleX(${pinch})`;
        if (outEl) {
          outEl.style.opacity = `${1 - p}`;
          outEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE * p})`;
        }
        if (inEl) {
          inEl.style.opacity = `${p}`;
          inEl.style.transform = `scaleX(${1 - TAIL_SQUEEZE + TAIL_SQUEEZE * p})`;
        }
      },
      onComplete: () => {
        run = null;
        landed(to);
      },
    });
  };

  return {
    go,
    cycle() {
      const live = read();
      clear();
      if (live.values.length < 2) {
        rest(live.values[0] ?? "");
        return;
      }
      arm(live);
    },
    settle() {
      if (heading === null) return;
      const to = heading;
      clear();
      landed(to);
    },
    dispose: clear,
  };
}
