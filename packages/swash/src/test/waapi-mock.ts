export function installWaapiMock() {
  const calls = new WeakMap<Element, Array<PropertyDescriptor[] | Keyframe[]>>();
  (Element.prototype as any).animate = function (keys: any) {
    const list = calls.get(this) ?? [];
    list.push(keys);
    calls.set(this, list);
    let done!: () => void;
    const finished = new Promise<void>((r) => (done = r));
    setTimeout(done, 0);
    return { finished, cancel() {}, finish() { done(); }, play() {}, pause() {} };
  };
  (globalThis as any).__waapiCalls = calls;
}

export function animateCallCount(el: Element): number {
  return ((globalThis as any).__waapiCalls.get(el)?.length ?? 0) as number;
}
