"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconPnpm,
  IconNpm,
  IconBun,
  IconYarn,
  IconDeno,
  IconAntigravity,
  IconClaude,
  IconCursor,
  IconChatGPT,
  IconV0,
  IconWindsurf,
  IconCopy,
  IconCheck,
  IconChevron,
} from "./brand-icons";

export const MANAGERS = [
  { id: "pnpm", label: "pnpm", cmd: "pnpm add swash", icon: IconPnpm },
  { id: "npm", label: "npm", cmd: "npm i swash", icon: IconNpm },
  { id: "bun", label: "bun", cmd: "bun add swash", icon: IconBun },
  { id: "yarn", label: "yarn", cmd: "yarn add swash", icon: IconYarn },
  { id: "deno", label: "deno", cmd: "deno add npm:swash", icon: IconDeno },
] as const;

export type ManagerId = (typeof MANAGERS)[number]["id"];

export const AI_AGENTS = [
  {
    id: "antigravity",
    name: "Antigravity",
    icon: IconAntigravity,
  },
  {
    id: "claude",
    name: "Claude Code",
    icon: IconClaude,
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: IconCursor,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: IconChatGPT,
  },
  {
    id: "v0",
    name: "v0 / Bolt",
    icon: IconV0,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: IconWindsurf,
  },
] as const;

export type AgentId = (typeof AI_AGENTS)[number]["id"];

