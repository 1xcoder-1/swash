"use client";

import { useState, type ReactNode } from "react";

/**
 * A live panel: the demo on top, a replay control below. Remounting the demo
 * (via key) restarts whatever effect runs on mount.
 */
export function Preview({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [run, setRun] = useState(0);
  return (
    <div className="preview">
      <div className="preview-body" key={run}>
        {children}
      </div>
      <div className="preview-bar">
        <span className="preview-label">{label}</span>
        <button
          type="button"
          className="preview-replay"
          onClick={() => setRun((n) => n + 1)}
        >
          Replay
        </button>
      </div>
    </div>
  );
}
