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
  return { ...view, root: view.container.firstChild as HTMLElement };
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
});
