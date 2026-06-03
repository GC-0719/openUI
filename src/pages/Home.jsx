import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  FileCode2,
  Github,
  PackageCheck,
  PanelLeft,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import '../styles/home.css';

// Set when the public repo lands (Milestone 4).
const GITHUB_URL = 'https://github.com/GC-0719/openUI';

const ReactLogo = () => (
  <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="9" fill="#61DAFB" />
    <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="5.5" fill="none" />
    <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="5.5" fill="none" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61DAFB" strokeWidth="5.5" fill="none" transform="rotate(120 50 50)" />
  </svg>
);

const AngularLogo = () => (
  <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
    <polygon points="50,4 94,18 86,80 50,96 14,80 6,18" fill="#DD0031" />
    <polygon points="50,4 50,96 14,80 6,18" fill="#C3002F" />
    <polygon points="50,20 70,68 60,68 55,55 45,55 40,68 30,68" fill="white" />
    <rect x="43" y="46" width="14" height="8" fill="white" />
  </svg>
);

const FEATURES = [
  {
    Icon: PanelLeft,
    title: 'Sandbox IDE',
    desc: 'A real recursive file tree, code editor, and live preview. Create, rename, and delete files and folders like any editor.',
  },
  {
    Icon: Bot,
    title: 'AI full-build agent',
    desc: 'Describe a feature; the agent writes pages, components, hooks, and services across your project — and auto-fixes its own syntax errors.',
  },
  {
    Icon: Database,
    title: 'Backend-aware via MCP',
    desc: 'Connect your backend over MCP. The agent sees your tools and live data and builds UI that matches your exact fields and endpoints.',
  },
  {
    Icon: Boxes,
    title: 'Design-system kit',
    desc: 'Ships with 24 polished components for React and Angular — with a kit name and CSS prefix you can rename in one click.',
  },
  {
    Icon: Eye,
    title: 'Live preview',
    desc: 'Every change renders instantly in a sandboxed preview of the running app, with inline error recovery.',
  },
  {
    Icon: Download,
    title: 'Export & publish',
    desc: 'Download a ZIP, push to GitHub, generate an MCP server, or publish your kit to npm — under your own name.',
  },
];

const WORKFLOW = [
  { label: 'Files', value: 'project tree', Icon: PanelLeft },
  { label: 'Code', value: 'live editor', Icon: Code2 },
  { label: 'Preview', value: 'running app', Icon: Eye },
  { label: 'Agent', value: 'builds files', Icon: Bot },
  { label: 'Export', value: 'zip · npm · MCP', Icon: Download },
];

