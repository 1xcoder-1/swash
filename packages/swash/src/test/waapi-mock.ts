interface FakeAnimation {
  finished: Promise<void>;
  onfinish: (() => void) | null;
  playstate: string;
  cancel(): void;
  finish(): void;
  play(): void;
  pause(): void;
}

const calls = new WeakMap<Element, (PropertyDescriptor[] | Keyframe[])[]>();

/**
 * WAAPI for jsdom, which has none. What components lean on is `onfinish` and
 * `finished`, so the fake honours the duration it is given: a sweep of 500ms
 * settles after 500ms of fake time, and `cancel` clears the pending timer, so
 * a test can tell a call-off from a completion.
 */
export function installWaapiMock() {
  const animate = function (
    this: Element,
    keys: PropertyDescriptor[] | Keyframe[],
    options: KeyframeAnimationOptions | number = 0,
  ): FakeAnimation {
    const list = calls.get(this) ?? [];
    list.push(keys);
    calls.set(this, list);

    let done!: () => void;
    const finished = new Promise<void>((resolve) => (done = resolve));
    let settled = false;
    const ms = typeof options === "number" ? options : Number(options.duration) || 0;
    const timer = window.setTimeout(finish, ms);

    function finish() {
      window.clearTimeout(timer);
      if (settled) return;
      settled = true;
      done();
      animation.onfinish?.();
    }

    const animation: FakeAnimation = {
      finished,
      onfinish: null,
      playstate: "running",
      cancel() {
        window.clearTimeout(timer);
        this.playstate = "idle";
      },
      finish,
      play() {
        this.playstate = "running";
      },
      pause() {
        this.playstate = "paused";
      },
    };
    return animation;
  };
  Element.prototype.animate =
    animate as unknown as typeof Element.prototype.animate;
}

/** How many times this element has been asked to animate, ever. */
export function animateCallCount(el: Element): number {
  return calls.get(el)?.length ?? 0;
}
