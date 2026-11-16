"use client";

import { useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePixelCanvas } from "./pixel-canvas";

export interface PixelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * The pixel pill from Aceternity's interactions set: a button made of tiny
 * pixels whose rim breathes, whose pixels light up around the pointer, and
 * whose press sends a square wavefront rippling out from under the cursor.
 * The drawing lives in `usePixelCanvas`; this shell keeps the label real DOM
 * text on a real button, so the effect never costs the accessibility tree.
 */
export function PixelButton({
  children,
  className,
  ...rest
}: PixelButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePixelCanvas(buttonRef, canvasRef);

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
