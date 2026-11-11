import { vi } from "vitest";

export interface MatchMediaMock {
  /** Every query the page has asked for, in order. */
  queries: string[];
  /** How many change handlers are registered right now. */
  listenerCount(): number;
  /** Changes the setting and notifies listeners, the way an OS preference does. */
  set(matches: boolean): void;
}

interface FakeList {
  media: string;
  matches: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
}

/**
 * The lists deliberately live outside `installMatchMediaMock`: an application
 * module that cached a MediaQueryList on an earlier test still holds this same
 * object, so `set` reaches it. Rebuilding the lists per install would leave
 * that cached copy reading a stale setting forever.
 */
const lists: FakeList[] = [];
const handlers = new Set<() => void>();
const queries: string[] = [];
let matches = false;

const listFor = (media: string): FakeList => {
  const found = lists.find((list) => list.media === media);
  if (found) return found;
  const list: FakeList = {
    media,
    get matches() {
      return matches;
    },
    addEventListener: (_type, cb) => void handlers.add(cb),
    removeEventListener: (_type, cb) => void handlers.delete(cb),
  };
  lists.push(list);
  return list;
};

/**
 * A matchMedia that keeps answering after the first call: the lists read
 * `matches` through a getter, so flipping the setting reaches a MediaQueryList
 * the application cached long ago, which is the path `useReducedMotion` needs
 * in order to re-render.
 */
export function installMatchMediaMock(initial = false): MatchMediaMock {
  queries.length = 0;
  handlers.clear();
  matches = initial;
  vi.stubGlobal("matchMedia", (query: string) => {
    queries.push(query);
    return listFor(query);
  });

  return {
    queries,
    listenerCount: () => handlers.size,
    set(next: boolean) {
      matches = next;
      for (const handler of [...handlers]) handler();
    },
  };
}
