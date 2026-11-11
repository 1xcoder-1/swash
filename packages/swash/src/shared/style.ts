import { useIsomorphicLayoutEffect } from "./client";

/**
 * Puts a stylesheet on the page the first time a component needs it and never
 * again, keyed by `id`. Nothing is removed on unmount: a second typewriter
 * three seconds later should not have to wait for the first style to be
 * re-appended, and the text is a few hundred bytes.
 */
export function useStyle(id: string, css: string): void {
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = css;
    document.head.appendChild(tag);
  }, [id, css]);
}
