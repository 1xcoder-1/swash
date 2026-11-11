import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

async function load() {
  vi.resetModules();
  return import("../../src/shared/motion");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("useReducedMotion", () => {
  it("reflects matchMedia and re-renders when the setting changes", async () => {
    const media = installMatchMediaMock(false);
    const mod = await load();
    const { result } = renderHook(() => mod.useReducedMotion());
    expect(result.current).toBe(false);
    act(() => media.set(true));
    expect(result.current).toBe(true);
  });

  it("runs one media query and one change handler for many subscribers", async () => {
    const media = installMatchMediaMock(false);
    const mod = await load();
    renderHook(() => mod.useReducedMotion());
    renderHook(() => mod.useReducedMotion());
    expect(media.queries).toEqual([REDUCE_QUERY]);
    expect(media.listenerCount()).toBe(1);
  });
});

describe("getReducedMotion", () => {
  it("is false when matchMedia does not exist (server)", async () => {
    vi.stubGlobal("matchMedia", undefined);
    const mod = await load();
    expect(mod.getReducedMotion()).toBe(false);
  });
});
