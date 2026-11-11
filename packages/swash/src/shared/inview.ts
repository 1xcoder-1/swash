export interface InviewOptions {
  once?: boolean;
  ratio?: number;
  rootMargin?: string;
}

interface Sub {
  fn: () => void;
  once: boolean;
}

interface Entry {
  observer: IntersectionObserver;
  subs: Map<Element, Set<Sub>>;
}

/**
 * One IntersectionObserver per (ratio, rootMargin) pair, shared by every
 * component on the page. Registering the same element twice adds a handler,
 * never a second observation, which is the bug class behind scroll-spy
 * listeners piling up across re-mounts.
 */
const registry = new Map<string, Entry>();

export function observeInview(
  el: Element,
  opts: InviewOptions,
  onEnter: () => void,
): () => void {
  const ratio = opts.ratio ?? 0;
  const rootMargin = opts.rootMargin ?? "0px";
  const once = opts.once ?? false;
  const key = `${ratio}|${rootMargin}`;

  let entry = registry.get(key);
  if (!entry) {
    const subs = new Map<Element, Set<Sub>>();
    const observer: IntersectionObserver = new IntersectionObserver((records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        const set = subs.get(record.target);
        if (!set) continue;
        for (const sub of [...set]) {
          sub.fn();
          if (sub.once) set.delete(sub);
        }
        if (set.size === 0) {
          subs.delete(record.target);
          observer.unobserve(record.target);
        }
      }
    }, { threshold: ratio, rootMargin });
    entry = { observer, subs };
    registry.set(key, entry);
  }

  const active = entry;
  const sub: Sub = { fn: onEnter, once };
  const existing = active.subs.get(el);
  if (existing) existing.add(sub);
  else {
    active.subs.set(el, new Set([sub]));
    active.observer.observe(el);
  }

  return () => {
    const set = active.subs.get(el);
    if (!set) return;
    set.delete(sub);
    if (set.size === 0) {
      active.subs.delete(el);
      active.observer.unobserve(el);
    }
    // An observer nobody is using any more is a live object holding a closure
    // over this module for the rest of the document. A routed page that mounts
    // a reveal with a new margin on each screen would otherwise keep one per
    // margin.
    if (active.subs.size === 0) {
      active.observer.disconnect();
      registry.delete(key);
    }
  };
}
