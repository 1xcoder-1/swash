import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
  it("keeps the channel copies dark at rest", async () => {
    // Regression: ::before / ::after pulled attr(data-text) with no clip of
    // their own whenever the glitch was not running, so a resting phrase sat
    // under a screen-blended cyan+magenta ghost copy — nearly invisible on a
    // light background, tinted everywhere else. The sheet must gate the
    // copies behind .playing (opacity 0 -> 1), with no animation on opacity.
    const { Glitch } = await import("../../src/glitch/Glitch");
    render(<Glitch text="Light plate" trigger="hover" />);
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent)
      .join("\n");
    const gate = css.indexOf(".swash-glitch::before");
    expect(css.slice(gate)).toMatch(/\.swash-glitch::before,?[^}]*opacity:0/);
    expect(css).toMatch(/\.swash-glitch\.playing::before,[\s\S]*?opacity:1/);
  });

  it("runs on touch through the pointer events, not mouseenter alone", async () => {
    // Touch devices never send mouseenter: the hover trigger went dead on
    // every phone. pointerdown starts a burst, pointerup and cancel clear it.
    const { Glitch } = await import("../../src/glitch/Glitch");
    const { container } = render(<Glitch text="Tap me" trigger="hover" />);
    const root = container.firstChild as HTMLElement;
    act(() => {
      fireEvent.pointerDown(root);
    });
    expect(root.className).toContain("playing");
    act(() => {
      fireEvent.pointerUp(root);
    });
    expect(root.className).not.toContain("playing");
  });

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
