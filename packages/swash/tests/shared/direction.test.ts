import { afterEach, describe, expect, it, vi } from "vitest";
import { isRtl } from "../../src/shared/direction";

/**
 * Every physical transform in the library points itself by asking this one
 * function which way the text runs. If it reads the wrong edge, a morph cross-fades
 * from the wrong side and a caret sits on the wrong end — and both only show up on
 * an Arabic or Hebrew page someone deploys much later. So the helper that decides it
 * is pinned here directly, not just through the components that call it.
 */

describe("isRtl", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is false when there is nothing to read a direction off", () => {
    expect(isRtl(null)).toBe(false);
  });

  it("follows the computed direction, so dir=rtl on an ancestor counts", () => {
    // The reading direction is inherited; a caller never sets it on the animated
    // box itself, so this has to read the value the browser resolved, not a
    // local attribute.
    const el = document.createElement("div");
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      direction: "rtl",
    } as CSSStyleDeclaration);
    expect(isRtl(el)).toBe(true);
  });

  it("is false for left-to-right text", () => {
    const el = document.createElement("div");
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      direction: "ltr",
    } as CSSStyleDeclaration);
    expect(isRtl(el)).toBe(false);
  });
});
