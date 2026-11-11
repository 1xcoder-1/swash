import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFrameStub } from "../test/frames";
import { installIntersectionMock } from "../test/intersection-mock";
import { installMatchMediaMock } from "../test/match-media-mock";
import { installResizeMock } from "../test/resize-mock";
import { animateCallCount, animationAt, installWaapiMock } from "../test/waapi-mock";
import type { MarkerProps } from "./types";

/**
 * A marker draws over someone else's sentence, so the tests are mostly about
 * where the drawing sits: one stroke per line when the phrase wraps, a wash that
 * needs no measuring at all, and a parent that re-renders without redrawing it.
 */

let media: ReturnType<typeof installMatchMediaMock>;
let clock: ReturnType<typeof installFrameStub>;
let IO: ReturnType<typeof installIntersectionMock>;
let Observer: ReturnType<typeof installResizeMock>;

/** Where the first line of the phrase sits; the rects below are in that space. */
const LINE = { left: 100, top: 50, width: 300 };

const rect = (left: number, top: number, width: number) => ({
  left,
  top,
  width,
  height: 20,
  right: left + width,
  bottom: top + 20,
  x: left,
  y: top,
});

/** The x coordinates a path was built from, to check how far a stroke reaches. */
const xs = (d: string) =>
  (d.match(/-?\d*\.?\d+/g) ?? []).map(Number).filter((_, i) => i % 2 === 0);

/** Feeds the component the layout a wrapped phrase would have really produced. */
function mockLayout(rects: Array<ReturnType<typeof rect>>) {
  // The box the drawing is placed from is the box the words are in, so moving
  // the line boxes has to move it too.
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  // jsdom's Range has no client rects at all, so there is nothing to spy on.
  (Range.prototype as unknown as { getClientRects: () => unknown[] }).getClientRects =
    () => [...rects];
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    left,
    top,
    width: right - left,
    height: bottom - top,
    right,
    bottom,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as unknown as DOMRect);
}

