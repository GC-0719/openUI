import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ExternalLink, Eye, EyeOff, Plus, Trash2, Wifi, WifiOff, Cpu, Server, Zap, RefreshCw } from 'lucide-react';
import { useAI, AI_PROVIDERS } from '../../context/AIContext';

const LOCAL_PRESETS = [
  { label: 'Ollama', url: 'http://localhost:11434/v1' },
  { label: 'LM Studio', url: 'http://localhost:1234/v1' },
  { label: 'Jan', url: 'http://localhost:1337/v1' },
];

const TRANSPORTS = [
  { id: 'stdio', label: 'stdio' },
  { id: 'http',  label: 'HTTP/SSE' },
];

const blankServer = () => ({ id: Date.now(), label: '', transport: 'stdio', url: '', command: '', enabled: true });

const AISettingsModal = ({ onClose, defaultTab = 'ai' }) => {
  const { settings, updateSettings, mcpServers, updateMcpServers } = useAI();
  const [tab, setTab] = useState(defaultTab);
  const [local, setLocal] = useState({ ...settings });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [localModels, setLocalModels] = useState([]);
  const [servers, setServers] = useState(() => (mcpServers || []).map(s => ({ ...s })));
  const [testingServer, setTestingServer] = useState(null);
  const [serverTestResults, setServerTestResults] = useState({});

  useEffect(() => { updateMcpServers(servers); }, [servers]);

  const set = (k, v) => { setLocal(prev => ({ ...prev, [k]: v })); setTestResult(null); };

  const handleProviderChange = (p) => {
    if (p === 'local') {
      setLocal(prev => ({ ...prev, provider: p, model: prev.model || '', apiKey: '' }));
    } else {
      const firstModel = AI_PROVIDERS[p].models[0].id;
      setLocal(prev => ({ ...prev, provider: p, model: firstModel, apiKey: '' }));
    }
    setTestResult(null);
    setLocalModels([]);
  };

  const fetchLocalModels = async () => {
    setFetchingModels(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/local-models?baseUrl=${encodeURIComponent(local.baseUrl || 'http://localhost:11434/v1')}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLocalModels(data.models || []);
      if (data.models?.length && !local.model) {
        setLocal(prev => ({ ...prev, model: data.models[0] }));
      }
      setTestResult({ ok: true, msg: `${data.models.length} model${data.models.length !== 1 ? 's' : ''} found` });
    } catch (err) {
      setTestResult({ ok: false, msg: err.message });
    }
    setFetchingModels(false);
  };

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: local.provider, model: local.model, apiKey: local.apiKey,
          systemPrompt: 'Reply with exactly: "Connection successful."',
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTestResult({ ok: true, msg: 'Connection successful' });
    } catch (err) { setTestResult({ ok: false, msg: err.message }); }
    setTesting(false);
  };

  const addServer = () => setServers(prev => [...prev, blankServer()]);
  const removeServer = (id) => setServers(prev => prev.filter(s => s.id !== id));
  const updateServer = (id, key, value) =>
    setServers(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));

  const testServer = async (server) => {
    setTestingServer(server.id);
    setServerTestResults(prev => ({ ...prev, [server.id]: null }));
    try {
      const res = await fetch('/api/mcp-bridge/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transport: server.transport, url: server.url, command: server.command }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const count = (data.tools || []).length;
      setServerTestResults(prev => ({ ...prev, [server.id]: { ok: true, msg: `${count} tool${count !== 1 ? 's' : ''} found` } }));
    } catch (err) {
      setServerTestResults(prev => ({ ...prev, [server.id]: { ok: false, msg: err.message } }));
    }
    setTestingServer(null);
  };

  const save = () => { updateSettings(local); onClose(); };
  const provider = AI_PROVIDERS[local.provider];
  const enabledCount = servers.filter(s => s.enabled).length;

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="openui-modal ai-settings-modal">
        <div className="openui-modal-header">
          <span className="openui-modal-title">AI Settings</span>
          <button className="openui-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="ai-settings-tabs">
          <button className={`ai-settings-tab${tab === 'ai' ? ' active' : ''}`} onClick={() => setTab('ai')}>
            <Cpu size={13} /> AI Provider
          </button>
          <button className={`ai-settings-tab${tab === 'mcp' ? ' active' : ''}`} onClick={() => setTab('mcp')}>
            <Server size={13} /> MCP Servers
            {enabledCount > 0 && <span className="ai-settings-tab-badge">{enabledCount}</span>}
          </button>
        </div>

        <div className="openui-modal-body">
          {tab === 'ai' && (
            <>
              {/* Provider */}
              <div className="ai-settings-section">
                <label className="ai-settings-label">Provider</label>
                <div className="ai-provider-tabs">
                  {Object.entries(AI_PROVIDERS).map(([key, p]) => (
                    <button
                      key={key}
                      className={`ai-provider-tab ${local.provider === key ? 'active' : ''}`}
                      onClick={() => handleProviderChange(key)}
                    >
                      <span className="ai-provider-logo">{p.logo}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {local.provider === 'local' ? (
                <>
                  {/* Base URL */}
                  <div className="ai-settings-section">
                    <label className="ai-settings-label">Server URL</label>
                    <div className="ai-local-presets">
                      {LOCAL_PRESETS.map(p => (
                        <button
                          key={p.label}
                          className={`ai-local-preset-btn${local.baseUrl === p.url ? ' active' : ''}`}
                          onClick={() => { set('baseUrl', p.url); setLocalModels([]); setTestResult(null); }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <input
                      className="ai-settings-input"
                      value={local.baseUrl || ''}
                      onChange={e => { set('baseUrl', e.target.value); setLocalModels([]); setTestResult(null); }}
                      placeholder="http://localhost:11434/v1"
                      spellCheck={false}
                    />
                    <span className="ai-settings-hint">OpenAI-compatible endpoint. Ollama, LM Studio, Jan, LocalAI all work.</span>
                  </div>

                  {/* Model */}
                  <div className="ai-settings-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="ai-settings-label" style={{ marginBottom: 0 }}>Model</label>
                      <button
                        className="ai-settings-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={fetchLocalModels}
                        disabled={fetchingModels}
                      >
                        <RefreshCw size={11} style={fetchingModels ? { animation: 'spin 1s linear infinite' } : {}} />
                        {fetchingModels ? 'Fetching…' : 'Fetch models'}
                      </button>
                    </div>
                    {localModels.length > 0 ? (
                      <select className="ai-settings-select" value={local.model} onChange={e => set('model', e.target.value)}>
                        {localModels.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input
                        className="ai-settings-input"
                        value={local.model || ''}
                        onChange={e => set('model', e.target.value)}
                        placeholder="e.g. llama3.2, mistral, gemma3"
                        spellCheck={false}
                      />
                    )}
                    <span className="ai-settings-hint">Click "Fetch models" to auto-discover, or type the model name directly.</span>
                  </div>

                  {/* Optional API key for secured local servers */}
                  <div className="ai-settings-section">
                    <label className="ai-settings-label">API Key <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label>
                    <input
                      className="ai-settings-input"
                      type="password"
                      value={local.apiKey || ''}
                      onChange={e => set('apiKey', e.target.value)}
                      placeholder="Leave empty for Ollama / LM Studio"
                      spellCheck={false}
                    />
                    <span className="ai-settings-hint">Only needed if your local server requires authentication.</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Model */}
                  <div className="ai-settings-section">
                    <label className="ai-settings-label">Model</label>
                    <select className="ai-settings-select" value={local.model} onChange={e => set('model', e.target.value)}>
                      {provider.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>

                  {/* API Key */}
                  <div className="ai-settings-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="ai-settings-label" style={{ marginBottom: 0 }}>API Key</label>
                      <a
                        href={local.provider === 'claude' ? 'https://console.anthropic.com' : local.provider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://aistudio.google.com/app/apikey'}
                        target="_blank" rel="noopener noreferrer" className="ai-settings-link"
                      >
                        Get key <ExternalLink size={11} />
                      </a>
                    </div>
                    <div className="ai-key-wrapper">
                      <input
                        className="ai-settings-input"
                        type={showKey ? 'text' : 'password'}
                        value={local.apiKey}
                        onChange={e => set('apiKey', e.target.value)}
                        placeholder={provider.keyPlaceholder}
                        spellCheck={false}
                      />
                      <button className="ai-key-toggle" onClick={() => setShowKey(s => !s)}>
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <span className="ai-settings-hint">Stored in localStorage, never sent anywhere except the AI provider.</span>
                  </div>
                </>
              )}

              {testResult && (
                <div className={`ai-test-result ${testResult.ok ? 'ok' : 'err'}`}>
                  {testResult.ok ? <Check size={14} /> : <AlertCircle size={14} />}
                  {testResult.msg}
                </div>
              )}
            </>
          )}

          {tab === 'mcp' && (
            <>
              <div className="ai-settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="ai-settings-label" style={{ marginBottom: 0 }}>Connected Servers</label>
                  <button className="ai-mcp-add-btn" onClick={addServer}><Plus size={12} /> Add Server</button>
                </div>
                <p className="ai-settings-hint" style={{ marginBottom: '12px' }}>
                  Connect backend MCP servers so the AI reads your API schemas and data models when generating UI.
                </p>

                {servers.length === 0 && (
                  <div className="ai-mcp-empty">
                    <Server size={22} />
                    <span>No servers connected yet.</span>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>Add your exported MCP server or any backend MCP endpoint.</span>
                  </div>
                )}

                {servers.map(server => (
                  <div key={server.id} className={`ai-mcp-server-card${server.enabled ? '' : ' disabled'}`}>
                    <div className="ai-mcp-server-row">
                      <input
                        className="ai-settings-input ai-mcp-label-input"
                        value={server.label}
                        onChange={e => updateServer(server.id, 'label', e.target.value)}
                        placeholder="Server name (e.g. My Backend)"
                      />
                      <label className="ai-mcp-toggle" title={server.enabled ? 'Disable' : 'Enable'}>
                        <input type="checkbox" checked={server.enabled} onChange={e => updateServer(server.id, 'enabled', e.target.checked)} />
                        <span className="ai-mcp-toggle-track" />
                      </label>
                      <button className="ai-mcp-remove-btn" onClick={() => removeServer(server.id)} title="Remove">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="ai-mcp-transport-tabs">
                      {TRANSPORTS.map(t => (
                        <button
                          key={t.id}
                          className={`ai-mcp-transport-tab${server.transport === t.id ? ' active' : ''}`}
                          onClick={() => updateServer(server.id, 'transport', t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {server.transport === 'http' ? (
                      <input
                        className="ai-settings-input"
                        value={server.url}
                        onChange={e => updateServer(server.id, 'url', e.target.value)}
                        placeholder="http://localhost:3001/mcp"
                      />
                    ) : (
                      <input
                        className="ai-settings-input"
                        value={server.command}
                        onChange={e => updateServer(server.id, 'command', e.target.value)}
                        placeholder="node /path/to/mcp-server/index.js"
                      />
                    )}

                    <div className="ai-mcp-server-footer">
                      <button
                        className="ai-mcp-test-btn"
                        onClick={() => testServer(server)}
                        disabled={testingServer === server.id || !(server.transport === 'http' ? server.url : server.command)}
                      >
                        {testingServer === server.id ? 'Testing…' : <><Wifi size={11} /> Test connection</>}
                      </button>
                      {serverTestResults[server.id] && (
                        <span className={`ai-mcp-test-result${serverTestResults[server.id].ok ? ' ok' : ' err'}`}>
                          {serverTestResults[server.id].ok
                            ? <><Check size={11} /> {serverTestResults[server.id].msg}</>
                            : <><WifiOff size={11} /> {serverTestResults[server.id].msg}</>}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="openui-modal-footer">
          {tab === 'ai' ? (
            <>
              <button
                className="ai-settings-btn-ghost"
                onClick={local.provider === 'local' ? fetchLocalModels : testConnection}
                disabled={local.provider === 'local' ? (!local.baseUrl || fetchingModels) : (!local.apiKey || testing)}
              >
                {local.provider === 'local'
                  ? (fetchingModels ? 'Connecting…' : <><Zap size={12} /> Test &amp; Fetch Models</>)
                  : (testing ? 'Testing…' : 'Test Connection')}
              </button>
              <button
                className="ai-settings-btn-primary"
                onClick={save}
                disabled={local.provider === 'local' ? (!local.baseUrl?.trim() || !local.model?.trim()) : !local.apiKey}
              >
                Save &amp; Apply
              </button>
            </>
          ) : (
            <button className="ai-settings-btn-primary" onClick={onClose}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
