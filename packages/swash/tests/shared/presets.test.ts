import { describe, expect, it, vi } from "vitest";
import { FEELS, resolveFeel } from "../../src/shared/presets";

describe("resolveFeel", () => {
  it("maps known names", () => {
    expect(resolveFeel("snappy")).toBe(FEELS.snappy);
  });
  it("defaults to cinematic when nothing is given", () => {
    expect(resolveFeel()).toBe(FEELS.cinematic);
  });
  it("keeps what a usable custom object says", () => {
    const f = { charDelay: 5, jitter: 0, deleteRatio: 0.5, pause: 0 };
    expect(resolveFeel(f)).toEqual(f);
  });
  it("reads a broken custom object field by field", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const broken = { charDelay: -50, jitter: Number.NaN, deleteRatio: 4, pause: Number.POSITIVE_INFINITY };
    expect(resolveFeel(broken)).toEqual(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(4);
  });
  it("never returns undefined for garbage input (kasumi crash bug)", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolveFeel("not-a-feel" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1); // warnOnce dedupes
  });
  it("does not mistake an inherited object member for a feel", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveFeel("constructor" as any)).toBe(FEELS.cinematic);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
