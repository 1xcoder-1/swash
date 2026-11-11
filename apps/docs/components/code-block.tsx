import type { ReactNode } from "react";
import { CopyButton } from "./copy-button";

/**
 * A framed code block. `plain` children are the raw text for the copy button;
 * children can include token spans for light highlighting.
 */
export function CodeBlock({
  caption,
  copy,
  children,
}: {
  caption?: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <div className="code">
      {caption ? <div className="code-caption">{caption}</div> : null}
      <pre>
        <code>{children}</code>
      </pre>
      <span className="copy">
        <CopyButton text={copy} />
      </span>
    </div>
  );
}
