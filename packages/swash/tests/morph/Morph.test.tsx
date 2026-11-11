import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { installFrameStub } from "../helpers/frames";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { MorphProps } from "../../src/morph/types";

/**
 * A morph fails in two ways: it shows a character that was in neither string,
 * or the words around it jump while the width changes. Both are caught by
 * reading what is in the element between frames, not the finished result, so
 * every test here samples the line as it goes.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let clock: ReturnType<typeof installFrameStub>;

async function renderMorphing(props: MorphProps) {
  // Fresh modules per test, because the set of warnings already printed
  // outlives a component.
  vi.resetModules();
  const { Morph } = await import("../../src/morph/Morph");
  const view = render(<Morph {...props} />);
  const body = view.container.querySelector("[data-swash-morph]") as HTMLElement;
  return {
    ...view,
    root: view.container.firstChild as HTMLElement,
    text: () => body.textContent ?? "",
    width: () => body.style.width,
    /** Reads the line once per frame for a while. */
    frames: async (count: number, step = 16) => {
      const seen: string[] = [];
      for (let i = 0; i < count; i++) {
        await vi.advanceTimersByTimeAsync(step);
        seen.push(body.textContent ?? "");
      }
      return seen;
    },
    advance: (ms: number) => vi.advanceTimersByTimeAsync(ms),
    update: (next: MorphProps) => view.rerender(<Morph {...next} />),
  };
}

const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

/**
 * Waits for the nth report rather than for a slice of the clock: the rest
 * between two morphs is short, and a fixed wait can just as easily land in the
 * middle of the next swap.
 */
