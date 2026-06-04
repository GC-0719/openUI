import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Boxes,
  Code2,
  Database,
  Download,
  Eye,
  FileCode2,
  Github,
  PanelLeft,
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import '../styles/home.css';

const GITHUB_URL = 'https://github.com/GC-0719/openUI';

const FEATURES = [
  { Icon: PanelLeft, title: 'Real file tree', desc: 'Edit, rename, and preview on disk — git-friendly.' },
  { Icon: Bot, title: 'AI agent', desc: 'Plan or build across pages, components, and lib/.' },
  { Icon: Database, title: 'MCP backends', desc: 'Your schema and tools in the prompt.' },
  { Icon: Boxes, title: 'Design kit', desc: '24 components · React & Angular.' },
  { Icon: Eye, title: 'Live preview', desc: 'Running app in the studio iframe.' },
  { Icon: Download, title: 'Export', desc: 'ZIP, MCP server, npm under your name.' },
];

const WORKFLOW = [
  { label: 'Files', value: 'tree' },
  { label: 'Code', value: 'editor' },
  { label: 'Preview', value: 'app' },
  { label: 'Agent', value: 'writes' },
  { label: 'Export', value: 'ship' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isConfigured, settings, keySource } = useAI();

  return (
    <div className="lp-root">
      <header className="lp-nav">
        <div className="lp-brand">
          <BrandLogo size={28} mono />
          <Wordmark size={18} mono />
        </div>
        <nav className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#start">Start</a>
          <Link to="/docs">Docs</Link>
          <a href="#frameworks">Studio</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-ghost-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub
          </a>
          <button type="button" className="lp-primary-btn" onClick={() => navigate('/studio/react')}>
            Open Studio <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <span className="lp-eyebrow">Local-first · Bring your own key</span>
          <h1 className="lp-title">
            Build frontends with AI.<br />
            <span className="lp-title-accent">On your machine.</span>
          </h1>
          <p className="lp-subtitle">
            A studio that writes real files, previews the app, and connects to your backend over MCP.
            No hosted inference — your API key stays with you.
          </p>
          {import.meta.env.PROD && (
            <p className="lp-subtitle" style={{ fontSize: 14, marginTop: -16 }}>
              Full studio: clone the repo and run <code>npm run dev</code>.
            </p>
          )}
          <div className="lp-hero-actions">
            <button type="button" className="lp-primary-btn lp-lg" onClick={() => navigate('/studio/react')}>
              Open Studio <ArrowRight size={16} />
            </button>
            <a className="lp-ghost-btn lp-lg" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> GitHub
            </a>
          </div>
          <div className="lp-hero-meta">
            <span className="lp-pill">Runs locally</span>
            <span className={`lp-pill ${isConfigured ? 'ready' : ''}`}>
              {isConfigured
                ? keySource === 'env'
                  ? 'Claude · env key'
                  : `${settings.provider} ready`
                : 'BYOK — Settings or OPENUI_AI_KEY'}
            </span>
          </div>
        </section>

        <section className="lp-preview-wrap" aria-label="Studio preview">
          <div className="lp-preview-panel">
            <div className="lp-preview-sidebar">
              <span className="lp-preview-side-label">Files</span>
              <div className="lp-file"><FileCode2 size={12} /> App.jsx</div>
              <div className="lp-file lp-file-dir">pages/</div>
              <div className="lp-file active"><FileCode2 size={12} /> Dashboard.jsx</div>
              <div className="lp-file lp-file-dir">components/</div>
            </div>
            <div className="lp-preview-main">
              <div className="lp-preview-tabs">
                <span>Code</span>
                <span className="active">Preview</span>
                <span>Audit</span>
              </div>
              <div className="lp-preview-canvas">
                <div className="lp-demo-card">
                  <div className="lp-demo-label">Dashboard</div>
                  <div className="lp-demo-btn">Action</div>
                  <div className="lp-demo-row"><span /><span /><span /></div>
                  <div className="lp-demo-bars"><i /><i /><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="lp-preview-agent">
              <div className="lp-agent-head"><Bot size={14} /> Agent</div>
              <div className="lp-agent-msg">Build a users page from the API schema</div>
              <div className="lp-agent-files">
                <span><FileCode2 size={11} /> Users.jsx</span>
              </div>
              <div className="lp-agent-backend"><Database size={11} /> MCP connected</div>
            </div>
          </div>
        </section>

        <section className="lp-quickstart" id="start">
          <div className="lp-section-head">
            <h2>Quick start</h2>
            <p>Node 20+. One install at the repo root.</p>
          </div>
          <pre>{`git clone https://github.com/GC-0719/openUI.git
cd openUI && npm install
npm run dev
# http://localhost:5173/studio/react
# optional: OPENUI_AI_KEY=sk-ant-... npm run dev`}</pre>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-section-head">
            <h2>What you get</h2>
            <p>From prompt to production-ready UI — without leaving your repo.</p>
          </div>
          <div className="lp-feature-grid">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div className="lp-feature-card" key={title}>
                <span className="lp-feature-icon"><Icon size={18} strokeWidth={1.5} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section lp-section-tight" id="how">
          <div className="lp-section-head">
            <h2>Flow</h2>
            <p>Five steps in one local studio.</p>
          </div>
          <div className="lp-workflow">
            {WORKFLOW.map(({ label, value }, i) => (
              <div className="lp-workflow-step" key={label}>
                <span className="lp-workflow-icon"><span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span></span>
                <div>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </div>
                {i < WORKFLOW.length - 1 && <ArrowRight className="lp-workflow-arrow" size={14} />}
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section" id="frameworks">
          <div className="lp-section-head">
            <h2>Open a workspace</h2>
            <p>React or Angular — same studio, same agent.</p>
          </div>
          <div className="lp-fw-grid">
            <button type="button" className="lp-fw-card" onClick={() => navigate('/studio/react')}>
              <span className="lp-fw-head">
                <span className="lp-fw-logo"><Code2 size={22} strokeWidth={1.5} /></span>
                <span>
                  <strong>React</strong>
                  <small>JSX · Vite workspace</small>
                </span>
              </span>
              <span className="lp-fw-meta">
                <span>24 kit components</span>
                <span>Diff preview · Audit · MCP</span>
              </span>
              <span className="lp-fw-foot">
                <span>Recommended</span>
                <span className="lp-fw-open">Open <ArrowRight size={14} /></span>
              </span>
            </button>
            <button type="button" className="lp-fw-card" onClick={() => navigate('/studio/angular')}>
              <span className="lp-fw-head">
                <span className="lp-fw-logo"><Boxes size={22} strokeWidth={1.5} /></span>
                <span>
                  <strong>Angular</strong>
                  <small>Standalone · TypeScript</small>
                </span>
              </span>
              <span className="lp-fw-meta">
                <span>24 kit components</span>
                <span>Compiler validation in dev</span>
              </span>
              <span className="lp-fw-foot">
                <span>Full parity</span>
                <span className="lp-fw-open">Open <ArrowRight size={14} /></span>
              </span>
            </button>
          </div>
        </section>

        <section className="lp-cta">
          <h2>Describe your first screen.</h2>
          <button type="button" className="lp-primary-btn lp-lg" onClick={() => navigate('/studio/react')}>
            Open Studio <ArrowRight size={16} />
          </button>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-brand">
          <BrandLogo size={22} mono />
          <Wordmark size={15} mono />
        </div>
        <div className="lp-footer-meta">
          <span>MIT</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          <Link to="/docs">Components</Link>
        </div>
      </footer>
    </div>
  );
}
