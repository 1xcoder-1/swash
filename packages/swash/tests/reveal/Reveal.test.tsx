import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import { animateCallCount, animationAt, installWaapiMock } from "../helpers/waapi-mock";
import type { RevealProps } from "../../src/reveal/types";

/**
 * A reveal has to arrive from the same markup the server sent, or hydration
 * mismatches and the line flashes. So every test here starts from what is in
 * the DOM before anything scrolls, then checks that the animation only ever
 * touches pieces of it.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function pieceEls(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-swash-reveal]")];
}

/** The starting transform of the first keyframe this piece was handed. */
function transformOf(el: Element): string {
  const key = animationAt(el, 0)!.keys[0] as { transform?: string };
  return String(key.transform);
}

/** Scrolls the line in or out, the way the reader would. */
function scroll(el: Element, intersecting: boolean) {
  act(() => {
    const observer = Observer.forElement(el);
    if (!observer) throw new Error("Reveal is not watching its own line");
    observer.fire(el, intersecting);
  });
}

async function renderRevealed(props: RevealProps) {
  // Fresh modules per test, because the shared observer registry outlives a
  // component and this test empties the instance list it searches.
  vi.resetModules();
  const { Reveal } = await import("../../src/reveal/Reveal");
  const view = render(<Reveal {...props} />);
  const root = view.container.firstChild as HTMLElement;
  return {
    ...view,
    root,
    pieces: () => pieceEls(view.container),
    arrive: () => scroll(root, true),
    leave: () => scroll(root, false),
    update: (next: RevealProps) => view.rerender(<Reveal {...next} />),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  media = installMatchMediaMock(false);
  Observer = installIntersectionMock();
  installWaapiMock();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("sends the whole line in the markup and animates nothing until it arrives", async () => {
    const { container, pieces } = await renderRevealed({ children: "Ship it" });
    expect(container.textContent).toBe("Ship it");
    const units = pieces();
    expect(units).toHaveLength(2);
    expect(units.map((el) => el.style.opacity)).toEqual(["", ""]);
    expect(units.map((el) => animateCallCount(el))).toEqual([0, 0]);
  });

  it("animates every word once and leaves the spaces unanimated", async () => {
    const { arrive, container, pieces } = await renderRevealed({
      children: "Ship it out",
      y: 12,
    });
    arrive();
    const units = pieces();
    expect(container.textContent).toBe("Ship it out");
    expect(units).toHaveLength(3);
    expect(units.map((el) => animateCallCount(el))).toEqual([1, 1, 1]);
    expect(units.map((el) => animationAt(el, 0)?.options.delay)).toEqual([0, 40, 80]);
    expect(animationAt(units[1]!, 0)?.keys[0]).toEqual({
      opacity: 0,
      transform: "translateY(12px)",
    });
  });

  it("reveals again when once is off and the line comes back", async () => {
    const { arrive, leave, pieces } = await renderRevealed({
      children: "Ship it",
      once: false,
      duration: 300,
    });
    arrive();
    await advance(400);
    expect(animateCallCount(pieces()[0]!)).toBe(1);
    leave();
    arrive();
    expect(animateCallCount(pieces()[0]!)).toBe(2);
  });

  it("holds one piece per grapheme when it goes letter by letter", async () => {
    const { arrive, pieces } = await renderRevealed({ children: "🚀 go", by: "letter" });
    arrive();
    const units = pieces();
    expect(units.map((el) => el.textContent)).toEqual(["🚀", "g", "o"]);
    expect(units.map((el) => animateCallCount(el))).toEqual([1, 1, 1]);
  });

  it("counts the pieces it staggers by line, not by word", async () => {
    const tops = new Map([
      ["one", 0],
      ["two", 0],
      ["three", 20],
      ["four", 20],
    ]);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        return { top: tops.get(this.textContent ?? "") ?? 0 } as DOMRect;
      },
    );
    const { arrive, pieces } = await renderRevealed({
      children: "one two three four",
      by: "line",
      stagger: 120,
    });
    arrive();
    expect(pieces().map((el) => animationAt(el, 0)?.options.delay)).toEqual([
      0, 0, 120, 120,
    ]);
  });

  it("fades the line as one piece", async () => {
    const { arrive, container, pieces } = await renderRevealed({
      children: "Ship it",
      by: "fade",
    });
    arrive();
    expect(pieces()).toHaveLength(1);
    expect(container.textContent).toBe("Ship it");
    expect(animateCallCount(pieces()[0]!)).toBe(1);
  });

  it("is already in its final state when motion is reduced", async () => {
    media.set(true);
    const { arrive, container, pieces } = await renderRevealed({ children: "Ship it" });
    arrive();
    expect(pieces().map((el) => animateCallCount(el))).toEqual([0, 0]);
    expect(container.textContent).toBe("Ship it");
  });

  it("does not restart when a parent re-renders around it", async () => {
    const { arrive, pieces, update } = await renderRevealed({ children: "Ship it" });
    arrive();
    update({ children: "Ship it" });
    update({ children: "Ship it", duration: 900, stagger: 90 });
    expect(pieces().map((el) => animateCallCount(el))).toEqual([1, 1]);
  });

  it("gives up the hint it asked the browser to remember", async () => {
    const { arrive, pieces } = await renderRevealed({ children: "Ship it", duration: 300 });
    arrive();
    expect(pieces()[0]!.style.willChange).toBe("opacity, transform");
    await advance(400);
    expect(pieces().map((el) => el.style.willChange)).toEqual(["", ""]);
  });

  it("leaves anything that is not text alone, once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { arrive, container, pieces } = await renderRevealed({
      children: <em>Ship it</em>,
    });
    arrive();
    expect(container.textContent).toBe("Ship it");
    expect(pieces()).toHaveLength(0);
    expect(warn.mock.calls.filter((call) => String(call[0]).includes("string"))).toHaveLength(1);
  });

  it("reads a negative timing as the default instead of throwing", async () => {
    // Web Animations throws on a negative duration, so a typo in a prop would
    // have taken the page down rather than arriving on the default rhythm.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { arrive, pieces } = await renderRevealed({
      children: "Ship it",
      duration: -400,
      stagger: -10,
    });
    arrive();
    expect(animationAt(pieces()[0]!, 0)!.options.duration).toBe(400);
    expect(animationAt(pieces()[1]!, 0)!.options.delay).toBe(40);
    const complaints = warn.mock.calls.filter((call) =>
      String(call[0]).includes("duration"),
    );
    expect(complaints).toHaveLength(1);
  });

  it("writes a distance it can actually animate", async () => {
    // A junk distance used to be dropped straight into the transform string, and
    // a browser throws away one invalid property with the whole keyframe: the
    // line would fade in place, silent. A distance that points downwards is a
    // different thing, and must survive as written.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const junk = await renderRevealed({ children: "Ship it", y: Number.NaN });
    junk.arrive();
    expect(transformOf(junk.pieces()[0]!)).toMatch(
      /^translateY\(-?\d+(?:\.\d+)?px\)$/,
    );
    expect(warn.mock.calls.filter((call) => /Reveal y\b/.test(String(call[0])))).toHaveLength(
      1,
    );

    const falling = await renderRevealed({ children: "Ship it", y: -20 });
    falling.arrive();
    expect(transformOf(falling.pieces()[0]!)).toBe("translateY(-20px)");
    warn.mockRestore();
  });
});
