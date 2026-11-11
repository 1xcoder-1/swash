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
 * A matchMedia that keeps answering after the first call: the returned lists
 * read `matches` through a getter, so flipping the setting reaches a
 * MediaQueryList the application cached long ago, which is exactly the path
 * `useReducedMotion` needs to re-render.
 */
export function installMatchMediaMock(initial = false): MatchMediaMock {
  const queries: string[] = [];
  const handlers = new Set<() => void>();
  const lists: FakeList[] = [];
  let value = initial;

  const listFor = (media: string): FakeList => {
    const found = lists.find((list) => list.media === media);
    if (found) return found;
    const list: FakeList = {
      media,
      get matches() {
        return value;
      },
      addEventListener: (_type, cb) => void handlers.add(cb),
      removeEventListener: (_type, cb) => void handlers.delete(cb),
    };
    lists.push(list);
    return list;
  };

  vi.stubGlobal("matchMedia", (query: string) => {
    queries.push(query);
    return listFor(query);
  });

  return {
    queries,
    listenerCount: () => handlers.size,
    set(matches: boolean) {
      value = matches;
      for (const handler of [...handlers]) handler();
    },
  };
}
