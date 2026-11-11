import { vi } from "vitest";

/**
 * Deterministic frame clock for tests: every frame advances the timestamp by
 * 16ms and costs 16ms of fake timer time, so durations stay predictable. The
 * returned `frames` count lets a test prove that an animation never asked for
 * one.
 */
export function installFrameStub() {
  let now = 0;
  let frames = 0;
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: (time: number) => void) => {
      now += 16;
      frames++;
      return setTimeout(() => cb(now), 16) as unknown as number;
    },
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  return {
    get frames() {
      return frames;
    },
  };
}
