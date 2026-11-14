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
