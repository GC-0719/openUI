import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Settings, RotateCcw, FileCode, Layers, Sparkles, Undo2, Database } from 'lucide-react';
import { useAI, AI_PROVIDERS } from '../../context/AIContext';
import { callAI, buildAgentPrompt, buildAskPrompt, buildPlanPrompt, parseAgentResponse } from '../../services/aiService';
import { fetchMCPContext, formatMCPContext } from '../../services/mcpClientService';
import { componentsMeta } from '../../data/components-meta.js';

const COMPONENTS_META = componentsMeta.map(c => ({ id: c.id, name: c.name }));

const SUGGESTIONS = [
  'Create a user management dashboard with stats and a data table',
  'Build a settings page with profile, notifications, and security sections',
  'Make an analytics dashboard with KPI cards and charts',
  'Create a sign-in form with email, password, and social login',
  'Build a pricing page with three plan cards and a feature comparison',
];

const WELCOME = `Hi! I'm openUI Agent.\n\nDescribe any UI you want and I'll build it — pages, components, or both. I can create multiple pages in one go and edit existing files.\n\nWhat would you like to build?`;

const renderText = (text) =>
  text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={j}>{seg.slice(2, -2)}</strong>;
      if (seg.startsWith('`') && seg.endsWith('`')) return <code key={j} className="ai-inline-code">{seg.slice(1, -1)}</code>;
      return seg;
    });
    return <React.Fragment key={i}>{parts}{i < arr.length - 1 && <br />}</React.Fragment>;
  });

const FileChangeBadge = ({ changes, onNavigate }) => {
  if (!changes?.fileChanges) return null;
  const entries = Object.entries(changes.fileChanges);
  const pages = entries.filter(([p]) => p.includes('/pages/'));
  const comps = entries.filter(([p]) => p.includes('/components/'));

  return (
    <div className="agent-file-badges">
      {pages.map(([path]) => {
        const name = path.split('/').pop().replace(/\.jsx$/, '');
        return (
          <button key={path} className="agent-file-badge agent-file-badge-page" onClick={() => onNavigate?.(name)}>
            <Layers size={10} /> {name}
          </button>
        );
      })}
      {comps.map(([path]) => (
        <span key={path} className="agent-file-badge agent-file-badge-comp">
          <FileCode size={10} /> {path.split('/').pop().replace(/\.jsx$/, '')}
        </span>
      ))}
    </div>
  );
};

