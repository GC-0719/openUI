import { apiFetch, apiPost } from './api.js';

export function buildThemeOverridesCss(cssVars = {}, componentCSS = {}, kitName = 'openUI') {
  const varRules = Object.entries(cssVars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const cssRules = Object.entries(componentCSS).map(([s, p]) => `${s} { ${p} }`).join('\n');
  if (!varRules && !cssRules) return '';
  return (
    `/* ${kitName} theme overrides — edited in openUI studio */\n` +
    (varRules ? `:root {\n${varRules}\n}\n` : '') +
    (cssRules ? `\n${cssRules}\n` : '')
  );
}

const ENTRY_IMPORT = {
  react: { path: 'src/main.jsx', after: "import './styles/openui.css';", line: "import './styles/theme-overrides.css';" },
  angular: { path: 'src/main.ts', after: "import './styles/openui.css';", line: "import './styles/theme-overrides.css';" },
};

/** Write theme-overrides.css to the kit workspace and ensure the entry file imports it. */
export async function syncThemeToWorkspace({ framework, cssVars, componentCSS, kitName }) {
  const css = buildThemeOverridesCss(cssVars, componentCSS, kitName);
  const kit = framework === 'angular' ? 'angular' : 'react';

  if (!css) {
    try {
      await apiPost('/api/delete-file', { path: 'src/styles/theme-overrides.css', kit });
    } catch {
      /* file may not exist */
    }
    return;
  }

  await apiPost('/api/write-file', {
    path: 'src/styles/theme-overrides.css',
    content: css,
    kit,
  });

  const entry = ENTRY_IMPORT[kit];
  if (!entry) return;

  try {
    const data = await apiFetch(`/api/read-file?path=${encodeURIComponent(entry.path)}&kit=${kit}`);
    let main = data.content || '';
    if (!main.includes(entry.line)) {
      const idx = main.indexOf(entry.after);
      if (idx >= 0) {
        const insertAt = idx + entry.after.length;
        main = `${main.slice(0, insertAt)}\n${entry.line}${main.slice(insertAt)}`;
        await apiPost('/api/write-file', { path: entry.path, content: main, kit });
      }
    }
  } catch {
    /* entry missing — preview may still use studio-injected styles */
  }
}
