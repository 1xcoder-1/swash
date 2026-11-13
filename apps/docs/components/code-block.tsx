import { CopyButton } from "./copy-button";
import { Highlighted } from "./highlight";
import { LangBadge } from "./lang-badge";

/** Line-number gutter shared by every framed code pane. */
export function CodeGutter({ lines }: { lines: number }) {
  return (
    <div className="code-gutter" aria-hidden>
      {Array.from({ length: lines }, (_, n) => (
        <span key={n}>{n + 1}</span>
      ))}
    </div>
  );
}

/** A code block with a language badge, optional filename, and copy button. */
export function CodeBlock({
  caption,
  copy,
  lang = "ts",
  highlight = "tsx",
}: {
  caption?: string;
  copy: string;
  lang?: string;
  highlight?: string;
}) {
  return (
    <div className="code">
      <div className="code-head">
        <LangBadge lang={lang} />
        {caption ? <span className="code-file">{caption}</span> : null}
        <span className="code-head-copy">
          <CopyButton text={copy} />
        </span>
      </div>
      <div className="code-body">
        <CodeGutter lines={copy.split("\n").length} />
        <Highlighted code={copy} lang={highlight} />
      </div>
    </div>
  );
}
