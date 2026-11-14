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
  it("keeps one real text node the reader sees, plus one for readers out loud", async () => {
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="SYSTEM REBOOT" trigger="always" />);
    // The visible text is one aria-hidden node; the screen-reader copy is a
    // real node styled out of sight. The pseudo-element copies live in CSS.
    const root = container.firstChild as HTMLElement;
    const sr = root.querySelector("[data-swash-sr]");
    const visible = root.querySelector('span[aria-hidden="true"]');
    expect(sr?.textContent).toBe("SYSTEM REBOOT");
    expect(visible?.textContent).toBe("SYSTEM REBOOT");
    expect(root.getAttribute("data-text")).toBe("SYSTEM REBOOT");
  });

  it("announces once through the hidden copy, not a bare aria-label", async () => {
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="Error 404" trigger="hover" />);
    const root = container.firstChild as HTMLElement;
    expect(root.querySelector("[data-swash-sr]")?.textContent).toBe("Error 404");
    expect(root.getAttribute("aria-label")).toBeNull();
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
