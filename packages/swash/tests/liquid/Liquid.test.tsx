import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock, FakeIntersectionObserver } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { LiquidProps } from "../../src/liquid/types";

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

const renderLiquid = async (props: LiquidProps) => {
  vi.resetModules();
  const { Liquid } = await import("../../src/liquid/Liquid");
  const view = render(<Liquid {...props} />);
  return { ...view, root: view.container.firstChild as HTMLElement };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Liquid", () => {
  it("carries a reader copy, a vessel copy and a liquid copy", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderLiquid({ children: "pour" });
    expect(root.querySelector("[data-swash-sr]")?.textContent).toBe("pour");
    expect(root.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2);
    expect(root.querySelector(".swash-liquid-fill")?.textContent).toBe("pour");
  });

  it("rises when a view trigger arrives and drains when it leaves", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderLiquid({ children: "pour", trigger: "view" });
    expect(root.className).not.toContain("filled");
    const io = FakeIntersectionObserver.forElement(root)!;
    act(() => io.fire(root, true));
    expect(root.className).toContain("filled");
    expect(root.className).toContain("bob");
    act(() => io.fire(root, false));
    expect(root.className).not.toContain("filled");
  });

  it("is full the moment motion is reduced", async () => {
    media = installMatchMediaMock(true);
    Observer = installIntersectionMock();
    const { root } = await renderLiquid({ children: "pour", trigger: "view" });
    expect(root.className).toContain("filled");
    expect(root.className).not.toContain("bob");
  });

  it("the loop pours, holds and drains on a clock", async () => {
    vi.useFakeTimers();
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderLiquid({
      children: "pour",
      trigger: "loop",
      duration: 500,
      hold: 400,
    });
    expect(root.className).toContain("filled");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(root.className).not.toContain("filled");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(root.className).toContain("filled");
  });

  it("clamps a level outside 0..1 and warns once", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const warn = vi.fn();
    vi.stubGlobal("console", { ...console, warn });
    const { root } = await renderLiquid({ children: "pour", level: 4 });
    expect(root.style.getPropertyValue("--swash-liquid-final")).toBe("100%");
  });
});
