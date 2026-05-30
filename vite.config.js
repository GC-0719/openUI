import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// ── Constants ─────────────────────────────────────────────────────────────────
const KITS_DIR          = 'kits';
const REACT_WORKSPACE   = `${KITS_DIR}/react/workspace`;
const REACT_TEMPLATE    = `${KITS_DIR}/react/template`;
const ANGULAR_WORKSPACE = `${KITS_DIR}/angular/workspace`;
const ANGULAR_TEMPLATE  = `${KITS_DIR}/angular/template`;
// Backwards-compat alias used by all API handlers
const WORKSPACE = REACT_WORKSPACE;
const TEMPLATE  = REACT_TEMPLATE;

// ── Helpers ───────────────────────────────────────────────────────────────────
const json = (res, code, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(code);
  res.end(JSON.stringify(data));
};

const readBody = (req) => new Promise(resolve => {
  let b = ''; req.on('data', c => { b += c; }); req.on('end', () => resolve(b));
});

// Parse local LLM response — handles OpenAI JSON, NDJSON, and SSE streaming formats
function parseLocalLLMResponse(rawText) {
  // First try standard single-object JSON
  try {
    const d = JSON.parse(rawText);
    if (d.error) throw new Error(typeof d.error === 'string' ? d.error : d.error.message || JSON.stringify(d.error));
    return d.choices?.[0]?.message?.content ?? d.message?.content ?? '';
  } catch (e) {
    if (!(e instanceof SyntaxError)) throw e; // only suppress JSON parse errors
  }
  // NDJSON / SSE: aggregate content deltas across lines
  let content = '';
  for (const line of rawText.split('\n')) {
    const stripped = line.startsWith('data: ') ? line.slice(6) : line.trim();
    if (!stripped || stripped === '[DONE]') continue;
    try {
      const chunk = JSON.parse(stripped);
      if (chunk.error) throw new Error(typeof chunk.error === 'string' ? chunk.error : chunk.error.message || JSON.stringify(chunk.error));
      content += chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content ?? chunk.message?.content ?? '';
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }
  }
  if (!content) throw new Error(`Local LLM returned unexpected format: ${rawText.slice(0, 300)}`);
  return content;
}

