"use client";

import { useEffect, useRef, useState } from "react";

const CMD = "npm i swash";

const TL = {
  cmdStart: 200,
  cmdEnd: 1000,
  install: 1200,
  codeStart: 1700,
  codeStep: 240,
  preview: 4200,
  stats: 4700,
  cycle: 10500,
};

const CODE: React.ReactNode[] = [
  <>
    <span className="tok-k">import</span> {"{ "}
    <span className="tok-t">Typewriter</span>, <span className="tok-t">Scramble</span>
    {" } "}
    <span className="tok-k">from</span> <span className="tok-s">"swash"</span>;
  </>,
  <>&nbsp;</>,
  <>
    <span className="tok-k">export default function</span>{" "}
    <span className="tok-t">Hero</span>() {"{"}
  </>,
  <>{"  return ("}</>,
  <>{"    <>"}</>,
  <>
    {'      <'}
    <span className="tok-t">Typewriter</span> <span className="tok-a">text</span>
    {"="}
    <span className="tok-s">"Ship it."</span> {" />"}
  </>,
  <>
    {'      <'}
    <span className="tok-t">Scramble</span> <span className="tok-a">text</span>
    {"="}
    <span className="tok-s">"Zero dependencies."</span> {" />"}
  </>,
  <>{"    </>"}</>,
  <>{"  );"}</>,
  <>{"}"}</>,
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function useElapsed() {
  const [el, setEl] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setEl(TL.cycle);
      return;
    }
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      setEl((t - start) % TL.cycle);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return el;
}

function vis(el: number, at: number): React.CSSProperties {
  const p = clamp01((el - at) / 260);
  return { opacity: p, transform: `translateY(${(1 - p) * 6}px)` };
}

export function HeroStage() {
  const el = useElapsed();
  const typed = CMD.slice(
    0,
    Math.round(CMD.length * clamp01((el - TL.cmdStart) / (TL.cmdEnd - TL.cmdStart)))
  );

  return (
    <div className="stage">
      <div className="stage-bar">
        <span className="stage-dot" />
        <span className="stage-dot" />
        <span className="stage-dot" />
        <span className="stage-title">Terminal - 508&#215;590</span>
      </div>
      <div className="stage-tabbar">
        <span className="stage-tab">app/page.tsx</span>
        <span className="stage-tab-add">+</span>
      </div>
      <div className="stage-body">
        <div className="t-cmd">
          <span className="t-prompt">$ </span>
          {typed}
          {el < TL.install && <span className="cursor-block" />}
        </div>

        <div className="t-install" style={vis(el, TL.install)}>
          added 1 package in 1.2s
        </div>

        <div className="t-code">
          {CODE.map((line, i) => (
            <div
              className="cl"
              key={i}
              style={vis(el, TL.codeStart + i * TL.codeStep)}
            >
              {line}
            </div>
          ))}
        </div>

        <div className="t-preview" style={vis(el, TL.preview)}>
          Ship it.
          <span className="cursor-block" />
        </div>

        <div className="t-stat" style={vis(el, TL.stats)}>
          <span className="check">&#10003;</span> 0 dependencies
        </div>
        <div className="t-stat" style={vis(el, TL.stats + 200)}>
          <span className="check">&#10003;</span> 4.2 kB gzipped
        </div>
        <div className="t-stat" style={vis(el, TL.stats + 400)}>
          <span className="check">&#10003;</span> SSR &middot; reduced-motion &middot; TypeScript
        </div>
      </div>
    </div>
  );
}
