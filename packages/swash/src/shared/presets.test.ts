import { describe, expect, it, vi } from "vitest";
import { FEELS, resolveFeel } from "./presets";

describe("resolveFeel", () => {
  it("maps known names", () => {
    expect(resolveFeel("snappy")).toBe(FEELS.snappy);
  });
  it("defaults to cinematic when nothing is given", () => {
    expect(resolveFeel()).toBe(FEELS.cinematic);
  });
  it("passes custom objects through", () => {
    const f = { charDelay: 5, jitter: 0, deleteRatio: 0.5, pause: 0 };
    expect(resolveFeel(f)).toBe(f);
  });
  it("never returns undefined for garbage input (kasumi crash bug)", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1); // warnOnce dedupes
  });
});
