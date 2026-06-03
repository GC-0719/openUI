import { useState, useCallback, useEffect } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Info, Copy, Check, FileCode, FileInput } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { callAI, buildAuditPrompt, parseAuditResult } from '../../services/aiService';
import { componentsMeta, angularComponentsMeta } from '../../data/components-meta.js';

const SEVERITY_ICON = {
  error: <AlertCircle size={13} style={{ color: '#f87171', flexShrink: 0 }} />,
  warning: <AlertTriangle size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />,
  info: <Info size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />,
};

const SEVERITY_CLASS = { error: 'audit-violation-error', warning: 'audit-violation-warning', info: 'audit-violation-info' };

const SAMPLE_REACT = `// Paste JSX to audit against your kit
function Example() {
  return (
    <div>
      <button style={{ background: "#6366F1", color: "#fff" }}>Save</button>
      <input type="text" placeholder="Search..." />
    </div>
  );
}`;

const SAMPLE_ANGULAR = `// Paste Angular template or component code
@Component({
  template: \`
    <button style="background:#6366F1">Save</button>
    <input type="text" placeholder="Search" />
  \`,
})
export class ExampleComponent {}`;

const AuditPanel = ({ framework = 'react', activeFilePath = null, activeFileContent = null }) => {
  const { settings, kit, isConfigured, specs, specsError } = useAI();
  const [code, setCode] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const componentsList = (framework === 'angular' ? angularComponentsMeta : componentsMeta)
    .map(c => ({ id: c.id, name: c.name }));

  const specCount = Object.keys(specs || {}).filter(k => specs[k]?.purpose).length;

  useEffect(() => {
    queueMicrotask(() => {
      setCode('');
      setResult(null);
      setError('');
    });
  }, [framework]);

  const runAudit = useCallback(async () => {
    if (!code.trim()) return;
    if (!isConfigured) { setError('Configure an AI provider in Settings first.'); return; }
    setAuditing(true);
    setError('');
    setResult(null);
    try {
      const systemPrompt = buildAuditPrompt(code, {
        components: componentsList,
        kitPrefix: kit.kitPrefix,
        kitName: kit.kitName,
        framework,
        specs,
      });
      const text = await callAI({
        ...settings,
        messages: [{ role: 'user', content: 'Audit the code provided in the system prompt.' }],
        systemPrompt,
      });
      setResult(parseAuditResult(text));
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditing(false);
    }
  }, [code, settings, kit, isConfigured, componentsList, framework, specs]);

  const loadOpenFile = useCallback(() => {
    if (!activeFileContent?.trim()) return;
    setCode(activeFileContent);
    setResult(null);
    setError('');
  }, [activeFileContent]);

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

  const sample = framework === 'angular' ? SAMPLE_ANGULAR : SAMPLE_REACT;
  const langLabel = framework === 'angular' ? 'Angular template / TS' : 'JSX';

  return (
    <div className="audit-layout">
      <div className="audit-left">
        <div className="audit-left-header">
          <ShieldCheck size={14} style={{ color: '#34d399' }} />
          <span className="audit-title">Design System Audit</span>
          {!isConfigured && (
            <span className="audit-no-key">Configure AI in Settings ↗</span>
          )}
        </div>
        <div className="audit-meta-row">
          <span className="audit-meta-pill">{framework === 'angular' ? 'Angular' : 'React'}</span>
          {specCount > 0 && (
            <span className="audit-meta-pill audit-meta-specs">{specCount} AI specs loaded</span>
          )}
          {specsError && (
            <span className="audit-meta-pill audit-meta-warn" title={specsError}>Specs unavailable</span>
          )}
        </div>
        <div className="audit-editor-wrap">
          <textarea
            className="audit-textarea-full"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={sample}
            spellCheck={false}
            disabled={auditing}
          />
        </div>
        <div className="audit-footer">
          <div className="audit-footer-actions">
            {activeFilePath && activeFileContent && (
              <button
                type="button"
                className="audit-load-file-btn"
                onClick={loadOpenFile}
                disabled={auditing}
                title={activeFilePath}
              >
                <FileInput size={12} /> Load open file
              </button>
            )}
            <span className="audit-hint">Paste {langLabel} — checked against {kit.kitName} rules</span>
          </div>
          <button
            className="audit-run-btn"
            onClick={runAudit}
            disabled={auditing || !code.trim() || !isConfigured}
          >
            {auditing
              ? <><span className="ai-thinking-dots"><span /><span /><span /></span> Auditing…</>
              : <><ShieldCheck size={13} /> Audit</>}
          </button>
        </div>
      </div>

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
