import { useState } from 'react';
import { X, Wand2, Download, Copy, Check, Plus, FileJson, Database } from 'lucide-react';
import JSZip from 'jszip';
import { apiPost } from '../../utils/api';

const SAMPLE_OPENAPI = `{
  "openapi": "3.0.0",
  "info": { "title": "My API", "version": "1.0.0" },
  "servers": [{ "url": "http://localhost:3000" }],
  "paths": {
    "/users": {
      "get": { "operationId": "listUsers", "summary": "List users" }
    }
  }
}`;

const SAMPLE_PRISMA = `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}

model Order {
  id     Int    @id @default(autoincrement())
  userId Int
  total  Float
  status String
}`;

const MCPWizardModal = ({ onClose, onAddServer }) => {
  const [source, setSource] = useState('openapi');
  const [specText, setSpecText] = useState('');
  const [serverName, setServerName] = useState('My Backend');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const spec = source === 'openapi'
        ? (specText.trim() ? JSON.parse(specText) : null)
        : specText;
      if (!spec) throw new Error('Paste a spec first');

      const data = await apiPost('/api/mcp-wizard/scaffold', {
        source,
        spec,
        serverName: serverName.trim(),
        baseUrl: baseUrl.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!result?.files) return;
    const zip = new JSZip();
    const folder = `${result.meta?.slug || 'mcp-server'}-mcp`;
    for (const [p, content] of Object.entries(result.files)) {
      zip.file(`${folder}/${p}`, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folder}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyClaudeConfig = () => {
    if (!result?.meta) return;
    const slug = result.meta.slug;
    const folder = `${slug}-mcp`;
    const config = {
      mcpServers: {
        [slug]: {
          command: 'node',
          args: [`/absolute/path/to/${folder}/index.js`],
          ...(result.meta.kind === 'openapi'
            ? { env: { API_BASE_URL: result.meta.baseUrl } }
            : {}),
        },
      },
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addToStudio = () => {
    if (!result?.meta || !onAddServer) return;
    const slug = result.meta.slug;
    const folder = `${slug}-mcp`;
    onAddServer({
      label: serverName.trim() || 'Backend MCP',
      transport: 'stdio',
      command: `node /absolute/path/to/${folder}/index.js`,
      enabled: true,
    });
    onClose();
  };

  const loadSample = () => {
    setSpecText(source === 'openapi' ? SAMPLE_OPENAPI : SAMPLE_PRISMA);
    setError('');
  };

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && !busy && onClose()}>
      <div className="openui-modal mcp-wizard-modal" onClick={e => e.stopPropagation()}>
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wand2 size={15} /> MCP wizard
          </span>
          <button type="button" className="openui-modal-close" onClick={onClose} disabled={busy}>
            <X size={16} />
          </button>
        </div>

        <div className="openui-modal-body mcp-wizard-body">
          <p className="mcp-wizard-intro">
            Generate a minimal <strong>stdio</strong> MCP server from an OpenAPI document (HTTP tools) or a
            Prisma schema (model introspection tools). Download the bundle, run <code>npm install</code>, then
            connect it in MCP settings.
          </p>

          <div className="mcp-wizard-source-tabs">
            <button
              type="button"
              className={`mcp-wizard-tab${source === 'openapi' ? ' active' : ''}`}
              onClick={() => { setSource('openapi'); setResult(null); }}
            >
              <FileJson size={14} /> OpenAPI
            </button>
            <button
              type="button"
              className={`mcp-wizard-tab${source === 'prisma' ? ' active' : ''}`}
              onClick={() => { setSource('prisma'); setResult(null); }}
            >
              <Database size={14} /> Prisma
            </button>
          </div>

          <div className="mcp-wizard-fields">
            <label className="mcp-wizard-label">Server name</label>
            <input
              className="mcp-wizard-input"
              value={serverName}
              onChange={e => setServerName(e.target.value)}
              placeholder="My Backend"
            />
            {source === 'openapi' && (
              <>
                <label className="mcp-wizard-label">API base URL</label>
                <input
                  className="mcp-wizard-input"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                />
              </>
            )}
          </div>

          <div className="mcp-wizard-spec-head">
            <label className="mcp-wizard-label">
              {source === 'openapi' ? 'OpenAPI spec (JSON)' : 'Prisma schema'}
            </label>
            <button type="button" className="mcp-wizard-sample-btn" onClick={loadSample}>
              Load sample
            </button>
          </div>
          <textarea
            className="mcp-wizard-textarea"
            value={specText}
            onChange={e => setSpecText(e.target.value)}
            placeholder={source === 'openapi' ? 'Paste openapi.json…' : 'Paste schema.prisma…'}
            spellCheck={false}
          />

          {error && <p className="mcp-wizard-error">{error}</p>}

          {result?.ok && (
            <div className="mcp-wizard-result">
              <p className="mcp-wizard-result-summary">
                Generated <strong>{Object.keys(result.files).length}</strong> files
                {result.meta.kind === 'openapi' && (
                  <> · <strong>{result.meta.toolCount}</strong> API tools</>
                )}
                {result.meta.kind === 'prisma' && (
                  <> · <strong>{result.meta.modelCount}</strong> models</>
                )}
              </p>
              <ul className="mcp-wizard-file-list">
                {Object.keys(result.files).map(f => (
                  <li key={f}><code>{f}</code></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="openui-modal-footer mcp-wizard-footer">
          {!result ? (
            <>
              <button type="button" className="ai-settings-btn secondary" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="ai-settings-btn primary"
                onClick={generate}
                disabled={busy || !specText.trim()}
              >
                {busy ? 'Generating…' : 'Generate MCP server'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="ai-settings-btn secondary" onClick={() => setResult(null)}>
                Back
              </button>
              <button type="button" className="ai-settings-btn secondary" onClick={copyClaudeConfig}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Claude config</>}
              </button>
              <button type="button" className="ai-settings-btn secondary" onClick={downloadZip}>
                <Download size={14} /> Download ZIP
              </button>
              {onAddServer && (
                <button type="button" className="ai-settings-btn primary" onClick={addToStudio}>
                  <Plus size={14} /> Add to MCP settings
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCPWizardModal;
