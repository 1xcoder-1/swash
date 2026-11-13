import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * BlurReveal's contract: word-splitting keeps kerning, spaces are plain
 * fragments, pieces are aria-hidden, aria-label carries the sentence.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

beforeEach(() => {
  media = installMatchMediaMock(false);
  Observer = installIntersectionMock();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("BlurReveal", () => {
  it("splits by word so OpenType kerning survives", async () => {
    const { BlurReveal } = await import("../../src/blur-reveal/BlurReveal");
    const { container } = render(
      <BlurReveal by="word">AV To We</BlurReveal>,
    );
    const pieces = container.querySelectorAll(".swash-blur-piece");
    // Four visible words → four pieces (three spaces rendered as fragments).
    expect(pieces).toHaveLength(3);
    expect(pieces[0]?.textContent).toBe("AV");
    expect(pieces[1]?.textContent).toBe("To");
    expect(pieces[2]?.textContent).toBe("We");
  });

  it("hides every piece from assistive tech and announces once", async () => {
    const { BlurReveal } = await import("../../src/blur-reveal/BlurReveal");
    const { container } = render(
      <BlurReveal by="word">Hello world</BlurReveal>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Hello world");
    for (const piece of root.querySelectorAll(".swash-blur-piece")) {
      expect(piece.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("shows the words on first paint when reduced motion is on", async () => {
    media.set(true);
    const { BlurReveal } = await import("../../src/blur-reveal/BlurReveal");
    const { container } = render(
      <BlurReveal by="word">Sharp immediately</BlurReveal>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("reduced");
    expect(root.className).toContain("shown");
  });
});
