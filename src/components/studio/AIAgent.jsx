import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Settings, RotateCcw, FileCode, Layers, Sparkles, Undo2, Database, Brain, Trash2 } from 'lucide-react';
import { useAI, AI_PROVIDERS } from '../../context/AIContext';
import { useTheme } from '../../context/ThemeContext';
import {
  callAI,
  buildAgentPrompt,
  buildAskPrompt,
  buildPlanPrompt,
  buildImplementPlanPrompt,
  parseAgentResponse,
  buildMemoryExtractionPrompt,
} from '../../services/aiService';
import PlanChecklist from './PlanChecklist';
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

// Render a prose run: **bold** and `inline code`.
const renderProse = (text) =>
  text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={j}>{seg.slice(2, -2)}</strong>;
      if (seg.startsWith('`') && seg.endsWith('`')) return <code key={j} className="ai-inline-code">{seg.slice(1, -1)}</code>;
      return seg;
    });
    return <React.Fragment key={i}>{parts}{i < arr.length - 1 && <br />}</React.Fragment>;
  });

// A fenced code block. `lang` may be "jsx" or a path-annotated "jsx:src/pages/Foo.jsx".
const CodeBlock = ({ lang = '', code, streaming = false }) => {
  const path = lang.includes(':') ? lang.slice(lang.indexOf(':') + 1) : '';
  const label = path || lang || 'code';
  return (
    <div className={`ai-code-block${streaming ? ' streaming' : ''}`}>
      <div className="ai-code-block-head">
        <FileCode size={11} />
        <span className="ai-code-block-name">{label}</span>
        {streaming && <span className="ai-code-writing">writing…</span>}
      </div>
      <pre className="ai-code-block-pre"><code>{code}</code></pre>
    </div>
  );
};

// Fence-aware message renderer. Code fences (```lang or ```lang:path) become <pre>
// blocks — so single backticks of template literals INSIDE code are never treated as
// inline code and stripped. An unclosed trailing fence (mid-stream) renders live.
const renderMessage = (text) => {
  if (!text) return null;
  const out = [];
  const fence = /```([\w./:\- ]*)\n([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = fence.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={`p${out.length}`}>{renderProse(text.slice(last, m.index))}</span>);
    out.push(<CodeBlock key={`c${out.length}`} lang={m[1].trim()} code={m[2].replace(/\n$/, '')} />);
    last = fence.lastIndex;
  }
  const tail = text.slice(last);
  const open = tail.match(/```([\w./:\- ]*)\n([\s\S]*)$/);
  if (open) {
    const before = tail.slice(0, open.index);
    if (before.trim()) out.push(<span key={`p${out.length}`}>{renderProse(before)}</span>);
    out.push(<CodeBlock key={`c${out.length}`} lang={open[1].trim()} code={open[2]} streaming />);
  } else if (tail) {
    out.push(<span key={`p${out.length}`}>{renderProse(tail)}</span>);
  }
  return out;
};

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

// Context-window management: keep the most recent turns within a char budget
// (~12K tokens). Durable facts live in long-term memory, so dropping old chat
// is low-loss — and it keeps the cached system-prompt prefix the dominant cost.
const CONTEXT_CHAR_BUDGET = 48000;
function trimForContext(history) {
  const out = [];
  let total = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const len = (history[i].content || '').length;
    if (out.length && total + len > CONTEXT_CHAR_BUDGET) break;
    out.unshift(history[i]);
    total += len;
  }
  return out;
}

