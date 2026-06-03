import { useNavigate } from 'react-router-dom';
import { Github, ArrowLeft, Terminal } from 'lucide-react';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import '../styles/home.css';

// Shown for /studio on the public site (openui.live). The studio's agent writes
// files, runs a live preview, and talks to local MCP servers — so it runs on the
// user's machine, not in a hosted tab. This page points them to run it locally.
const GITHUB_URL = 'https://github.com/GC-0719/openUI';

export default function RunLocally() {
  const navigate = useNavigate();
  return (
    <div className="lp-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="lp-nav">
        <button className="lp-brand" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/')}>
          <BrandLogo size={30} />
          <Wordmark size={19} />
        </button>
        <div className="lp-nav-actions">
          <a className="lp-ghost-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub
          </a>
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
          <span className="lp-eyebrow"><Terminal size={13} /> Local-first</span>
          <h1 className="lp-title" style={{ fontSize: 'clamp(28px, 5vw, 44px)', margin: '18px 0 0' }}>
            The studio runs on <span className="lp-title-accent">your machine</span>
          </h1>
          <p className="lp-subtitle" style={{ margin: '20px auto 20px' }}>
            openUI's AI agent creates files, runs a live preview, and connects to your backend over
            MCP — so the studio runs locally, not in this tab. Start it in three commands:
          </p>

          <p className="lp-subtitle" style={{ fontSize: 13, margin: '0 auto 20px', maxWidth: 520, textAlign: 'left' }}>
            <strong style={{ color: '#e7e7ee' }}>Included in the dev studio</strong> (not on this hosted page):
            Audit tab, agent diff preview, open existing repo, git file badges, starter templates,
            MCP wizard (AI Settings → MCP), theme editor, and plan → build workflow.
          </p>

          <pre style={{
            textAlign: 'left', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
            padding: '18px 20px', fontSize: 13.5, lineHeight: 1.8, color: '#e7e7ee',
            overflowX: 'auto', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}>
{`git clone https://github.com/GC-0719/openUI.git
cd openUI && npm install
OPENUI_AI_KEY=sk-ant-... npm run dev
# open http://localhost:5173/studio/react`}
          </pre>

          <div className="lp-hero-actions" style={{ marginTop: 26 }}>
            <a className="lp-primary-btn lp-lg" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> Get it on GitHub
            </a>
            <button className="lp-ghost-btn lp-lg" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Back to home
            </button>
          </div>

          <p className="lp-subtitle" style={{ fontSize: 14, margin: '38px 0 10px' }}>
            Or use the component kits directly in your own app:
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <code className="lp-pill" style={{ fontFamily: "var(--font-mono, monospace)" }}>npm i @openedui/react</code>
            <code className="lp-pill" style={{ fontFamily: "var(--font-mono, monospace)" }}>npm i @openedui/angular</code>
          </div>
        </div>
      </main>
    </div>
  );
}
