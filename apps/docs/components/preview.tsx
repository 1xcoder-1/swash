"use client";

import { useState, type ReactNode } from "react";
import { CopyButton } from "./copy-button";
import { Highlighted } from "./highlight";
import { DEMO_CODE } from "./demo-code";

/**
 * A live panel: the demo on top, a replay control below. Remounting the demo
 * (via key) restarts whatever effect runs on mount. When the demo's label has
 * a snippet in DEMO_CODE, a Preview | Code segmented toggle lets the reader
 * flip between the running widget and the source that produced it.
 */
export function Preview({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [run, setRun] = useState(0);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const code = DEMO_CODE[label];
  const showCode = Boolean(code) && tab === "code";

  return (
    <div className="preview">
      {code ? (
        <div className="preview-head">
          <div className="preview-seg" role="tablist" aria-label="Preview or code">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`preview-seg-btn${tab === "preview" ? " is-active" : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "code"}
              className={`preview-seg-btn${tab === "code" ? " is-active" : ""}`}
              onClick={() => setTab("code")}
            >
              Code
            </button>
          </div>
          {showCode ? (
            <span className="copy">
              <CopyButton text={code} />
            </span>
          ) : null}
        </div>
      ) : null}

      {showCode ? (
        <div className="preview-code">
          <div className="code-gutter" aria-hidden>
            {code.split("\n").map((_, n) => (
              <span key={n}>{n + 1}</span>
            ))}
          </div>
          <Highlighted code={code} lang="tsx" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
