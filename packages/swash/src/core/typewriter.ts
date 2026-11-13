import { splitGraphemes } from "../shared/grapheme";
import type { Feel } from "../shared/presets";

type Phase = "typing" | "pausing" | "deleting" | "done";

/**
 * The caret lives on the element after the last grapheme, so it travels with
 * the text. Blinking is CSS: a timer would be one more thing to pause when the
 * tab goes away. Shared by every framework binding so one sheet serves the page.
 */
export const CARET_CSS = `@keyframes swash-caret-blink { 0%, 45% { opacity: 1 } 55%, 100% { opacity: 0 } }
[data-swash-caret] {
  display: inline-block;
  width: 0;
  border-inline-start: 1px solid currentColor;
  margin-inline-start: 1px;
  animation: swash-caret-blink 1.05s steps(1, end) infinite;
}
@media (prefers-reduced-motion: reduce) {
  [data-swash-caret] { animation: none }
}`;

/** How far a grapheme blurs in and out, in px and ms. */
const BLUR_PX = 8;
const BLUR_MS = 300;

/**
 * A hand is not a metronome: it settles into a line and slows down as it
 * reaches the end of it. The middle of a phrase therefore types a little
 * faster than the first and last graphemes.
 */
function rhythm(progress: number) {
  return 1 - 0.35 * Math.sin(progress * Math.PI);
}

/**
 * Deterministic wobble in [-1, 1]. Random jitter per step would give a
 * restarted run timings that differ from the run it replaced, and a re-render
 * could not tell the two apart.
 */
function jitterFor(index: number, seed: number) {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** The gap in ms before grapheme `index` of a phrase of `total` graphemes. */
function beat(index: number, total: number, feel: Feel, phrase: number, ratio = 1) {
  const progress = total <= 1 ? 0 : index / (total - 1);
  const base = feel.charDelay * rhythm(progress) * ratio;
  const wobble = 1 + jitterFor(index, phrase) * feel.jitter;
  return Math.max(1, Math.round(base * wobble));
}

export interface TypewriterRun {
  /** Phrases to type, already resolved from `text` or `loop`. */
  phrases: string[];
  feel: Feel;
  /** Rotate through `phrases` forever, rather than typing the first and stopping. */
  looping: boolean;
  reduced: boolean;
  /** Reports how much of the current phrase is on screen; the host renders it. */
  publish: (state: { phrase: number; count: number }) => void;
  /** Finds the element for grapheme `index`, so a run can blur it in or out. */
  elementFor: (index: number) => HTMLElement | null;
  onDone?: () => void;
  onLoopDone?: (phrase: string, index: number) => void;
}

/**
 * The framework-free typing machine: graphemes appear one at a time, a finished
 * phrase holds, then erases, and the pointer moves on. One timer drives it, and
 * the only thing it publishes is how much of the phrase is on screen, so a
 * parent re-render can neither speed the run up, slow it down, nor freeze it. It
 * returns a disposer, which is all a binding has to hold on to.
 */
export function runTypewriter(run: TypewriterRun): () => void {
  const units = run.phrases.map((phrase) => splitGraphemes(phrase));
  const first = units[0] ?? [];
  const { feel } = run;

  // Reduced motion gets the finished line, not a faster version of the run.
  if (run.reduced) {
    run.publish({ phrase: 0, count: first.length });
    run.onDone?.();
    return () => {};
  }

  const machine = { phrase: 0, count: 0, phase: "typing" as Phase };
  run.publish({ phrase: 0, count: 0 });

  const animations = new Map<number, Animation>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const publish = () => run.publish({ phrase: machine.phrase, count: machine.count });
  const rest = (ms: number) => {
    timer = setTimeout(tick, ms);
  };
  const typeBeat = (index: number, total: number) => beat(index, total, feel, machine.phrase);
  const eraseBeat = (index: number, total: number) =>
    beat(index, total, feel, machine.phrase, feel.deleteRatio);

  const blur = (index: number, out: boolean) => {
    const el = run.elementFor(index);
    if (!el?.animate) return;
    animations.get(index)?.cancel();
    const frames = out
      ? [{ filter: "blur(0px)", opacity: 1 }, { filter: `blur(${BLUR_PX / 2}px)`, opacity: 0 }]
      : [{ filter: `blur(${BLUR_PX}px)`, opacity: 0.4 }, { filter: "blur(0px)", opacity: 1 }];
    const anim = el.animate(frames, {
      duration: out ? BLUR_MS * 0.6 : BLUR_MS,
      easing: "ease-out",
      fill: "forwards",
    });
    animations.set(index, anim);
  };

  /** Last grapheme erased: hand the line to the next phrase, or wrap. */
  const nextPhrase = () => {
    const wrapped = machine.phrase + 1 >= units.length;
    if (wrapped) run.onLoopDone?.(run.phrases[machine.phrase] ?? "", machine.phrase);
    machine.phrase = wrapped ? 0 : machine.phrase + 1;
    machine.phase = "typing";
    publish();
    rest(typeBeat(0, (units[machine.phrase] ?? []).length));
  };

  function tick() {
    const chars = units[machine.phrase] ?? [];

    if (machine.phase === "typing") {
      if (machine.count >= chars.length) {
        // Nothing to type: an empty phrase holds, then moves on.
        if (!run.looping) {
          machine.phase = "done";
          run.onDone?.();
          return;
        }
        machine.phase = "pausing";
        rest(feel.pause);
        return;
      }
      const index = machine.count;
      machine.count = index + 1;
      publish();
      blur(index, false);
      if (machine.count < chars.length) rest(typeBeat(machine.count, chars.length));
      else if (run.looping) {
        machine.phase = "pausing";
        rest(feel.pause);
      } else {
        machine.phase = "done";
        run.onDone?.();
      }
      return;
    }

    if (machine.phase === "pausing") {
      machine.phase = "deleting";
      if (machine.count === 0) nextPhrase();
      else rest(eraseBeat(machine.count - 1, chars.length));
      return;
    }

    // Deleting, which only a looping typewriter can reach.
    const index = machine.count - 1;
    if (index >= 0) {
      machine.count = index;
      publish();
      blur(index, true);
    }
    if (machine.count > 0) rest(eraseBeat(machine.count - 1, chars.length));
    else nextPhrase();
  }

  rest(typeBeat(0, first.length));
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    animations.forEach((anim) => anim.cancel());
    animations.clear();
  };
}