async function land(onMorphed: Mock, count: number) {
  for (let i = 0; i < 100 && onMorphed.mock.calls.length < count; i++) {
    await vi.advanceTimersByTimeAsync(20);
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = installFrameStub();
  media = installMatchMediaMock(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Morph", () => {
  it("shows the value it is pointed at", async () => {
    const onMorphed = vi.fn();
    const line = await renderMorphing({ values: ["Ship", "Shop"], step: 0, onMorphed });
    expect(line.text()).toBe("Ship");
    await line.advance(2000);
    expect(line.text()).toBe("Ship");
    expect(onMorphed).not.toHaveBeenCalled();
  });

  it("steps once to the next value and stops", async () => {
    const onMorphed = vi.fn();
    const line = await renderMorphing({ values: ["2019", "2024"], onMorphed });
    expect(onMorphed).not.toHaveBeenCalled();

    await line.advance(700);
    expect(line.text()).toBe("2024");
    expect(onMorphed).toHaveBeenCalledTimes(1);
    expect(onMorphed).toHaveBeenCalledWith("2024", 1);

    await line.advance(5000);
    expect(line.text()).toBe("2024");
    expect(onMorphed).toHaveBeenCalledTimes(1);
  });

  it("walks the list and wraps around while looping", async () => {
    const onMorphed = vi.fn();
    const props = {
      values: ["one", "two", "three"],
      loop: true,
      duration: 200,
      hold: 100,
      onMorphed,
    };
    const line = await renderMorphing(props);
    await line.advance(50);
    expect(line.text()).toBe("one");

    await land(onMorphed, 1);
    expect(line.text()).toBe("two");
    await land(onMorphed, 2);
    expect(line.text()).toBe("three");
    await land(onMorphed, 3);
    expect(line.text()).toBe("one");
    expect(onMorphed.mock.calls).toEqual([
      ["two", 1],
      ["three", 2],
      ["one", 0],
    ]);
  });

  it("keeps turning when the list hands back the word already on screen", async () => {
    // A list with the same value twice used to end the pass in silence and with
    // no timer to arm the next turn, so a rotator with a repeated word in it
    // stopped for the rest of the page's life. The repeat itself is not a swap
    // and is not reported as one.
    const onMorphed = vi.fn();
    const line = await renderMorphing({
      values: ["ab", "cd", "cd"],
      loop: true,
      duration: 100,
      hold: 20,
      onMorphed,
    });
    await land(onMorphed, 3);
    expect(onMorphed.mock.calls).toEqual([
      ["cd", 1],
      ["ab", 0],
      ["cd", 1],
    ]);
    expect(line.text()).toBe("cd");
  });

  it("rests on what it has when the list shrinks under a loop", async () => {
    // With one value left the modulo is a division that has nowhere to go, and
    // the timer armed at the end of every turn would keep handing the swap a
    // value that is not in the list. The turn already in flight still lands.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onMorphed = vi.fn();
    const line = await renderMorphing({
      values: ["one", "two", "three"],
      loop: true,
      duration: 100,
      hold: 20,
      onMorphed,
    });
    await line.advance(60);
    line.update({ values: ["two"], loop: true, duration: 100, hold: 20, onMorphed });

    await land(onMorphed, 1);
    expect(onMorphed).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls.filter((call) => /at least two/.test(String(call[0])))).toHaveLength(
      1,
    );

    // Nothing left to cycle between, so the line just stays on that word.
    await line.advance(5000);
    expect(onMorphed).toHaveBeenCalledTimes(1);
    expect(line.text()).toBe("two");
    warn.mockRestore();
  });

  it("follows the step prop when it is handed one", async () => {
    const onMorphed = vi.fn();
    const base = { values: ["a", "b", "c"], step: 0, onMorphed };
    const line = await renderMorphing(base);
    expect(line.text()).toBe("a");

    line.update({ ...base, step: 2 });
    await line.advance(700);
    expect(line.text()).toBe("c");
    expect(onMorphed).toHaveBeenCalledTimes(1);
    expect(onMorphed).toHaveBeenCalledWith("c", 2);
  });

  it("holds the width it measured while it swaps the tail", async () => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
      this: Element,
    ) {
      return { width: (this.textContent ?? "").length * 10 } as DOMRect;
    });
    const line = await renderMorphing({ values: ["aa", "bbbb"], duration: 200 });
    // Locked to the width of the word it started on, before a frame is drawn.
    expect(line.width()).toBe("20px");

    await line.advance(100);
    const midway = Number.parseFloat(line.width());
    expect(midway).toBeGreaterThan(20);
    expect(midway).toBeLessThan(40);

    await line.advance(200);
    expect(line.text()).toBe("bbbb");
    // At rest the word is allowed to size itself again.
    expect(line.width()).toBe("");
  });

  it("never shows half an emoji", async () => {
    const line = await renderMorphing({
      values: ["🚀x", "🎉y"],
      loop: true,
      duration: 200,
      hold: 50,
    });
    const seen = await line.frames(20, 30);
    expect(seen.some((frame) => frame !== "🚀x" && frame !== "🎉y")).toBe(true);
    expect(seen.every((frame) => !loneSurrogate.test(frame))).toBe(true);
  });

  it("is already on the next value when motion is reduced", async () => {
    media.set(true);
    const onMorphed = vi.fn();
    const line = await renderMorphing({
      values: ["one", "two", "three"],
      loop: true,
      duration: 600,
      hold: 100,
      onMorphed,
    });
    await land(onMorphed, 1);
    expect(line.text()).toBe("two");
    // Nothing eased its way there.
    expect(clock.frames).toBe(0);
    await land(onMorphed, 2);
    expect(line.text()).toBe("three");
    expect(onMorphed.mock.calls).toEqual([
      ["two", 1],
      ["three", 2],
    ]);
  });

  it("warns once and shows what it has when the list is too short", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const line = await renderMorphing({ values: ["only"] });
    expect(line.text()).toBe("only");
    await line.advance(5000);
    expect(line.text()).toBe("only");
    expect(vi.getTimerCount()).toBe(0);
    expect(warn.mock.calls.filter((call) => String(call[0]).includes("values"))).toHaveLength(1);
  });

  it("does not restart when a parent hands it a fresh array", async () => {
    const onMorphed = vi.fn();
    const props = { values: ["one", "two"], loop: true, duration: 400, hold: 200, onMorphed };
    const line = await renderMorphing(props);
    await line.advance(300);

    line.update({ ...props, values: ["one", "two"] });
    // A restarted cycle would still be mid-morph here, showing both tails.
    await line.advance(316);
    expect(line.text()).toBe("two");
    expect(onMorphed).toHaveBeenCalledTimes(1);
  });

  it("finishes the swap when the reader turns reduced motion on mid-way", async () => {
    const onMorphed = vi.fn();
    const line = await renderMorphing({
      values: ["one", "two"],
      loop: true,
      duration: 600,
      hold: 100,
      onMorphed,
    });
    await line.advance(200);
    expect(line.text()).toBe("onetwo");

    act(() => media.set(true));
    expect(line.text()).toBe("two");
    expect(line.width()).toBe("");
    expect(onMorphed).toHaveBeenCalledTimes(1);
  });

  it("leaves no timer behind when it unmounts mid-cycle", async () => {
    const line = await renderMorphing({
      values: ["one", "two", "three"],
      loop: true,
      duration: 400,
      hold: 400,
    });
    await line.advance(500);
    expect(clock.frames).toBeGreaterThan(0);
    line.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
