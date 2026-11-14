"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { usePixelCanvas } from "./pixel-canvas";

export interface PromptButtonProps {
  children: ReactNode;
  /** Internal route (renders a Next Link) or full URL. */
  href?: string;
  /** Set for external URLs: opens in a new tab with rel="noreferrer". */
  external?: boolean;
  onClick?: () => void;
}

/**
 * Aceternity's Pixel Prompt Button, exactly: a blue pill whose tiny white
 * pixels light up around the pointer and ripple out on press, with the
 * real edge highlights, ring, glow and text shadow on top. The drawing
 * lives in `usePixelCanvas`; the label stays real DOM text so screen
 * readers only ever see the words.
 */
export function PromptButton({
  children,
  href,
  external,
  onClick,
}: PromptButtonProps) {
  const hostRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePixelCanvas(hostRef, canvasRef);

  const inner = (
    <>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="pixel-button-label">{children}</span>
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          ref={hostRef}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
        >
          {inner}
        </a>
      );
    }
    return (
      <Link ref={hostRef} href={href} className="btn btn-primary">
        {inner}
      </Link>
    );
  }
  return (
    <button
      ref={hostRef as never}
      type="button"
      onClick={onClick}
      className="btn btn-primary"
    >
      {inner}
    </button>
  );
}
