import { useEffect, useLayoutEffect } from "react";

/** Layout effect in the browser, passive effect on the server, so SSR never warns. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
