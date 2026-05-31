import React, { useState } from 'react';
import { X, Download, Github, Check, AlertCircle, ExternalLink, Loader, Cpu, Copy } from 'lucide-react';
import JSZip from 'jszip';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../context/AIContext';

const ExportModal = ({ onClose }) => {
  const { cssVars, componentCSS } = useTheme();
  const { kit } = useAI();
  const [tab, setTab] = useState('zip');
  const [copied, setCopied] = useState(false);
  const [zipState, setZipState] = useState('idle'); // idle | loading | done | error
  const [githubState, setGithubState] = useState('idle');
  const [githubForm, setGithubForm] = useState({ token: '', repo: '', description: '', isPrivate: false });
  const [githubResult, setGithubResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const fetchFiles = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cssVars,
        componentCSS,
        kitName: kit.kitName,
        kitPrefix: kit.kitPrefix,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.files;
  };

  const copyMCPConfig = (kitName) => {
    const pkgName = kitName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const config = JSON.stringify({
      mcpServers: {
        [pkgName]: {
          command: 'node',
          args: [`/path/to/${pkgName}/mcp-server/index.js`],
        },
      },
    }, null, 2);
    navigator.clipboard.writeText(config).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadZip = async () => {
    setZipState('loading');
    setError('');
    try {
      const files = await fetchFiles();
      const zip = new JSZip();
      for (const [p, content] of Object.entries(files)) {
        zip.file(p, content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kit.kitName.toLowerCase().replace(/\s+/g, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setZipState('done');
      setTimeout(() => setZipState('idle'), 3000);
    } catch (err) {
      setError(err.message);
      setZipState('error');
    }
  };

  const pushToGitHub = async () => {
    const { token, repo, description, isPrivate } = githubForm;
    if (!token || !repo) return;
    setGithubState('loading');
    setGithubResult(null);
    setError('');

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    };

    try {
      // 1. Get authenticated user
      setProgress('Authenticating…');
      const meRes = await fetch('https://api.github.com/user', { headers });
      const me = await meRes.json();
      if (me.message) throw new Error(`GitHub auth failed: ${me.message}`);
      const owner = me.login;

      // 2. Create repository
      setProgress('Creating repository…');
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repo,
          description: description || 'My openUI',
          private: isPrivate,
          auto_init: true,
        }),
      });
      const created = await createRes.json();
      if (created.message) throw new Error(`Failed to create repo: ${created.message}`);
      const repoUrl = created.html_url;

      // 3. Get default branch SHA
      setProgress('Reading branch…');
      const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, { headers });
      const branchData = await branchRes.json();
      const baseSha = branchData.object?.sha;

      // 4. Fetch project files
      setProgress('Bundling files…');
      const files = await fetchFiles();

      // 5. Create blobs for each file
      setProgress('Uploading files…');
      const treeItems = [];
      const entries = Object.entries(files);
      for (let i = 0; i < entries.length; i++) {
        const [filePath, content] = entries[i];
        setProgress(`Uploading ${i + 1}/${entries.length}: ${filePath}`);
        const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content, encoding: 'utf-8' }),
        });
        const blob = await blobRes.json();
        if (!blob.sha) throw new Error(`Failed to upload ${filePath}`);
        treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
      }

      // 6. Create tree
      setProgress('Creating commit…');
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ base_tree: baseSha, tree: treeItems }),
      });
      const tree = await treeRes.json();

      // 7. Create commit
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'Initial commit — openUI export',
          tree: tree.sha,
          parents: baseSha ? [baseSha] : [],
        }),
      });
      const commit = await commitRes.json();

      // 8. Update ref
      setProgress('Finalizing…');
      await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commit.sha, force: true }),
      });

      setProgress('');
      setGithubResult({ url: repoUrl, name: `${owner}/${repo}` });
      setGithubState('done');
    } catch (err) {
      setError(err.message);
      setGithubState('error');
      setProgress('');
    }
  };

  const hasOverrides = Object.keys(cssVars).length > 0 || Object.keys(componentCSS).length > 0;

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="openui-modal" style={{ width: '500px' }}>
        <div className="openui-modal-header">
          <span className="openui-modal-title">Export Kit</span>
          <button className="openui-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="export-tabs">
          <button className={`export-tab ${tab === 'zip' ? 'active' : ''}`} onClick={() => setTab('zip')}>
            <Download size={14} /> Download ZIP
          </button>
          <button className={`export-tab ${tab === 'github' ? 'active' : ''}`} onClick={() => setTab('github')}>
            <Github size={14} /> Push to GitHub
          </button>
          <button className={`export-tab ${tab === 'mcp' ? 'active' : ''}`} onClick={() => setTab('mcp')}>
            <Cpu size={14} /> MCP Server
          </button>
        </div>

        <div className="openui-modal-body">
          {hasOverrides && (
            <div className="export-override-notice">
              <Check size={13} />
              Your AI theme customizations will be baked into <code>src/styles/theme-overrides.css</code>
            </div>
          )}

          {tab === 'zip' && (
            <div className="flex-col" style={{ gap: '16px' }}>
              <p className="export-desc">
                Download the complete openUI as a ZIP file. Includes all source files, components, styles, and your current theme.
              </p>
              <ul className="export-checklist">
                <li><Check size={12} /> All React components (<code>src/components/ui/</code>)</li>
                <li><Check size={12} /> CSS system (<code>src/styles/</code>)</li>
                <li><Check size={12} /> Live demo dashboard</li>
                <li><Check size={12} /> Docs site with AI chat</li>
                {hasOverrides && <li><Check size={12} style={{ color: 'var(--secondary)' }} /> AI theme overrides baked in</li>}
              </ul>
              <button
                className="export-action-btn"
                onClick={downloadZip}
                disabled={zipState === 'loading'}
              >
                {zipState === 'loading' && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {zipState === 'done' && <Check size={16} />}
                {zipState === 'idle' && <Download size={16} />}
                {zipState === 'loading' ? 'Bundling…' : zipState === 'done' ? 'Downloaded!' : 'Download ZIP'}
              </button>
            </div>
          )}

          {tab === 'github' && (
            <div className="flex-col" style={{ gap: '14px' }}>
              <p className="export-desc">
                Push the entire kit to a new GitHub repository under your account.
              </p>

              <div className="ai-settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="ai-settings-label" style={{ marginBottom: 0 }}>Personal Access Token</label>
                  <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="ai-settings-link">
                    Create token <ExternalLink size={11} />
                  </a>
                </div>
                <input
                  className="ai-settings-input"
                  type="password"
                  placeholder="ghp_…"
                  value={githubForm.token}
                  onChange={e => setGithubForm(f => ({ ...f, token: e.target.value }))}
                />
                <span className="ai-settings-hint">Needs <code>repo</code> scope. Stored only in memory.</span>
              </div>

              <div className="ai-settings-section">
                <label className="ai-settings-label">Repository Name</label>
                <input
                  className="ai-settings-input"
                  placeholder="my-ui-kit"
                  value={githubForm.repo}
                  onChange={e => setGithubForm(f => ({ ...f, repo: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                />
              </div>

              <div className="ai-settings-section">
                <label className="ai-settings-label">Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
                <input
                  className="ai-settings-input"
                  placeholder="My custom UI component library"
                  value={githubForm.description}
                  onChange={e => setGithubForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={githubForm.isPrivate}
                  onChange={e => setGithubForm(f => ({ ...f, isPrivate: e.target.checked }))}
                  style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }}
                />
                Make repository private
              </label>

              {progress && (
                <div className="export-progress">
                  <Loader size={12} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  {progress}
                </div>
              )}

              {githubResult && (
                <div className="ai-test-result ok">
                  <Check size={14} />
                  Repository created!{' '}
                  <a href={githubResult.url} target="_blank" rel="noopener noreferrer" className="ai-settings-link">
                    {githubResult.name} <ExternalLink size={11} />
                  </a>
                </div>
              )}

              <button
                className="export-action-btn"
                onClick={pushToGitHub}
                disabled={!githubForm.token || !githubForm.repo || githubState === 'loading'}
              >
                {githubState === 'loading' && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {githubState === 'done' && <Check size={16} />}
                {githubState === 'idle' && <Github size={16} />}
                {githubState === 'loading' ? 'Pushing…' : githubState === 'done' ? 'Pushed!' : 'Create & Push to GitHub'}
              </button>
            </div>
          )}

          {tab === 'mcp' && (
            <div className="flex-col" style={{ gap: '16px' }}>
              <div className="export-mcp-hero">
                <Cpu size={18} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8f8f8', marginBottom: '4px' }}>Design System Intelligence Layer</div>
                  <div style={{ fontSize: '12px', color: 'rgba(248,248,248,0.55)', lineHeight: 1.5 }}>
                    The exported ZIP includes a ready-to-run MCP server. Connect it to Claude Desktop or Claude Code — and Claude will use <strong>your exact components</strong> when generating UI.
                  </div>
                </div>
              </div>

              <ul className="export-checklist">
                <li><Check size={12} /> <code>list_components</code> — browse your full component library</li>
                <li><Check size={12} /> <code>get_component_api</code> — get props, examples & AI specs</li>
                <li><Check size={12} /> <code>generate_ui</code> — scaffold pages with your components</li>
                <li><Check size={12} /> <code>validate_code</code> — audit code against design system rules</li>
                <li><Check size={12} /> <code>get_css_variables</code> — expose all design tokens</li>
              </ul>

              <div className="export-mcp-steps">
                <div className="export-mcp-step">
                  <span className="export-mcp-num">1</span>
                  <div>
                    <div className="export-mcp-step-title">Download ZIP & install MCP dependencies</div>
                    <pre className="export-mcp-code">{`cd ${kit.kitName.toLowerCase().replace(/\s+/g, '-')}/mcp-server\nnpm install`}</pre>
                  </div>
                </div>
                <div className="export-mcp-step">
                  <span className="export-mcp-num">2</span>
                  <div style={{ flex: 1 }}>
                    <div className="export-mcp-step-title" style={{ marginBottom: '8px' }}>Add to <code>claude_desktop_config.json</code></div>
                    <div style={{ position: 'relative' }}>
                      <pre className="export-mcp-code">{JSON.stringify({
                        mcpServers: {
                          [kit.kitName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')]: {
                            command: 'node',
                            args: [`/path/to/${kit.kitName.toLowerCase().replace(/\s+/g, '-')}/mcp-server/index.js`],
                          }
                        }
                      }, null, 2)}</pre>
                      <button
                        className="export-mcp-copy"
                        onClick={() => copyMCPConfig(kit.kitName)}
                        title="Copy config"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="export-mcp-step">
                  <span className="export-mcp-num">3</span>
                  <div>
                    <div className="export-mcp-step-title">Ask Claude to build UI with your components</div>
                    <div style={{ fontSize: '12px', color: 'rgba(248,248,248,0.5)', marginTop: '4px' }}>
                      "Build me a user dashboard using my design system" — Claude will call <code>list_components</code> and use your exact components.
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="export-action-btn"
                onClick={downloadZip}
                disabled={zipState === 'loading'}
              >
                {zipState === 'loading' && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {zipState === 'done' && <Check size={16} />}
                {zipState === 'idle' && <Download size={16} />}
                {zipState === 'loading' ? 'Bundling…' : zipState === 'done' ? 'Downloaded!' : 'Download ZIP with MCP Server'}
              </button>
            </div>
          )}

          {error && (
            <div className="ai-test-result err" style={{ marginTop: '12px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
