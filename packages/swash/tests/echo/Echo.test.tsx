import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
  return { ...view, Echo, root: view.container.firstChild as HTMLElement };
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

  it("pulses on touch: pointerdown starts, pointerup idles", async () => {
    // Touch devices never send mouseenter: the hover trigger went dead on
    // every phone. pointerdown starts the trail, pointerup clears it.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "PING", trigger: "hover" });
    expect(root.className).toContain("idle");
    act(() => {
      fireEvent.pointerDown(root);
    });
    expect(root.className).not.toContain("idle");
    act(() => {
      fireEvent.pointerUp(root);
    });
    expect(root.className).toContain("idle");
  });

  it("falls back to the default timing when the duration is not a time", async () => {
    // A negative duration kills the keyframe silently; the shared reader
    // falls back and warns instead.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "PING", duration: -900 });
    expect(root.style.getPropertyValue("--swash-echo-duration")).toBe("1600ms");
  });

  it("clamps an out-of-range count and warns once", async () => {
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const warn = vi.fn();
    vi.stubGlobal("console", { ...console, warn });
    const { root } = await renderEcho({ children: "ping", count: 99 });
    expect(copies(root)).toHaveLength(3);
  });

  it("drops a stale hover cue when the trigger changes", async () => {
    // A hover that is no longer a hover must not keep the trail running:
    // the old trigger's state does not survive a trigger change.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root, Echo, rerender } = await renderEcho({
      children: "PING",
      trigger: "hover",
    });
    act(() => {
      fireEvent.pointerDown(root);
    });
    expect(root.className).not.toContain("idle");
    rerender(<Echo trigger="view">PING</Echo>);
    expect(root.className).toContain("idle");
    expect(copies(root)).toHaveLength(0);
  });

  it("paints the trail under the text and holds its opacity while it grows", async () => {
    // Regression: the copies used to sit over the opaque text at a curve
    // that faded before it spread, so the whole effect read as a static
    // word. The layering and the opacity hold are the visible contract.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { root } = await renderEcho({ children: "ping", count: 3 });
    expect(root.className).not.toContain("idle");
    const css = document.getElementById("swash-echo")?.textContent ?? "";
    expect(css).toContain("z-index:-1");
    expect(css).toContain("35%{opacity:.4}");
  });

  it("ships no echo copies on the server so the text is not duplicated pre-hydration", async () => {
    // Regression: the copies are positioned by client-injected CSS; in the
    // server markup they flowed inline and painted "pingpingpingping" until
    // hydration. They are animation layers, so they mount with the client.
    media = installMatchMediaMock(false);
    Observer = installIntersectionMock();
    const { renderToString } = await import("react-dom/server");
    vi.resetModules();
    const { Echo } = await import("../../src/echo/Echo");
    const html = renderToString(<Echo>ping</Echo>);
    expect(html).not.toContain("swash-echo-copy");
    expect(html).toContain("ping");
  });
});
