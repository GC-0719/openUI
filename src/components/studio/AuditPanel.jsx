import { useState, useCallback } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Info, Copy, Check, FileCode } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { callAI, buildAuditPrompt } from '../../services/aiService';
import { componentsMeta } from '../../data/components-meta.js';

const SEVERITY_ICON = {
  error: <AlertCircle size={13} style={{ color: '#f87171', flexShrink: 0 }} />,
  warning: <AlertTriangle size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />,
  info: <Info size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />,
};

const SEVERITY_CLASS = { error: 'audit-violation-error', warning: 'audit-violation-warning', info: 'audit-violation-info' };

const COMPONENTS_META = componentsMeta.map(c => ({ id: c.id, name: c.name }));

const SAMPLE = `// Paste any JSX here to audit it against your design system
function Example() {
  return (
    <div>
      <button style={{ background: "#6366F1", color: "#fff" }}>
        Save Changes
      </button>
      <input type="text" placeholder="Search..." />
      <span style={{ fontSize: "12px", color: "#999" }}>
        3 items selected
      </span>
    </div>
  );
}`;

const AuditPanel = () => {
  const { settings, kit } = useAI();
  const [code, setCode] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const runAudit = useCallback(async () => {
    if (!code.trim()) return;
    if (!settings.apiKey) { setError('Configure an AI provider in Settings first.'); return; }
    setAuditing(true);
    setError('');
    setResult(null);
    try {
      const systemPrompt = buildAuditPrompt(code, {
        components: COMPONENTS_META,
        kitPrefix: kit.kitPrefix,
      });
      const text = await callAI({
        ...settings,
        messages: [{ role: 'user', content: 'Audit the code provided in the system prompt.' }],
        systemPrompt,
      });
      const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      setResult(JSON.parse(clean));
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditing(false);
    }
  }, [code, settings, kit]);

  const applyFixes = useCallback(() => {
    if (!result?.violations?.length) return;
    const lines = code.split('\n');
    const fixes = result.violations
      .filter(v => v.suggestion && v.line)
      .sort((a, b) => b.line - a.line);
    for (const v of fixes) {
      const idx = v.line - 1;
      if (idx >= 0 && idx < lines.length) {
        lines[idx] = `  {/* FIX: ${v.suggestion} */}`;
      }
    }
    const fixed = lines.join('\n');
    setCode(fixed);
    navigator.clipboard.writeText(fixed).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, result]);

  return (
    <div className="audit-layout">
      {/* Left: Input */}
      <div className="audit-left">
        <div className="audit-left-header">
          <ShieldCheck size={14} style={{ color: '#34d399' }} />
          <span className="audit-title">Design System Audit</span>
          {!settings.apiKey && (
            <span className="audit-no-key">Configure AI in Settings ↗</span>
          )}
        </div>
        <div className="audit-editor-wrap">
          <textarea
            className="audit-textarea-full"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={SAMPLE}
            spellCheck={false}
            disabled={auditing}
          />
        </div>
        <div className="audit-footer">
          <span className="audit-hint">Paste any JSX — AI checks it against {kit.kitName} rules</span>
          <button
            className="audit-run-btn"
            onClick={runAudit}
            disabled={auditing || !code.trim() || !settings.apiKey}
          >
            {auditing
              ? <><span className="ai-thinking-dots"><span /><span /><span /></span> Auditing…</>
              : <><ShieldCheck size={13} /> Audit</>}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="audit-right">
        {!result && !error && (
          <div className="audit-right-empty">
            <FileCode size={32} opacity={0.2} />
            <span>Audit results will appear here</span>
          </div>
        )}

        {error && (
          <div className="audit-error-card">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {result && (
          <>
            <div className="audit-results-header">
              <span className={`audit-summary-badge ${result.violations?.length === 0 ? 'clean' : ''}`}>
                {result.summary}
              </span>
              {result.violations?.length > 0 && (
                <button className="audit-fix-btn" onClick={applyFixes}>
                  {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy fixed</>}
                </button>
              )}
            </div>

            {result.violations?.length === 0 ? (
              <div className="audit-clean">
                <Check size={16} style={{ color: '#34d399' }} />
                <span>No violations — code follows the design system</span>
              </div>
            ) : (
              <div className="audit-violations-list">
                {result.violations.map((v, i) => (
                  <div key={i} className={`audit-violation ${SEVERITY_CLASS[v.severity] || ''}`}>
                    <div className="audit-violation-header">
                      {SEVERITY_ICON[v.severity] || SEVERITY_ICON.info}
                      <code className="audit-violation-element">{v.element}</code>
                      {v.line && <span className="audit-violation-line">line {v.line}</span>}
                    </div>
                    <div className="audit-violation-msg">{v.message}</div>
                    {v.suggestion && (
                      <pre className="audit-suggestion">{v.suggestion}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditPanel;
