"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";

/**
 * Editor-grade syntax highlighting via Shiki — the same TextMate grammar
 * engine VS Code uses. The site is dark-only, so one dark theme suffices.
 * Results are cached per (lang, code) so repeated panes never re-highlight.
 * The HTML is produced locally by Shiki from repo-controlled snippet
 * strings — no user input ever reaches it. Until the async highlight
 * resolves, the raw text renders; pane geometry is identical either way.
 */
const THEME = "vitesse-dark";
const cache = new Map<string, string>();

export function Highlighted({
  code,
  lang = "tsx",
}: {
  code: string;
  lang?: string;
}) {
  const key = `${lang}\u0000${code}`;
  const [html, setHtml] = useState<string | undefined>(() => cache.get(key));

  useEffect(() => {
    if (cache.has(key)) {
      setHtml(cache.get(key));
      return;
    }
    let alive = true;
    codeToHtml(code, { lang, theme: THEME })
      .then((out) => {
        cache.set(key, out);
        if (alive) setHtml(out);
      })
      .catch(() => {
        // Highlighting is decoration, never a hard dependency: the
        // plain-text fallback below stays. Surface it in the console.
        console.warn(`[docs] shiki could not highlight a ${lang} snippet`);
      });
    return () => {
      alive = false;
    };
  }, [key, code, lang]);

  if (!html) {
    return (
      <pre className="hl">
        <code>{code}</code>
      </pre>
    );
  }
  return <div className="hl" dangerouslySetInnerHTML={{ __html: html }} />;
}