const AIAgent = ({ framework = 'react', onFilesWritten, onNavigatePage, onOpenSettings, activeFilePath, activeFileContent, onUndo, canUndo, workspaceRefreshKey = 0 }) => {
  const { settings, kit, specs, mcpServers } = useAI();
  const [messages, setMessages] = useState([{ role: 'assistant', text: WELCOME, changes: null }]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('edit'); // 'ask' | 'plan' | 'edit'
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [error, setError] = useState('');
  const [mcpContext, setMcpContext] = useState('');
  const [mcpData, setMcpData] = useState([]); // structured serverContexts for the UI panel
  const [mcpLoading, setMcpLoading] = useState(false);
  const [showBackend, setShowBackend] = useState(false);
  const [workspaceCtx, setWorkspaceCtx] = useState({ tree: [], barrel: '', routes: [], navFile: null, pageFiles: {} });
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const enabled = (mcpServers || []).filter(s => s.enabled);
    if (!enabled.length) { setMcpContext(''); setMcpData([]); return; }
    setMcpLoading(true);
    fetchMCPContext(enabled)
      .then(r => { setMcpData(r); setMcpContext(formatMCPContext(r)); })
      .catch(() => {})
      .finally(() => setMcpLoading(false));
  }, [mcpServers]);

  const parseWorkspaceData = (data, fw) => {
    const files = data.files || {};
    const tree = Object.keys(files);
    const barrelKey = fw === 'angular' ? 'src/components/ui/index.ts' : 'src/components/ui/index.jsx';
    // Keep content of every page file so the agent can read and update them
    const pageFiles = Object.fromEntries(
      Object.entries(files).filter(([p]) =>
        fw === 'angular'
          ? p.includes('/app/') && p.endsWith('.ts')
          : p.startsWith('src/pages/') && p.endsWith('.jsx')
      )
    );
    return { tree, barrel: files[barrelKey] || '', routes: data.routes || [], navFile: data.navFile || null, pageFiles };
  };

  useEffect(() => {
    setWorkspaceCtx({ tree: [], barrel: '', routes: [], navFile: null, pageFiles: {} });
    setMessages([{ role: 'assistant', text: WELCOME, changes: null }]);
    fetch(`/api/workspace-context?kit=${framework}`)
      .then(r => r.json())
      .then(data => setWorkspaceCtx(parseWorkspaceData(data, framework)))
      .catch(() => {});
  }, [framework]);

  // Re-fetch workspace context after any file write so the next message
  // includes new components/pages in the tree and updated barrel exports.
  useEffect(() => {
    if (workspaceRefreshKey === 0) return;
    fetch(`/api/workspace-context?kit=${framework}`)
      .then(r => r.json())
      .then(data => setWorkspaceCtx(parseWorkspaceData(data, framework)))
      .catch(() => {});
  }, [workspaceRefreshKey, framework]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const configured = settings.provider === 'local'
      ? Boolean(settings.baseUrl?.trim() && settings.model?.trim())
      : Boolean(settings.apiKey?.trim());
    if (!input.trim() || loading || !configured) return;
    const userMsg = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Drop leading assistant messages (the welcome banner) — local LLMs require
      // the conversation to start with a user turn.
      const rawHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
      const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
      const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

      const ctxArgs = {
        components: COMPONENTS_META,
        kitPrefix: kit.kitPrefix,
        kitName: kit.kitName,
        specs,
        mcpContext,
        activeFilePath,
        activeFileContent,
        framework,
        workspaceTree: workspaceCtx.tree,
        barrelContent: workspaceCtx.barrel,
        existingRoutes: workspaceCtx.routes,
        navFile: workspaceCtx.navFile,
        pageFiles: workspaceCtx.pageFiles,
      };

      const systemPrompt =
        mode === 'ask'  ? buildAskPrompt(ctxArgs) :
        mode === 'plan' ? buildPlanPrompt(ctxArgs) :
        buildAgentPrompt(ctxArgs);

      const isEditMode = mode === 'edit';
      const MAX_AUTO_FIX = 2;
      let conversationTail = [...history, { role: 'user', content: userMsg }];
      let finalMessage = '';
      let finalChanges = null;
      let autoFixCount = 0;

       
      while (true) {
        const rawText = await callAI({ ...settings, systemPrompt, messages: conversationTail });

        if (!isEditMode) {
          finalMessage = rawText.replace(/```[\s\S]*?```\n?/g, '').trim() || rawText;
          break;
        }

        const { files, message, errors: structuralWarnings } = parseAgentResponse(rawText);
        const paths = Object.keys(files);

        if (paths.length > 0) {
          // Check for kit-component violations BEFORE writing the file.
          // This catches raw <button>/<input> etc. without needing a Vite round-trip.
          const kitViolations = structuralWarnings.filter(w => w.startsWith('KIT_VIOLATION:'));
          if (kitViolations.length > 0 && autoFixCount < MAX_AUTO_FIX) {
            autoFixCount++;
            setAutoFixing(true);
            const violationDetail = kitViolations.join('\n');
            const filePreview = paths.map(p => `\`\`\`jsx\n${(files[p] || '').slice(0, 800)}\n\`\`\``).join('\n');
            setMessages(prev => [...prev, {
              role: 'assistant',
              text: `⟳ Fixing component usage (attempt ${autoFixCount})…`,
              changes: null,
              mode,
            }]);
            conversationTail = [
              ...conversationTail,
              { role: 'assistant', content: rawText },
              { role: 'user', content: `Your code uses raw HTML elements instead of the design system kit components. You must rewrite it.\n\n${violationDetail}\n\nYour current code:\n${filePreview}\n\nReplace EVERY raw element with the kit equivalent. The only import allowed is:\nimport { Button, Input, Card, Badge, Avatar, ... } from '../components/ui';\n\nOutput ONLY the corrected \`\`\`jsx:path\`\`\` block.` },
            ];
            continue;
          }

          const result = await onFilesWritten?.(files);
          const parseErrors = result?.parseErrors ?? [];

          if (parseErrors.length > 0 && autoFixCount < MAX_AUTO_FIX) {
            autoFixCount++;
            setAutoFixing(true);
            const errSummary = parseErrors.map(e => {
              const fileContent = files[e.path] || '';
              return `File: ${e.path.split('/').pop()}\nError: ${e.error}\nYour code:\n\`\`\`jsx\n${fileContent.slice(0, 1500)}\n\`\`\``;
            }).join('\n\n');
            setMessages(prev => [...prev, {
              role: 'assistant',
              text: `⟳ Auto-fixing syntax error (attempt ${autoFixCount})…`,
              changes: null,
              mode,
            }]);
            conversationTail = [
              ...conversationTail,
              { role: 'assistant', content: rawText },
              { role: 'user', content: `Your file has a React/JSX syntax error and cannot be parsed. Fix it:\n\n${errSummary}\n\nRules:\n- JSX files MUST NOT contain <script> or <style> HTML tags\n- Every string value needs matching quotes: 'value' not value' or value\n- No hardcoded hex colors — use var(--primary), var(--text), var(--text-muted)\n- Output ONLY the corrected \`\`\`jsx:path\`\`\` block, nothing else` },
            ];
            continue;
          }

          if (parseErrors.length > 0) {
            // Exhausted retries — warn user
            finalMessage = `⚠ Could not auto-fix the syntax error after ${MAX_AUTO_FIX} attempts. The file was written but may not render. Try a more capable model (GPT-4o, Claude, Gemini Pro) or switch to a larger local model.`;
            finalChanges = { fileChanges: Object.fromEntries(paths.map(p => [p, true])) };
            break;
          }

          finalChanges = { fileChanges: Object.fromEntries(paths.map(p => [p, true])) };
          finalMessage = message || `Updated ${paths.map(p => p.split('/').pop()).join(', ')}.`;
        } else {
          finalMessage = message || rawText;
        }
        break;
      }

      if (!finalMessage) finalMessage = '…';
      setAutoFixing(false);
      setMessages(prev => [...prev, { role: 'assistant', text: finalMessage, changes: finalChanges, mode }]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
  };

  const clearConversation = () => {
    setMessages([{ role: 'assistant', text: WELCOME, changes: null }]);
    setError('');
  };

  const enabledMCP = (mcpServers || []).filter(s => s.enabled).length;
  const isConfigured = settings.provider === 'local'
    ? Boolean(settings.baseUrl?.trim() && settings.model?.trim())
    : Boolean(settings.apiKey?.trim());

  return (
    <div className="ai-agent-panel">
      {/* Header */}
      <div className="ai-agent-header">
        <div className="ai-agent-title">
          <span className="ai-prism-logo">◆</span>
          <span>openUI Agent</span>
          {enabledMCP > 0 && (
            <button
              className={`ai-mcp-indicator${showBackend ? ' active' : ''}`}
              onClick={() => setShowBackend(v => !v)}
              title="Show connected backend (MCP) context"
            >
              <span className="ai-mcp-indicator-dot" />
              {enabledMCP} MCP
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {messages.length > 1 && (
            <button className="ai-header-btn" onClick={clearConversation} title="Clear conversation">
              <RotateCcw size={13} />
            </button>
          )}
          <button className="ai-header-btn" onClick={() => onOpenSettings?.('ai')} title="AI Settings">
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* Provider badge */}
      {isConfigured && (
        <div className="ai-provider-badge">
          <span className="ai-provider-dot" />
          {AI_PROVIDERS[settings.provider]?.logo ?? '◆'}{' '}
          {settings.model.split('-').slice(0, 3).join(' ')}
        </div>
      )}

      {/* Backend (MCP) context — what the agent can build against */}
      {showBackend && enabledMCP > 0 && (
        <div className="ai-backend-panel">
          <div className="ai-backend-title"><Database size={12} /> Backend context</div>
          {(mcpServers || []).filter(s => s.enabled).map(s => {
            const ctx = mcpData.find(d => d.serverLabel === s.label);
            const status = mcpLoading ? 'connecting' : ctx ? 'connected' : 'unreachable';
            return (
              <div key={s.label} className="ai-backend-server">
                <div className="ai-backend-server-head">
                  <span className={`ai-backend-dot ${status}`} />
                  <strong>{s.label}</strong>
                  <span className="ai-backend-status">
                    {mcpLoading ? 'connecting…' : ctx ? `${ctx.tools.length} tools` : 'unreachable'}
                  </span>
                </div>
                {ctx && ctx.tools.length > 0 && (
                  <ul className="ai-backend-tools">
                    {ctx.tools.map(t => {
                      const params = Object.keys(t.inputSchema?.properties || {}).join(', ');
                      return (
                        <li key={t.name} title={t.description || ''}>
                          <code>{t.name}({params})</code>
                          {t.data != null && <span className="ai-backend-live">live data</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
          <div className="ai-backend-hint">The agent uses these tools, field names, and live data to build matching UI.</div>
        </div>
      )}

      {/* Messages */}
      <div className="ai-agent-messages">
        {!isConfigured ? (
          <div className="ai-configure-prompt">
            <div className="ai-configure-icon"><Sparkles size={20} /></div>
            <p className="ai-configure-title">Connect an AI model</p>
            <p className="ai-configure-desc">Add your API key to start building with openUI Agent.</p>
            <button className="ai-configure-btn" onClick={() => onOpenSettings?.('ai')}>
              <Settings size={14} /> Configure AI
            </button>
          </div>
        ) : (
          <>
            {(() => {
              // Index of the last assistant message that made file changes
              const lastChangedIdx = messages.reduce((acc, m, i) => m.changes ? i : acc, -1);
              return messages.map((msg, i) =>
                msg.role === 'assistant' ? (
                  <div key={i} className="ai-msg ai-msg-assistant">
                    <div className="ai-msg-label">
                      <span className="ai-msg-label-prism">◆</span>
                      <span className="ai-msg-label-name">openUI Agent</span>
                    </div>
                    <div className="ai-msg-body">{renderText(msg.text)}</div>
                    <FileChangeBadge changes={msg.changes} onNavigate={onNavigatePage} />
                    {msg.changes && i === lastChangedIdx && canUndo && (
                      <button className="agent-undo-btn" onClick={onUndo} title="Undo these changes">
                        <Undo2 size={11} /> Undo changes
                      </button>
                    )}
                  </div>
              ) : (
                <div key={i} className="ai-msg ai-msg-user">
                  <div className="ai-user-bubble">{msg.text}</div>
                </div>
              )
            );
            })()}

            {messages.length === 1 && !input && (
              <div className="ai-quick-actions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="ai-quick-action" onClick={() => setInput(s)}>{s}</button>
                ))}
              </div>
            )}

            {loading && (
              <div className="ai-msg ai-msg-thinking">
                <div className="ai-msg-label">
                  <span className="ai-msg-label-prism">◆</span>
                  <span className="ai-msg-label-name">openUI Agent</span>
                </div>
                <div className="ai-thinking-row">
                  <span className="ai-thinking-text">{autoFixing ? 'Auto-fixing' : mode === 'ask' ? 'Thinking' : mode === 'plan' ? 'Planning' : 'Building'}</span>
                  <div className="ai-thinking-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}

            {error && <div className="ai-error-banner">⚠ {error}</div>}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      {isConfigured && (
        <div className="ai-composer">
          {/* Mode selector */}
          <div className="ai-mode-bar">
            {[
              { id: 'ask',  label: 'Ask',  title: 'Get answers and explanations — no file changes' },
              { id: 'plan', label: 'Plan', title: 'Outline an implementation plan — no file changes' },
              { id: 'edit', label: 'Edit', title: 'Create, update, or delete files in the workspace' },
            ].map(({ id, label, title }) => (
              <button
                key={id}
                className={`ai-mode-btn${mode === id ? ' active' : ''}`}
                onClick={() => setMode(id)}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ai-composer-card">
            <textarea
              ref={textareaRef}
              className="ai-composer-input"
              placeholder={
                mode === 'ask'  ? 'Ask anything about the design system…' :
                mode === 'plan' ? 'Describe what you want to plan…' :
                activeFilePath  ? `Describe changes to ${activeFilePath.split('/').pop()} or build something new…`
                                : 'Describe what you want to build…'
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
            />
            <div className="ai-composer-actions">
              <button className="ai-composer-send" onClick={send} disabled={!input.trim() || loading}>
                <ArrowUp size={13} />
              </button>
            </div>
          </div>
          <div className="ai-composer-hint">⌘↵ to send · Shift+↵ for new line</div>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
