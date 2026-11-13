"use client";
import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "../shared/motion";
import { ms } from "../shared/number";
import { useStyle } from "../shared/style";
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

/** Splits a formatted number into digit / static tokens. */
export function tokenizeNumber(
  value: number,
  decimals: number | undefined,
  separator: string,
): { text: string; isDigit: boolean }[] {
  if (!Number.isFinite(value)) return [{ text: "0", isDigit: true }];
  const fixed =
    decimals === undefined
      ? // Let the number decide, but avoid the exponent notation for large or
        // small values; `toLocaleString` handles that better than `String`.
        value.toLocaleString("en-US", {
          maximumFractionDigits: 20,
          useGrouping: false,
        })
      : value.toFixed(decimals);
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

  let digitIndex = -1;
  const rendered = tokens.map((t, i) => {
    if (!t.isDigit) {
      return (
        <span key={i} className="swash-ticker-static">
          {t.text}
        </span>
      );
    }
    digitIndex += 1;
    const current = digitIndex;
    const digit = Number(t.text);
    return (
      <span key={i} className="swash-ticker-col">
        <span
          className={reduced ? "swash-ticker-strip reduced" : "swash-ticker-strip"}
          style={{
            transform: `translateY(-${digit}em)`,
            transitionDuration: reduced ? "0ms" : `${dur}ms`,
            transitionDelay: reduced ? "0ms" : `${current * gap}ms`,
          }}
          data-digit-index={current}
        >
          {Array.from({ length: 10 }, (_, d) => (
            <span key={d} className="swash-ticker-cell">
              {d}
            </span>
          ))}
        </span>
      </span>
    );
  });

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
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

  const serverText = prefix + tokens.map((t) => t.text).join("") + suffix;

  return (
    <span
      className={className ? `swash-ticker ${className}` : "swash-ticker"}
      style={style}
      onTransitionEnd={handleTransitionEnd}
      aria-label={serverText}
    >
      {/* Hidden text so screen readers get the whole number in one pass and
          assistive tech is not reading ten separate digits one by one. */}
      <span className="swash-sr-only" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
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