function copyPath(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copyPath(path.join(src, f), path.join(dest, f));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// srcRoot = .../src, destRoot = .../kit-templates/react/src
function copyWorkspaceFiles(srcRoot, destRoot) {
  for (const rel of ['components/ui', 'pages/Dashboard.jsx', 'styles/lumina.css', 'styles/demo.css']) {
    copyPath(path.join(srcRoot, rel), path.join(destRoot, rel));
  }
}

const WORKSPACE_APP = `import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { ToastProvider } from './components/ui';

// Agent-created pages live in src/pages/<Name>.jsx and are reachable at #/ai/<Name>
// via this dynamic loader — no manual route registration needed.
function AIDynamicPage() {
  const { page } = useParams();
  const [Comp, setComp] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setComp(null); setErr(null);
    import(/* @vite-ignore */ \`./pages/\${page}.jsx\`)
      .then(m => {
        if (!m.default) throw new Error(\`"\${page}.jsx" has no default export\`);
        setComp(() => m.default);
      })
      .catch(e => setErr(e.message));
  }, [page]);

  if (err) return (
    <div style={{ padding: 24, color: '#EF4444', fontFamily: 'monospace', fontSize: 13, background: 'var(--bg)', minHeight: '100vh' }}>
      ⚠ {err}
    </div>
  );
  if (!Comp) return (
    <div style={{ padding: 24, color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'var(--bg)' }}>
      Loading…
    </div>
  );
  return <Comp />;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/ai/:page" element={<AIDynamicPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
`;

const WORKSPACE_MAIN = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/lumina.css';
import './styles/demo.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
`;

function setupTemplate(cwd) {
  const dest = path.join(cwd, TEMPLATE);
  if (fs.existsSync(dest)) return; // already exists, never overwrite
  console.log('[lumina] Initialising kits/react/template…');
  const destSrc = path.join(dest, 'src');
  copyWorkspaceFiles(path.join(cwd, 'src'), destSrc);
  fs.writeFileSync(path.join(destSrc, 'App.jsx'), WORKSPACE_APP);
  fs.writeFileSync(path.join(destSrc, 'main.jsx'), WORKSPACE_MAIN);
}

function setupWorkspace(cwd) {
  const dest = path.join(cwd, REACT_WORKSPACE);
  if (fs.existsSync(dest)) return;
  console.log('[lumina] Initialising kits/react/workspace from template…');
  copyPath(path.join(cwd, REACT_TEMPLATE), dest);
}

function setupAngularWorkspace(cwd) {
  const dest = path.join(cwd, ANGULAR_WORKSPACE);
  if (fs.existsSync(dest)) return;
  const tmpl = path.join(cwd, ANGULAR_TEMPLATE);
  if (!fs.existsSync(tmpl)) return;
  console.log('[lumina] Initialising kits/angular/workspace from template…');
  copyPath(tmpl, dest);
}

// ── MCP Export Helpers ────────────────────────────────────────────────────────
function parseComponentProps(fileContent) {
  const match = fileContent.match(/(?:const\s+\w+\s*=\s*)?\(\s*\{([^}]{0,800})\}/);
  if (!match) return {};
  const propStr = match[1];
  const props = {};
  const entries = propStr.split(',').map(s => s.trim()).filter(Boolean);
  for (const entry of entries) {
    const eqMatch = entry.match(/^(\w+)\s*=\s*['"`]?([^'"`\n,]*)['"`]?/);
    if (eqMatch) {
      const [, name, def] = eqMatch;
      const val = def.trim().replace(/['"` ]/g, '');
      const isNum = !isNaN(val) && val !== '';
      const isBool = val === 'true' || val === 'false';
      props[name] = { type: isBool ? 'boolean' : isNum ? 'number' : 'string', default: isBool ? val === 'true' : isNum ? Number(val) : val };
    } else {
      const nameMatch = entry.match(/^(\w+)/);
      if (nameMatch && nameMatch[1] !== 'children') {
        props[nameMatch[1]] = { type: 'any' };
      }
    }
  }
  return props;
}

function generateKitData(wsRoot, specsPath, kitName, kitPrefix) {
  const specs = fs.existsSync(specsPath) ? JSON.parse(fs.readFileSync(specsPath, 'utf-8')) : {};
  const compDir = path.join(wsRoot, 'src/components/ui');
  const components = [];

  const COMPONENT_NAMES = [
    'Accordion','Alert','Avatar','Badge','Breadcrumbs','Button','Card',
    'Checkbox','Chip','Drawer','Dropdown','Input','List','Modal',
    'Navbar','NavItem','Progress','Radio','Skeleton','Switch',
    'Table','Tabs','Toast','Tooltip',
  ];

  for (const name of COMPONENT_NAMES) {
    const filePath = path.join(compDir, `${name}.jsx`);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const id = name.toLowerCase();
    const props = parseComponentProps(content);

    const cssClassMatch = content.matchAll(/className[=`{['"]*[`'"]([a-z0-9-_\s]+)[`'"]/g);
    const cssClasses = [...new Set([...cssClassMatch].map(m => m[1].trim().split(/\s+/)).flat()
      .filter(c => c.startsWith(kitPrefix + '-')))];

    const spec = specs[id] || {};
    const description = spec.purpose || `${name} component`;
    const examples = (spec.patterns || []).slice(0, 3).map(p => ({
      name: p.name || 'Example',
      code: `<${name} ${Object.entries(p.props || {}).map(([k,v]) => `${k}="${v}"`).join(' ')}>${p.name || name}</${name}>`,
    }));

    components.push({ id, name, description, cssClasses, props, examples, aiSpec: spec });
  }

  const cssPath = path.join(wsRoot, 'src/styles/lumina.css');
  const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';
  const cssVarEntries = [...cssContent.matchAll(/--([a-z][a-z0-9-]*):\s*([^;]+);/g)];
  const cssVariables = {};
  for (const [, k, v] of cssVarEntries) cssVariables[`--${k}`] = v.trim();

  return { kitName, kitPrefix, components, cssVariables };
}

function generateMCPServer(kitData) {
  const dataJson = JSON.stringify(kitData, null, 2);
  // Build compact component reference for the AI prompt (baked into generated file)
  const compactRef = kitData.components.map(c => {
    const propList = Object.entries(c.props || {}).map(([k, v]) =>
      v.default !== undefined ? `${k}="${v.default}"` : k
    ).join(', ');
    const useWhen = c.aiSpec?.useWhen?.slice(0, 2).join('; ') || '';
    return `${c.name}(${propList}) — ${c.aiSpec?.purpose || c.description}${useWhen ? ` | use for: ${useWhen}` : ''}`;
  }).join('\n');

  return `#!/usr/bin/env node
// ${kitData.kitName} MCP Server — generated by Lumina
// Exposes your design system to Claude Desktop, Claude Code, and any MCP client

const https = require('https');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const KIT_DATA = ${dataJson};

// ── AI helper (ANTHROPIC_API_KEY or LUMINA_AI_KEY) ─────────────────────────
function callAnthropicAPI(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.LUMINA_AI_KEY;
    if (!apiKey) { reject(new Error('no_key')); return; }
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).content?.[0]?.text || ''); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractCodeBlock(text) {
  const m = text.match(/\`\`\`(?:jsx?|tsx?)\\n([\\s\\S]*?)\`\`\`/);
  return m ? m[1].trim() : text.trim();
}

// ── HTML → kit component rules for validate_code ──────────────────────────
const HTML_TO_KIT = [
  { pattern: /<button(?![A-Z])[^>]*>/i,    skip: /Button/,    kit: 'Button',    example: '<Button variant="primary">Label</Button>',          severity: 'error' },
  { pattern: /<input(?![A-Z])[^>]*>/i,     skip: /Input/,     kit: 'Input',     example: '<Input placeholder="Enter value" />',                severity: 'error' },
  { pattern: /<textarea[^>]*>/i,           skip: /Input/,     kit: 'Input',     example: '<Input multiline placeholder="..." />',              severity: 'error' },
  { pattern: /<select[^>]*>/i,             skip: /Dropdown/,  kit: 'Dropdown',  example: '<Dropdown trigger={<Button>Open</Button>}>…</Dropdown>', severity: 'error' },
  { pattern: /<table(?![A-Z])[^>]*>/i,     skip: /Table/,     kit: 'Table',     example: '<Table columns={columns} data={rows} />',             severity: 'error' },
  { pattern: /<ul[^>]*>|<ol[^>]*>/i,       skip: /List/,      kit: 'List',      example: '<List>…</List>',                                      severity: 'warning' },
  { pattern: /<progress[^>]*>/i,           skip: /Progress/,  kit: 'Progress',  example: '<Progress value={75} />',                             severity: 'error' },
  { pattern: /<details[^>]*>/i,            skip: /Accordion/, kit: 'Accordion', example: '<Accordion items={items} />',                         severity: 'warning' },
  { pattern: /className="[^"]*(?:spinner|loading|skeleton)[^"]*"/i, skip: /Skeleton/, kit: 'Skeleton', example: '<Skeleton width={200} height={20} />', severity: 'warning' },
  { pattern: /style=\{?\{[^}]*color\s*:\s*['"]?#[0-9a-fA-F]/i, skip: /var\(--/, kit: 'CSS variable', example: 'color: var(--primary)  or  var(--text-muted)', severity: 'warning' },
  { pattern: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/,               skip: /CSS|var\(|\/\/|\/\*/, kit: 'CSS variable', example: 'var(--primary), var(--text), var(--surface), etc.', severity: 'warning' },
];

const server = new Server(
  { name: '${kitData.kitName.toLowerCase().replace(/\s+/g, '-')}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_components',
      description: 'List all UI components in the ${kitData.kitName} design system with import paths and usage guidance',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_component_api',
      description: 'Get full props schema, CSS classes, examples, and AI spec for a component',
      inputSchema: { type: 'object', properties: { componentId: { type: 'string', description: 'Component ID or name (e.g. "button", "Card")' } }, required: ['componentId'] },
    },
    {
      name: 'get_usage_example',
      description: 'Get the best usage example for a component matching a specific use case',
      inputSchema: { type: 'object', properties: { componentId: { type: 'string' }, useCase: { type: 'string', description: 'Describe the use case, e.g. "delete action", "form submission"' } }, required: ['componentId', 'useCase'] },
    },
    {
      name: 'generate_ui',
      description: 'Generate complete JSX using ${kitData.kitName} components for a described UI. Uses AI when ANTHROPIC_API_KEY is set, otherwise returns a smart scaffold.',
      inputSchema: { type: 'object', properties: { description: { type: 'string', description: 'Describe the UI to build, e.g. "user management dashboard with stats and a table"' }, components: { type: 'array', items: { type: 'string' }, description: 'Optional list of component IDs to use' } }, required: ['description'] },
    },
    {
      name: 'validate_code',
      description: 'Audit JSX/TSX code for design system violations — raw HTML elements, hardcoded colors, missing kit components',
      inputSchema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
    },
    {
      name: 'get_css_variables',
      description: 'Get all CSS design tokens from ${kitData.kitName}. Use these instead of hardcoded values.',
      inputSchema: { type: 'object', properties: { category: { type: 'string', description: 'Optional filter: "color", "radius", "shadow", "transition"' } } },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── list_components ──────────────────────────────────────────────────────
  if (name === 'list_components') {
    const list = KIT_DATA.components.map(c => ({
      id: c.id,
      name: c.name,
      importStatement: \`import { \${c.name} } from './components/ui';\`,
      purpose: c.aiSpec?.purpose || c.description,
      useWhen: c.aiSpec?.useWhen || [],
      avoidWhen: c.aiSpec?.avoidWhen || [],
      defaultProps: c.aiSpec?.defaultProps || {},
    }));
    return { content: [{ type: 'text', text: JSON.stringify(list, null, 2) }] };
  }

  // ── get_component_api ────────────────────────────────────────────────────
  if (name === 'get_component_api') {
    const comp = KIT_DATA.components.find(c =>
      c.id === args.componentId?.toLowerCase() ||
      c.name.toLowerCase() === args.componentId?.toLowerCase()
    );
    if (!comp) return { content: [{ type: 'text', text: \`Component "\${args.componentId}" not found. Call list_components to see available components.\` }] };
    const result = {
      ...comp,
      importStatement: \`import { \${comp.name} } from './components/ui';\`,
    };
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  // ── get_usage_example ────────────────────────────────────────────────────
  if (name === 'get_usage_example') {
    const comp = KIT_DATA.components.find(c =>
      c.id === args.componentId?.toLowerCase() ||
      c.name.toLowerCase() === args.componentId?.toLowerCase()
    );
    if (!comp) return { content: [{ type: 'text', text: \`Component "\${args.componentId}" not found.\` }] };
    const uc = (args.useCase || '').toLowerCase();
    const words = uc.split(/\\s+/);
    const score = (text = '') => words.filter(w => text.toLowerCase().includes(w)).length;
    const pattern = comp.aiSpec?.patterns?.slice().sort((a, b) =>
      score(b.whenToUse) + score(b.name) - score(a.whenToUse) - score(a.name)
    )[0];
    const defaultProps = Object.entries(pattern?.props || comp.aiSpec?.defaultProps || {})
      .map(([k, v]) => \`\${k}="\${v}"\`).join(' ');
    const exampleCode = \`import { \${comp.name} } from './components/ui';

<\${comp.name}\${defaultProps ? ' ' + defaultProps : ''}>\${comp.name}</ \${comp.name}>\`;
    return { content: [{ type: 'text', text: JSON.stringify({
      component: comp.name,
      importStatement: \`import { \${comp.name} } from './components/ui';\`,
      matchedPattern: pattern || null,
      exampleCode,
      aiSpec: comp.aiSpec || null,
    }, null, 2) }] };
  }

  // ── generate_ui ──────────────────────────────────────────────────────────
  if (name === 'generate_ui') {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.LUMINA_AI_KEY;
    const descLower = (args.description || '').toLowerCase();

    // Filter to relevant components based on description keywords
    const relevant = KIT_DATA.components.filter(c => {
      const text = [c.name, c.description, ...(c.aiSpec?.useWhen || [])].join(' ').toLowerCase();
      return descLower.split(/\\s+/).some(w => w.length > 3 && text.includes(w));
    });
    const compsToUse = relevant.length >= 3 ? relevant : KIT_DATA.components.slice(0, 10);
    const importNames = compsToUse.map(c => c.name).join(', ');

    if (apiKey) {
      const COMP_REF = \`${compactRef.replace(/`/g, '\\`')}\`;
      const systemPrompt = \`You are a UI code generator for the ${kitData.kitName} design system.
Generate a complete, runnable React functional component (default export) using ONLY components from this kit.
Rules:
1. Start with: import { ... } from './components/ui';
2. Use realistic placeholder data, not Lorem ipsum
3. Never use raw HTML elements (<button>, <input>, <table>) — use kit components
4. Apply CSS variables for any colors: var(--primary), var(--text), var(--surface), etc.
5. Return ONLY a fenced \\\`\\\`\\\`jsx code block, nothing else

Available components:
\${COMP_REF}\`;
      try {
        const text = await callAnthropicAPI(systemPrompt, args.description);
        return { content: [{ type: 'text', text: extractCodeBlock(text) }] };
      } catch (e) {
        if (e.message !== 'no_key') {
          return { content: [{ type: 'text', text: \`AI generation failed: \${e.message}\` }] };
        }
      }
    }

    // Heuristic scaffold — uses relevant components with real structure
    const sections = compsToUse.map(c => {
      const dp = Object.entries(c.aiSpec?.defaultProps || {}).map(([k,v]) => \` \${k}="\${v}"\`).join('');
      return \`      <\${c.name}\${dp}>\${c.name} content</\${c.name}>\`;
    }).join('\\n');

    const scaffold = \`import React, { useState } from 'react';
import { \${importNames} } from './components/ui';

// Generated scaffold for: \${args.description}
// Set ANTHROPIC_API_KEY to get AI-generated JSX instead of this scaffold

export default function GeneratedUI() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
\${sections}
    </div>
  );
}\`;
    return { content: [{ type: 'text', text: scaffold }] };
  }

  // ── validate_code ────────────────────────────────────────────────────────
  if (name === 'validate_code') {
    const code = args.code || '';
    const violations = [];
    const lines = code.split('\\n');

    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      for (const rule of HTML_TO_KIT) {
        if (rule.pattern.test(line) && !rule.skip.test(line)) {
          violations.push({
            line: lineNum,
            element: rule.pattern.toString().replace(/^\\/|\\[.*$/g, '').replace(/\\\\/g, ''),
            message: \`Use <\${rule.kit}> from the \${KIT_DATA.kitName} design system instead\`,
            suggestion: rule.example,
            severity: rule.severity,
          });
        }
      }
      // Check for kit components used without import
      KIT_DATA.components.forEach(c => {
        if (new RegExp(\`<\${c.name}[\\\\s/>]\`).test(line) && !code.includes(\`import\`) && !code.includes(c.name)) {
          violations.push({ line: lineNum, element: c.name, message: \`Missing import for \${c.name}\`, suggestion: \`import { \${c.name} } from './components/ui';\`, severity: 'error' });
        }
      });
    });

    const errors = violations.filter(v => v.severity === 'error').length;
    const warnings = violations.filter(v => v.severity === 'warning').length;
    const summary = violations.length === 0
      ? 'No violations found — code follows design system rules'
      : \`\${errors} error\${errors !== 1 ? 's' : ''} · \${warnings} warning\${warnings !== 1 ? 's' : ''}\`;

    return { content: [{ type: 'text', text: JSON.stringify({ summary, violations }, null, 2) }] };
  }

  // ── get_css_variables ────────────────────────────────────────────────────
  if (name === 'get_css_variables') {
    let vars = KIT_DATA.cssVariables;
    if (args.category) {
      const cat = args.category.toLowerCase();
      vars = Object.fromEntries(Object.entries(vars).filter(([k]) => k.includes(cat)));
    }
    const grouped = {
      colors: Object.fromEntries(Object.entries(vars).filter(([k]) => !k.includes('radius') && !k.includes('shadow') && !k.includes('transition'))),
      radius: Object.fromEntries(Object.entries(vars).filter(([k]) => k.includes('radius'))),
      shadows: Object.fromEntries(Object.entries(vars).filter(([k]) => k.includes('shadow'))),
      other: Object.fromEntries(Object.entries(vars).filter(([k]) => k.includes('transition'))),
    };
    return { content: [{ type: 'text', text: JSON.stringify(args.category ? vars : grouped, null, 2) }] };
  }

  return { content: [{ type: 'text', text: \`Unknown tool: \${name}\` }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${kitData.kitName} MCP server running on stdio');
}

main().catch(console.error);
`;
}

// ── Run setup eagerly so @ui alias resolves on first Vite start ───────────────
const __cwd = process.cwd();
setupTemplate(__cwd);
setupWorkspace(__cwd);
setupAngularWorkspace(__cwd);

// ── Workspace Sandbox Plugin ──────────────────────────────────────────────────
// Prevents syntax errors in agent-created workspace page files from crashing
// the parent Lumina studio app. Intercepts HMR error broadcasts whose source
// file lives inside kits/*/workspace/src/pages/ and re-routes them as a custom
// 'workspace-page-error' event instead of the global 'error' event, so only
// the preview iframe's error boundary sees the failure.
const workspaceSandboxPlugin = {
  name: 'lumina-workspace-sandbox',
  enforce: 'pre',
  configureServer(server) {
    const WORKSPACE_PAGES_RE = /kits[\\/](?:react|angular)[\\/]workspace[\\/]src[\\/]pages[\\/]/;

    // Monkey-patch server.hot.send to intercept workspace-page transform errors
    const hot = server.hot ?? server.ws;
    if (!hot) return;
    const origSend = hot.send.bind(hot);
    hot.send = function(payload, ...rest) {
      if (
        payload?.type === 'error' &&
        payload?.err?.id &&
        WORKSPACE_PAGES_RE.test(payload.err.id)
      ) {
        // Rebroadcast as a non-fatal custom event so the studio app ignores it
        // but the preview iframe's error handler can pick it up if desired.
        origSend({ type: 'custom', event: 'workspace-page-error', data: {
          file: payload.err.id,
          message: payload.err.message,
          frame: payload.err.frame ?? '',
        } }, ...rest);
        return;
      }
      origSend(payload, ...rest);
    };
  },
};

// ── Plugin ────────────────────────────────────────────────────────────────────
const luminaDevPlugin = {
  name: 'lumina-dev',
  configureServer(server) {
    const cwd = process.cwd();

    // Resolve a workspace-relative path safely. Returns the absolute path only if
    // it stays inside the kit's workspace root; otherwise null (blocks `..` traversal).
    const resolveWs = (kit, relPath) => {
      const wsRoot = path.join(cwd, KITS_DIR, kit || 'react', 'workspace');
      const full = path.resolve(wsRoot, relPath || '');
      if (full !== wsRoot && !full.startsWith(wsRoot + path.sep)) return null;
      return full;
    };

    // ── AI completions ────────────────────────────────────────────────────────
    server.middlewares.use('/api/ai', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { provider, model, apiKey, baseUrl, messages, systemPrompt } = JSON.parse(await readBody(req));
        let text = '';

        if (provider === 'claude') {
          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
            body: JSON.stringify({ model, system: systemPrompt, messages, max_tokens: 4096 }),
          });
          const d = await r.json();
          if (d.error) throw new Error(d.error.message);
          text = d.content[0].text;

        } else if (provider === 'openai') {
          const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 4096 }),
          });
          const d = await r.json();
          if (d.error) throw new Error(d.error.message);
          text = d.choices[0].message.content;

        } else if (provider === 'gemini') {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
              }),
            }
          );
          const d = await r.json();
          if (d.error) throw new Error(d.error.message || d.error.status);
          text = d.candidates[0].content.parts[0].text;

        } else if (provider === 'local') {
          const base = (baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '');
          const authHeaders = {};
          if (apiKey && apiKey.toLowerCase() !== 'ollama') authHeaders['Authorization'] = `Bearer ${apiKey}`;
          const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];

          let r = await fetch(`${base}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ model, messages: allMessages, stream: false }),
          });

          // Older Ollama versions don't have /v1 — fall back to native /api/chat
          if (r.status === 404) {
            const ollamaBase = base.replace(/\/v1$/, '');
            r = await fetch(`${ollamaBase}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ model, messages: allMessages, stream: false }),
            });
          }

          if (!r.ok) {
            const errBody = await r.text();
            let errMsg = `Local LLM error ${r.status}`;
            try { const d = JSON.parse(errBody); if (d.error) errMsg = typeof d.error === 'string' ? d.error : d.error.message || errMsg; } catch {}
            throw new Error(errMsg);
          }
          text = parseLocalLLMResponse(await r.text());

        } else {
          throw new Error(`Unknown provider: ${provider}`);
        }

        json(res, 200, { text });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Discover models from a local LLM server ───────────────────────────────
    server.middlewares.use('/api/local-models', async (req, res) => {
      if (req.method !== 'GET') { json(res, 405, { error: 'GET only' }); return; }
      const url = new URL(req.url, 'http://localhost');
      const baseUrl = (url.searchParams.get('baseUrl') || 'http://localhost:11434/v1').replace(/\/$/, '');
      const signal = AbortSignal.timeout(4000);
      try {
        // Try OpenAI-compatible /models endpoint first
        const r = await fetch(`${baseUrl}/models`, { signal });
        const d = await r.json();
        if (d.data?.length) {
          return json(res, 200, { models: d.data.map(m => m.id) });
        }
      } catch { /* fall through */ }
      try {
        // Ollama-specific: GET /api/tags (strip /v1 suffix if present)
        const ollamaBase = baseUrl.replace(/\/v1$/, '');
        const r = await fetch(`${ollamaBase}/api/tags`, { signal: AbortSignal.timeout(4000) });
        const d = await r.json();
        if (d.models?.length) {
          return json(res, 200, { models: d.models.map(m => m.name) });
        }
      } catch { /* fall through */ }
      json(res, 503, { error: 'Cannot reach local server — is it running?' });
    });

    // ── Read a workspace file ─────────────────────────────────────────────────
    server.middlewares.use('/api/read-file', (req, res) => {
      if (req.method !== 'GET') { json(res, 405, { error: 'GET only' }); return; }
      try {
        const url = new URL(req.url, 'http://localhost');
        const filePath = url.searchParams.get('path');
        const kit = url.searchParams.get('kit') || 'react';
        const source = url.searchParams.get('source') || 'workspace'; // 'workspace' | 'template'
        if (!filePath) { json(res, 400, { error: 'Missing path' }); return; }
        const full = path.join(cwd, KITS_DIR, kit, source, filePath);
        const content = fs.readFileSync(full, 'utf-8');
        json(res, 200, { content });
      } catch (err) {
        json(res, 404, { error: err.message });
      }
    });

    // ── Write a workspace file ────────────────────────────────────────────────
    server.middlewares.use('/api/write-file', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { path: filePath, content, kit = 'react' } = JSON.parse(await readBody(req));
        const full = path.join(cwd, KITS_DIR, kit, 'workspace', filePath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf-8');
        // Invalidate Vite's transform cache immediately so the next iframe load
        // always gets the freshly-written file instead of a stale compiled version.
        const mods = server.moduleGraph.getModulesByFile(full);
        if (mods) mods.forEach(mod => server.moduleGraph.invalidateModule(mod));
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Delete a workspace file (used by undo for newly-created files) ──────────
    server.middlewares.use('/api/delete-file', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { path: filePath, kit = 'react' } = JSON.parse(await readBody(req));
        const full = path.join(cwd, KITS_DIR, kit, 'workspace', filePath);
        if (fs.existsSync(full)) {
          fs.unlinkSync(full);
          const mods = server.moduleGraph.getModulesByFile(full);
          if (mods) mods.forEach(mod => server.moduleGraph.invalidateModule(mod));
        }
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Create an empty folder ────────────────────────────────────────────────
    server.middlewares.use('/api/create-folder', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { path: dirPath, kit = 'react' } = JSON.parse(await readBody(req));
        const full = resolveWs(kit, dirPath);
        if (!full) { json(res, 400, { error: 'Invalid path' }); return; }
        fs.mkdirSync(full, { recursive: true });
        // Keep empty dirs visible to git/tools and listable until a real file lands.
        const keep = path.join(full, '.gitkeep');
        if (!fs.existsSync(keep)) fs.writeFileSync(keep, '', 'utf-8');
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Rename / move a file or folder ────────────────────────────────────────
    server.middlewares.use('/api/rename-path', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { from, to, kit = 'react' } = JSON.parse(await readBody(req));
        const fullFrom = resolveWs(kit, from);
        const fullTo = resolveWs(kit, to);
        if (!fullFrom || !fullTo) { json(res, 400, { error: 'Invalid path' }); return; }
        if (!fs.existsSync(fullFrom)) { json(res, 404, { error: 'Source not found' }); return; }
        if (fs.existsSync(fullTo)) { json(res, 409, { error: 'Destination already exists' }); return; }
        fs.mkdirSync(path.dirname(fullTo), { recursive: true });
        fs.renameSync(fullFrom, fullTo);
        for (const f of [fullFrom, fullTo]) {
          const mods = server.moduleGraph.getModulesByFile(f);
          if (mods) mods.forEach(mod => server.moduleGraph.invalidateModule(mod));
        }
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Delete a file OR a folder (recursive) ─────────────────────────────────
    server.middlewares.use('/api/delete-path', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { path: targetPath, kit = 'react' } = JSON.parse(await readBody(req));
        const full = resolveWs(kit, targetPath);
        if (!full) { json(res, 400, { error: 'Invalid path' }); return; }
        const wsRoot = path.join(cwd, KITS_DIR, kit, 'workspace');
        if (full === wsRoot) { json(res, 400, { error: 'Cannot delete workspace root' }); return; }
        if (fs.existsSync(full)) {
          const mods = server.moduleGraph.getModulesByFile(full);
          if (mods) mods.forEach(mod => server.moduleGraph.invalidateModule(mod));
          fs.rmSync(full, { recursive: true, force: true });
        }
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Reset workspace to template ───────────────────────────────────────────
    server.middlewares.use('/api/reset-template', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { kit = 'react' } = JSON.parse(await readBody(req) || '{}');
        const wsPath = path.join(cwd, KITS_DIR, kit, 'workspace');
        const tmplPath = path.join(cwd, KITS_DIR, kit, 'template');
        if (!fs.existsSync(tmplPath)) { json(res, 404, { error: 'Template not found' }); return; }
        fs.rmSync(wsPath, { recursive: true, force: true });
        copyPath(tmplPath, wsPath);
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Rename kit (prefix + brand name) in workspace ────────────────────────
    server.middlewares.use('/api/rename', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { oldPrefix, newPrefix, kitName, oldKitName } = JSON.parse(await readBody(req));
        if (!oldPrefix || !newPrefix || oldPrefix === newPrefix) {
          json(res, 400, { error: 'Invalid prefix' });
          return;
        }

        const wsRoot = path.join(cwd, WORKSPACE);
        const RENAME_PATHS = [
          'src/components/ui',
          'src/pages/Dashboard.jsx',
          'src/styles/lumina.css',
          'src/styles/demo.css',
        ];
        const changed = [];

        const processFile = (relPath) => {
          const full = path.join(wsRoot, relPath);
          if (!fs.existsSync(full)) return;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            for (const f of fs.readdirSync(full)) processFile(`${relPath}/${f}`);
            return;
          }
          if (!['.jsx', '.js', '.css'].includes(path.extname(full))) return;

          let c = fs.readFileSync(full, 'utf-8');
          const orig = c;
          const isCss = full.endsWith('.css');

          if (isCss) {
            c = c.replace(new RegExp(`\\.${oldPrefix}-`, 'g'), `.${newPrefix}-`);
          } else {
            c = c.replace(new RegExp(`(['"\\` + '`' + `\\s])${oldPrefix}-([a-z])`, 'g'), `$1${newPrefix}-$2`);
          }

          if (kitName && oldKitName && kitName !== oldKitName) {
            c = c.replace(new RegExp(oldKitName, 'g'), kitName);
          }

          if (c !== orig) {
            fs.writeFileSync(full, c, 'utf-8');
            changed.push(relPath);
          }
        };

        for (const p of RENAME_PATHS) processFile(p);
        json(res, 200, { ok: true, changed });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Full workspace context for AI ────────────────────────────────────────
    server.middlewares.use('/api/workspace-context', (req, res) => {
      if (req.method !== 'GET') { json(res, 405, { error: 'GET only' }); return; }
      try {
        const url = new URL(req.url, 'http://localhost');
        const kit = url.searchParams.get('kit') || 'react';
        const wsRoot = path.join(cwd, KITS_DIR, kit, 'workspace');
        const files = {};
        const EXTS = kit === 'angular'
          ? new Set(['.ts', '.css', '.json', '.md', '.html'])
          : new Set(['.jsx', '.js', '.ts', '.tsx', '.css', '.json', '.md', '.html']);

        const isJunk = (bn) => bn.startsWith('._') || bn === '.DS_Store' || bn === '.git' || bn === 'node_modules';
        const collect = (relPath) => {
          const full = path.join(wsRoot, relPath);
          if (!fs.existsSync(full)) return;
          if (isJunk(path.basename(full))) return;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            for (const f of fs.readdirSync(full)) collect(`${relPath}/${f}`);
          } else if (EXTS.has(path.extname(full)) || path.basename(full) === '.gitkeep') {
            try { files[relPath] = fs.readFileSync(full, 'utf-8'); } catch { /* skip */ }
          }
        };

        // Walk the entire workspace src/ so the agent sees the full project structure.
        const contextPaths = kit === 'angular'
          ? ['src']
          : ['src'];

        for (const p of contextPaths) collect(p);

        // Derive existing page routes so the agent knows what's already connected
        const routes = [];
        if (kit === 'react') {
          const pagesDir = path.join(wsRoot, 'src/pages');
          if (fs.existsSync(pagesDir)) {
            for (const f of fs.readdirSync(pagesDir)) {
              if (!f.endsWith('.jsx')) continue;
              const name = f.replace(/\.jsx$/, '');
              if (name === 'Dashboard' || name === 'ComponentShowcase' || name === 'BuilderOutput') continue;
              routes.push({ file: `src/pages/${f}`, route: `#/ai/${name}`, name });
            }
          }
          // Detect the best "navigation file" to update when new pages are added
          // Priority: any file that already contains window.location.hash or href="#/ai/
          let navFile = null;
          for (const [filePath, content] of Object.entries(files)) {
            if (content && (content.includes('window.location.hash') || content.includes('href="#/ai/'))) {
              navFile = filePath;
              break;
            }
          }
          json(res, 200, { files, routes, navFile });
        } else {
          json(res, 200, { files, routes: [], navFile: null });
        }
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── List workspace file paths (no content) ────────────────────────────────
    server.middlewares.use('/api/workspace-files', (req, res) => {
      if (req.method !== 'GET') { json(res, 405, { error: 'GET only' }); return; }
      try {
        const url = new URL(req.url, 'http://localhost');
        const kit = url.searchParams.get('kit') || 'react';
        const wsRoot = path.join(cwd, KITS_DIR, kit, 'workspace');
        const EXTS = kit === 'angular'
          ? new Set(['.ts', '.css', '.json', '.md', '.html'])
          : new Set(['.jsx', '.js', '.ts', '.tsx', '.css', '.json', '.md', '.html']);
        const filePaths = [];
        const isJunk = (bn) => bn.startsWith('._') || bn === '.DS_Store' || bn === '.git' || bn === 'node_modules';
        const scan = (relPath) => {
          const full = path.join(wsRoot, relPath);
          if (!fs.existsSync(full)) return;
          if (isJunk(path.basename(full))) return;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            for (const f of fs.readdirSync(full)) scan(`${relPath}/${f}`);
          } else if (EXTS.has(path.extname(full)) || path.basename(full) === '.gitkeep') {
            filePaths.push(relPath);
          }
        };
        // List the whole workspace src/ so the IDE file tree shows every file.
        for (const p of ['src']) scan(p);
        json(res, 200, { files: filePaths });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Read component AI specs ───────────────────────────────────────────────
    server.middlewares.use('/api/read-specs', (req, res) => {
      if (req.method !== 'GET') { json(res, 405, { error: 'GET only' }); return; }
      try {
        const specsPath = path.join(cwd, 'src/data/ai-specs.json');
        const specs = fs.existsSync(specsPath) ? JSON.parse(fs.readFileSync(specsPath, 'utf-8')) : {};
        json(res, 200, { specs });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Write a single component's AI spec ───────────────────────────────────
    server.middlewares.use('/api/write-spec', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { componentId, aiSpec } = JSON.parse(await readBody(req));
        const specsPath = path.join(cwd, 'src/data/ai-specs.json');
        const existing = fs.existsSync(specsPath) ? JSON.parse(fs.readFileSync(specsPath, 'utf-8')) : {};
        existing[componentId] = aiSpec;
        fs.writeFileSync(specsPath, JSON.stringify(existing, null, 2), 'utf-8');
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── AI-generate a spec for a component ───────────────────────────────────
    server.middlewares.use('/api/ai-spec-generate', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { componentId, componentName, description, classes, variants, provider, model, apiKey, baseUrl } =
          JSON.parse(await readBody(req));

        const systemPrompt = `You are a design system expert. Given a UI component's metadata, produce a structured AI intelligence spec in JSON.

Output ONLY a JSON object with this exact shape (no markdown fences, no extra keys):
{
  "purpose": "One sentence: what this component does semantically",
  "useWhen": ["situation 1", "situation 2", "situation 3"],
  "avoidWhen": ["anti-pattern 1", "anti-pattern 2"],
  "defaultProps": { "propName": "defaultValue" },
  "accessibilityNotes": "Key a11y guidance",
  "patterns": [
    { "name": "Pattern name", "props": { "propName": "value" }, "whenToUse": "Guidance" }
  ]
}`;

        const userMsg = `Component: ${componentName}
Description: ${description || 'A UI component'}
CSS classes: ${(classes || []).join(', ')}
Variants: ${(variants || []).join(', ')}`;

        let text = '';
        if (provider === 'claude') {
          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
            body: JSON.stringify({ model, system: systemPrompt, messages: [{ role: 'user', content: userMsg }], max_tokens: 1024 }),
          });
          const d = await r.json();
          if (d.error) throw new Error(d.error.message);
          text = d.content[0].text;
        } else if (provider === 'openai') {
          const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], max_tokens: 1024 }),
          });
          const d = await r.json();
          if (d.error) throw new Error(d.error.message);
          text = d.choices[0].message.content;
        } else if (provider === 'gemini') {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: userMsg }] }],
              }),
            }
          );
          const d = await r.json();
          if (d.error) throw new Error(d.error.message || d.error.status);
          text = d.candidates[0].content.parts[0].text;
        } else if (provider === 'local') {
          const base = (baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '');
          const authHeaders = {};
          if (apiKey && apiKey.toLowerCase() !== 'ollama') authHeaders['Authorization'] = `Bearer ${apiKey}`;
          const specMessages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }];
          let r = await fetch(`${base}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ model, messages: specMessages, stream: false }),
          });
          if (r.status === 404) {
            const ollamaBase = base.replace(/\/v1$/, '');
            r = await fetch(`${ollamaBase}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ model, messages: specMessages, stream: false }),
            });
          }
          if (!r.ok) {
            const errBody = await r.text();
            let errMsg = `Local LLM error ${r.status}`;
            try { const d = JSON.parse(errBody); if (d.error) errMsg = typeof d.error === 'string' ? d.error : d.error.message || errMsg; } catch {}
            throw new Error(errMsg);
          }
          text = parseLocalLLMResponse(await r.text());
        } else {
          throw new Error(`Unknown provider: ${provider}`);
        }

        // Strip markdown fences if model added them
        const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        const aiSpec = JSON.parse(clean);
        json(res, 200, { aiSpec });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── MCP Bridge ───────────────────────────────────────────────────────────
    // Shared: send one JSON-RPC call to an HTTP MCP server, return result
    async function httpMCPRequest(url, method, params = {}) {
      const initRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'lumina-studio', version: '1.0.0' } } }),
      });
      const sessionId = initRes.headers.get('mcp-session-id');
      const parseResponse = async (r) => {
        const ct = r.headers.get('content-type') || '';
        if (ct.includes('text/event-stream')) {
          const text = await r.text();
          for (const block of text.split('\n\n')) {
            const line = block.split('\n').find(l => l.startsWith('data: '));
            if (line) return JSON.parse(line.slice(6));
          }
          return {};
        }
        return r.json();
      };
      await parseResponse(initRes);
      const callRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(sessionId ? { 'mcp-session-id': sessionId } : {}) },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method, params }),
      });
      const data = await parseResponse(callRes);
      return data.result ?? data.error ?? data;
    }

    // Shared: send one JSON-RPC call to a stdio MCP server, return result
    function stdioMCPRequest(command, method, params = {}) {
      return new Promise((resolve, reject) => {
        const parts = command.trim().split(/\s+/);
        const proc = spawn(parts[0], parts.slice(1), { stdio: ['pipe', 'pipe', 'pipe'] });
        let buf = ''; let initialized = false;
        proc.stdout.on('data', d => {
          buf += d.toString();
          const lines = buf.split('\n'); buf = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const msg = JSON.parse(line);
              if (!initialized && msg.id === 1) {
                initialized = true;
                proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
                proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method, params }) + '\n');
              } else if (msg.id === 2) {
                proc.kill();
                resolve(msg.result ?? msg.error ?? msg);
              }
            } catch { /* non-JSON line, skip */ }
          }
        });
        proc.on('error', e => { reject(new Error(`MCP spawn error: ${e.message}`)); });
        const timeout = setTimeout(() => { proc.kill(); reject(new Error('MCP request timed out')); }, 12000);
        proc.on('close', () => clearTimeout(timeout));
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'lumina-studio', version: '1.0.0' } } }) + '\n');
      });
    }

    async function mcpRequest(transport, url, command, method, params) {
      if (transport === 'stdio') return stdioMCPRequest(command, method, params);
      return httpMCPRequest(url, method, params);
    }

    server.middlewares.use('/api/mcp-bridge/tools', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { transport = 'http', url, command } = JSON.parse(await readBody(req) || '{}');
        const result = await mcpRequest(transport, url, command, 'tools/list', {});
        json(res, 200, { tools: result?.tools || [] });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    server.middlewares.use('/api/mcp-bridge/call', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { transport = 'http', url, command, tool, toolArgs = {} } = JSON.parse(await readBody(req) || '{}');
        const result = await mcpRequest(transport, url, command, 'tools/call', { name: tool, arguments: toolArgs });
        const text = result?.content?.[0]?.text ?? (typeof result === 'string' ? result : JSON.stringify(result));
        json(res, 200, { result: text });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });

    // ── Export kit from workspace ─────────────────────────────────────────────
    server.middlewares.use('/api/export', async (req, res) => {
      if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return; }
      try {
        const { cssVars = {}, componentCSS = {}, kitName = 'My UI Kit', kitPrefix = 'l' } =
          JSON.parse(await readBody(req) || '{}');

        const wsRoot = path.join(cwd, WORKSPACE);
        const files = {};
        const TEXT_EXTS = new Set(['.jsx', '.js', '.css', '.html', '.json', '.md']);

        const readPath = (wsRelPath) => {
          const full = path.join(wsRoot, wsRelPath);
          if (!fs.existsSync(full)) return;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            for (const f of fs.readdirSync(full)) readPath(`${wsRelPath}/${f}`);
          } else if (TEXT_EXTS.has(path.extname(full))) {
            try { files[wsRelPath] = fs.readFileSync(full, 'utf-8'); } catch { /* skip */ }
          }
        };

        // Read everything from workspace
        for (const p of ['src/components/ui', 'src/pages/Dashboard.jsx', 'src/styles/lumina.css', 'src/styles/demo.css']) {
          readPath(p);
        }

        // Bake CSS overrides
        const varRules = Object.entries(cssVars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
        const cssRules = Object.entries(componentCSS).map(([s, p]) => `${s} { ${p} }`).join('\n');
        if (varRules || cssRules) {
          files['src/styles/theme-overrides.css'] =
            `/* ${kitName} theme overrides */\n` +
            (varRules ? `:root {\n${varRules}\n}\n` : '') +
            (cssRules ? `\n${cssRules}\n` : '');
        }

        const pkgName = kitName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const cssImport = varRules || cssRules ? `\nimport './styles/theme-overrides.css';` : '';

        files['src/main.jsx'] =
          `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport './styles/lumina.css';${cssImport}\nimport App from './App.jsx';\n\ncreateRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);\n`;

        files['src/App.jsx'] = WORKSPACE_APP;
        files['index.html'] =
          `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${kitName}</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>\n`;

        files['vite.config.js'] = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n`;

        files['package.json'] = JSON.stringify({
          name: pkgName, private: true, version: '1.0.0', type: 'module',
          scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
          dependencies: { 'lucide-react': '^0.477.0', react: '^19.0.0', 'react-dom': '^19.0.0', 'react-router-dom': '^7.0.0' },
          devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^6.0.0' },
        }, null, 2);

        // ── MCP Server bundle ──────────────────────────────────────────────────
        const specsPath = path.join(cwd, 'src/data/ai-specs.json');
        const kitData = generateKitData(wsRoot, specsPath, kitName, kitPrefix);
        const mcpServerCode = generateMCPServer(kitData);

        files['mcp-server/index.js'] = mcpServerCode;
        files['mcp-server/kit-data.json'] = JSON.stringify(kitData, null, 2);
        files['mcp-server/package.json'] = JSON.stringify({
          name: `${pkgName}-mcp`,
          version: '1.0.0',
          description: `MCP server for the ${kitName} design system`,
          main: 'index.js',
          bin: { [`${pkgName}-mcp`]: './index.js' },
          scripts: { start: 'node index.js' },
          dependencies: { '@modelcontextprotocol/sdk': '^1.0.0' },
        }, null, 2);

        files['README.md'] =
          `# ${kitName}\n\nA UI component kit built with React + Vite.\n\n## Getting started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Components\n\n\`\`\`jsx\nimport { Button, Card, Badge } from './components/ui';\n\`\`\`\n\n## MCP Server (AI Integration)\n\nConnect your design system to Claude Desktop, Claude Code, and other MCP clients:\n\n\`\`\`bash\ncd mcp-server\nnpm install\n\`\`\`\n\nAdd to your \`claude_desktop_config.json\`:\n\`\`\`json\n{\n  "mcpServers": {\n    "${pkgName}": {\n      "command": "node",\n      "args": ["/absolute/path/to/mcp-server/index.js"]\n    }\n  }\n}\n\`\`\`\n\nNow Claude will use your exact components when generating UI code.\n`;

        json(res, 200, { files });
      } catch (err) {
        json(res, 500, { error: err.message });
      }
    });
  },
};

export default defineConfig(async () => {
  const plugins = [
    workspaceSandboxPlugin,
    react(),
  ];

  if (process.env.LUMINA_ANGULAR === '1') {
    const { default: angular } = await import('@analogjs/vite-plugin-angular');
    plugins.push(angular({
      tsconfig: path.join(__cwd, 'kits/angular/workspace/tsconfig.json'),
      workspaceRoot: __cwd,
    }));
  }

  plugins.push(luminaDevPlugin);

  return {
    plugins,
    resolve: {
      alias: {
        '@ui': path.join(__cwd, REACT_WORKSPACE, 'src/components/ui'),
      },
    },
    server: {
      fs: { allow: ['.'] },
    },
    optimizeDeps: {
      exclude: process.env.LUMINA_ANGULAR === '1' ? ['@angular/compiler'] : [],
    },
  };
});
