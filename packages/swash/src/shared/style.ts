import { useIsomorphicLayoutEffect } from "./client";

/**
 * Puts a stylesheet on the page the first time it is needed and never again,
 * keyed by `id`. Nothing is removed on unmount: a second typewriter three
 * seconds later should not have to wait for the first style to be re-appended,
 * and the text is a few hundred bytes. Framework-free, so the Vue and Svelte
 * adapters can call it directly.
 */
export function ensureStyle(id: string, css: string): void {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

/**
 * Injects the page stylesheet once, on mount, through the framework-free
 * `ensureStyle`. The React binding keeps this hook so the sheet is added in the
 * layout phase, before the first paint.
 */
export function useStyle(id: string, css: string): void {
  useIsomorphicLayoutEffect(() => {
    ensureStyle(id, css);
  }, [id, css]);
}

