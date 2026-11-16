import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock, FakeIntersectionObserver } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { NeonProps } from "../../src/neon/types";

vi.mock("../../src/shared/motion", async (orig) => {
  const actual = await orig<typeof import("../../src/shared/motion")>();
  return { ...actual, useReducedMotion: () => actual.useReducedMotion() };
});

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

const renderNeon = async (props: NeonProps) => {
  vi.resetModules();
  const { Neon } = await import("../../src/neon/Neon");
  const view = render(<Neon {...props} />);
  return { ...view, root: view.container.firstChild as HTMLElement };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Neon", () => {
  it("carries the text once for readers and once for the eye", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "OPEN 24/7" });
    expect(root.querySelector("[data-swash-sr]")?.textContent).toBe("OPEN 24/7");
    expect(root.querySelector('span[aria-hidden="true"]')?.textContent).toBe("OPEN 24/7");
  });

  it("dims until the hover trigger lights it, and hums while lit", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "BAR", trigger: "hover" });
    expect(root.className).toContain("swash-neon-dim");
    fireEvent.mouseEnter(root);
    expect(root.className).not.toContain("swash-neon-dim");
    expect(root.className).toContain("swash-neon-flicker");
    fireEvent.mouseLeave(root);
    expect(root.className).toContain("swash-neon-dim");
  });

  it("lights on touch: pointerdown renders, pointerup dims", async () => {
    // Touch devices never send mouseenter: the hover trigger went dead on
    // every phone. pointerdown lights the sign, pointerup and cancel dim it.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "BAR", trigger: "hover" });
    expect(root.className).toContain("swash-neon-dim");
    act(() => {
      fireEvent.pointerDown(root);
    });
    expect(root.className).toContain("swash-neon-flicker");
    act(() => {
      fireEvent.pointerUp(root);
    });
    expect(root.className).toContain("swash-neon-dim");
  });

  it("keeps every keyframe offset inside 0-100%", async () => {
    // The soft flicker once ended at 100.1% — an offset over 100 invalidates
    // the whole keyframe rule, dropping the re-light after the 86% dip.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "BAR", trigger: "always", flicker: "soft" });
    const css = Array.from(document.querySelectorAll("style"))
      .map((n) => n.textContent)
      .join("\n");
    expect(css).not.toContain("100.1%");
    expect(root.className).toContain("swash-neon-flicker");
  });

  it("stops the flicker, not the glow, under reduced motion", async () => {
    media = installMatchMediaMock(true);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "BAR", flicker: "hard" });
    expect(root.className).not.toContain("swash-neon-flicker");
    expect(root.className).not.toContain("swash-neon-dim");
  });

  it("turns off when a scroll trigger leaves the viewport", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderNeon({ text: "VACANCY", trigger: "scroll" });
    expect(root.className).toContain("swash-neon-dim");
    const io = FakeIntersectionObserver.forElement(root)!;
    act(() => io.fire(root, true));
    expect(root.className).not.toContain("swash-neon-dim");
    act(() => io.fire(root, false));
    expect(root.className).toContain("swash-neon-dim");
  });
});
