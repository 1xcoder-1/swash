import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * Ticker's contract: the server text is the target value, only the digit
 * columns animate, and reduced-motion skips the roll.
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

describe("Ticker", () => {
  /** The cell index each column's wheel currently sits on. The strip is
   *  translated by -slot em, so the slot is the negated offset. */
  const slots = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>(".swash-ticker-strip")].map((s) => {
      const m = /translateY\((-?[\d.]+)em\)/.exec(s.style.transform);
      return -Number(m?.[1]);
    });

  it("paints the target number as text so hydration is a no-op", async () => {
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container } = render(<Ticker value={1234} prefix="$" decimals={0} />);
    const sr = container.querySelector("span[style*='position: absolute'], span[aria-hidden='false']");
    // The screen-reader mirror carries the whole formatted number in one text node.
    expect(container.textContent).toContain("$");
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("3");
    expect(container.textContent).toContain("4");
    expect(sr).toBeTruthy();
  });

  it("ships plain text on the server so the raw wheel never paints before hydration", async () => {
    // Regression: the SSR markup carried all 100 wheel cells per column while
    // the clipping CSS only lands client-side, so a reload flashed
    // "$01234567890123..." until hydration finished. The server must ship the
    // target number as text, and the client upgrades it to the strip on mount.
    const { renderToString } = await import("react-dom/server");
    const { Ticker } = await import("../../src/ticker/Ticker");
    const html = renderToString(
      <Ticker value={499.95} prefix="$" decimals={2} />,
    );
    expect(html).not.toContain("swash-ticker-strip");
    expect(html).not.toContain("swash-ticker-cell");
    expect(html).toContain("$499.95");

    // On the client the strip upgrade happens in the layout phase, before
    // paint, so a mounted ticker rolls as always.
    const { container } = render(<Ticker value={499.95} prefix="$" decimals={2} />);
    expect(container.querySelectorAll(".swash-ticker-strip").length).toBe(5);
  });

  it("keeps punctuation out of the rolling columns", async () => {
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container } = render(<Ticker value={1234} separator="," />);
    // Rolling columns never contain punctuation — the strip inside each col
    // holds only digits 0-9.
    const cols = container.querySelectorAll(".swash-ticker-col");
    expect(cols.length).toBeGreaterThan(0);
    for (const col of cols) {
      expect(col.textContent).not.toContain(",");
      expect(col.textContent).not.toContain(".");
    }
    // The comma is rendered as a static sibling, not inside a column.
    const statics = [...container.querySelectorAll(".swash-ticker-static")];
    expect(statics.some((s) => s.textContent === ",")).toBe(true);
  });

  it("drops the transition when reduced motion is on", async () => {
    media.set(true);
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container } = render(<Ticker value={42} decimals={0} />);
    const strips = container.querySelectorAll(".swash-ticker-strip");
    for (const s of strips) {
      const el = s as HTMLElement;
      expect(el.className).toContain("reduced");
      expect(el.style.transitionDuration).toBe("0ms");
      expect(el.style.transitionDelay).toBe("0ms");
    }
  });

  it("announces the whole number once, not every column", async () => {
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container } = render(<Ticker value={5150} prefix="$" separator="," />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("$5,150");
    const visual = container.querySelector("[aria-hidden='true']");
    expect(visual).toBeTruthy();
  });

  it("fires onDone via the safety net when a digit column never changes", async () => {
    // Regression: the completion set only fills from transitionend events,
    // which a column whose digit didn't change (100 -> 105 keeps the
    // leading "1") never emits. The old `>=` guard on the safety timeout
    // then silently swallowed onDone forever. The net is now unconditional.
    const onDone = vi.fn();
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { rerender } = render(
      <Ticker value={100} decimals={0} onDone={onDone} />,
    );
    // Mount paints the value but must not fire onDone yet.
    expect(onDone).not.toHaveBeenCalled();

    // Changing the value re-arms the effect; jsdom never dispatches
    // transitionend, so only the unconditional safety timeout can report
    // done. duration + lastIndex*stagger + 30 = 500 + 2*40 + 30 = 610ms.
    act(() => {
      rerender(<Ticker value={105} decimals={0} onDone={onDone} />);
    });
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(650);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("rolls a falling digit the short way round the wheel by default", async () => {
    // The old strip was one 0-9 run and jumped straight to the digit's slot,
    // so 7 -> 2 wound backwards through eight digits, direction or not. On
    // the wheel, auto takes the shortest path: five cells forward, landing
    // on a 2 that shows the same face as the mount repeat did.
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container, rerender } = render(<Ticker value={7} decimals={0} />);
    const [start] = slots(container);
    expect(start! % 10).toBe(7);

    act(() => rerender(<Ticker value={2} decimals={0} />));
    const [landed] = slots(container);
    expect(landed!).toBe(start! + 5);
    expect(landed! % 10).toBe(2);
  });

  it("climbs and descends on one wheel when a direction is asked for", async () => {
    // direction was in the props table while the engine ignored it: a
    // developer setting "down" got a rewind, and "up" got a teleport. The
    // pairs are deliberately asymmetric (6 one way, 4 the other) so "auto"
    // could not pass for either by taking the shorter road.
    const { Ticker } = await import("../../src/ticker/Ticker");

    const up = render(<Ticker value={7} decimals={0} direction="up" />);
    const upStart = slots(up.container)[0]!;
    act(() => up.rerender(<Ticker value={3} decimals={0} direction="up" />));
    // Only ever climbing: the next 3 above a 7 is six cells up.
    expect(slots(up.container)[0]).toBe(upStart + 6);

    const down = render(<Ticker value={3} decimals={0} direction="down" />);
    const downStart = slots(down.container)[0]!;
    act(() =>
      down.rerender(<Ticker value={7} decimals={0} direction="down" />),
    );
    // Only ever descending: the next 7 below a 3 is six cells down.
    expect(slots(down.container)[0]).toBe(downStart - 6);
  });

  it("leaves the wheels alone when a re-render moves no digit", async () => {
    // A parent re-render with the same props — or StrictMode's double
    // render — must not advance the wheel a second time, and flipping the
    // direction on a number that has not moved must not send a column a
    // whole revolution around for nothing.
    const { Ticker } = await import("../../src/ticker/Ticker");
    const { container, rerender } = render(
      <Ticker value={42} decimals={0} direction="up" />,
    );
    const first = slots(container);

    rerender(<Ticker value={42} decimals={0} direction="up" />);
    expect(slots(container)).toEqual(first);

    rerender(<Ticker value={42} decimals={0} direction="down" />);
    expect(slots(container)).toEqual(first);

    act(() => rerender(<Ticker value={47} decimals={0} direction="down" />));
    const moved = slots(container);
    expect(moved[0]).toBe(first[0]); // the 4 never moved
    expect(moved[1]).toBe(first[1]! - 5); // the 2 descends five cells to a 7
  });

  it("keeps a decimals count that means nothing from crashing the page", async () => {
    // toFixed throws a RangeError outside 0..100, and it threw straight
    // through the render: one stray prop took the whole page down. The
    // number's own decimals are used instead, and the mistake is named once.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { Ticker } = await import("../../src/ticker/Ticker");
    expect(() =>
      render(<Ticker value={12.5} decimals={-1} />),
    ).not.toThrow();
    expect(() =>
      render(<Ticker value={12.5} decimals={101} />),
    ).not.toThrow();
    const complaints = warn.mock.calls.filter((call) =>
      String(call[0]).includes("decimals"),
    );
    expect(complaints).toHaveLength(1);
    warn.mockRestore();
  });
});
