import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * FlipWords: cycle without runaway timers when the tab is backgrounded.
 */

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock(false);
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("FlipWords", () => {
  it("starts on the first word", async () => {
    const { FlipWords } = await import("../../src/flip-words/FlipWords");
    const { container } = render(
      <FlipWords words={["one", "two", "three"]} duration={1000} />,
    );
    const word = container.querySelector(".swash-flip-word");
    expect(word?.textContent).toBe("one");
  });

  it("reserves the widest word when preserveSpace is on", async () => {
    const { FlipWords } = await import("../../src/flip-words/FlipWords");
    const { container } = render(
      <FlipWords
        words={["go", "stop", "proceed"]}
        duration={1000}
        preserveSpace
      />,
    );
    const measure = container.querySelector(".swash-flip-measure");
    expect(measure).toBeTruthy();
    expect(measure?.children).toHaveLength(3);
  });

  it("pauses the timer while the document is hidden", async () => {
    const { FlipWords } = await import("../../src/flip-words/FlipWords");
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hiddenValue,
    });
    let hiddenValue = false;
    const { container } = render(
      <FlipWords words={["a", "b", "c"]} duration={500} />,
    );
    const wordEl = () =>
      (container.querySelector(".swash-flip-word") as HTMLElement).textContent;

    expect(wordEl()).toBe("a");
    // Flip the tab away, then advance a lot.
    act(() => {
      hiddenValue = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    // Nothing ticked while hidden.
    expect(wordEl()).toBe("a");
  });

  it("flips the correct arriving word on every leg", async () => {
    // Regression: the flip used to flash the word *two* ahead during the
    // "in" leg because the index advanced when the in-leg started rather
    // than when it settled. Walk one full cycle and assert the word that is
    // actually shown on each phase.
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    const { FlipWords } = await import("../../src/flip-words/FlipWords");
    const { container } = render(
      <FlipWords words={["a", "b", "c"]} duration={1000} />,
    );
    const shown = () =>
      (container.querySelector(".swash-flip-word") as HTMLElement).textContent;
    const classes = () =>
      (container.querySelector(".swash-flip-word") as HTMLElement).className;

    expect(shown()).toBe("a");

    // Dwell elapses: flip-out starts, still showing the old word "a".
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(shown()).toBe("a");
    expect(classes()).toContain("out");

    // Out leg ends: flip-in shows the correct next word "b" (never "c").
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(shown()).toBe("b");
    expect(classes()).toContain("in");

    // In leg settles: index advances, the word stays "b", phase idles.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(shown()).toBe("b");
    expect(classes()).not.toContain("out");
    expect(classes()).not.toContain("in");
  });
});
