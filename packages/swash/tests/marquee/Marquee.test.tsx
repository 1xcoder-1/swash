import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { MarqueeProps } from "../../src/marquee/types";

let media: ReturnType<typeof installMatchMediaMock>;

const renderMarquee = async (props: MarqueeProps) => {
  vi.resetModules();
  const { Marquee } = await import("../../src/marquee/Marquee");
  const view = render(<Marquee {...props} />);
  return { ...view, root: view.container.firstChild as HTMLElement };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Marquee", () => {
  it("puts two copies of the line on one track and reads one", async () => {
    media = installMatchMediaMock(false);
    const { root } = await renderMarquee({ children: <span>Free shipping worldwide</span> });
    const tracks = root.querySelectorAll(".swash-marquee-track");
    expect(tracks).toHaveLength(2);
    expect(tracks[0]!.textContent).toBe("Free shipping worldwide");
    expect(tracks[1]!.getAttribute("aria-hidden")).toBe("true");
    // The reader's copy is not hidden.
    expect(tracks[0]!.getAttribute("aria-hidden")).toBeNull();
  });

  it("hands the timing, the gap and the fade to custom properties", async () => {
    media = installMatchMediaMock(false);
    const { root } = await renderMarquee({ children: "hi", duration: 8000, gap: 24 });
    expect(root.style.getPropertyValue("--swash-marquee-duration")).toBe("8000ms");
    expect(root.style.getPropertyValue("--swash-marquee-gap")).toBe("24px");
    expect(root.style.getPropertyValue("--swash-marquee-mask")).toContain("linear-gradient");
  });

  it("reverses on request and drops the fade with it", async () => {
    media = installMatchMediaMock(false);
    const { root } = await renderMarquee({ children: "hi", reverse: true, fade: false });
    expect(root.className).toContain("reverse");
    expect(root.style.getPropertyValue("--swash-marquee-mask")).toBe("none");
  });

  it("pauses on hover only when asked", async () => {
    media = installMatchMediaMock(false);
    const paused = await renderMarquee({ children: "hi", pauseOnHover: true });
    expect(paused.root.querySelector(".swash-marquee-track")!.className).toContain("pause-on-hover");
    const running = await renderMarquee({ children: "hi", pauseOnHover: false });
    expect(running.root.querySelector(".swash-marquee-track")!.className).not.toContain("pause-on-hover");
  });
});
