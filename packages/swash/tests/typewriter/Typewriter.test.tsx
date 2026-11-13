import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../helpers/frames";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import { installWaapiMock } from "../helpers/waapi-mock";
import type { Feel } from "../../src/shared/presets";
import { Typewriter } from "../../src/typewriter/Typewriter";
import type { TypewriterProps } from "../../src/typewriter/types";

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
let Observer: ReturnType<typeof installIntersectionMock>;

beforeEach(() => {
  vi.useFakeTimers();
  installFrameStub();
  installWaapiMock();
  Observer = installIntersectionMock();
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

  it("stops the caret blinking when the reader asked for no motion", async () => {
    // A caret that blinks forever is the one animation a reduced-motion reader
    // is least able to ignore, and it is still a compositor job for as long as
    // the page is open.
    await renderTyped({ text: "one", feel: FLAT });
    const css = document.querySelector("style#swash-caret")?.textContent ?? "";
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("starts typing when the scroll gate is taken away", async () => {
    // startOnView off used to leave the phrase invisible forever: the flag was
    // read once at mount, and the observer that would have lifted it had just
    // been unregistered.
    const { container, rerender } = await renderTyped({
      text: "ab",
      feel: FLAT,
      startOnView: true,
    });
    expect(typed(container)).toBe("");

    rerender(<Typewriter text="ab" feel={FLAT} startOnView={false} />);
    await advance(40);
    expect(typed(container)).toBe("ab");
  });

  it("waits for the scroll when the gate is put up", async () => {
    const { container } = await renderTyped({
      text: "ab",
      feel: FLAT,
      startOnView: true,
    });
    const root = container.firstChild as Element;
    expect(Observer.forElement(root)).toBeDefined();
    await advance(40);
    expect(typed(container)).toBe("");

    act(() => Observer.instances[0]!.fire(root));
    await advance(40);
    expect(typed(container)).toBe("ab");
  });
});

describe("caret styling", () => {
  it("anchors the caret with logical properties so it mirrors in right-to-left text", async () => {
    // A physical `border-left` caret sits on the wrong edge when the reading
    // direction flips; the inline-start longhand follows the text either way.
    const { CARET_CSS } = await import("../../src/core/typewriter");
    expect(CARET_CSS).toContain("border-inline-start");
    expect(CARET_CSS).toContain("margin-inline-start");
    expect(CARET_CSS).not.toMatch(/border-left|margin-left/);
  });
});
