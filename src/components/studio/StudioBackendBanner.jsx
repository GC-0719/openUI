import { Terminal, X } from 'lucide-react';

/**
 * Shown when the studio UI loaded but Vite dev APIs (/api/*) are unavailable.
 */
export default function StudioBackendBanner({ onDismiss }) {
  return (
    <div className="studio-backend-banner" role="status">
      <Terminal size={15} className="studio-backend-banner-icon" />
      <div className="studio-backend-banner-text">
        <strong>Studio backend is offline.</strong>{' '}
        Audit, diff preview, workspace bind, git badges, and the AI agent need the dev server.
        Run <code>npm run dev</code> (or <code>npm run dev:react</code>) and open the URL it prints — not{' '}
        <code>npm start</code>, <code>npm run preview</code>, or the hosted openui.live studio link.
      </div>
      {onDismiss && (
        <button
          type="button"
          className="studio-backend-banner-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
