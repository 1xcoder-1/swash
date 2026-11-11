import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../test/frames";
import { installIntersectionMock } from "../test/intersection-mock";
import { installMatchMediaMock } from "../test/match-media-mock";
import { installWaapiMock } from "../test/waapi-mock";
import type { Feel } from "../shared/presets";
import { Typewriter } from "./Typewriter";
import type { TypewriterProps } from "./types";

/**
 * Typewriter is the one component allowed to touch React state per step: a
 * typed character is human-scale, not 60fps. What these tests hold it to is
 * the parts that used to break elsewhere - emoji falling apart into code
 * units, a loop callback that fires twice or never, and a re-render that
 * froze the machine.
 */

// Flat timing: 20ms a grapheme, no wobble, half that to delete, 50ms hold.
const FLAT: Feel = { charDelay: 20, jitter: 0, deleteRatio: 0.5, pause: 50 };

const charSpans = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("[data-swash-char]")];

/** The characters a reader can see right now, in order. */
const typed = (container: HTMLElement) =>
  charSpans(container)
    .filter((el) => el.style.visibility !== "hidden")
    .map((el) => el.textContent)
    .join("");

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function renderTyped(props: TypewriterProps) {
  const view = render(<Typewriter {...props} />);
  return { ...view, container: view.container as HTMLElement };
}

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  vi.useFakeTimers();
  installFrameStub();
  installWaapiMock();
  installIntersectionMock();
  media = installMatchMediaMock(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Typewriter", () => {
  it("types one step per grapheme, not per code unit", async () => {
    const { container } = await renderTyped({ text: "🚀 go", feel: FLAT });
    expect(charSpans(container)).toHaveLength(4);
    expect(typed(container)).toBe("");

    await advance(20);
    expect(typed(container)).toBe("🚀");
    await advance(20);
    expect(typed(container)).toBe("🚀 ");
    await advance(40);
    expect(typed(container)).toBe("🚀 go");
  });

  it("fires onLoopDone once per full rotation", async () => {
    const onLoopDone = vi.fn();
    await renderTyped({ loop: ["ab", "cd"], feel: FLAT, onLoopDone });

    // One rotation is 2 types + hold + 2 deletes per phrase: 110ms twice.
    await advance(110);
    expect(onLoopDone).not.toHaveBeenCalled();
    await advance(110);
    expect(onLoopDone).toHaveBeenCalledTimes(1);
    expect(onLoopDone).toHaveBeenLastCalledWith("cd", 1);
    await advance(440);
    expect(onLoopDone).toHaveBeenCalledTimes(3);
  });

  it("restarts on a new text instead of freezing mid-word", async () => {
    const onDone = vi.fn();
    const view = await renderTyped({ text: "Hello", feel: FLAT, onDone });
    await advance(60);
    expect(typed(view.container)).toBe("Hel");

    view.rerender(<Typewriter text="Bye" feel={FLAT} onDone={onDone} />);
    await advance(20);
    expect(typed(view.container)).toBe("B");
    await advance(100);
    expect(typed(view.container)).toBe("Bye");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("an unknown feel warns once and types at cinematic speed", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await renderTyped({ text: "ab", feel: "bogus" as never });
    await advance(100);
    expect(typed(container)).toBe("ab");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("reduced motion prints the whole phrase and leaves it alone", async () => {
    media.set(true);
    const onDone = vi.fn();
    const { container } = await renderTyped({ text: "🚀 go", feel: FLAT, onDone });
    expect(typed(container)).toBe("🚀 go");
    expect(onDone).toHaveBeenCalledTimes(1);

    // Time passes, and the line just sits there, finished.
    await advance(2000);
    expect(typed(container)).toBe("🚀 go");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("draws a caret unless asked not to, and deletes grapheme by grapheme", async () => {
    const { container, rerender } = await renderTyped({
      loop: ["ab", "cd"],
      feel: FLAT,
    });
    expect(container.querySelector("[data-swash-caret]")).toBeTruthy();

    rerender(<Typewriter loop={["ab", "cd"]} feel={FLAT} cursor={false} />);
    expect(container.querySelector("[data-swash-caret]")).toBeNull();

    await advance(40); // both letters of "ab" typed
    expect(typed(container)).toBe("ab");
    await advance(50); // the hold
    await advance(10);
    expect(typed(container)).toBe("a");
    await advance(10);
    expect(typed(container)).toBe("");
    await advance(20);
    expect(typed(container)).toBe("c");
  });

  it("leaves no timer behind when it unmounts mid-type", async () => {
    const view = await renderTyped({ text: "Hello there", feel: FLAT });
    await advance(60);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("injects the caret stylesheet once for the whole page", async () => {
    await renderTyped({ text: "one", feel: FLAT });
    const second = render(<Typewriter text="two" feel={FLAT} />);
    second.unmount();
    expect(document.querySelectorAll("style#swash-caret")).toHaveLength(1);
  });
});
