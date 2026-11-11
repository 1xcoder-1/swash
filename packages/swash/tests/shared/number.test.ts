import { afterEach, describe, expect, it, vi } from "vitest";
import { ms, offset, pixels } from "../../src/shared/number";

/**
 * One helper, four components. What is being checked here is the promise the
 * fourth engine rule makes: a number that cannot work is never handed to an
 * animation, and the caller is told once rather than every frame.
 */

const complaints = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.map((call) => String(call[0]));

afterEach(() => vi.restoreAllMocks());

describe("number props", () => {
  it("passes a usable number straight through, and says nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(ms(250, 800, "duration", "Marker")).toBe(250);
    expect(pixels(6, 4, "radius", "Frame")).toBe(6);
    expect(warn).not.toHaveBeenCalled();
  });

  it("takes the default for anything an animation cannot run on", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(ms(-1, 800, "duration", "Marker")).toBe(800);
    expect(ms(Number.NaN, 800, "delay", "Marker")).toBe(800);
    expect(ms(Number.POSITIVE_INFINITY, 800, "hold", "Marker")).toBe(800);
    expect(pixels(-4, 2, "width", "Frame")).toBe(2);
    expect(complaints(warn)).toEqual([
      "[swash] Marker duration wants a number of ms, got -1. Using 800.",
      "[swash] Marker delay wants a number of ms, got NaN. Using 800.",
      "[swash] Marker hold wants a number of ms, got Infinity. Using 800.",
      "[swash] Frame width wants a number of pixels, got -4. Using 2.",
    ]);
  });

  it("stays quiet when the prop was simply left out", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(ms(undefined, 600, "duration", "Morph")).toBe(600);
    expect(warn).not.toHaveBeenCalled();
  });

  it("lets a distance point the other way, but not mean nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(offset(-24, 14, "y", "Reveal")).toBe(-24);
    expect(offset(Number.NaN, 14, "y", "Reveal")).toBe(14);
    expect(complaints(warn)).toEqual([
      "[swash] Reveal y wants a number of pixels, got NaN. Using 14.",
    ]);
  });
});
