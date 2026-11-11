const seen = new Set<string>();

/** Development-only warning, printed once per key so a bad prop cannot flood the console. */
export function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`[swash] ${message}`);
}
