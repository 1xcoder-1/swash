import { describe, expect, it } from "vitest";
import { wobblyBox, wobblyEllipse, wobblyLine } from "./paths";

/**
 * A hand-drawn stroke still has to land where the text is, so the rule these
 * tests hold the builders to is that the noise stays inside a couple of pixels
 * of the bounds they are handed, and that the same seed draws the same mark.
 */

const numbers = (d: string) => (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
const pairs = (d: string) => {
  const list = numbers(d);
  const out: Array<[number, number]> = [];
  for (let i = 0; i + 1 < list.length; i += 2) out.push([list[i]!, list[i + 1]!]);
  return out;
};

describe("wobblyLine", () => {
  it("runs from one edge of the line to the other", () => {
    const d = wobblyLine(180, 7);
    expect(d.startsWith("M")).toBe(true);
    const points = pairs(d);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    expect(Math.abs(first[0])).toBeLessThan(1);
    expect(Math.abs(last[0] - 180)).toBeLessThan(1);
  });

  it("stays near the baseline it was drawn on", () => {
    for (const [, y] of pairs(wobblyLine(320, 11))) expect(Math.abs(y)).toBeLessThan(2);
  });

  it("draws the same mark for the same seed", () => {
    expect(wobblyLine(120, 3)).toBe(wobblyLine(120, 3));
    expect(wobblyLine(120, 3)).not.toBe(wobblyLine(120, 4));
  });

  it("survives a line with no room in it", () => {
    const d = wobblyLine(0, 1);
    expect(d.startsWith("M")).toBe(true);
    expect(Number.isNaN(numbers(d).some(Number.isNaN))).toBe(false);
  });
});

describe("wobblyEllipse", () => {
  it("closes on itself around the box it is given", () => {
    const d = wobblyEllipse(90, 36, 5);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    const points = pairs(d);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    expect(Math.abs(last[0] - first[0])).toBeLessThan(1);
    expect(Math.abs(last[1] - first[1])).toBeLessThan(1);

    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    expect(Math.max(...xs)).toBeGreaterThan(88);
    expect(Math.max(...xs)).toBeLessThan(92);
    expect(Math.max(...ys)).toBeGreaterThan(34);
    expect(Math.max(...ys)).toBeLessThan(38);
    expect(Math.min(...xs)).toBeGreaterThan(-2);
    expect(Math.min(...ys)).toBeGreaterThan(-2);
  });

  it("draws the same loop for the same seed", () => {
    expect(wobblyEllipse(60, 24, 2)).toBe(wobblyEllipse(60, 24, 2));
    expect(wobblyEllipse(60, 24, 2)).not.toBe(wobblyEllipse(60, 24, 9));
  });
});

describe("wobblyBox", () => {
  it("goes around the four sides and shuts", () => {
    const d = wobblyBox(120, 40, 4);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    const points = pairs(d);
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    expect(Math.max(...xs)).toBeGreaterThan(118);
    expect(Math.max(...xs)).toBeLessThan(122);
    expect(Math.max(...ys)).toBeGreaterThan(38);
    expect(Math.max(...ys)).toBeLessThan(42);
    expect(points[0]![0]).toBeLessThan(2);
    expect(points[points.length - 1]![0]).toBeLessThan(2);
  });

  it("draws the same box for the same seed", () => {
    expect(wobblyBox(80, 30, 6)).toBe(wobblyBox(80, 30, 6));
    expect(wobblyBox(80, 30, 6)).not.toBe(wobblyBox(80, 30, 8));
  });
});
