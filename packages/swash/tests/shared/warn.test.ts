import { afterEach, describe, expect, it, vi } from "vitest";
import { warnOnce } from "../../src/shared/warn";

afterEach(() => vi.restoreAllMocks());

describe("warnOnce", () => {
  it("warns once per key, not twice", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOnce("t2-key", "bad preset: nope");
    warnOnce("t2-key", "bad preset: nope");
    expect(spy).toHaveBeenCalledTimes(1);
    const firstCall = spy.mock.calls[0];
    expect(firstCall?.[0]).toContain("bad preset: nope");
  });
});
