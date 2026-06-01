import { useId } from 'react';

// openUI mark — a UI panel (sidebar + content) inside an Aurora gradient tile,
// with an AI spark. Scales cleanly from favicon to hero sizes.
export function BrandLogo({ size = 30, style }) {
  const raw = useId();
  const gid = `ou-${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: 'block', flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id={gid} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <rect x="6.5" y="9.5" width="19" height="13.5" rx="3.2" fill="#ffffff" />
      <rect x="6.5" y="9.5" width="6.6" height="13.5" rx="3.2" fill="#0891B2" fillOpacity="0.16" />
      <circle cx="9.8" cy="13.2" r="1.05" fill="#0891B2" fillOpacity="0.75" />
      <rect x="15.4" y="13.4" width="7.6" height="1.9" rx="0.95" fill="#0891B2" fillOpacity="0.6" />
      <rect x="15.4" y="17.6" width="5" height="1.9" rx="0.95" fill="#0891B2" fillOpacity="0.34" />
      <path d="M24.3 3.4l.97 2.33 2.33.97-2.33.97-.97 2.33-.97-2.33L20.03 6.7l2.33-.97z" fill="#ffffff" />
    </svg>
  );
}

// "open" in a soft weight + "UI" as an Aurora gradient — the openUI wordmark.
export function Wordmark({ size = 17, openColor = '#e7e7ee' }) {
  return (
    <span style={{ fontFamily: "var(--font-display, 'Outfit', system-ui, sans-serif)", fontSize: size, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 500, color: openColor }}>open</span>
      <span
        style={{
          fontWeight: 800,
          background: 'linear-gradient(120deg, #2DD4BF, #06B6D4 55%, #6366F1)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: '#22D3EE',
        }}
      >
        UI
      </span>
    </span>
  );
}
