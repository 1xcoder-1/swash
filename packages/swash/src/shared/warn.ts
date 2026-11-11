const seen = new Set<string>();

/** Development-only warning, printed once per key so a bad prop cannot flood the console. */
export function warnOnce(key: string, message: string): void {
  // This is the fallback path for a bad prop, so it must not be the thing that
  // throws. A bundle loaded straight by a browser never defines process, and a
  // bare read of it there is a ReferenceError instead of a warning.
  const env = typeof process === "undefined" ? undefined : process.env?.NODE_ENV;
  if (env === "production") return;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`[swash] ${message}`);
}
