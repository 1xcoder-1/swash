"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../shared/client";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { srOnlyStyle, useStyle } from "../shared/style";
import { warnOnce } from "../shared/warn";
import type { TickerProps } from "./types";

/**
 * Rolling-digits ticker (odometer style). Each digit column has its own
 * vertical strip of 0-9 shifted with a single GPU-accelerated CSS transform,
 * and punctuation ($ . , % /) is rendered as static text that never moves.
 * Column widths are tabular-num locked so a change from "199" to "200" does
 * not shove adjacent badges or prices around.
 *
 * Server markup is plain text of the target number so hydration is a no-op.
 * The client upgrades it to a strip only on mount, and the transition from
 * the previous digit is what actually animates.
 */

const TICKER_CSS = [
  ".swash-ticker{display:inline-flex;align-items:baseline;font-variant-numeric:tabular-nums}",
  ".swash-ticker .swash-ticker-static{display:inline-block}",
  ".swash-ticker .swash-ticker-col{display:inline-block;height:1em;line-height:1;overflow:hidden;position:relative;min-width:1ch}",
  ".swash-ticker .swash-ticker-strip{display:flex;flex-direction:column;transition:transform 500ms cubic-bezier(0.16,1,0.3,1);will-change:transform}",
  ".swash-ticker .swash-ticker-strip.reduced{transition:none}",
  ".swash-ticker .swash-ticker-cell{display:block;height:1em;line-height:1;text-align:center}",
].join("\n");

/** Ten 0-9 repeats per column: the wheel a roll moves along. */
const WHEEL_CELLS = 100;
const WHEEL_HALF = 50;
const WHEEL_LAST = WHEEL_CELLS - 1;
/** Built once for the page; the elements are stateless and shared by React. */
const WHEEL = Array.from({ length: WHEEL_CELLS }, (_, i) => (
  <span key={i} className="swash-ticker-cell">
    {i % 10}
  </span>
));

/** Splits a formatted number into digit / static tokens. */
export function tokenizeNumber(
  value: number,
  decimals: number | undefined,
  separator: string,
): { text: string; isDigit: boolean }[] {
  if (!Number.isFinite(value)) return [{ text: "0", isDigit: true }];
  // toFixed throws a RangeError outside 0..100, and it would throw straight
  // through the render: the page goes down over one stray prop. A decimals
  // count that means nothing is dropped, said out loud once, and the number
  // speaks for itself.
  let fixed: string;
  if (decimals === undefined) {
    fixed = value.toLocaleString("en-US", {
      maximumFractionDigits: 20,
      useGrouping: false,
    });
  } else if (Number.isInteger(decimals) && decimals >= 0 && decimals <= 100) {
    fixed = value.toFixed(decimals);
  } else {
    warnOnce(
      "ticker:decimals",
      `Ticker decimals wants a whole number of digits from 0 to 100, got ${decimals}. Using the number's own decimals.`,
    );
    fixed = value.toLocaleString("en-US", {
      maximumFractionDigits: 20,
      useGrouping: false,
    });
  }
  const [intPart = "0", fracPart] = fixed.split(".");
  const tokens: { text: string; isDigit: boolean }[] = [];
  const pushDigits = (digits: string, withSep: boolean) => {
    for (let i = 0; i < digits.length; i++) {
      tokens.push({ text: digits[i]!, isDigit: true });
      const remaining = digits.length - i - 1;
      if (withSep && remaining > 0 && remaining % 3 === 0) {
        tokens.push({ text: separator, isDigit: false });
      }
    }
  };
  const signed = intPart.startsWith("-");
  if (signed) tokens.push({ text: "-", isDigit: false });
  pushDigits(signed ? intPart.slice(1) : intPart, Boolean(separator) && decimals === undefined);
  if (fracPart !== undefined) {
    tokens.push({ text: ".", isDigit: false });
    pushDigits(fracPart, false);
  }
  return tokens;
}

