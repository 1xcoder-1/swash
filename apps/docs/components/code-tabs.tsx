"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { CodeGutter } from "./code-block";
import { Highlighted } from "./highlight";
import { LangBadge } from "./lang-badge";

const LANGS = ["JavaScript", "TypeScript"] as const;
type Lang = (typeof LANGS)[number];

/**
 * A framed code panel with JavaScript / TypeScript tabs, the way
 * torph.lochie.me shows its usage snippet. The header carries the language
 * badge and the copy button; the body gets a line-number gutter. The copy
 * button copies whichever language is on screen, and the source is Shiki
 * highlighted like a real editor.
 */
export function CodeTabs({ js, ts }: { js: string; ts: string }) {
  const [lang, setLang] = useState<Lang>("JavaScript");
  const code = lang === "JavaScript" ? js : ts;
  return (
    <div className="code">
      <div className="code-tabbar" role="tablist" aria-label="Language">
        {LANGS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={lang === t}
            className="code-tab"
            onClick={() => setLang(t)}
          >
            {t}
          </button>
        ))}
        <LangBadge lang={lang === "TypeScript" ? "ts" : "js"} />
        <span className="copy">
          <CopyButton text={code} />
        </span>
      </div>
      <div className="code-body">
        <CodeGutter lines={code.split("\n").length} />
        <Highlighted code={code} lang={lang === "TypeScript" ? "tsx" : "jsx"} />
      </div>
    </div>
  );
}
