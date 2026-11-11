"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`bento ${className}`.trim()}>{children}</div>;
}

export function BentoCard({
  span,
  children,
}: {
  /** grid span: 1 (default), 2 or 3 columns */
  span?: 1 | 2 | 3;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${e.clientX - r.left}px`);
    el.style.setProperty("--gy", `${e.clientY - r.top}px`);
  };

  const spanClass = span === 2 ? " span-2" : span === 3 ? " span-3" : "";

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      className={`bento-card${spanClass}`}
    >
      <span className="bento-glow" aria-hidden />
      {children}
    </article>
  );
}
