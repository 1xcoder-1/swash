import { vi } from "vitest";

/**
 * Stands in for ResizeObserver, which jsdom does not have. Like the real thing
 * it never fires on its own: a test calls `fire` when the box is meant to have
 * changed. `instances` makes the bugs worth guarding visible - attaching while
 * a sweep is still running, or leaving an observer behind after a hide.
 */
export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  targets = new Set<Element>();
  observeCalls = 0;
  disconnectCalls = 0;

  constructor(public cb: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observeCalls++;
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.disconnectCalls++;
    this.targets.clear();
  }

  /** Reports every observed element as having changed size. */
  fire() {
    const entries = [...this.targets].map(
      (target) => ({ target }) as unknown as ResizeObserverEntry,
    );
    this.cb(entries, this as unknown as ResizeObserver);
  }

  static forElement(el: Element) {
    return FakeResizeObserver.instances.find((ro) => ro.targets.has(el));
  }
}

/** Installs the fake and returns it, with the instance list emptied. */
export function installResizeMock() {
  FakeResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  return FakeResizeObserver;
}
