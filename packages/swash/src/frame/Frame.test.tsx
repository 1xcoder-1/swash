import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMediaMock } from "../test/match-media-mock";
import { installResizeMock } from "../test/resize-mock";
import { animateCallCount, installWaapiMock } from "../test/waapi-mock";
import { Frame } from "./Frame";
import type { FrameProps } from "./types";

/**
 * A frame is drawn on top of someone else's text, so the interesting bugs are
 * all about not disturbing it: a parent that re-renders should not redraw the
 * frame, the outline should follow a resize and a late webfont rather than the
 * mount, and the measurement work should never happen on the animation path.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installResizeMock>;

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function renderFramed(props: FrameProps) {
  const view = render(<Frame {...props} />);
  const root = view.container.firstChild as HTMLElement;
  const layer = root.querySelector("[data-swash-frame]") as HTMLElement;
  return {
    ...view,
    root,
    layer,
    /** Re-renders with a new prop bag, the way a busy parent would. */
    update: (next: FrameProps) => view.rerender(<Frame {...next} />),
  };
}

const shown: FrameProps = { show: true, children: "Ship it" };

beforeEach(() => {
  vi.useFakeTimers();
  media = installMatchMediaMock(false);
  Observer = installResizeMock();
  installWaapiMock();
});

afterEach(() => {
  cleanup();
  delete (document as unknown as { fonts?: unknown }).fonts;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Frame", () => {
  it("keeps the frame out of the way until show is on", () => {
    const { layer } = renderFramed({ ...shown, show: false });
    expect(screen.getByText("Ship it")).toBeTruthy();
    expect(layer.style.visibility).toBe("hidden");
    expect(animateCallCount(layer)).toBe(0);
  });

  it("draws over the text without ever owning it", () => {
    const { container, layer } = renderFramed(shown);
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.style.pointerEvents).toBe("none");
    expect(layer.style.userSelect).toBe("none");
    expect(container.querySelector("[data-swash-frame-label]")).toBeNull();
    expect(animateCallCount(layer)).toBe(1);
  });

  it("ignores a parent that re-renders around it", async () => {
    const { layer, update } = renderFramed({ ...shown, duration: 500 });
    await advance(200);
    update({ ...shown, duration: 500 });
    update({ ...shown, duration: 900, label: "Cmd K" });
    expect(animateCallCount(layer)).toBe(1);
  });

  it("sweeps out and back in every time show toggles", async () => {
    const { layer, update } = renderFramed({ ...shown, duration: 200 });
    await advance(200);
    update({ ...shown, show: false, duration: 200 });
    await advance(200);
    expect(layer.style.visibility).toBe("hidden");
    update({ ...shown, show: true, duration: 200 });
    await advance(200);
    expect(animateCallCount(layer)).toBe(3);
    expect(layer.style.visibility).toBe("visible");
  });

  it("draws the finished frame when motion is reduced", async () => {
    media.set(true);
    const { layer, update } = renderFramed({ ...shown, duration: 500 });
    expect(animateCallCount(layer)).toBe(0);
    expect(layer.style.visibility).toBe("visible");
    expect(layer.style.opacity).toBe("1");

    // The setting going back must not restart or redraw what is already up.
    await act(async () => {
      media.set(false);
    });
    await advance(1000);
    expect(animateCallCount(layer)).toBe(0);

    // A frame that has to leave while motion is reduced simply leaves.
    await act(async () => {
      media.set(true);
    });
    update({ ...shown, show: false });
    await advance(10);
    expect(layer.style.visibility).toBe("hidden");
    expect(animateCallCount(layer)).toBe(0);
  });

  it("gives the badge back the space after its last glyph", () => {
    const { container } = renderFramed({ ...shown, label: "Cmd K" });
    const badge = container.querySelector("[data-swash-frame-label]") as HTMLElement;
    expect(badge.textContent).toBe("Cmd K");
    expect(badge.style.letterSpacing).not.toBe("");
    expect(badge.style.marginRight).toBe(`-${badge.style.letterSpacing}`);
  });

  it("measures when the content changes, not on every render", () => {
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
    const { update } = renderFramed(shown);
    const mounted = rect.mock.calls.length;
    update({ ...shown, width: 3 });
    expect(rect.mock.calls.length).toBe(mounted);
    update({ ...shown, children: "Ship it again" });
    expect(rect.mock.calls.length).toBeGreaterThan(mounted);
  });

  it("watches the box for resize only once the frame is at rest", async () => {
    const { root, update } = renderFramed({ ...shown, duration: 400 });
    expect(Observer.instances).toHaveLength(0);
    await advance(400);
    expect(Observer.instances).toHaveLength(1);

    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
    act(() => {
      Observer.instances[0]!.fire();
    });
    expect(rect).toHaveBeenCalled();

    update({ ...shown, show: false, duration: 400 });
    await advance(400);
    expect(Observer.instances[0]!.disconnectCalls).toBe(1);
    expect(Observer.forElement(root)).toBeUndefined();
  });

  it("re-measures when a webfont finishes swapping in", async () => {
    let swap!: () => void;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((resolve) => { swap = resolve; }) },
    });
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
    renderFramed(shown);
    const afterMount = rect.mock.calls.length;
    await act(async () => {
      swap();
    });
    expect(rect.mock.calls.length).toBe(afterMount + 1);
  });

  it("re-measures nothing while the frame is away", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
    renderFramed({ ...shown, show: false });
    const before = rect.mock.calls.length;
    await advance(10);
    expect(rect.mock.calls.length).toBe(before);
  });

  it("warns once about a nonsense size and draws the default", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { root, update } = renderFramed({ ...shown, width: -4 });
    update({ ...shown, width: -4 });
    const complaints = warn.mock.calls.filter((call) => String(call[0]).includes("width"));
    expect(complaints).toHaveLength(1);
    expect(root.style.getPropertyValue("--frame-width")).toBe("2px");
  });
});
