import type { IconType } from "react-icons";
import { SiCss, SiJavascript, SiTypescript } from "react-icons/si";

/**
 * The language badge as the real brand mark rather than a "JS"/"TS" symbol,
 * painted in each brand's official colour. Unknown languages keep the text
 * pill, so a `bash` or `json` badge still reads.
 */
const BRANDS: Record<string, { Icon: IconType; name: string; color: string }> = {
  js: { Icon: SiJavascript, name: "JavaScript", color: "#f7df1e" },
  javascript: { Icon: SiJavascript, name: "JavaScript", color: "#f7df1e" },
  ts: { Icon: SiTypescript, name: "TypeScript", color: "#3178c6" },
  typescript: { Icon: SiTypescript, name: "TypeScript", color: "#3178c6" },
  css: { Icon: SiCss, name: "CSS", color: "#1572b6" },
};

export function LangBadge({ lang }: { lang: string }) {
  const brand = BRANDS[lang.toLowerCase()];
  if (!brand) return <span className="code-lang">{lang}</span>;
  const { Icon, name, color } = brand;
  return (
    <span
      className="code-lang code-lang-brand"
      style={{ color }}
      role="img"
      aria-label={name}
      title={name}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}
