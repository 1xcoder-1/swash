import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

interface FakeMql {
  matches: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
}

async function loadWithMatchMedia(initial: boolean) {
  const handlers: Array<() => void> = [];
  const mql: FakeMql = {
    matches: initial,
    addEventListener: (_type, cb) => void handlers.push(cb),
    removeEventListener: () => {},
  };
  vi.stubGlobal("matchMedia", vi.fn(() => mql));
  vi.resetModules();
  const mod = await import("./motion");
  return { mod, handlers, mql };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("useReducedMotion", () => {
  it("reflects matchMedia and re-renders when the setting changes", async () => {
    const { mod, handlers, mql } = await loadWithMatchMedia(false);
    const { result } = renderHook(() => mod.useReducedMotion());
    expect(result.current).toBe(false);
    mql.matches = true;
    act(() => handlers.forEach((h) => h()));
    expect(result.current).toBe(true);
  });

  it("runs one media query and one change handler for many subscribers", async () => {
    const queries: string[] = [];
    let changeHandlers = 0;
    const mql: FakeMql = {
      matches: false,
      addEventListener: () => void changeHandlers++,
      removeEventListener: () => {},
    };
    vi.stubGlobal("matchMedia", vi.fn((query: string) => {
      queries.push(query);
      return mql;
    }));
    vi.resetModules();
    const mod = await import("./motion");
    renderHook(() => mod.useReducedMotion());
    renderHook(() => mod.useReducedMotion());
    expect(queries).toEqual(["(prefers-reduced-motion: reduce)"]);
    expect(changeHandlers).toBe(1);
  });
});

describe("getReducedMotion", () => {
  it("is false when matchMedia does not exist (server)", async () => {
    vi.stubGlobal("matchMedia", undefined);
    vi.resetModules();
    const mod = await import("./motion");
    expect(mod.getReducedMotion()).toBe(false);
  });
});
