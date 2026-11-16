import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock, FakeIntersectionObserver } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { SliceProps } from "../../src/slice/types";

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

const renderSlice = async (props: SliceProps) => {
  vi.resetModules();
  const { Slice } = await import("../../src/slice/Slice");
  const view = render(<Slice {...props} />);
  return { ...view, Slice, root: view.container.firstChild as HTMLElement };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Slice", () => {
  it("cuts the phrase into two halves over one readable copy", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "Bisect" });
    const halves = root.querySelectorAll(".swash-slice-half");
    expect(halves).toHaveLength(2);
    expect(root.querySelector("[data-swash-sr]")?.textContent).toBe("Bisect");
    const top = root.querySelector(".swash-slice-top");
    const bottom = root.querySelector(".swash-slice-bottom");
    expect(top?.className).toContain("swash-slice-half");
    expect(bottom?.className).toContain("swash-slice-ghost");
  });

  it("overlaps the two clips at the seam so no hairline shows when closed", async () => {
    // Regression: edge-to-edge clip-paths meet at exactly 50%, and when the
    // seam lands on a fractional device pixel the anti-aliased edges leave a
    // bright ~1px line across the middle of the closed word. Each half must
    // reach a pixel past the centre so the seam row is fully painted.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    await renderSlice({ text: "Bisect" });
    const css = document.getElementById("swash-slice")?.textContent ?? "";
    expect(css).toContain("inset(0 0 calc(50% - 1px) 0)");
    expect(css).toContain("inset(calc(50% - 1px) 0 0 0)");
  });

  it("parts on hover and closes when the pointer leaves", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "Bisect" });
    expect(root.className).not.toContain("open");
    fireEvent.mouseEnter(root);
    expect(root.className).toContain("open");
    fireEvent.mouseLeave(root);
    expect(root.className).not.toContain("open");
  });

  it("parts on touch: pointerdown opens, pointerup closes", async () => {
    // Touch devices never send mouseenter: the hover trigger went dead on
    // every phone. pointerdown parts the halves, pointerup and cancel close.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "TEAR", trigger: "hover" });
    expect(root.className).not.toContain("open");
    act(() => {
      fireEvent.pointerDown(root);
    });
    expect(root.className).toContain("open");
    act(() => {
      fireEvent.pointerUp(root);
    });
    expect(root.className).not.toContain("open");
  });

  it("warns and falls back when the duration is not a time", async () => {
    // A negative duration is not a fast slide: it is an invalid transition
    // that would make the halves snap with nothing said.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "TEAR", trigger: "hover", duration: -500 });
    expect(root.style.getPropertyValue("--swash-slice-duration")).toBe("420ms");
  });

  it("closes when the trigger changes away from the loop", async () => {
    // The loop's clock must not leave the halves parted after it stops: a
    // trigger that changes mid-hold ends the cycle where it stands.
    vi.useFakeTimers();
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root, Slice, rerender } = await renderSlice({
      text: "TEAR",
      trigger: "loop",
      hold: 100,
      duration: 100,
    });
    expect(root.className).toContain("open");
    rerender(<Slice text="TEAR" trigger="hover" />);
    expect(root.className).not.toContain("open");
    fireEvent.mouseEnter(root);
    expect(root.className).toContain("open");
  });

  it("never parts under reduced motion, even on the loop", async () => {
    vi.useFakeTimers();
    media = installMatchMediaMock(true);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "TEAR", trigger: "loop" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(root.className).not.toContain("open");
  });

  it("opens when a view trigger arrives and closes when it leaves", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "Bisect", trigger: "view" });
    const io = FakeIntersectionObserver.forElement(root)!;
    act(() => io.fire(root, true));
    expect(root.className).toContain("open");
    act(() => io.fire(root, false));
    expect(root.className).not.toContain("open");
  });

  it("the loop parts and closes on a clock", async () => {
    vi.useFakeTimers();
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderSlice({ text: "Bisect", trigger: "loop", hold: 300, duration: 100 });
    expect(root.className).toContain("open");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(root.className).not.toContain("open");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(root.className).toContain("open");
  });

  it("ships plain text on the server so the halves never stack pre-hydration", async () => {
    // Regression: both half-copies depend on injected CSS (absolute ghost +
    // clip-path); in the server markup they flowed inline and painted the
    // phrase twice until hydration.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { renderToString } = await import("react-dom/server");
    vi.resetModules();
    const { Slice } = await import("../../src/slice/Slice");
    const html = renderToString(<Slice text="Bisect" />);
    expect(html).not.toContain("swash-slice-half");
    expect(html).toContain("Bisect");
  });
});
