import { useNavigate } from 'react-router-dom';
import { Github, ArrowLeft } from 'lucide-react';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import '../styles/home.css';

const GITHUB_URL = 'https://github.com/GC-0719/openUI';

export default function RunLocally() {
  const navigate = useNavigate();
  return (
    <div className="lp-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="lp-nav">
        <button
          type="button"
          className="lp-brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => navigate('/')}
        >
          <BrandLogo size={28} mono />
          <Wordmark size={18} mono />
        </button>
        <div className="lp-nav-actions">
          <a className="lp-ghost-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub
          </a>
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <span className="lp-eyebrow">Hosted site</span>
          <h1 className="lp-title" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
            Studio runs locally
          </h1>
          <p className="lp-subtitle" style={{ margin: '16px auto 24px' }}>
            Audit, diff preview, the AI agent, and MCP need the dev server on your machine — not this tab.
          </p>

          <div className="lp-quickstart" style={{ padding: 0, textAlign: 'left' }}>
            <pre>{`git clone https://github.com/GC-0719/openUI.git
cd openUI && npm install
npm run dev
# http://localhost:5173/studio/react
# optional: OPENUI_AI_KEY=sk-ant-... npm run dev`}</pre>
          </div>

          <div className="lp-hero-actions" style={{ marginTop: 28 }}>
            <a className="lp-primary-btn lp-lg" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> GitHub
            </a>
            <button type="button" className="lp-ghost-btn lp-lg" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
