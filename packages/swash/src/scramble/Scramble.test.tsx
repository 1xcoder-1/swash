import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { splitGraphemes } from "../shared/grapheme";
import { installFrameStub } from "../test/frames";
import { installIntersectionMock } from "../test/intersection-mock";
import { installMatchMediaMock } from "../test/match-media-mock";
import type { ScrambleProps } from "./types";

/**
 * A scramble is only allowed to fail in one way: by moving letters around
 * inside a line that never changes length. So these tests read what is in the
 * element between frames rather than trusting that the run looks right, and
 * check that the line it ends on is exactly the line it was given.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let clock: ReturnType<typeof installFrameStub>;
let Observer: ReturnType<typeof installIntersectionMock>;

async function renderScrambled(props: ScrambleProps) {
  // Fresh modules per test, because both the observer registry and the set of
  // warnings already printed outlive a component.
  vi.resetModules();
  const { Scramble } = await import("./Scramble");
  const view = render(<Scramble {...props} />);
  const textEl = view.container.querySelector("span > span") as HTMLElement;
  return {
    ...view,
    root: view.container.firstChild as HTMLElement,
    text: () => textEl.textContent ?? "",
    /** Reads the line once per frame for a while, the way a reader sees it. */
    frames: async (count: number, step = 16) => {
      const seen: string[] = [];
      for (let i = 0; i < count; i++) {
        await vi.advanceTimersByTimeAsync(step);
        seen.push(textEl.textContent ?? "");
      }
      return seen;
    },
    finish: () => vi.runAllTimersAsync(),
    update: (next: ScrambleProps) => view.rerender(<Scramble {...next} />),
  };
}

function arrive(el: Element) {
  act(() => {
    Observer.instances[0]!.fire(el);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = installFrameStub();
  media = installMatchMediaMock(false);
  Observer = installIntersectionMock();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Scramble", () => {
  it("lands on the exact text and says so once", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "Hello world", onDone });
    await line.finish();
    expect(line.text()).toBe("Hello world");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("keeps the length of the line in every frame", async () => {
    const target = "🚀 Ship it 👍🏽";
    const wanted = splitGraphemes(target).length;
    const line = await renderScrambled({ text: target });
    const seen = await line.frames(20, 50);
    expect(seen.every((frame) => splitGraphemes(frame).length === wanted)).toBe(true);
    await line.finish();
    expect(splitGraphemes(line.text())).toEqual(splitGraphemes(target));
  });

  it("leaves the spaces where they are", async () => {
    const line = await renderScrambled({ text: "a b c" });
    const seen = await line.frames(15, 50);
    expect(seen.every((frame) => frame[1] === " " && frame[3] === " ")).toBe(true);
  });

  it("churns a single grapheme before it settles", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "🚀", onDone });
    const [mid] = await line.frames(3);
    expect(mid).not.toBe("🚀");
    expect(splitGraphemes(mid ?? "").length).toBe(1);
    await line.finish();
    expect(line.text()).toBe("🚀");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("finishes an empty line instead of spinning on it", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "", onDone });
    await line.finish();
    expect(line.text()).toBe("");
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("waits for the click", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "Ship it", trigger: "click", onDone });
    expect(await line.frames(10, 100)).toEqual(Array(10).fill("Ship it"));
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.click(line.root);
    const [mid] = await line.frames(2);
    expect(mid).not.toBe("Ship it");
    await line.finish();
    expect(line.text()).toBe("Ship it");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("waits for the line to scroll in", async () => {
    const line = await renderScrambled({ text: "Ship it", trigger: "view" });
    expect(await line.frames(10, 100)).toEqual(Array(10).fill("Ship it"));

    arrive(line.root);
    const [mid] = await line.frames(2);
    expect(mid).not.toBe("Ship it");
    await line.finish();
    expect(line.text()).toBe("Ship it");
  });

  it("starts only when the text changes under the prop trigger", async () => {
    const onDone = vi.fn();
    const base = { trigger: "prop" as const, onDone };
    const line = await renderScrambled({ ...base, text: "one" });
    expect(await line.frames(10, 100)).toEqual(Array(10).fill("one"));
    expect(onDone).not.toHaveBeenCalled();

    line.update({ ...base, text: "two" });
    const [mid] = await line.frames(2);
    expect(mid).not.toBe("two");
    await line.finish();
    expect(line.text()).toBe("two");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("switches to the new text when the target changes mid-run", async () => {
    const onDone = vi.fn();
    const base = { trigger: "prop" as const, onDone };
    const line = await renderScrambled({ ...base, text: "alpha" });
    line.update({ ...base, text: "bravo" });
    await line.frames(4, 50);

    line.update({ ...base, text: "ship" });
    expect(splitGraphemes(line.text()).length).toBe(4);
    await line.finish();
    expect(line.text()).toBe("ship");
    // The run that got replaced never reports a finish of its own.
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("does not start again when a parent re-renders around it", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "Ship it", speed: 2, onDone });
    await line.finish();
    expect(onDone).toHaveBeenCalledTimes(1);

    line.update({ text: "Ship it", speed: 1, onDone });
    await line.frames(10, 100);
    expect(line.text()).toBe("Ship it");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("is already finished when motion is reduced", async () => {
    media.set(true);
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "Ship it", onDone });
    expect(line.text()).toBe("Ship it");
    expect(clock.frames).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("only ever shows the glyphs it was given", async () => {
    const line = await renderScrambled({ text: "abcd", charset: "AB" });
    const seen = await line.frames(5, 40);
    const allowed = new Set(["A", "B"]);
    expect(seen.every((frame) => splitGraphemes(frame).every((g) => allowed.has(g)))).toBe(true);
    await line.finish();
    expect(line.text()).toBe("abcd");
  });

  it("lands the line when the reader turns reduced motion on mid-run", async () => {
    const onDone = vi.fn();
    const line = await renderScrambled({ text: "Ship it", onDone });
    await line.frames(5);
    expect(line.text()).not.toBe("Ship it");

    act(() => media.set(true));
    expect(line.text()).toBe("Ship it");
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("carries a long line through without dropping a grapheme", async () => {
    const target = "swash ".repeat(100);
    const wanted = splitGraphemes(target).length;
    const line = await renderScrambled({ text: target, speed: 3 });
    const seen = await line.frames(10, 200);
    expect(seen.every((frame) => splitGraphemes(frame).length === wanted)).toBe(true);
    await line.finish();
    expect(line.text()).toBe(target);
  });

  it("gives up the frame it asked for when it unmounts mid-run", async () => {
    const line = await renderScrambled({ text: "Ship it" });
    await line.frames(5);
    expect(clock.frames).toBeGreaterThan(0);
    line.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clamps a speed nobody could mean and warns once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const line = await renderScrambled({ text: "Ship it", speed: 40 });
    await line.finish();
    expect(line.text()).toBe("Ship it");
    expect(warn.mock.calls.filter((call) => String(call[0]).includes("speed"))).toHaveLength(1);
  });
});
