import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";

/**
 * Wave: grapheme-safe split (never cuts a family emoji in half), per-index
 * CSS variable for the stagger, pieces aria-hidden.
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

describe("Wave", () => {
  it("keeps a family emoji in one animated piece", async () => {
    const { Wave } = await import("../../src/wave/Wave");
    const { container } = render(
      <Wave amplitude={8} interval={100} trigger="loop">
        👩‍👩‍👧‍👦 Hi
      </Wave>,
    );
    const pieces = container.querySelectorAll(".swash-wave-piece");
    // First piece is the whole family emoji as one grapheme, then a space
    // fragment (not a piece), then "Hi" as two more graphemes.
    expect(pieces[0]?.textContent).toBe("👩‍👩‍👧‍👦");
    expect(pieces).toHaveLength(3); // 👩‍👩‍👧‍👦, H, i
  });

  it("gives every animated piece a --i index", async () => {
    const { Wave } = await import("../../src/wave/Wave");
    const { container } = render(
      <Wave amplitude={8} interval={100} trigger="loop">
        abc
      </Wave>,
    );
    const pieces = container.querySelectorAll<HTMLElement>(".swash-wave-piece");
    expect(pieces).toHaveLength(3);
    pieces.forEach((el, i) => {
      expect(el.style.getPropertyValue("--swash-wave-i")).toBe(String(i));
    });
  });

  it("hides pieces and announces the whole phrase once", async () => {
    const { Wave } = await import("../../src/wave/Wave");
    const { container } = render(
      <Wave amplitude={8} interval={100} trigger="loop">
        Hello
      </Wave>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Hello");
    for (const piece of root.querySelectorAll(".swash-wave-piece")) {
      expect(piece.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("drops the animation when reduced motion is on", async () => {
    media.set(true);
    const { Wave } = await import("../../src/wave/Wave");
    const { container } = render(
      <Wave amplitude={8} interval={100} trigger="loop">
        Quiet
      </Wave>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("reduced");
    expect(root.className).not.toContain("playing");
  });

  it("keeps tabs and non-breaking spaces out of the animated pieces", async () => {
    // Regression: whitespace was compared to a plain " " so a tab or NBSP
    // was waved as if it were a letter — a visible layout glitch. Any
    // Unicode whitespace must stay a static aria-hidden fragment instead.
    const { Wave } = await import("../../src/wave/Wave");
    const { container } = render(
      <Wave amplitude={8} interval={100} trigger="loop">
        {"a\tb\u00A0c"}
      </Wave>,
    );
    const pieces = container.querySelectorAll(".swash-wave-piece");
    // Only the three letters animate; the tab and NBSP between them are
    // static fragments, not pieces.
    expect(pieces).toHaveLength(3);
    expect(Array.from(pieces).map((p) => p.textContent)).toEqual(["a", "b", "c"]);
    // The static whitespace fragments are hidden from assistive tech.
    const statics = Array.from(container.querySelectorAll("span")).filter(
      (s) => !s.classList.contains("swash-wave-piece") && /^\s+$/.test(s.textContent ?? ""),
    );
    for (const s of statics) {
      expect(s.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
