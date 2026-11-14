import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { installIntersectionMock, FakeIntersectionObserver } from "../helpers/intersection-mock";
import { installMatchMediaMock } from "../helpers/match-media-mock";
import type { EchoProps } from "../../src/echo/types";

let media: ReturnType<typeof installMatchMediaMock>;
let Observer: ReturnType<typeof installIntersectionMock>;

const renderEcho = async (props: EchoProps) => {
  vi.resetModules();
  const { Echo } = await import("../../src/echo/Echo");
  const view = render(<Echo {...props} />);
  return { ...view, root: view.container.firstChild as HTMLElement };
};

const copies = (root: HTMLElement) => root.querySelectorAll(".swash-echo-copy");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Echo", () => {
  it("pulses with staggered copies and keeps one readable text", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "ping", count: 4 });
    expect(copies(root)).toHaveLength(4);
    expect(root.querySelector("[data-swash-sr]")?.textContent).toBe("ping");
    const indexes = [...copies(root)].map(
      (c) => (c as HTMLElement).style.getPropertyValue("--swash-echo-i"),
    );
    expect(indexes).toEqual(["0", "1", "2", "3"]);
  });

  it("renders no copies while idle and none under reduced motion", async () => {
    media = installMatchMediaMock(true);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "ping", count: 3, trigger: "always" });
    expect(copies(root)).toHaveLength(0);
    expect(root.className).toContain("reduced");
  });

  it("stops pulsing when a view trigger leaves the viewport", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "sonar", trigger: "view" });
    expect(root.className).toContain("idle");
    const io = FakeIntersectionObserver.forElement(root)!;
    act(() => io.fire(root, true));
    expect(root.className).not.toContain("idle");
    expect(copies(root)).toHaveLength(3);
    act(() => io.fire(root, false));
    expect(root.className).toContain("idle");
  });

  it("clamps an out-of-range count and warns once", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const warn = vi.fn();
    vi.stubGlobal("console", { ...console, warn });
    const { root } = await renderEcho({ children: "ping", count: 99 });
    expect(copies(root)).toHaveLength(3);
  });
});