const FRAMEWORKS = [
  {
    id: 'react',
    name: 'React',
    Logo: ReactLogo,
    color: '#61DAFB',
    colorSoft: 'rgba(97,218,251,0.1)',
    stack: 'JSX workspace',
    entry: 'kits/react/workspace',
    files: '24 JSX components',
    output: 'Vite package + MCP server',
    signal: 'Fastest path',
  },
  {
    id: 'angular',
    name: 'Angular',
    Logo: AngularLogo,
    color: '#DD0031',
    colorSoft: 'rgba(221,0,49,0.1)',
    stack: 'Standalone TS workspace',
    entry: 'kits/angular/workspace',
    files: '24 TS components',
    output: 'Angular package + showcase',
    signal: 'Compiler ready',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { kit, isConfigured, settings } = useAI();

  return (
    <div className="lp-root">
      {/* ── Nav ── */}
      <header className="lp-nav">
        <div className="lp-brand">
          <BrandLogo size={30} />
          <Wordmark size={19} />
        </div>
        <nav className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link to="/docs">Components</Link>
          <a href="#frameworks">Frameworks</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-ghost-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub
          </a>
          <button className="lp-primary-btn" onClick={() => navigate('/studio/react')}>
            Open Studio <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero">
          <span className="lp-eyebrow">
            <Sparkles size={13} /> Local-first AI frontend sandbox
          </span>
          <h1 className="lp-title">
            Build full frontends with AI —<br />
            <span className="lp-title-accent">wired to your real backend.</span>
          </h1>
          <p className="lp-subtitle">
            openUI is a local studio where an AI agent builds complete React apps from your design
            system, connected to your backend through MCP. Edit files, preview live, then export or
            publish — all on your machine, with your own API key.
          </p>
          {import.meta.env.PROD && (
            <p className="lp-subtitle" style={{ fontSize: 13, margin: '0 0 8px', opacity: 0.85 }}>
              The hosted site links to setup instructions. For Audit, diff preview, workspace bind, and the
              full agent, clone the repo and run <code style={{ fontSize: '0.92em' }}>npm run dev</code>.
            </p>
          )}
          <div className="lp-hero-actions">
            <button className="lp-primary-btn lp-lg" onClick={() => navigate('/studio/react')}>
              Open the Studio <ArrowRight size={16} />
            </button>
            <a className="lp-ghost-btn lp-lg" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> Star on GitHub
            </a>
          </div>
          <div className="lp-hero-meta">
            <span className="lp-pill"><CheckCircle2 size={13} /> Workspace runs locally</span>
            <span className={`lp-pill ${isConfigured ? 'ready' : ''}`}>
              <Sparkles size={13} />
              {isConfigured ? `${settings.provider} connected` : 'Bring your own AI key'}
            </span>
            <span className="lp-pill"><Boxes size={13} /> Ships with the {kit.kitName} kit</span>
          </div>
        </section>

        {/* ── Product mockup ── */}
        <section className="lp-preview-wrap" aria-label="Studio preview">
          <div className="lp-preview-panel">
            <div className="lp-preview-sidebar">
              <span className="lp-preview-side-label">Files</span>
              <div className="lp-file"><FileCode2 size={12} /> App.jsx</div>
              <div className="lp-file lp-file-dir">pages/</div>
              <div className="lp-file active"><FileCode2 size={12} /> Dashboard.jsx</div>
              <div className="lp-file lp-file-dir">components/ui/</div>
              <div className="lp-file lp-file-dir">lib/</div>
              <div className="lp-file"><FileCode2 size={12} /> api.js</div>
            </div>
            <div className="lp-preview-main">
              <div className="lp-preview-tabs">
                <span className="active">Preview</span>
                <span>Code</span>
                <span>Spec</span>
                <span>Audit</span>
              </div>
              <div className="lp-preview-canvas">
                <div className="lp-demo-card">
                  <div className="lp-demo-label">Dashboard</div>
                  <div className="lp-demo-btn">Primary action</div>
                  <div className="lp-demo-row"><span /><span /><span /></div>
                  <div className="lp-demo-bars"><i /><i /><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="lp-preview-agent">
              <div className="lp-agent-head"><Bot size={14} /> openUI Agent</div>
              <div className="lp-agent-msg">Build a users page from the connected API</div>
              <div className="lp-agent-files">
                <span><FileCode2 size={11} /> Users.jsx</span>
                <span><FileCode2 size={11} /> lib/api.js</span>
              </div>
              <div className="lp-agent-backend"><Database size={11} /> 1 MCP · 4 tools</div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lp-section" id="features">
          <div className="lp-section-head">
            <h2>Everything between a prompt and a shipped UI</h2>
            <p>A full editor, an agent that builds across your whole project, and a path to production.</p>
          </div>
          <div className="lp-feature-grid">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div className="lp-feature-card" key={title}>
                <span className="lp-feature-icon"><Icon size={18} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="lp-section lp-section-tight" id="how">
          <div className="lp-section-head">
            <h2>How it works</h2>
            <p>One local studio, from first file to published kit.</p>
          </div>
          <div className="lp-workflow">
            {WORKFLOW.map(({ label, value, Icon }, i) => (
              <div className="lp-workflow-step" key={label}>
                <span className="lp-workflow-icon"><Icon size={16} /></span>
                <div>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </div>
                {i < WORKFLOW.length - 1 && <ArrowRight className="lp-workflow-arrow" size={14} />}
              </div>
            ))}
          </div>
        </section>

        {/* ── Frameworks ── */}
        <section className="lp-section" id="frameworks">
          <div className="lp-section-head">
            <h2>Open a workspace</h2>
            <p>Pick a framework and start building in the studio.</p>
          </div>
          <div className="lp-fw-grid">
            {FRAMEWORKS.map(({ id, name, Logo, color, colorSoft, stack, entry, files, output, signal }) => (
              <button
                key={id}
                className="lp-fw-card"
                style={{ '--fw-color': color, '--fw-soft': colorSoft }}
                onClick={() => navigate(`/studio/${id}`)}
              >
                <span className="lp-fw-accent" />
                <span className="lp-fw-head">
                  <span className="lp-fw-logo"><Logo /></span>
                  <span>
                    <strong>{name}</strong>
                    <small>{stack}</small>
                  </span>
                </span>
                <span className="lp-fw-meta">
                  <span><FileCode2 size={13} />{files}</span>
                  <span><Settings2 size={13} />{entry}</span>
                  <span><PackageCheck size={13} />{output}</span>
                </span>
                <span className="lp-fw-foot">
                  <span>{signal}</span>
                  <span className="lp-fw-open">Open <ArrowRight size={14} /></span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <h2>Open the studio and describe your first screen.</h2>
          <button className="lp-primary-btn lp-lg" onClick={() => navigate('/studio/react')}>
            Open the Studio <ArrowRight size={16} />
          </button>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-brand">
          <BrandLogo size={22} />
          <Wordmark size={15} />
        </div>
        <div className="lp-footer-meta">
          <span>MIT License</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>Built with the openUI kit</span>
        </div>
      </footer>
    </div>
  );
}
