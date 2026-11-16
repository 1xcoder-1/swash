import { splitGraphemes } from "../shared/grapheme";

/** The strips an airport board holds, which is what the cells churn through. */
export const DEFAULT_FLAP_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** A cell flips no more than this many times, so a long line never crawls. */
const MAX_FLIPS = 6;

/** Everything one run reads at the moment it starts, so a re-render between
 *  flips cannot change the strip the cells are cycling through. */
export interface SplitFlapRun {
  text: string;
  charset: string;
  /** Time for one flip, in ms: half out, half back. */
  interval: number;
  /** How many cell elements the host rendered, so cells a shorter line
   *  retired can be blanked instead of left showing a stale tile. */
  cells: number;
  reduced: boolean;
  onDone?: () => void;
}

export interface SplitFlapController {
  /** Cycles every cell that differs from its target until it lands. */
  run(cfg: SplitFlapRun): void;
  dispose(): void;
}

/**
 * The framework-free split-flap engine. It is handed a reader for the cell
 * elements the host renders, and it drives each one itself: half a flip out,
 * the character swapped underneath at the closed position, half a flip back.
 * One run at a time, so a retyping parent replaces the cycle in flight rather
 * than stacking two of them.
 */
export function createSplitFlapper(
  getCell: (index: number) => HTMLElement | null,
): SplitFlapController {
  /** Bumped on every stop; a callback from an earlier run reads a stale token
   *  and does nothing, which is what keeps a superseded half-flip from
   *  writing a character the new run did not choose. */
  let token = 0;
  let animations: Animation[] = [];
  let timers: ReturnType<typeof setTimeout>[] = [];

  const stop = () => {
    token += 1;
    for (const timer of timers) clearTimeout(timer);
    timers = [];
    for (const anim of animations) anim.cancel();
    animations = [];
  };

  /** One flip: out to the closed position, swap the tile, back down. */
  const flipTo = (
    el: HTMLElement,
    next: string,
    half: number,
    mine: number,
    then?: () => void,
  ) => {
    if (mine !== token) return;
    if (typeof el.animate !== "function") {
      el.textContent = next;
      then?.();
      return;
    }
    const out = el.animate(
      [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }],
      { duration: half, easing: "ease-in", fill: "forwards" },
    );
    animations.push(out);
    const swap = () => {
      if (mine !== token) return;
      // The up-half holds its last angle through `fill: forwards`. If it is
      // still on the element when the down-half is later cancelled, that
      // held -90deg becomes the dominant fill again and the tile lands
      // rotated away — invisible under backface-visibility:hidden. Retire
      // the up-half the moment the down-half owns the transform; the two
      // hand over inside one task, so no frame paints between them.
      out.cancel();
      el.textContent = next;
      const back = el.animate(
        [{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }],
        { duration: half, easing: "ease-out", fill: "forwards" },
      );
      animations.push(back);
      const settle = () => {
        if (mine !== token) return;
        // The down-half held its last angle; cancelling hands the resting
        // look back to the element (no transform at all, the upright tile).
        back.cancel();
        animations = animations.filter((a) => a !== out && a !== back);
        then?.();
      };
      if (back.finished) back.finished.then(settle, settle);
      else setTimeout(settle, half);
    };
    if (out.finished) out.finished.then(swap, swap);
    else setTimeout(swap, half);
  };

  return {
    run(cfg) {
      stop();
      const mine = token;
      const target = splitGraphemes(cfg.text);
      const glyphs = splitGraphemes(cfg.charset === "" ? DEFAULT_FLAP_CHARSET : cfg.charset);
      const pick = () => glyphs[Math.floor(Math.random() * glyphs.length)]!;

      /** Cells the line shrank away from are blanked before anything flips:
       *  a tile the board retired must not keep its old character while the
       *  rest of the line is turning. */
      const blank = (from: number, to: number) => {
        for (let i = Math.max(0, from); i < to; i++) {
          const el = getCell(i);
          if (el && el.textContent !== "") el.textContent = "";
        }
      };

      if (cfg.reduced || target.length === 0 || glyphs.length === 0) {
        for (let i = 0; i < target.length; i++) {
          const el = getCell(i);
          if (el) el.textContent = target[i]!;
        }
        blank(target.length, cfg.cells);
        cfg.onDone?.();
        return;
      }

      blank(target.length, cfg.cells);

      const interval = Math.max(40, cfg.interval);
      const half = Math.round(interval / 2);
      // Cells read left to right, so a cell starts after the one before it
      // has begun: the wave travels the way a reader scans the board.
      const stagger = Math.round(interval / 3);
      let furthest = 0;
      for (let i = 0; i < target.length; i++) {
        const want = target[i]!;
        const el = getCell(i);
        if (!el) continue;
        if (el.textContent === want) continue;
        // Longer into the word means further from its own start, which keeps
        // the churn dense at the seam and lets the head settle early.
        const flips = Math.min(MAX_FLIPS, 2 + Math.floor(i / 2));
        const start = i * stagger;
        furthest = Math.max(furthest, start + flips * interval);

        for (let f = 0; f < flips; f++) {
          const last = f === flips - 1;
          const next = last ? want : pick();
          timers.push(
            setTimeout(() => {
              const cell = getCell(i);
              if (!cell) return;
              flipTo(cell, next, half, mine);
            }, start + f * interval),
          );
        }
      }

      // Only a run that actually turned something reports done: a board that
      // was already showing the line never left the reader waiting.
      if (furthest > 0) timers.push(setTimeout(() => cfg.onDone?.(), furthest + half));
    },
    dispose() {
      stop();
    },
  };
}
