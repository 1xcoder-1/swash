import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../helpers/frames";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import { installResizeMock } from "../helpers/resize-mock";
import { installWaapiMock } from "../helpers/waapi-mock";
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

  it("flips every cell onto the new line", async () => {
    const view = await renderFlap({ text: "GATE 7" });
    view.rerender(<view.SplitFlap text="GATE 12" charset="0123456789" interval={80} />);
    // The board is mid-turn, so the cells are whatever their cycle chose.
    await view.runAll();
    expect(view.cells()).toEqual(["G", "A", "T", "E", " ", "1", "2"]);
  });

  it("is finished the moment motion is reduced", async () => {
    media.set(true);
    const view = await renderFlap({ text: "DELAYED", interval: 80 });
    expect(view.cells()).toEqual(["D", "E", "L", "A", "Y", "E", "D"]);
    view.rerender(<view.SplitFlap text="BOARDED" />);
    expect(view.cells()).toEqual(["B", "O", "A", "R", "D", "E", "D"]);
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
