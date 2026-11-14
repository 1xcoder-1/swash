import { useIsomorphicLayoutEffect } from "./client";

/**
 * Puts a stylesheet on the page the first time it is needed and never again,
 * keyed by `id`. Nothing is removed on unmount: a second typewriter three
 * seconds later should not have to wait for the first style to be re-appended,
 * and the text is a few hundred bytes. Framework-free, so other frameworks
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
 * One visible copy of the text the reader can hear. An `aria-label` on a bare
 * `<span>` has no role to hang it on, so most screen readers drop it — the
 * reliable contract is a real node styled out of sight, which is what Ticker
 * has always done and every split-text component now does too.
 */
export const srOnlyStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

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

