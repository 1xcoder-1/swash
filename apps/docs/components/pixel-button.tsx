"use client";

import { useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Edge of one pixel, in CSS px. The whole surface is a grid of these. */
const CELL = 4;
/** Corner radius the pixel grid is masked to, in CSS px. */
const RADIUS = 12;
/** How far the pointer's light reaches, in CSS px. */
const REACH = 44;
/** How long a press ripple travels before it is gone. */
const RIPPLE_MS = 700;
/** The loop idles on for a beat after the last news, so decays finish on screen. */
const DECAY_MS = 1200;

interface Ripple {
  x: number;
  y: number;
  born: number;
}

export interface PixelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * The pixel pill from Aceternity's interactions set, rebuilt on one canvas
 * with no dependency: a button made of tiny pixels whose rim breathes, whose
 * pixels light up around the pointer, and whose press sends a square
 * wavefront rippling out from under the cursor. The label stays real DOM
 * text on a real button, so the effect never costs the accessibility tree:
 * the canvas is decoration, and `prefers-reduced-motion` gets the still
 * frame — the same rim, lit evenly, with nothing moving.
 */
export function PixelButton({
  children,
  className,
  ...rest
}: PixelButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // NaN rather than -1: an absent pointer must not be a light source.
    const pointer = { x: Number.NaN, y: Number.NaN };
    const ripples: Ripple[] = [];
    let width = 0;
    let height = 0;
    let tint = "0, 156, 255";
    let lastNews = 0;
    let raf = 0;

    // The glow follows the theme's accent without a second source of truth:
    // read the token off the button and let the canvas normalise it to hex.
    const resolveTint = () => {
      const styles = getComputedStyle(button);
      const raw = styles.getPropertyValue("--pixel-glow").trim() || styles.color;
      const previous = ctx.fillStyle;
      ctx.fillStyle = raw;
      const hex = String(ctx.fillStyle).replace("#", "");
      ctx.fillStyle = previous;
      const full =
        hex.length <= 4
          ? [...hex.slice(0, 3)].map((h) => h + h).join("")
          : hex.slice(0, 6);
      const r = Number.parseInt(full.slice(0, 2), 16);
      const g = Number.parseInt(full.slice(2, 4), 16);
      const b = Number.parseInt(full.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        tint = `${r}, ${g}, ${b}`;
      }
    };

    /** Signed distance to the rounded-rect rim: 0 on the border, negative in. */
    const rimDistance = (x: number, y: number) => {
      const hx = Math.abs(x - width / 2) - (width / 2 - RADIUS);
      const hy = Math.abs(y - height / 2) - (height / 2 - RADIUS);
      const outside = Math.hypot(Math.max(hx, 0), Math.max(hy, 0));
      const inside = Math.min(Math.max(hx, hy), 0);
      return outside + inside - RADIUS;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      while (ripples.length && now - ripples[0].born > RIPPLE_MS) ripples.shift();
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const travel = Math.max(width, height);
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          const x = c * CELL + CELL / 2;
          const y = r * CELL + CELL / 2;
          const rim = rimDistance(x, y);
          if (rim > CELL / 2) continue;

          let value = 0;
          if (!reduced.matches) {
            // The rim is the border: one cell thick, lit, breathing out of
            // step. The interior keeps a faint skin so the pixels read.
            if (rim > -CELL * 1.5) {
              const breathe = 0.5 + 0.5 * Math.sin(now / 640 + c * 0.9 + r * 1.3);
              value = 0.22 + breathe * 0.14;
            } else {
              value = 0.05;
            }
            if (Number.isFinite(pointer.x)) {
              const near = Math.hypot(x - pointer.x, y - pointer.y);
              if (near < REACH) {
                value = Math.max(value, 0.1 + (1 - near / REACH) ** 2 * 0.9);
              }
            }
            for (const ripple of ripples) {
              const age = (now - ripple.born) / RIPPLE_MS;
              const front = age * travel;
              const band = CELL * 2;
              const gap = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - front);
              if (gap < band) {
                value = Math.max(value, (1 - gap / band) * (1 - age) * 0.95);
              }
            }
          } else {
            value = rim > -CELL * 1.5 ? 0.34 : 0.05;
          }
          ctx.fillStyle = `rgba(${tint}, ${Math.min(value, 1).toFixed(3)})`;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    };

    const step = (now: number) => {
      raf = 0;
      draw(now);
      const moving =
        !reduced.matches &&
        (Number.isFinite(pointer.x) ||
          ripples.length > 0 ||
          now - lastNews < DECAY_MS);
      if (moving) raf = requestAnimationFrame(step);
    };

    const wake = () => {
      lastNews = performance.now();
      if (reduced.matches) {
        draw(lastNews);
        return;
      }
      if (!raf) raf = requestAnimationFrame(step);
    };

    const resize = () => {
      const rect = button.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resolveTint();
      wake();
    };

    const local = (event: PointerEvent | MouseEvent) => {
      const rect = button.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      const at = local(event);
      pointer.x = at.x;
      pointer.y = at.y;
      wake();
    };
    const onLeave = () => {
      pointer.x = Number.NaN;
      pointer.y = Number.NaN;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      if (event.button === 0) {
        const at = local(event);
        ripples.push({ x: at.x, y: at.y, born: performance.now() });
      }
      wake();
    };
    // Enter and Space fire a click without a pointerdown: the keyboard press
    // ripples from the middle so it is not a silent activation.
    const onClick = (event: MouseEvent) => {
      if (event.detail === 0) {
        ripples.push({ x: width / 2, y: height / 2, born: performance.now() });
        wake();
      }
    };
    const onMotionChange = () => wake();

    button.addEventListener("pointermove", onMove);
    button.addEventListener("pointerleave", onLeave);
    button.addEventListener("pointerdown", onDown);
    button.addEventListener("click", onClick);
    reduced.addEventListener("change", onMotionChange);
    const observer = new ResizeObserver(resize);
    observer.observe(button);
    resize();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      reduced.removeEventListener("change", onMotionChange);
      button.removeEventListener("pointermove", onMove);
      button.removeEventListener("pointerleave", onLeave);
      button.removeEventListener("pointerdown", onDown);
      button.removeEventListener("click", onClick);
      observer.disconnect();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className ? `pixel-button ${className}` : "pixel-button"}
      {...rest}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="pixel-button-label">{children}</span>
    </button>
  );
}
