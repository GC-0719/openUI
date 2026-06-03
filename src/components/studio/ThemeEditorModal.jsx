import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../context/AIContext';
import { THEME_TOKEN_GROUPS } from '../../data/theme-tokens';
import { syncThemeToWorkspace } from '../../utils/themeSync';

const ThemeEditorModal = ({ framework, onClose, onSynced }) => {
  const { cssVars, componentCSS, applyChanges, removeCssVar, resetTheme } = useTheme();
  const { kit } = useAI();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const debounceRef = useRef(null);

  const pushToWorkspace = useCallback(async (vars, compCss) => {
    setSyncing(true);
    setSyncError('');
    try {
      await syncThemeToWorkspace({
        framework,
        cssVars: vars,
        componentCSS: compCss,
        kitName: kit.kitName,
      });
      onSynced?.();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  }, [framework, kit.kitName, onSynced]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushToWorkspace(cssVars, componentCSS);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [cssVars, componentCSS, pushToWorkspace]);

  const handleTokenChange = (key, value) => {
    if (!value.trim()) {
      removeCssVar(key);
      return;
    }
    applyChanges({ cssVars: { [key]: value.trim() } });
  };

  const handleReset = async () => {
    resetTheme();
    setSyncError('');
    try {
      await syncThemeToWorkspace({ framework, cssVars: {}, componentCSS: {}, kitName: kit.kitName });
      onSynced?.();
    } catch (err) {
      setSyncError(err.message);
    }
  };

  const overrideCount = Object.keys(cssVars).length;

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="openui-modal theme-editor-modal">
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={15} /> Theme tokens
          </span>
          <button type="button" className="openui-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="openui-modal-body theme-editor-body">
          <p className="theme-editor-intro">
            Overrides apply live in the studio and sync to <code>src/styles/theme-overrides.css</code> in your
            workspace so the preview iframe matches. The AI agent sees your token values in every build.
          </p>

          {THEME_TOKEN_GROUPS.map(group => (
            <section key={group.id} className="theme-editor-group">
              <h3 className="theme-editor-group-title">{group.label}</h3>
              <div className="theme-editor-grid">
                {group.tokens.map(token => {
                  const value = cssVars[token.key] ?? '';
                  const inputId = `theme-${token.key}`;
                  return (
                    <label key={token.key} className="theme-editor-field" htmlFor={inputId}>
                      <span className="theme-editor-label">{token.label}</span>
                      <code className="theme-editor-key">{token.key}</code>
                      <div className="theme-editor-input-row">
                        {token.type === 'color' && (
                          <input
                            type="color"
                            className="theme-editor-color-swatch"
                            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : token.default}
                            onChange={e => handleTokenChange(token.key, e.target.value)}
                            title="Pick color"
                          />
                        )}
                        <input
                          id={inputId}
                          className="ai-settings-input theme-editor-value"
                          value={value}
                          placeholder={token.default}
                          onChange={e => handleTokenChange(token.key, e.target.value)}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="openui-modal-footer theme-editor-footer">
          <span className="theme-editor-status">
            {syncing ? 'Syncing to workspace…' : syncError || `${overrideCount} override${overrideCount !== 1 ? 's' : ''} active`}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="ai-settings-btn secondary" onClick={handleReset}>
              <RotateCcw size={13} /> Reset theme
            </button>
            <button type="button" className="ai-settings-btn primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditorModal;