async function renderMarked(props: MarkerProps) {
  // Fresh modules per test: the observer registry and the set of warnings
  // already printed both outlive a component.
  vi.resetModules();
  const { Marker } = await import("./Marker");
  const view = render(<Marker {...props} />);
  const root = view.container.firstChild as HTMLElement;
  return {
    ...view,
    root,
    text: root.querySelector("[data-swash-marker='text']") as HTMLElement,
    layer: root.querySelector("[data-swash-marker='layer']") as SVGSVGElement,
    paths: () => Array.from(root.querySelectorAll("path")),
    update: (next: MarkerProps) => view.rerender(<Marker {...next} />),
  };
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

const underlined: MarkerProps = {
  action: "underline",
  startOnView: false,
  children: "the good part",
};
const marked: MarkerProps = { startOnView: false, children: "the good part" };

beforeEach(() => {
  vi.useFakeTimers();
  media = installMatchMediaMock(false);
  clock = installFrameStub();
  IO = installIntersectionMock();
  Observer = installResizeMock();
  installWaapiMock();
  mockLayout([rect(LINE.left, LINE.top, LINE.width)]);
  // jsdom knows nothing about path geometry, so the pen is given a length.
  (window.SVGElement.prototype as unknown as { getTotalLength: () => number })
    .getTotalLength = () => 240;
});

afterEach(() => {
  cleanup();
  delete (Range.prototype as unknown as { getClientRects?: unknown }).getClientRects;
  delete (document as unknown as { fonts?: unknown }).fonts;
  delete (window.SVGElement.prototype as unknown as { getTotalLength?: unknown })
    .getTotalLength;
  const tag = document.getElementById("swash-marker");
  if (tag) tag.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Marker", () => {
  it("leaves the words alone until they are marked", async () => {
    const { root, text, layer, paths } = await renderMarked({
      ...marked,
      show: false,
    });
    expect(root.textContent).toBe("the good part");
    expect(paths()).toHaveLength(0);
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(text.style.backgroundSize).toBe("0% 100%");
  });

  it("keeps the drawing out of the reading order", async () => {
    const { root, layer } = await renderMarked(underlined);
    await advance(900);
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.style.pointerEvents).toBe("none");
    expect(root.textContent).toBe("the good part");
  });

  it("draws one stroke per line when the phrase wraps", async () => {
    mockLayout([rect(100, 50, 300), rect(100, 78, 180)]);
    const { paths } = await renderMarked(underlined);
    await advance(900);
    const lines = paths();
    expect(lines).toHaveLength(2);
    // Under the first line, and under the second one a line-height below it.
    expect(lines[0]!.getAttribute("transform")).toBe("translate(0 23)");
    expect(lines[1]!.getAttribute("transform")).toBe("translate(0 51)");
    expect(lines[0]!.getAttribute("d")).toContain("L");
  });

  it("draws the underline on with the pen rather than fading it in", async () => {
    const { paths } = await renderMarked(underlined);
    await advance(200);
    const [line] = paths();
    expect(line!.style.strokeDasharray).toBe("240");
    expect(Number(line!.style.strokeDashoffset)).toBeGreaterThan(0);
    await advance(900);
    expect(Number(paths()[0]!.style.strokeDashoffset)).toBe(0);
  });

  it("rings the whole phrase once, even across lines", async () => {
    mockLayout([rect(100, 50, 300), rect(100, 78, 180)]);
    const { paths } = await renderMarked({ ...underlined, action: "circle" });
    await advance(900);
    const [ring] = paths();
    expect(paths()).toHaveLength(1);
    expect(ring!.getAttribute("d")!.endsWith("Z")).toBe(true);
    expect(ring!.getAttribute("transform")).toBe("translate(-5 -5)");
    // The ring reaches past the widest line and covers both, which one rect
    // cannot do.
    expect(Math.max(...xs(ring!.getAttribute("d")!))).toBeGreaterThan(300);
  });

  it("paints a highlight without measuring anything", async () => {
    const { text } = await renderMarked(marked);
    const first = animationAt(text, 0);
    expect(animateCallCount(text)).toBe(1);
    expect(first!.options.duration).toBe(800);
    expect(JSON.stringify(first!.keys)).toContain("100% 100%");
    await advance(900);
    expect(text.style.backgroundSize).toBe("100% 100%");
  });

  it("shows the finished mark on the first paint when motion is reduced", async () => {
    media.set(true);
    const { text, paths } = await renderMarked({ ...underlined, show: true });
    await advance(0);
    expect(paths()).toHaveLength(1);
    // On the page already, with nothing left to draw on: no dash to unwind.
    expect(paths()[0]!.style.strokeDashoffset).toBe("0");
    expect(clock.frames).toBe(0);
    const still = await renderMarked({ ...marked, show: true });
    expect(still.text.style.backgroundSize).toBe("100% 100%");
    expect(animateCallCount(still.text)).toBe(0);
  });

  it("takes its ink from the palette, and falls back to the text colour", async () => {
    const { root } = await renderMarked({ ...marked, color: "emerald" });
    expect(
      root.style.getPropertyValue("--swash-marker-ink"),
    ).toContain("var(--swash-marker-emerald)");
    const custom = await renderMarked({ ...underlined, color: "#f00" });
    expect(custom.root.style.getPropertyValue("--swash-marker-ink")).toBe("#f00");
    expect(document.getElementById("swash-marker")?.textContent).toContain(
      "prefers-color-scheme: dark",
    );
  });

  it("draws once when show turns on and ignores a busy parent", async () => {
    const { text, paths, update } = await renderMarked({
      ...marked,
      show: false,
    });
    expect(animateCallCount(text)).toBe(0);
    update({ ...marked, show: true });
    expect(animateCallCount(text)).toBe(1);
    update({ ...marked, show: true });
    update({ ...marked, show: true, duration: 800 });
    expect(animateCallCount(text)).toBe(1);

    const pen = await renderMarked({ ...underlined, show: false });
    pen.update({ ...underlined, show: true });
    await advance(900);
    expect(pen.paths()).toHaveLength(1);
    pen.update({ ...underlined, show: true });
    await advance(900);
    expect(pen.paths()).toHaveLength(1);
    expect(clock.frames).toBeGreaterThan(0);
  });

  it("wipes the mark off again when show turns back off", async () => {
    const { text, paths, update } = await renderMarked({ ...underlined, show: true });
    await advance(900);
    expect(paths()).toHaveLength(1);
    update({ ...underlined, show: false });
    expect(paths()).toHaveLength(0);
    // An underlined phrase never carried a wash, so there is nothing to put back.
    expect(text.style.backgroundSize).toBe("");
  });

  it("waits for the phrase to come into view, then draws it once", async () => {
    const { root, paths } = await renderMarked({ ...underlined, startOnView: true });
    await advance(0);
    expect(paths()).toHaveLength(0);
    const observer = IO.forElement(root);
    expect(observer).toBeTruthy();
    observer!.fire(root);
    await advance(900);
    expect(paths()).toHaveLength(1);
    observer!.fire(root);
    await advance(900);
    expect(paths()).toHaveLength(1);
  });

  it("draws on mount when told not to wait for the scroll", async () => {
    const { paths } = await renderMarked({ ...underlined, startOnView: false });
    await advance(900);
    expect(paths()).toHaveLength(1);
    expect(IO.instances).toHaveLength(0);
  });

  it("redraws the stroke where the reflowed line box now is", async () => {
    const { root, paths } = await renderMarked(underlined);
    await advance(900);
    expect(Math.max(...xs(paths()[0]!.getAttribute("d")!))).toBeGreaterThan(250);
    const observer = Observer.forElement(root);
    expect(observer).toBeTruthy();
    mockLayout([rect(LINE.left, LINE.top, 120)]);
    observer!.fire();
    await advance(900);
    expect(Math.max(...xs(paths()[0]!.getAttribute("d")!))).toBeLessThan(130);
  });

  it("draws again when the webfont lands with different metrics", async () => {
    let letTheFontLand!: () => void;
    const ready = new Promise<void>((resolve) => (letTheFontLand = resolve));
    (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts = {
      ready,
    };
    const { paths } = await renderMarked(underlined);
    await advance(900);
    expect(Math.max(...xs(paths()[0]!.getAttribute("d")!))).toBeGreaterThan(250);
    mockLayout([rect(LINE.left, LINE.top, 120)]);
    await act(async () => {
      letTheFontLand();
      await ready;
    });
    expect(Math.max(...xs(paths()[0]!.getAttribute("d")!))).toBeLessThan(130);
  });
});