const AIAgent = ({ framework = 'react', onFilesWritten, onNavigatePage, onOpenSettings, activeFilePath, activeFileContent, onUndo, canUndo, workspaceRefreshKey = 0 }) => {
  const { settings, kit, specs, mcpServers } = useAI();
  const { cssVars, componentCSS } = useTheme();
  const [messages, setMessages] = useState([{ role: 'assistant', text: WELCOME, changes: null }]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('edit'); // 'ask' | 'plan' | 'edit'
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [autoFixing, setAutoFixing] = useState(false);
  const [error, setError] = useState('');
  const [mcpContext, setMcpContext] = useState('');
  const [mcpData, setMcpData] = useState([]); // structured serverContexts for the UI panel
  const [mcpLoading, setMcpLoading] = useState(false);
  const [showBackend, setShowBackend] = useState(false);
  const [workspaceCtx, setWorkspaceCtx] = useState({ tree: [], barrel: '', routes: [], navFile: null, pageFiles: {} });
  const [memory, setMemory] = useState({ facts: [], updatedAt: null });
  const [showMemory, setShowMemory] = useState(false);
  const [contextWarning, setContextWarning] = useState('');
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const historyKitRef = useRef(framework); // which framework the current `messages` belong to

  const chatKey = (fw) => `openui:chat:${fw}`;

  useEffect(() => {
    const enabled = (mcpServers || []).filter(s => s.enabled);
    if (!enabled.length) { setMcpContext(''); setMcpData([]); return; }
    setMcpLoading(true);
    fetchMCPContext(enabled)
      .then(r => { setMcpData(r); setMcpContext(formatMCPContext(r)); setContextWarning(''); })
      .catch(() => setContextWarning('Could not reach one or more MCP servers'))
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

  // Persist chat history per framework so it survives reloads. Guarded by a ref
  // so a framework switch doesn't write the outgoing conversation under the new
  // key before the load effect runs. (Defined BEFORE the load effect so on a
  // switch it sees the stale ref and skips, then the load effect updates the ref.)
  useEffect(() => {
    if (historyKitRef.current !== framework) return;
    try {
      if (messages.length > 1) localStorage.setItem(chatKey(framework), JSON.stringify(messages.slice(-80)));
      else localStorage.removeItem(chatKey(framework));
    } catch { /* ignore quota errors */ }
  }, [messages, framework]);

  // On framework change / mount: load persisted history + memory + workspace context.
  useEffect(() => {
    historyKitRef.current = framework;
    setWorkspaceCtx({ tree: [], barrel: '', routes: [], navFile: null, pageFiles: {} });
    let saved = null;
    try { const s = localStorage.getItem(chatKey(framework)); if (s) saved = JSON.parse(s); } catch { /* ignore bad JSON */ }
    setMessages(saved && saved.length ? saved : [{ role: 'assistant', text: WELCOME, changes: null }]);
    setContextWarning('');
    fetch(`/api/agent-memory?kit=${framework}`)
      .then(r => {
        if (!r.ok) throw new Error('memory');
        return r.json();
      })
      .then(d => setMemory(d && Array.isArray(d.facts) ? d : { facts: [], updatedAt: null }))
      .catch(() => setContextWarning(prev => prev || 'Could not load agent memory'));
    fetch(`/api/workspace-context?kit=${framework}`)
      .then(r => {
        if (!r.ok) throw new Error('workspace');
        return r.json();
      })
      .then(data => setWorkspaceCtx(parseWorkspaceData(data, framework)))
      .catch(() => setContextWarning(prev => prev || 'Could not load workspace context'));
  }, [framework]);

  // Re-fetch workspace context after any file write so the next message
  // includes new components/pages in the tree and updated barrel exports.
  useEffect(() => {
    if (workspaceRefreshKey === 0) return;
    fetch(`/api/workspace-context?kit=${framework}`)
      .then(r => {
        if (!r.ok) throw new Error('workspace');
        return r.json();
      })
      .then(data => {
        setWorkspaceCtx(parseWorkspaceData(data, framework));
        setContextWarning(prev => (prev === 'Could not load workspace context' ? '' : prev));
      })
      .catch(() => setContextWarning(prev => prev || 'Could not load workspace context'));
  }, [workspaceRefreshKey, framework]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const executeTurn = async (userMsg, { activeMode = mode, implementPlanText = null } = {}) => {
    const configured = settings.provider === 'local'
      ? Boolean(settings.baseUrl?.trim() && settings.model?.trim())
      : Boolean(settings.apiKey?.trim());
    if (!userMsg?.trim() || loading || !configured) return;

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
      const fullHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];
      const history = trimForContext(fullHistory);

      const memoryText = (memory.facts || []).map(f => `- ${f.text}`).join('\n');

      const ctxArgs = {
        components: COMPONENTS_META,
        kitPrefix: kit.kitPrefix,
        kitName: kit.kitName,
        specs,
        mcpContext,
        memory: memoryText,
        activeFilePath,
        activeFileContent,
        framework,
        workspaceTree: workspaceCtx.tree,
        barrelContent: workspaceCtx.barrel,
        existingRoutes: workspaceCtx.routes,
        navFile: workspaceCtx.navFile,
        pageFiles: workspaceCtx.pageFiles,
        cssVars,
        componentCSS,
      };

      const systemPrompt =
        activeMode === 'ask' ? buildAskPrompt(ctxArgs) :
        activeMode === 'plan' ? buildPlanPrompt(ctxArgs) :
        implementPlanText ? buildImplementPlanPrompt({
          planText: implementPlanText,
          kitName: kit.kitName,
          kitPrefix: kit.kitPrefix,
          framework,
          components: COMPONENTS_META,
          specs,
          mcpContext,
          workspaceTree: workspaceCtx.tree,
          cssVars,
          componentCSS,
        }) :
        buildAgentPrompt(ctxArgs);

      const isEditMode = activeMode === 'edit';
      const MAX_AUTO_FIX = 2;
      let conversationTail = [...history, { role: 'user', content: userMsg }];
      let finalMessage = '';
      let finalChanges = null;
      let autoFixCount = 0;
      let builtFiles = null; // files successfully written this turn → feed the memory learner

       
      while (true) {
        setStreamingText('');
        const rawText = await callAI({
          ...settings,
          systemPrompt,
          messages: conversationTail,
          stream: true,
          onToken: (_delta, full) => setStreamingText(full),
        });

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
              mode: activeMode,
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
              mode: activeMode,
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
          builtFiles = files;
        } else {
          finalMessage = message || rawText;
        }
        break;
      }

      if (!finalMessage) finalMessage = '…';
      setStreamingText('');
      setAutoFixing(false);
      setMessages(prev => [...prev, { role: 'assistant', text: finalMessage, changes: finalChanges, mode: activeMode }]);

      // Learn from a successful build — fire-and-forget so it never blocks the UI.
      if (isEditMode && builtFiles) learnFromBuild(userMsg, builtFiles);
    } catch (err) {
      setError(err.message);
      setStreamingText('');
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    await executeTurn(userMsg);
  };

  const buildFromPlan = async (planText) => {
    setMode('edit');
    await executeTurn(
      'Implement the approved plan above. Complete every checklist item.',
      { activeMode: 'edit', implementPlanText: planText },
    );
  };

  // The "training" loop: after a successful build, ask the model for up to 3
  // durable facts and append them to long-term memory (deduped + capped server-side).
  const learnFromBuild = async (userMsg, files) => {
    try {
      const summary = Object.keys(files)
        .map(p => `${p}:\n${(files[p] || '').slice(0, 500)}`)
        .join('\n\n')
        .slice(0, 6000);
      const raw = await callAI({
        ...settings,
        systemPrompt: buildMemoryExtractionPrompt({ kitName: kit.kitName }),
        messages: [{ role: 'user', content: `User request:\n${userMsg}\n\nFiles created/updated:\n${summary}` }],
      });
      const arr = raw.match(/\[[\s\S]*\]/);
      if (!arr) return;
      let facts;
      try { facts = JSON.parse(arr[0]); } catch { return; }
      const clean = (Array.isArray(facts) ? facts : []).filter(f => typeof f === 'string' && f.trim()).slice(0, 3);
      if (!clean.length) return;
      const res = await fetch('/api/agent-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kit: framework, add: clean }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.facts)) setMemory(data);
    } catch { /* best-effort; never disrupt the build */ }
  };

  const forgetMemory = async () => {
    try {
      const res = await fetch(`/api/agent-memory?kit=${framework}`, { method: 'DELETE' });
      const data = await res.json();
      setMemory(data && Array.isArray(data.facts) ? data : { facts: [], updatedAt: null });
    } catch { /* ignore */ }
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
          {memory.facts.length > 0 && (
            <button
              className={`ai-mem-indicator${showMemory ? ' active' : ''}`}
              onClick={() => setShowMemory(v => !v)}
              title="What the agent has learned about this project"
            >
              <Brain size={11} />
              {memory.facts.length} learned
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

      {contextWarning && (
        <div className="ai-context-warning" title={contextWarning}>
          {contextWarning}
        </div>
      )}

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

      {/* Long-term memory — what the agent has learned and applies to every build */}
      {showMemory && memory.facts.length > 0 && (
        <div className="ai-backend-panel">
          <div className="ai-backend-title">
            <Brain size={12} /> Project memory
            <button className="ai-mem-forget" onClick={forgetMemory} title="Forget everything learned">
              <Trash2 size={11} /> Forget all
            </button>
          </div>
          <ul className="ai-mem-list">
            {memory.facts.map((f, i) => (
              <li key={i}>{f.text}</li>
            ))}
          </ul>
          <div className="ai-backend-hint">Learned automatically from your builds. Injected into every request so the agent improves over time.</div>
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
                    <div className="ai-msg-body">{renderMessage(msg.text)}</div>
                    {msg.mode === 'plan' && !loading && (
                      <PlanChecklist
                        planText={msg.text}
                        onBuild={() => buildFromPlan(msg.text)}
                        building={loading}
                      />
                    )}
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

            {loading && streamingText && (
              <div className="ai-msg ai-msg-assistant ai-msg-streaming">
                <div className="ai-msg-label">
                  <span className="ai-msg-label-prism">◆</span>
                  <span className="ai-msg-label-name">openUI Agent</span>
                  <span className="ai-streaming-cursor" />
                </div>
                <div className="ai-msg-body">{renderMessage(streamingText)}</div>
              </div>
            )}

            {loading && !streamingText && (
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
