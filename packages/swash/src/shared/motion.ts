import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
type Listener = () => void;

let mql: MediaQueryList | null = null;
const listeners = new Set<Listener>();

/** The media query list is created once and its change event wired once. */
function getMql(): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  if (!mql) {
    mql = window.matchMedia(QUERY);
    mql.addEventListener("change", () => listeners.forEach((l) => l()));
  }
  return mql;
}

/** Non-hook read for imperative code paths (effect bodies, controllers). */
export function getReducedMotion(): boolean {
  return getMql()?.matches ?? false;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  getMql();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Live reduced-motion flag. It re-renders when the user flips the OS setting
 * while the page is open, which a one-time read at mount cannot do.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getReducedMotion, () => false);
}
