import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeIntersectionObserver, installIntersectionMock } from "../test/intersection-mock";

async function load() {
  vi.resetModules();
  const mod = await import("./inview");
  return mod.observeInview;
}

let Observer: typeof FakeIntersectionObserver;

beforeEach(() => {
  Observer = installIntersectionMock();
});
afterEach(() => vi.unstubAllGlobals());

describe("observeInview", () => {
  it("calls onEnter when the element intersects", async () => {
    const observeInview = await load();
    const el = document.createElement("div");
    const onEnter = vi.fn();
    observeInview(el, { ratio: 0.3 }, onEnter);
    Observer.instances[0]!.fire(el);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("with once it fires a single time and stops observing", async () => {
    const observeInview = await load();
    const el = document.createElement("div");
    const onEnter = vi.fn();
    observeInview(el, { ratio: 0.3, once: true }, onEnter);
    const io = Observer.instances[0]!;
    io.fire(el);
    io.fire(el);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(io.observed.has(el)).toBe(false);
  });

  it("registers the element once even when two callers share it", async () => {
    const observeInview = await load();
    const el = document.createElement("div");
    const first = vi.fn();
    const second = vi.fn();
    observeInview(el, { ratio: 0.2 }, first);
    observeInview(el, { ratio: 0.2 }, second);
    const io = Observer.instances[0]!;
    expect(Observer.instances).toHaveLength(1);
    expect(io.observeCalls).toBe(1);
    io.fire(el);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("the returned cleanup unregisters the element", async () => {
    const observeInview = await load();
    const el = document.createElement("div");
    const cleanup = observeInview(el, { ratio: 0.5 }, vi.fn());
    const io = Observer.instances[0]!;
    expect(io.observed.size).toBe(1);
    cleanup();
    expect(io.observed.size).toBe(0);
    io.fire(el);
  });

  it("keeps one observer per threshold", async () => {
    const observeInview = await load();
    const a = document.createElement("div");
    const b = document.createElement("div");
    observeInview(a, { ratio: 0.1 }, vi.fn());
    observeInview(b, { ratio: 0.9 }, vi.fn());
    expect(Observer.instances).toHaveLength(2);
    expect(Observer.instances.map((io) => io.opts.threshold)).toEqual([0.1, 0.9]);
  });
});
