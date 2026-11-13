import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * Shimmer's contract: base text stays readable, beam is aria-hidden, and
 * reduced motion stops the sweep.
 */

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Shimmer", () => {
  it("renders the base text as real, selectable DOM", async () => {
    const { Shimmer } = await import("../../src/shimmer/Shimmer");
    const { container } = render(<Shimmer>Powered by AI</Shimmer>);
    const base = container.querySelector(".swash-shimmer-base");
    expect(base?.textContent).toBe("Powered by AI");
  });

  it("hides the beam copy from assistive tech", async () => {
    const { Shimmer } = await import("../../src/shimmer/Shimmer");
    const { container } = render(<Shimmer>Powered by AI</Shimmer>);
    const beam = container.querySelector(".swash-shimmer-beam");
    expect(beam?.getAttribute("aria-hidden")).toBe("true");
  });

  it("removes the animation when reduced motion is on", async () => {
    media.set(true);
    const { Shimmer } = await import("../../src/shimmer/Shimmer");
    const { container } = render(<Shimmer>Hi</Shimmer>);
    const beam = container.querySelector(".swash-shimmer-beam") as HTMLElement;
    expect(beam.className).toContain("reduced");
  });
});
