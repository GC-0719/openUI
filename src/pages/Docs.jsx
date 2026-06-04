import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Github, Search, Copy, Check } from 'lucide-react';
import { componentsData } from '../data/components.jsx';
import { angularSnippets } from '../data/angularSnippets.js';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import '../styles/home.css';
import '../styles/docs-site.css';
import '../styles/workspace-mono.css';

const GITHUB_URL = 'https://github.com/GC-0719/openUI';

// Isolate each live preview so one throwing variant can't crash the page.
class PreviewBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div className="docs-preview-error">⚠ Preview unavailable</div>;
    }
    return this.props.children;
  }
}

// Render a variant's `render()` as a real component so its hooks/state work.
function LivePreview({ render }) {
  const Comp = render;
  return <Comp />;
}

function CodePanel({ reactCode, angularCode }) {
  const [fw, setFw] = useState('react');
  const [copied, setCopied] = useState(false);
  const code = fw === 'react'
    ? reactCode
    : (angularCode || '<!-- Angular usage for this component is on the way. -->');

  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="docs-code">
      <div className="docs-code-head">
        <div className="docs-fw-toggle">
          <button className={fw === 'react' ? 'active' : ''} onClick={() => setFw('react')}>React</button>
          <button className={fw === 'angular' ? 'active' : ''} onClick={() => setFw('angular')}>Angular</button>
        </div>
        <button className="docs-copy" onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="docs-code-pre"><code>{code}</code></pre>
    </div>
  );
}

export default function Docs() {
  const { component: routeId } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const active = useMemo(
    () => componentsData.find(c => c.id === routeId) || componentsData[0],
    [routeId],
  );
  const filtered = componentsData.filter(c => c.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="docs-root workspace-mono">
      <header className="lp-nav">
        <Link to="/" className="lp-brand" style={{ textDecoration: 'none' }}>
          <BrandLogo size={28} mono />
          <Wordmark size={18} mono />
        </Link>
        <nav className="lp-nav-links">
          <Link to="/">Home</Link>
          <Link to="/docs">Components</Link>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-ghost-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub
          </a>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-sidebar">
          <div className="docs-search">
            <Search size={14} />
            <input
              placeholder="Search components…"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Search components"
            />
          </div>
          <nav className="docs-nav">
            {filtered.map(c => (
              <button
                key={c.id}
                className={`docs-nav-item${active?.id === c.id ? ' active' : ''}`}
                onClick={() => navigate(`/docs/${c.id}`)}
              >
                {c.name}
              </button>
            ))}
          </nav>
        </aside>

        <main className="docs-main">
          {active && (
            <>
              <div className="docs-head">
                <h1 className="docs-title">{active.name}</h1>
                <span className="docs-count">{active.variants.length} example{active.variants.length > 1 ? 's' : ''}</span>
              </div>
              {active.description && <p className="docs-desc">{active.description}</p>}
              {active.classes?.length > 0 && (
                <div className="docs-classes">
                  {active.classes.map(cl => <code key={cl}>.{cl}</code>)}
                </div>
              )}

              {active.variants.map((v, i) => (
                <section className="docs-variant" key={`${active.id}-${i}`}>
                  <h3 className="docs-variant-name">{v.name}</h3>
                  {v.desc && <p className="docs-variant-desc">{v.desc}</p>}
                  <div className="docs-preview">
                    <PreviewBoundary key={`${active.id}-${i}`}>
                      {v.render ? <LivePreview render={v.render} /> : null}
                    </PreviewBoundary>
                  </div>
                  <CodePanel reactCode={v.code} angularCode={angularSnippets[active.id]} />
                </section>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
