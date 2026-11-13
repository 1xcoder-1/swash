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
});
