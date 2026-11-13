import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * Glitch: one DOM text node, one aria-label, no duplicate readable copies.
 */

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock(false);
  installIntersectionMock();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Glitch", () => {
  it("keeps one real text node in the DOM", async () => {
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="SYSTEM REBOOT" trigger="always" />);
    // Only one child text — the pseudo-element copies live in CSS, not in markup.
    const root = container.firstChild as HTMLElement;
    expect(root.childNodes).toHaveLength(1);
    expect(root.textContent).toBe("SYSTEM REBOOT");
    expect(root.getAttribute("data-text")).toBe("SYSTEM REBOOT");
  });

  it("is announced exactly once via aria-label", async () => {
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="Error 404" trigger="hover" />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Error 404");
  });

  it("drops the animation when reduced motion is on", async () => {
    media.set(true);
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="Quiet" trigger="always" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("reduced");
    expect(root.className).not.toContain("playing");
  });
});