function getAgentPrompt(agentId: AgentId, cmd: string) {
  if (agentId === "antigravity") {
    return `# Google Antigravity — swash component instructions

Install package:
${cmd}

Package summary:
- "swash" provides zero-runtime-dependency React text motion components (React 18+).
- Fully compatible with Next.js App Router (SSR-safe, zero hydration mismatch, no "use client" wrapper needed).
- Grapheme-cluster safe text processing via Intl.Segmenter (emojis and ligatures never split in half).
- Reduced motion (prefers-reduced-motion) renders instant static states.

Import in client components:
import { Typewriter, Counter, Reveal, Marker, Morph, Scramble, Frame } from "swash";

Usage examples:
<Typewriter loop={["Build fast.", "Ship smoothly.", "Measure impact."]} feel="snappy" />
<Counter to={12500} prefix="$" startOnView />
<Reveal by="word" stagger={40}>Words rise into view on scroll.</Reveal>
<Marker action="highlight" color="amber">Critical insight</Marker>`;
  }

  if (agentId === "claude") {
    return `# Claude Code instructions for swash

Add dependency:
${cmd}

Guidelines:
1. Import text effect components directly from "swash" (e.g., Typewriter, Counter, Reveal, Marker, Morph, Scramble).
2. Zero external dependencies; uses platform Web Animations API.
3. SSR-safe with Next.js 14/15/16 App Router.
4. Always preserve full strings in the markup for screen readers and SEO.`;
  }

  if (agentId === "cursor") {
    return `# .cursorrules for swash

Install:
${cmd}

Rules:
- Library: "swash" (React text effects).
- Components: Typewriter, Reveal, Counter, Marker, Morph, Scramble, Frame.
- No Framer Motion or GSAP needed for text animations.
- SSR-safe, zero layout shift (CLS = 0).`;
  }

  if (agentId === "chatgpt") {
    return `# OpenAI ChatGPT Custom Prompt for swash

To add text effects, install:
${cmd}

Use swash components:
- <Typewriter text="Your text" feel="cinematic" />
- <Counter to={100} duration={1200} />
- <Reveal by="word">Your paragraph</Reveal>
- <Marker action="circle">Highlight text</Marker>`;
  }

  if (agentId === "v0") {
    return `Install swash via "${cmd}".
Add lightweight text animations with <Reveal by="word"> and <Typewriter loop={["Feature 1", "Feature 2"]} />.`;
  }

  return `# Windsurf / Codeium instructions for swash

Install: ${cmd}
Use components from "swash": Typewriter, Reveal, Counter, Marker, Morph, Scramble.`;
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function InstallTabs() {
  const [activePm, setActivePm] = useState<ManagerId>("pnpm");
  const [activeAgent, setActiveAgent] = useState<AgentId>("antigravity");
  const [openMenu, setOpenMenu] = useState<"pm" | "agent" | null>(null);
  const [copied, setCopied] = useState<"cmd" | "agent" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentPm = MANAGERS.find((m) => m.id === activePm) || MANAGERS[0];
  const currentAgent = AI_AGENTS.find((a) => a.id === activeAgent) || AI_AGENTS[0];

  const CurrentPmIcon = currentPm.icon;

  // Dismiss menu on outside click or Escape
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const flash = (kind: "cmd" | "agent") => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyCmd = async () => {
    if (await writeClipboard(currentPm.cmd)) flash("cmd");
  };

  const copyAgent = async (agentId?: AgentId) => {
    const chosen = agentId || activeAgent;
    if (agentId) setActiveAgent(agentId);
    if (await writeClipboard(getAgentPrompt(chosen, currentPm.cmd))) {
      flash("agent");
    }
  };

  return (
    <div className="install-actions-group" ref={rootRef}>
      {/* 1. Install Command Control with Real PM Icons & PM Switcher */}
      <div className="install-command-bar">
        <button
          type="button"
          className="cmd-main-btn"
          aria-label={copied === "cmd" ? "Command copied" : "Copy install command"}
          onClick={copyCmd}
        >
          <span className="brand-icon-wrap">
            <CurrentPmIcon size={16} />
          </span>
          <code className="cmd-text">{currentPm.cmd}</code>
          <span className="cmd-copy-icon" aria-hidden="true">
            {copied === "cmd" ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </span>
        </button>

        <button
          type="button"
          className="cmd-chevron-btn"
          aria-haspopup="listbox"
          aria-expanded={openMenu === "pm"}
          aria-label="Choose package manager"
          onClick={() => setOpenMenu((v) => (v === "pm" ? null : "pm"))}
        >
          <IconChevron size={12} />
        </button>

        {openMenu === "pm" && (
          <ul className="custom-dropdown-menu pm-dropdown" role="listbox" aria-label="Package Manager">
            {MANAGERS.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activePm;
              return (
                <li key={m.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setActivePm(m.id);
                      setOpenMenu(null);
                    }}
                  >
                    <span className="dropdown-item-icon">
                      <Icon size={16} />
                    </span>
                    <span className="dropdown-item-label">{m.label}</span>
                    {isSelected && (
                      <span className="dropdown-item-check">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 2. AI Prompt Button: Clean without brand icon on the button; Menu shows name and icon */}
      <div className="ai-prompt-bar">
        <button
          type="button"
          className="prompt-main-btn"
          aria-label={copied === "agent" ? `Copied for ${currentAgent.name}` : `Copy prompt for ${currentAgent.name}`}
          onClick={() => copyAgent()}
        >
          <span className="prompt-label">
            {copied === "agent" ? "Copied prompt!" : "Copy prompt"}
          </span>
          <span className="prompt-copy-icon" aria-hidden="true">
            {copied === "agent" ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </span>
        </button>

        <button
          type="button"
          className="prompt-chevron-btn"
          aria-haspopup="menu"
          aria-expanded={openMenu === "agent"}
          aria-label="Choose AI assistant prompt format"
          onClick={() => setOpenMenu((v) => (v === "agent" ? null : "agent"))}
        >
          <IconChevron size={12} />
        </button>

        {openMenu === "agent" && (
          <ul className="custom-dropdown-menu agent-dropdown" role="menu" aria-label="AI Assistant format">
            {AI_AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isSelected = agent.id === activeAgent;
              return (
                <li key={agent.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      copyAgent(agent.id);
                      setOpenMenu(null);
                    }}
                  >
                    <span className="dropdown-item-icon">
                      <Icon size={18} />
                    </span>
                    <span className="dropdown-item-label">{agent.name}</span>
                    {isSelected && (
                      <span className="dropdown-item-check">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
