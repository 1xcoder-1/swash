import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * CurvedText: native SVG textPath, aria-label + title for readers, and a
 * reduced-motion pause.
 */

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CurvedText", () => {
  it("renders the phrase inside an SVG textPath", async () => {
    const { CurvedText } = await import("../../src/curved-text/CurvedText");
    const { container } = render(<CurvedText text="SCROLL DOWN • 2026 • " radius={40} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const textPath = container.querySelector("textPath");
    expect(textPath?.textContent).toBe("SCROLL DOWN • 2026 • ");
    // The path the textPath references is inside defs.
    const pathId = textPath?.getAttribute("href")?.slice(1);
    expect(pathId).toBeTruthy();
    expect(container.querySelector(`path#${pathId}`) ?? container.querySelector("defs path")).toBeTruthy();
  });

  it("provides both SVG title and outer aria-label", async () => {
    const { CurvedText } = await import("../../src/curved-text/CurvedText");
    const { container } = render(<CurvedText text="Explore" radius={30} />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Explore");
    expect(root.getAttribute("role")).toBe("img");
    const title = container.querySelector("svg title");
    expect(title?.textContent).toBe("Explore");
  });

  it("does not animate when reduced motion is on", async () => {
    media.set(true);
    const { CurvedText } = await import("../../src/curved-text/CurvedText");
    const { container } = render(<CurvedText text="Quiet" radius={30} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("reduced");
  });
});