export function Ticker(props: TickerProps) {
  const {
    value,
    prefix = "",
    suffix = "",
    duration,
    stagger,
    direction = "auto",
    decimals,
    separator = ",",
    onDone,
    className,
    style,
  } = props;
  const dur = ms(duration, 500, "duration", "Ticker");
  const gap = ms(stagger, 40, "stagger", "Ticker");
  const reduced = useReducedMotion();

  useStyle("swash-ticker", TICKER_CSS);

  // The wheel markup means nothing without the clipping CSS, and that sheet
  // only lands client-side: shipping the strips from the server made a reload
  // paint "$01234567890123..." until hydration finished. So the server (and
  // the hydration pass) ships the target number as plain text, and the layout
  // effect upgrades it to the strip before the browser's first paint.
  const [mounted, setMounted] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  const tokens = useMemo(
    () => tokenizeNumber(value, decimals, separator),
    [value, decimals, separator],
  );
  // Only the digit tokens get columns; we count them for the stagger delay.
  const digitTokens = tokens.filter((t) => t.isDigit);
  const lastIndex = digitTokens.length - 1;

  // Track when every column has finished, so onDone fires once per value.
  // `firedRef` guards against double-fires: a column whose digit did not
  // change (100 -> 105 keeps the leading "1") never emits a transitionend,
  // so the completion set alone is not a reliable signal and the safety
  // timeout has to take over. Whichever path wins flips `firedRef` and the
  // other becomes a no-op.
  const completedRef = useRef<Set<number>>(new Set());
  const prevValueRef = useRef(value);
  const firedRef = useRef(false);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireDone = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    onDone?.();
  };

  /**
   * Where each column's wheel currently sits, as a cell index on ten 0-9
   * repeats. A roll is a move from the current index to the next occurrence
   * of the target digit, so "up" only ever climbs, "down" only ever
   * descends, and "auto" takes the shorter way round: 7 to 2 rolls five
   * cells forward, not eight cells back, which is the difference between an
   * odometer and a rewind. The result is memoised by value and direction:
   * a re-render of the same number (StrictMode's double render, a parent
   * that re-renders) must not advance the wheel a second time, and a
   * column that already shows its digit must not travel a whole extra
   * revolution just because the direction was flipped.
   */
  const wheelRef = useRef<{ key: string; slots: number[] } | null>(null);

  const wheelSlots = (digits: number[]): number[] => {
    const key = `${direction}:${digits.join("")}`;
    const cached = wheelRef.current;
    if (cached && cached.key === key) return cached.slots;
    const prev = cached?.slots;
    const slots = digits.map((digit, i) => {
      const at = prev?.[i] ?? WHEEL_HALF + digit;
      const forward = ((digit - at) % 10 + 10) % 10;
      const backward = forward - 10;
      const delta =
        forward === 0
          ? 0
          : direction === "up"
            ? forward
            : direction === "down"
              ? backward
              : forward <= 5
                ? forward
                : backward;
      return Math.min(WHEEL_LAST, Math.max(0, at + delta));
    });
    wheelRef.current = { key, slots };
    return slots;
  };

  useEffect(() => {
    // `Object.is` matters for the NaN case: `NaN === NaN` is false, so the
    // strict equality below would think the value changed on every re-render
    // and restart the roll for a value that never moves.
    if (Object.is(prevValueRef.current, value)) return;
    prevValueRef.current = value;
    completedRef.current = new Set();
    firedRef.current = false;
    if (reduced || lastIndex < 0) {
      // No animation to wait on; fire immediately.
      const t = setTimeout(() => fireDone(), 0);
      return () => clearTimeout(t);
    }
    // Safety net: if any column never fires (unchanged digit, element
    // off-screen, transition interrupted), still report done after the last
    // expected transition would have landed.
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    doneTimerRef.current = setTimeout(() => fireDone(), dur + lastIndex * gap + 30);
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced, dur, gap, lastIndex, digitTokens.length]);

  const serverText = prefix + tokens.map((t) => t.text).join("") + suffix;

  // Pre-hydration: plain text of the number, which needs no stylesheet to
  // read correctly. All hooks above have already run, so this early return
  // keeps the hook order stable.
  if (!mounted) {
    return (
      <span
        className={className ? `swash-ticker ${className}` : "swash-ticker"}
        style={style}
        aria-label={serverText}
      >
        {serverText}
      </span>
    );
  }

  const slots = wheelSlots(digitTokens.map((t) => Number(t.text)));

  let digitIndex = -1;
  const rendered = tokens.map((t, i) => {
    if (!t.isDigit) {
      return (
        // The key carries the kind as well as the position: when the digit
        // count changes (999 -> 1,000), a static token and a column can land
        // on the same index. Sharing a key would reuse a strip as a comma and
        // mount a fresh wheel where an old one should have rolled.
        <span key={`${i}-static`} className="swash-ticker-static">
          {t.text}
        </span>
      );
    }
    digitIndex += 1;
    const current = digitIndex;
    // Where the wheel lands for this digit, in the direction asked for.
    const slot = slots[current]!;
    return (
      <span key={`${i}-digit`} className="swash-ticker-col">
        <span
          className={reduced ? "swash-ticker-strip reduced" : "swash-ticker-strip"}
          style={{
            transform: `translateY(-${slot}em)`,
            transitionDuration: reduced ? "0ms" : `${dur}ms`,
            transitionDelay: reduced ? "0ms" : `${current * gap}ms`,
          }}
          data-digit-index={current}
        >
          {WHEEL}
        </span>
      </span>
    );
  });

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
    // Only the roll itself counts. A column clamped at the wheel's edge
    // settles with a normalising transition of a fraction of the distance,
    // and counting that would report the whole number done early.
    if (e.propertyName !== "transform") return;
    const target = e.target as HTMLElement;
    const idx = target.getAttribute("data-digit-index");
    if (idx === null) return;
    // Only the last column's transitionend is a reliable "everything is done"
    // signal, because earlier columns finish first and unchanged columns
    // never fire at all. The stagger delay ordering guarantees the highest
    // index settles last.
    completedRef.current.add(Number(idx));
    if (completedRef.current.size >= digitTokens.length) fireDone();
  };

  return (
    <span
      className={className ? `swash-ticker ${className}` : "swash-ticker"}
      style={style}
      onTransitionEnd={handleTransitionEnd}
      aria-label={serverText}
    >
      {/* Hidden text so screen readers get the whole number in one pass and
          assistive tech is not reading ten separate digits one by one. */}
      <span data-swash-sr="" style={srOnlyStyle}>
        {serverText}
      </span>
      {/* The columns are decorative once we've announced the number. */}
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "baseline" }}>
        {prefix ? <span className="swash-ticker-static">{prefix}</span> : null}
        {rendered}
        {suffix ? <span className="swash-ticker-static">{suffix}</span> : null}
      </span>
    </span>
  );
}
