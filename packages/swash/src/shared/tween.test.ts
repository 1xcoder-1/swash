import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cubicBezier, EASE } from "./bezier";
import { tween } from "./tween";

beforeEach(() => {
  vi.useFakeTimers();
  let now = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
    now += 16;
    return setTimeout(() => cb(now), 16) as unknown as number;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("cubicBezier", () => {
  it("anchors endpoints exactly", () => {
    const e = cubicBezier(0.16, 1, 0.3, 1);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
  });
  it("is linear when the curve degenerates to y = x", () => {
    const e = cubicBezier(0.5, 0.5, 1, 1);
    expect(e(0.25)).toBe(0.25);
  });
  it("is monotonic for an ease-out curve", () => {
    let prev = -1;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = EASE.out(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("tween", () => {
  it("ends at target with onComplete", async () => {
    const seen: number[] = [];
    const done = vi.fn();
    tween({ from: 0, to: 100, duration: 80, onUpdate: (v) => seen.push(v), onComplete: done });
    await vi.runAllTimersAsync();
    expect(seen[seen.length - 1]).toBe(100);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("zero duration completes immediately at target", async () => {
    const onUpdate = vi.fn();
    tween({ from: 5, to: 9, duration: 0, onUpdate });
    await vi.runAllTimersAsync();
    expect(onUpdate).toHaveBeenLastCalledWith(9, 1);
  });
  it("cancel stops updates", async () => {
    const onUpdate = vi.fn();
    const c = tween({ from: 0, to: 1, duration: 1000, onUpdate });
    await vi.advanceTimersByTimeAsync(100);
    c.cancel();
    const before = onUpdate.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate.mock.calls.length).toBe(before);
  });
  it("honours delay before the first update", async () => {
    const onUpdate = vi.fn();
    tween({ from: 0, to: 10, duration: 50, delay: 100, onUpdate });
    await vi.advanceTimersByTimeAsync(48);
    expect(onUpdate).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    expect(onUpdate).toHaveBeenCalled();
  });
});
