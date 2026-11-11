// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Counter,
  Frame,
  Marker,
  Morph,
  Reveal,
  Scramble,
  Typewriter,
} from "../index";

/**
 * This file has no window and no document, on purpose. A component that reaches
 * for the browser while it renders passes every test in an environment that has
 * one and throws on someone's server, and a hydration mismatch shows up first as
 * a React warning rather than as a failing assertion.
 */

const samples = [
  <Counter to={1200} />,
  <Frame show><b>Ship it</b></Frame>,
  <Marker>the good part</Marker>,
  <Morph values={["one", "two"]} />,
  <Reveal>hello world</Reveal>,
  <Scramble text="decode me" />,
  <Typewriter text="typed out" />,
];

describe("ssr safety", () => {
  it("has no browser to lean on", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("renders every component to a string", () => {
    for (const element of samples) expect(renderToString(element)).toContain("<span");
  });

  it("keeps the words in the markup, where a reader without script finds them", () => {
    expect(renderToString(<Typewriter text="typed out" />)).toContain("typed out");
    expect(renderToString(<Scramble text="decode me" />)).toContain("decode me");
    // Reveal hands every word its own span, so the line arrives in pieces.
    const revealed = renderToString(<Reveal>hello world</Reveal>);
    expect(revealed).toContain("hello");
    expect(revealed).toContain("world");
    expect(renderToString(<Morph values={["one", "two"]} />)).toContain("one");
    expect(renderToString(<Marker>the good part</Marker>)).toContain("the good part");
  });

  it("renders without saying anything", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const element of samples) renderToString(element);
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  });

  it("puts the number it starts from on the server, not the one it counts up to", () => {
    // The count belongs to the client. A server that wrote the destination
    // would be shown, then corrected back to the start, and the reader would
    // watch a figure they already had jump away and come counting up again.
    expect(renderToString(<Counter to={42} from={10} />)).toContain("10");
  });
});
