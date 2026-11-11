import { vi } from "vitest";

/**
 * Stands in for the browser's IntersectionObserver: it never reports anything
 * on its own, a test calls `fire` when it wants an element to scroll into
 * view. `instances` lets a test reach the observer that is watching a given
 * element, and `observeCalls` makes double-observation bugs visible.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed = new Set<Element>();
  observeCalls = 0;

  constructor(
    public cb: IntersectionObserverCallback,
    public opts: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observeCalls++;
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Reports the element as on (or off) screen, the way a real scroll would. */
  fire(el: Element, isIntersecting = true) {
    const entry = { isIntersecting, target: el } as unknown as IntersectionObserverEntry;
    this.cb([entry], this as unknown as IntersectionObserver);
  }

  static forElement(el: Element) {
    return FakeIntersectionObserver.instances.find((io) => io.observed.has(el));
  }
}

/** Installs the fake and returns it, with the instance list emptied. */
export function installIntersectionMock() {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  return FakeIntersectionObserver;
}
