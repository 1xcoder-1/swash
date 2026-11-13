import React from "react";

export function IconPnpm({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" fill="#F69220" />
      <rect x="9.25" y="2" width="5.5" height="5.5" rx="1" fill="#F69220" />
      <rect x="16.5" y="2" width="5.5" height="5.5" rx="1" fill="#F69220" />
      <rect x="9.25" y="9.25" width="5.5" height="5.5" rx="1" fill="#F69220" />
      <rect x="16.5" y="9.25" width="5.5" height="5.5" rx="1" fill="#FFBA00" />
      <rect x="2" y="16.5" width="5.5" height="5.5" rx="1" fill="#4E4E4E" />
      <rect x="9.25" y="16.5" width="5.5" height="5.5" rx="1" fill="#F69220" />
      <rect x="16.5" y="16.5" width="5.5" height="5.5" rx="1" fill="#F69220" />
    </svg>
  );
}

export function IconNpm({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="4" fill="#CB3837" />
      <path
        d="M4 7.5h16v9H12.5v-6.5H9.5v6.5H4V7.5zm12 2.5h2v4h-2v-4z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function IconBun({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M16 4.5c-5.8 0-10.2 4.4-11.8 9C2.7 18 4 23.5 8.2 26.5c2.3 1.6 5 2.3 7.8 2.3s5.5-.7 7.8-2.3c4.2-3 5.5-8.5 4-13-1.6-4.6-6-9-11.8-9z"
        fill="#FBF0DF"
      />
      <path
        d="M16 4.5c.8 1.8 1.8 3.5 3.2 4.8M16 4.5c-.8 1.8-1.8 3.5-3.2 4.8M16 4.5v5"
        stroke="#D4A373"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="18" r="1.5" fill="#2E241E" />
      <circle cx="20.5" cy="18" r="1.5" fill="#2E241E" />
      <ellipse cx="8.5" cy="20" rx="2" ry="1.2" fill="#F4A79D" opacity="0.85" />
      <ellipse cx="23.5" cy="20" rx="2" ry="1.2" fill="#F4A79D" opacity="0.85" />
      <path
        d="M14.5 20.5c.9.8 2.1.8 3 0"
        stroke="#2E241E"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconYarn({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#2C8EBB" />
      <path
        d="M7 14c1.2-3 3.5-4.8 6.5-4.8 2.8 0 4.5 1.8 4.5 3.8 0 2-1.5 3.5-4.5 3.5-2.5 0-4-1.5-4-3.5 0-2.5 2.5-5.5 6.5-5.5M9.5 7.5l5 9"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDeno({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#0D0D11" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path
        d="M7 16.5c.8-3.5 3.5-6.5 7.5-6.5h2v3c-2.5 0-4.5 1.5-5 5H7zm6.5-5.5V8c1.5 0 2.5 1 2.5 2.5h-2.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function IconAntigravity({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#151522" stroke="rgba(99, 102, 241, 0.45)" strokeWidth="1" />
      <path
        d="M12 4.5L14.2 9.8L19.5 12L14.2 14.2L12 19.5L9.8 14.2L4.5 12L9.8 9.8L12 4.5Z"
        fill="url(#ag-glow)"
      />
      <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
      <defs>
        <linearGradient id="ag-glow" x1="4.5" y1="4.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconClaude({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#241713" stroke="rgba(217, 119, 87, 0.45)" strokeWidth="1" />
      <path
        d="M12 6.5v11M6.5 12h11M8.1 8.1l7.8 7.8M8.1 15.9l7.8-7.8"
        stroke="#D97757"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="#D97757" />
    </svg>
  );
}

export function IconCursor({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="5" fill="#17171C" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path
        d="M12 4.5l6.5 3.8v7.4L12 19.5l-6.5-3.8V8.3L12 4.5z"
        fill="#26262E"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 4.5v15M5.5 8.3L18.5 15.7M5.5 15.7L18.5 8.3" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );
}

export function IconChatGPT({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="5" fill="#0C1915" stroke="rgba(16, 163, 127, 0.4)" strokeWidth="1" />
      <path
        d="M19.5 10.3a4.2 4.2 0 0 0-.4-3.5 4.3 4.3 0 0 0-4.5-2 4.3 4.3 0 0 0-3.8-2 4.3 4.3 0 0 0-4.1 3 4.3 4.3 0 0 0-2.8 2 4.3 4.3 0 0 0 .5 5 4.2 4.2 0 0 0 .4 3.5 4.3 4.3 0 0 0 4.5 2 4.3 4.3 0 0 0 3.2 1.4 4.3 4.3 0 0 0 4.1-3 4.3 4.3 0 0 0 2.8-2 4.3 4.3 0 0 0-.5-5.1v-.3zm-6.4 8.7a3.2 3.2 0 0 1-2.1-.6l.1-.1 3.4-2a.5.5 0 0 0 .3-.5v-4.8l1.4.8v4a3.2 3.2 0 0 1-3.2 3.2zm-6-2.9a3.2 3.2 0 0 1-.4-2.1l.1.1 3.4 2a.5.5 0 0 0 .5 0l4.2-2.4v1.7l-3.5 2a3.2 3.2 0 0 1-4.4-1.3zm-1.3-6.4a3.2 3.2 0 0 1 1.7-1.5v4.2l1.4-.8-3.4-2a3.2 3.2 0 0 1 .3-1v.1zm10.1 2.6l-4.2 2.4v-1.7l3.5-2a3.2 3.2 0 0 1 4.4 1.2 3.2 3.2 0 0 1 .4 2.1l-.1-.1-3.4-2a.5.5 0 0 0-.6.1zm2-1.7l-.1-.1-3.4-2a.5.5 0 0 0-.5 0l-4.2 2.4V5.7l3.5-2a3.2 3.2 0 0 1 4.8 2.5v1.2zm-6.4 3.5l-1.7-1 1.7-1 1.7 1-1.7 1z"
        fill="#10A37F"
      />
    </svg>
  );
}

export function IconV0({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="5" fill="#121214" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path
        d="M6.5 8.5l2.8 7 2.7-7H10l-1.4 3.8L7.3 8.5H6.5zm7 0a3.2 3.2 0 0 0-3 3.5 3.2 3.2 0 0 0 3 3.5 3.2 3.2 0 0 0 3-3.5 3.2 3.2 0 0 0-3-3.5zm0 5.6a1.9 1.9 0 0 1-1.8-2.1 1.9 1.9 0 0 1 1.8-2.1 1.9 1.9 0 0 1 1.8 2.1 1.9 1.9 0 0 1-1.8 2.1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function IconWindsurf({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#0A181B" stroke="rgba(0, 209, 178, 0.45)" strokeWidth="1" />
      <path
        d="M5.5 13.5c1.8-3.5 4.5-5.5 7.5-5.5 3 0 4.5 2 4.5 3.5 0 2-2 3.5-5.5 3.5-2.5 0-4.5-1.5-6.5-1.5z"
        fill="#00D1B2"
      />
    </svg>
  );
}

export function IconSparkles({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
      <path d="M19 4v4" />
      <path d="M21 6h-4" />
    </svg>
  );
}

export function IconCopy({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function IconCheck({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5 6.5 12 13 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevron({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
