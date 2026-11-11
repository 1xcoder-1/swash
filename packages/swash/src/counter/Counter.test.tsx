import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../test/frames";
import { installIntersectionMock } from "../test/intersection-mock";
import { installMatchMediaMock } from "../test/match-media-mock";
import type { CounterProps } from "./types";

/**
 * The Counter's job is to survive the three ways people break counters in the
 * wild: a parent that re-renders while it counts, a scroll listener that fires
 * again, and a tab that gets hidden halfway through. Each test below is one of
 * those, plus the props that wrap the number.
 */

async function renderCounted(props: CounterProps) {
  // Fresh modules per test, so the shared inview registry starts empty and the
  // observer this test installs is the one the component actually uses.
  vi.resetModules();
  const { Counter } = await import("./Counter");
  const view = render(<Counter {...props} />);
  const valueEl = view.container.querySelector("span > span") as HTMLElement;
  return {
    ...view,
    /** Re-renders with a new prop bag, the way a busy parent would. */
    update: (next: CounterProps) => view.rerender(<Counter {...next} />),
    /** What the reader sees where the number lives. */
    display: () => valueEl.textContent,
    valueEl,
    root: view.container.firstChild as HTMLElement,
  };
}

const numberOf = (text: string | null) => Number((text ?? "").replace(/[^0-9.-]/g, ""));

let hidden = false;
let clock: ReturnType<typeof installFrameStub>;
let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

function setHidden(next: boolean) {
  hidden = next;
  act(() => document.dispatchEvent(new Event("visibilitychange")));
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = installFrameStub();
  media = installMatchMediaMock(false);
  Observer = installIntersectionMock();
  hidden = false;
  Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
});

afterEach(() => {
  cleanup();
  delete (document as unknown as { hidden?: unknown }).hidden;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Counter", () => {
  it("counts to the target and formats", async () => {
    const counted = await renderCounted({ to: 1000, startOnView: false, duration: 100 });
    expect(counted.display()).toBe("0");
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
  });

  it("re-rendering with the same props does not restart a count in flight", async () => {
    const props = { to: 1000, startOnView: false, duration: 1000 };
    const counted = await renderCounted(props);
    await vi.advanceTimersByTimeAsync(500);
    const midway = numberOf(counted.display());
    expect(midway).toBeGreaterThan(0);

    counted.update(props);
    await vi.advanceTimersByTimeAsync(16);

    // A restarted tween would snap back towards zero; this one only moves on.
    expect(numberOf(counted.display())).toBeGreaterThanOrEqual(midway);
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
  });

  it("startOnView counts once on intersect and never again", async () => {
    const onDone = vi.fn();
    const counted = await renderCounted({ to: 1000, duration: 100, onDone });
    expect(Observer.instances).toHaveLength(1);
    const observer = Observer.instances[0]!;

    act(() => observer.fire(counted.root));
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
    expect(onDone).toHaveBeenCalledTimes(1);

    // Scrolling away and back must not count a second time.
    act(() => {
      observer.fire(counted.root);
      observer.fire(counted.root);
    });
    await vi.runAllTimersAsync();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(observer.observeCalls).toBe(1);
  });

  it("counts again on every appearance once the once prop is off", async () => {
    const onDone = vi.fn();
    const counted = await renderCounted({ to: 1000, duration: 100, once: false, onDone });
    const observer = Observer.instances[0]!;

    act(() => observer.fire(counted.root));
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
    expect(onDone).toHaveBeenCalledTimes(1);

    // Out of view and back: a fresh count from the start, not a stale number.
    act(() => {
      observer.fire(counted.root, false);
      observer.fire(counted.root);
    });
    await vi.advanceTimersByTimeAsync(16);
    expect(numberOf(counted.display())).toBeLessThan(1000);
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
    expect(onDone).toHaveBeenCalledTimes(2);
  });

  it("pauses while the tab is hidden and resumes without a stale jump", async () => {
    const counted = await renderCounted({ to: 1000, startOnView: false, duration: 1000 });
    await vi.advanceTimersByTimeAsync(400);
    const frozenAt = numberOf(counted.display());
    expect(frozenAt).toBeGreaterThan(0);

    setHidden(true);
    await vi.advanceTimersByTimeAsync(400);
    expect(numberOf(counted.display())).toBe(frozenAt);

    setHidden(false);
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
  });

  it("shows the final value instantly under reduced motion", async () => {
    media.set(true);
    const counted = await renderCounted({ to: 1000, startOnView: false, duration: 1000 });
    expect(counted.display()).toBe("1,000");
    expect(clock.frames).toBe(0);

    // Turning the setting back on mid-flight must not start a count behind
    // the reader's back either, as long as the value already landed.
    act(() => media.set(false));
    await vi.runAllTimersAsync();
    expect(counted.display()).toBe("1,000");
    expect(clock.frames).toBe(0);
  });

  it("renders the prefix and the suffix around the number", async () => {
    const counted = await renderCounted({
      to: 42,
      startOnView: false,
      duration: 100,
      prefix: "$",
      suffix: "%",
    });
    await vi.runAllTimersAsync();
    expect(counted.root.textContent).toBe("$42%");
    expect(counted.display()).toBe("42");
  });

  it("leaves no frame scheduled once it unmounts mid-count", async () => {
    const counted = await renderCounted({ to: 1000, startOnView: false, duration: 1000 });
    await vi.advanceTimersByTimeAsync(300);
    expect(clock.frames).toBeGreaterThan(0);
    counted.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
