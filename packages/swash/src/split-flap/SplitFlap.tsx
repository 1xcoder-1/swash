"use client";
import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { splitGraphemes } from "../shared/grapheme";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import { createSplitFlapper, DEFAULT_FLAP_CHARSET } from "../core/splitflap";
import type { SplitFlapProps } from "./types";

/**
 * A split-flap board, the way an airport departures board lands on a line:
 * every cell that differs from the target spins through tiles and comes down
 * on the right one, and the wave travels the way a reader scans.
 *
 * The cells are rendered once per grapheme of the current text and are never
 * re-rendered during a run — the engine writes each tile directly, the same
 * contract the typewriter keeps. A run is started by the text changing, so a
 * parent that re-renders with the same line disturbs nothing.
 */

const SPLIT_FLAP_CSS = [
  ".swash-splitflap{display:inline-flex;perspective:420px}",
  ".swash-splitflap .swash-splitflap-cell{",
  "  display:inline-block;",
  "  white-space:pre;",
  "  transform-style:preserve-3d;",
  "  backface-visibility:hidden;",
  "  will-change:transform;",
  "}",
].join("\n");

export function SplitFlap(props: SplitFlapProps) {
  const { text, charset = DEFAULT_FLAP_CHARSET, interval = 90, onDone, className, style } = props;

  useStyle("swash-splitflap", SPLIT_FLAP_CSS);
  const take = ms(interval, 90, "interval", "SplitFlap");
  const reduced = useReducedMotion();

  // Content, not array identity: a parent that rebuilds the line must not
  // restart a run that was already on its way.
  const key = text;

  const live = useRef({ text, charset, interval: take, cells: 0, reduced, onDone });
  useIsomorphicLayoutEffect(() => {
    live.current = { text, charset, interval: take, cells: cells.current.size, reduced, onDone };
  });

  // The tiles are uncontrolled from here on: React writes each cell exactly
  // once, at mount, and the engine owns every change after that. Re-rendering
  // the graphemes of the current text would overwrite the tiles mid-flip and
  // land every character instantly — which is the bug that turns a board
  // into plain text.
  const first = useRef(splitGraphemes(text));
  const graphemes = splitGraphemes(text);
  const cellCount = Math.max(first.current.length, graphemes.length);

  const cells = useRef(new Map<number, HTMLElement>());
  const refCache = useRef(new Map<number, (el: HTMLElement | null) => void>());
  const charRef = (index: number) => {
    const cached = refCache.current.get(index);
    if (cached) return cached;
    const attach = (el: HTMLElement | null) => {
      if (el) cells.current.set(index, el);
      else cells.current.delete(index);
    };
    refCache.current.set(index, attach);
    return attach;
  };

  const flapper = useRef<ReturnType<typeof createSplitFlapper> | null>(null);
  useIsomorphicLayoutEffect(() => {
    const controller = createSplitFlapper((index) => cells.current.get(index) ?? null);
    flapper.current = controller;
    return () => {
      if (flapper.current === controller) flapper.current = null;
      controller.dispose();
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    flapper.current?.run(live.current);
  }, [key]);

  useIsomorphicLayoutEffect(() => {
    if (text === "") {
      warnOnce("split-flap:text", "SplitFlap got an empty line; the board has nothing to show");
    }
  }, [text]);

  return (
    <span className={className} style={{ display: "inline-block", ...style }}>
      <span data-swash-sr="" style={srOnlyStyle}>{text}</span>
      <span className="swash-splitflap" aria-hidden="true">
        {Array.from({ length: cellCount }, (_, index) => (
          <span
            key={index}
            ref={charRef(index)}
            data-swash-flap-cell=""
          >
            {first.current[index] ?? ""}
          </span>
        ))}
      </span>
    </span>
  );
}
