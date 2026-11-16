import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../helpers/frames";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import { installResizeMock } from "../helpers/resize-mock";
import { installWaapiMock, animateCallCount, animationAt } from "../helpers/waapi-mock";
import type { SplitFlapProps } from "../../src/split-flap/types";

/**
 * A board lands exactly on the line it was given: every cell ends on its
 * target character, whatever it cycled through on the way. These tests read
 * the cells between flips and after them rather than trusting the look.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;
let clock: ReturnType<typeof installFrameStub>;

const cellTexts = (root: HTMLElement) =>
  [...root.querySelectorAll("[data-swash-flap-cell]")].map((c) => c.textContent ?? "");

async function renderFlap(props: SplitFlapProps) {
  vi.resetModules();
  const { SplitFlap } = await import("../../src/split-flap/SplitFlap");
  const view = render(<SplitFlap {...props} />);
  const root = view.container.firstChild as HTMLElement;
  return {
    ...view,
    SplitFlap,
    root,
    cells: () => cellTexts(root),
    flip: async (ms: number) => {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
      });
    },
    runAll: () => act(() => vi.runAllTimersAsync()),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = installFrameStub();
  media = installMatchMediaMock(false);
  Observer = installIntersectionMock();
  installResizeMock();
  installWaapiMock();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SplitFlap", () => {
  it("renders one cell per grapheme and reads once for readers", async () => {
    const view = await renderFlap({ text: "GATE 7" });
    expect(view.cells()).toEqual(["G", "A", "T", "E", " ", "7"]);
    expect(view.root.querySelector("[data-swash-sr]")?.textContent).toBe("GATE 7");
    expect(view.root.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1);
  });

  it("gives every cell the class its stylesheet hangs on", async () => {
    // The sheet keeps a space tile at full width (white-space:pre) and makes
    // the flip a real 3d turn (backface-visibility:hidden). Untagged cells
    // silently lose both: words crash into each other and a flipping tile
    // shows its mirrored face.
    const view = await renderFlap({ text: "GATE 7" });
    const cells = [
      ...view.root.querySelectorAll("[data-swash-flap-cell]"),
    ] as HTMLElement[];
    expect(cells).toHaveLength(6);
    for (const cell of cells) expect(cell.className).toBe("swash-splitflap-cell");
  });

  it("flips every cell onto the new line", async () => {
    const view = await renderFlap({ text: "GATE 7" });
    view.rerender(<view.SplitFlap text="GATE 12" charset="0123456789" interval={80} />);
    // The board is mid-turn, so the cells are whatever their cycle chose.
    await view.runAll();
    expect(view.cells()).toEqual(["G", "A", "T", "E", " ", "1", "2"]);
  });

  it("retires the extra tiles when the line shrinks, leaving no blank cell", async () => {
    // A board that mounted on a long word must not keep a stray blank tile
    // parked at the end once it lands on a shorter line: the cell count
    // follows the current word, not the mount word.
    const view = await renderFlap({ text: "BOARDING", interval: 80 });
    view.rerender(<view.SplitFlap text="DELAYED" interval={80} />);
    await view.runAll();
    expect(view.cells()).toEqual(["D", "E", "L", "A", "Y", "E", "D"]);
  });

  it("is finished the moment motion is reduced", async () => {
    media.set(true);
    const view = await renderFlap({ text: "DELAYED", interval: 80 });
    expect(view.cells()).toEqual(["D", "E", "L", "A", "Y", "E", "D"]);
    view.rerender(<view.SplitFlap text="BOARDED" />);
    expect(view.cells()).toEqual(["B", "O", "A", "R", "D", "E", "D"]);
  });

  it("retires both halves of a flip so no fill holds the landed tile", async () => {
    // The up-half keeps its last angle through fill:forwards. If it is still
    // on the element when the down-half is cancelled at settle, that held
    // -90deg becomes the resting look and the landed tile stays rotated
    // away — invisible under backface-visibility:hidden.
    const onDone = vi.fn();
    const view = await renderFlap({ text: "A", interval: 80, onDone });
    view.rerender(<view.SplitFlap text="B" interval={80} onDone={onDone} />);
    await view.runAll();
    expect(view.cells()).toEqual(["B"]);
    const cell = view.root.querySelector("[data-swash-flap-cell]")!;
    // Two flips for the head cell (2 + floor(i/2)), each an up-half and a
    // down-half. Every one of them must have been retired: a fill left
    // holding an angle is exactly the stuck-tile bug.
    expect(animateCallCount(cell)).toBe(4);
    for (let i = 0; i < 4; i++) {
      expect(animationAt(cell, i)?.canceled).toBe(true);
    }
  });

  it("reports done when every cell has landed", async () => {
    const onDone = vi.fn();
    const view = await renderFlap({ text: "A", interval: 80, onDone });
    expect(onDone).not.toHaveBeenCalled();
    view.rerender(<view.SplitFlap text="B" interval={80} onDone={onDone} />);
    await view.runAll();
    expect(onDone).toHaveBeenCalled();
  });

  it("leaves a line that did not change completely alone", async () => {
    const view = await renderFlap({ text: "HOLD", interval: 80 });
    const before = view.cells();
    view.rerender(<view.SplitFlap text="HOLD" interval={80} />);
    expect(view.cells()).toEqual(before);
  });
});
