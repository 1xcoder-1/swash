"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Aceternity's Direction Aware Selection, measured from the live demo:
 * frame border rgb(48,116,254) 2px, four 8px corner handles at -5px with
 * the page background as fill, and a live W × H tag under the frame whose
 * digits roll like odometers. The spring bounce is the demo's 0.15. */
const SPRING = { stiffness: 220, damping: 20 };

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DirCtx {
  hover: (el: HTMLElement) => void;
  unhover: (el: HTMLElement) => void;
}

const Ctx = createContext<DirCtx | null>(null);

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One odometer digit column, exactly like the demo's tag markup.
 * Roll step is the digit box height (12px in CSS) in px, not em — em
 * would ride on the tag's 11px font-size and leave half of the next
 * digit peeking into the window. */
function Digit({ value }: { value: number }) {
  return (
    <span className="ds-digit-col" aria-hidden>
      <span
        className="ds-digit-roll"
        style={{ transform: `translateY(-${value * 12}px)` }}
      >
        {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <span key={d} className="ds-digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ n }: { n: number }) {
  return (
    <>
      {String(Math.max(0, Math.round(n)))
        .split("")
        .map((d, i) => (
          <Digit key={i} value={Number(d)} />
        ))}
    </>
  );
}

export interface WordProps {
  children: ReactNode;
}

/** A selectable word: muted until the pointer reaches it, then it fills
 * with the bright colour from the edge the pointer came in, and the
 * selection frame slides over from the previous word. */
export function Word({ children }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const ctx = useContext(Ctx);

  useEffect(() => {
    const el = ref.current;
    const fill = fillRef.current;
    if (!el || !fill) return;
    const clipFor = (dir: string) =>
      dir === "left"
        ? "inset(0 100% 0 0)"
        : dir === "right"
          ? "inset(0 0 0 100%)"
          : dir === "top"
            ? "inset(0 0 100% 0)"
            : "inset(100% 0 0 0)";
    const enter = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const sides: Array<[string, number]> = [
        ["left", event.clientX - r.left],
        ["right", r.right - event.clientX],
        ["top", event.clientY - r.top],
        ["bottom", r.bottom - event.clientY],
      ];
      const dir = sides.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
      fill.style.transition = "none";
      fill.style.clipPath = clipFor(dir);
      // Force the hidden clip to commit before animating in, so the sweep
      // starts from the edge the pointer entered rather than the last side.
      void fill.offsetWidth;
      fill.style.transition = "";
      fill.style.clipPath = "inset(0 0 0 0)";
      ctx?.hover(el);
    };
    const leave = () => {
      fill.style.transition = "";
      fill.style.clipPath = "inset(0 100% 0 0)";
      ctx?.unhover(el);
    };
    const focus = () => {
      fill.style.clipPath = "inset(0 0 0 0)";
      ctx?.hover(el);
    };
    const blur = leave;
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", blur);
    };
  }, [ctx]);

  return (
    <span ref={ref} className="ds-word" tabIndex={0}>
      {children}
      <span ref={fillRef} className="ds-word-fill" aria-hidden>
        {children}
      </span>
    </span>
  );
}

export interface DirectionSelectProps {
  children: ReactNode;
  className?: string;
}

/** Wrap a sentence; every <Word> inside becomes a selectable layer. */
export function DirectionSelect({
  children,
  className,
}: DirectionSelectProps) {
  // Must be an inline element: DirectionSelect renders inside <p> in the hero,
  // and a <div> child of <p> is invalid HTML (causes a hydration error).
  const hostRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [shown, setShown] = useState(false);
  const active = useRef<Set<HTMLElement>>(new Set());
  // The frame stays "visible" through the tiny gap between two words, so
  // moving from one word to the next glides with the spring instead of
  // snapping. It only truly hides after a short grace period.
  const visible = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useRef<Rect | null>(null);
  const cur = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const vel = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const raf = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    raf.current = 0;
    const t = target.current;
    if (!t) return;
    const dt = Math.min((now - (last.current || now)) / 1000, 0.034);
    last.current = now;
    let moving = false;
    (["x", "y", "w", "h"] as const).forEach((k) => {
      const force =
        SPRING.stiffness * (t[k] - cur.current[k]) -
        SPRING.damping * vel.current[k];
      vel.current[k] += force * dt;
      cur.current[k] += vel.current[k] * dt;
      if (
        Math.abs(t[k] - cur.current[k]) > 0.1 ||
        Math.abs(vel.current[k]) > 0.1
      )
        moving = true;
    });
    setRect({ ...cur.current });
    if (moving) raf.current = requestAnimationFrame(tick);
  }, []);

  const ctx = useMemo<DirCtx>(
    () => ({
      hover: (el) => {
        const host = hostRef.current;
        if (!host) return;
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        active.current.add(el);
        const hr = host.getBoundingClientRect();
        const wr = el.getBoundingClientRect();
        const next: Rect = {
          x: wr.left - hr.left,
          y: wr.top - hr.top,
          w: wr.width,
          h: wr.height,
        };
        setShown(true);
        if (!visible.current || reduced()) {
          // First appearance (or reduced motion): snap onto the word so the
          // frame is correct even before the spring has a chance to tick.
          visible.current = true;
          cur.current = next;
          vel.current = { x: 0, y: 0, w: 0, h: 0 };
          target.current = next;
          setRect({ ...next });
          return;
        }
        // Already on a word: spring-glide to the new one.
        target.current = next;
        if (!raf.current) {
          last.current = performance.now();
          raf.current = requestAnimationFrame(tick);
        }
      },
      unhover: (el) => {
        active.current.delete(el);
        if (!active.current.size && !hideTimer.current) {
          // Grace period: a hover on the next word (across the space between)
          // cancels this and glides instead of re-snapping.
          hideTimer.current = setTimeout(() => {
            hideTimer.current = null;
            visible.current = false;
            target.current = null;
            setShown(false);
          }, 160);
        }
      },
    }),
    [tick],
  );

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  return (
    <Ctx.Provider value={ctx}>
      <span ref={hostRef} className={`ds ${className || ""}`}>
        {children}
        <span
          aria-hidden
          className="ds-frame"
          style={{
            opacity: shown && rect ? 1 : 0,
            transform: `translate(${rect ? rect.x : 0}px, ${rect ? rect.y : 0}px)`,
            width: rect ? rect.w : 0,
            height: rect ? rect.h : 0,
          }}
        >
          <span className="ds-handle ds-handle-tl" />
          <span className="ds-handle ds-handle-tr" />
          <span className="ds-handle ds-handle-br" />
          <span className="ds-handle ds-handle-bl" />
          <span
            className="ds-tag"
            style={{ left: rect ? rect.w / 2 : 0, top: rect ? rect.h : 0 }}
          >
            <Odometer n={rect ? rect.w : 0} />
            <span className="ds-times">×</span>
            <Odometer n={rect ? rect.h : 0} />
          </span>
        </span>
      </span>
    </Ctx.Provider>
  );
}
