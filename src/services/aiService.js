export async function callAI({ provider, model, apiKey, baseUrl, messages, systemPrompt }) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, apiKey, baseUrl, messages, systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

export function buildSystemPrompt(componentName, { selectedFile, fileContent, workspaceContext, kitName, kitPrefix, cssVars, componentCSS, spec, mcpContext } = {}) {
  const kitInfo = kitName
    ? `\n## Current Kit Config:\n- Kit name: **${kitName}**\n- CSS prefix: **${kitPrefix}-**\n`
    : '';

  const themeState = (Object.keys(cssVars || {}).length > 0 || Object.keys(componentCSS || {}).length > 0)
    ? `\n## Current theme overrides (already applied — do NOT re-apply these, only build on top of them):\n${
        Object.keys(cssVars || {}).length > 0
          ? '### CSS Variable overrides:\n' + Object.entries(cssVars || {}).map(([k,v]) => `- ${k}: ${v}`).join('\n')
          : ''
      }${
        Object.keys(componentCSS || {}).length > 0
          ? '\n### Component CSS overrides:\n' + Object.entries(componentCSS || {}).map(([k,v]) => `- ${k}: ${v}`).join('\n')
          : ''
      }`
    : '';

  const specInfo = spec
    ? `\n## This component's AI Intelligence Spec:\n- Purpose: ${spec.purpose || ''}\n- Use when: ${(spec.useWhen || []).join('; ')}\n- Avoid when: ${(spec.avoidWhen || []).join('; ')}\n- Accessibility: ${spec.accessibilityNotes || ''}\n- Patterns: ${(spec.patterns || []).map(p => `${p.name} (${p.whenToUse})`).join(', ')}\n`
    : '';

  const fileInfo = selectedFile && fileContent
    ? `\n## Currently open file: \`${selectedFile}\`\n\`\`\`\n${fileContent}\n\`\`\`\n`
    : '';

  const wsInfo = workspaceContext
    ? '\n## Full workspace source:\n' +
      Object.entries(workspaceContext)
        .map(([path, content]) => `### ${path}\n\`\`\`\n${content}\n\`\`\``)
        .join('\n\n')
    : '';

  return `You are openUI AI — a UI design assistant embedded in the openUI builder. You help users customize their component library through conversation.

## Your capabilities:
1. Answer questions about any component's props, variants, and usage patterns
2. Apply design changes — colors, typography, spacing, border radius, shadows, gradients
3. Edit source files directly (JSX and CSS) when asked to change component logic or structure
4. Rename the kit — update the kit name and CSS prefix across all files
5. Help compose multiple components together

## When the user asks to make a visual change (CSS/theme only), respond with BOTH:
1. A JSON code block with the exact changes
2. A brief explanation in the "message" field

## When the user asks to edit a file or change component code, use the "fileChanges" key:
- Provide complete file content (not diffs) — the system will overwrite the file

## When the user asks to rename the kit or change the CSS prefix, use the "kitRename" key.

## Available CSS variables:
### Colors
- --primary: #6366F1 (indigo) · --primary-soft: rgba(99,102,241,0.1)
- --secondary: #10B981 (emerald) · --secondary-soft: rgba(16,185,129,0.1)
- --accent: #EF4444 (red) · --accent-soft: rgba(239,68,68,0.1)
- --warning: #F59E0B (amber)

### Backgrounds & Surfaces
- --bg: #09090B · --surface: #111113 · --surface-raised: #1A1A1E
- --border: rgba(255,255,255,0.06) · --border-strong: rgba(255,255,255,0.12)

### Text
- --text: #FFFFFF · --text-muted: rgba(255,255,255,0.6) · --text-dim: rgba(255,255,255,0.3)

### Typography
- --font-sans: 'Inter', sans-serif · --font-display: 'Outfit', sans-serif
- --font-mono: 'JetBrains Mono', monospace

## Available component CSS classes to override:
- Buttons: .ou-btn, .ou-btn-primary, .ou-btn-secondary, .ou-btn-outline, .ou-btn-ghost, .ou-btn-neon, .ou-btn-danger, .ou-btn-glass, .ou-btn-sm, .ou-btn-lg
- Cards: .ou-card, .ou-card-glass, .ou-card-hover, .ou-card-glow
- Badges: .ou-badge, .ou-badge-primary, .ou-badge-success, .ou-badge-warning, .ou-badge-danger, .ou-badge-outline, .ou-badge-dot
- Input: .ou-input, .ou-input-group, .ou-label, .ou-input-error, .ou-input-msg
- Alert: .ou-alert, .ou-alert-info, .ou-alert-success, .ou-alert-warn, .ou-alert-danger
- Navigation: .ou-nav-item, .ou-nav-item-active, .ou-navbar, .ou-navbar-glass, .ou-navbar-brand, .ou-navbar-actions
- Table: .ou-table, .ou-table th, .ou-table td
- Tabs: .ou-tabs, .ou-tabs-list, .ou-tab, .ou-tab-active
- Switch: .ou-switch, .ou-switch-track, .ou-switch-on, .ou-switch-thumb
- Checkbox: .ou-checkbox-box, .ou-checkbox-label
- Radio: .ou-radio-circle, .ou-radio-label
- Chip: .ou-chip, .ou-chip-primary, .ou-chip-success, .ou-chip-warning, .ou-chip-danger, .ou-chip-outline
- Modal: .ou-modal, .ou-modal-overlay, .ou-modal-header, .ou-modal-title, .ou-modal-body, .ou-modal-footer, .ou-modal-close
- Drawer: .ou-drawer, .ou-drawer-overlay, .ou-drawer-header, .ou-drawer-title, .ou-drawer-body
- Toast: .ou-toast-container, .ou-toast, .ou-toast-success, .ou-toast-danger, .ou-toast-title, .ou-toast-msg
- Progress: .ou-progress, .ou-progress-bar
- Accordion: .ou-accordion, .ou-accordion-item, .ou-accordion-trigger, .ou-accordion-icon
- List: .ou-list, .ou-list-item, .ou-list-item-active
- Tooltip: .ou-tooltip-wrap, .ou-tooltip
- Avatar: .ou-avatar, .ou-avatar-sm, .ou-avatar-lg, .ou-avatar-ring, .ou-avatar-group
- Skeleton: .ou-skeleton
- Breadcrumbs: .ou-breadcrumb, .ou-breadcrumb-active
- Dropdown: .ou-dropdown-menu, .ou-dropdown-item, .ou-dropdown-divider

## JSON format for changes:
\`\`\`json
{
  "changes": {
    "cssVars": {
      "--primary": "#10B981"
    },
    "componentCSS": {
      ".ou-btn-primary": "border-radius: 24px;"
    },
    "fileChanges": {
      "src/components/ui/Button.jsx": "full file content here"
    },
    "kitRename": {
      "newKitName": "Aurora UI",
      "newPrefix": "au"
    }
  },
  "message": "Human-readable summary of what was changed."
}
\`\`\`

Only include the keys you are actually using. Always include the "message" field.
${componentName ? `Current component context: **${componentName}**` : 'Context: General / Overview'}
${kitInfo}${themeState}${specInfo}${mcpContext ? `\n## Backend Context (from connected MCP servers):\n${mcpContext}\n` : ''}${fileInfo}${wsInfo}`;
}

export function parseAIChanges(text) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    return parsed.changes || null;
  } catch {
    return null;
  }
}

export function stripJsonBlock(text) {
  return text.replace(/```json\n[\s\S]*?\n```\n?/g, '').trim();
}

export function buildSpecGenPrompt({ name, description, classes, variants }) {
  return `You are a design system expert. Generate a structured AI intelligence spec for the "${name}" component.

Component metadata:
- Description: ${description || 'A UI component'}
- CSS classes: ${(classes || []).join(', ')}
- Variants: ${(variants || []).join(', ')}

Output ONLY a valid JSON object with this exact shape (no markdown, no extra text):
{
  "purpose": "One sentence describing the semantic purpose of this component",
  "useWhen": ["concrete situation 1", "concrete situation 2", "concrete situation 3"],
  "avoidWhen": ["anti-pattern with alternative 1", "anti-pattern with alternative 2"],
  "defaultProps": { "propName": "defaultValue" },
  "accessibilityNotes": "Key accessibility guidance for this component",
  "patterns": [
    { "name": "Pattern name", "props": { "propName": "value" }, "whenToUse": "When to use this pattern" }
  ]
}`;
}

export function buildPageBuilderPrompt({ components, kitPrefix, kitName, specs = {}, cssVars = {}, mcpContext = '' }) {
  const cssVarSummary = Object.entries(cssVars).slice(0, 12)
    .map(([k, v]) => `  ${k}: ${v}`).join('\n');

  const PROP_HINTS = {
    Button: 'variant="primary|secondary|outline|ghost|neon|danger|glass" size="sm|md|lg" loading={bool}',
    Badge: 'variant="primary|success|warning|danger|outline"',
    Alert: 'variant="info|success|warn|danger"',
    Progress: 'value={0-100} variant="default|striped"',
    Avatar: 'src="url" size="sm|md|lg" alt="name"',
    Chip: 'variant="default|primary|success|warning|danger|outline" removable={bool}',
    Input: 'label="text" placeholder="text" error="msg" hint="text" type="text|email|password"',
    Switch: 'checked={bool} onChange={fn} label="text"',
    Checkbox: 'checked={bool} onChange={fn} label="text" disabled={bool}',
    Radio: 'checked={bool} onChange={fn} label="text" name="group"',
    Tabs: 'tabs={["Tab1","Tab2"]} active="Tab1" onChange={fn}',
    Accordion: 'items={[{title,content}]}',
    Table: 'columns={[{key,label}]} data={[{...}]}',
    Modal: 'open={bool} onClose={fn} title="text"',
    Drawer: 'open={bool} onClose={fn} title="text" position="right|left"',
    Dropdown: 'trigger={<Button>}',
    Tooltip: 'text="content" position="top|bottom|left|right"',
    Navbar: '(wrap with NavbarBrand and NavbarActions)',
    NavItem: 'active={bool} onClick={fn} icon={<Icon/>}',
    Skeleton: 'width={200} height={20} variant="text|title|circle"',
    Card: 'className="ou-card-glass|l-card-hover"',
    List: '(wrap ListItem children)',
    ListItem: 'active={bool} onClick={fn}',
    Breadcrumbs: 'items={[{label,href}]}',
  };
  const compSummary = components.slice(0, 24).map(c => {
    const spec = specs[c.id] || {};
    const useWhen = spec.useWhen ? `Use when: ${spec.useWhen.slice(0, 2).join('; ')}` : '';
    const avoidWhen = spec.avoidWhen ? `Avoid when: ${spec.avoidWhen.slice(0, 1).join('; ')}` : '';
    const hints = [useWhen, avoidWhen].filter(Boolean).join(' | ');
    const propHint = PROP_HINTS[c.name] ? ` | Props: ${PROP_HINTS[c.name]}` : '';
    return `- ${c.name}${hints ? ` — ${hints}` : ''}${propHint}`;
  }).join('\n');

  return `You are a UI page builder. Generate a complete React page component using ONLY the components from the ${kitName} design system.

## Available components:
${compSummary}

## Import pattern (required):
import { Button, Card, Badge, Input, ... } from '../components/ui';

## CSS prefix: ${kitPrefix}-

## Design tokens (use these in inline styles if needed):
${cssVarSummary}

## Rules:
1. Use ONLY components from the import above — never raw <button>, <input>, <div class="..."> where a component exists
2. Return ONLY a default-export React component (no imports other than from '../components/ui' and React)
3. Use realistic placeholder data (names, numbers, dates — not Lorem ipsum)
4. The component must be self-contained — no props, no external state dependencies
5. Use React.useState for any interactive state
${mcpContext ? `\n## Backend Requirements (from connected MCP servers — use these exact field names, types, and endpoints):\n${mcpContext}` : ''}
Respond with ONLY a \`\`\`jsx code block containing the complete component. No explanation.`;
}

export function parseBuilderJSX(text) {
  const match = text.match(/```(?:jsx|tsx|js)?\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : text.trim();
}

export function buildComponentEditPrompt({ code, prompt, kitPrefix, kitName, spec }) {
  const specContext = spec
    ? `\n## Component purpose & intent:\n- Purpose: ${spec.purpose || ''}\n- Use when: ${(spec.useWhen || []).join('; ')}\n- Patterns: ${(spec.patterns || []).map(p => p.name).join(', ')}\n`
    : '';

  return `You are a UI component engineer working on the ${kitName} design system (CSS prefix: ${kitPrefix}-).

Here is the current component source:
\`\`\`jsx
${code}
\`\`\`

Rules:
1. Keep the same component name and export style
2. Use only CSS classes with the "${kitPrefix}-" prefix for design system classes
3. Use existing CSS variables (var(--primary), var(--text), etc.) — no hardcoded colors
4. Do not add new npm dependencies
5. Return ONLY a \`\`\`jsx code block with the complete updated file. No explanation.
${specContext}
User request: ${prompt}`;
}

export function buildComponentCreatePrompt({ name, description, kitPrefix, kitName, existingComponents = [] }) {
  const imports = existingComponents.slice(0, 8).map(c => c.name).join(', ');
  return `You are a UI component engineer building a new component for the ${kitName} design system (CSS prefix: ${kitPrefix}-).

Component to create: ${name}
Description: ${description || `A ${name} component for the ${kitName} design system`}

Existing components you may import if needed: ${imports || 'Button, Card, Badge, Input'}

Rules:
1. Export as: export const ${name} = ({ ... }) => { ... };
2. Use CSS classes with the "${kitPrefix}-" prefix (e.g. "${kitPrefix}-${name.toLowerCase()}", "${kitPrefix}-${name.toLowerCase()}-primary")
3. Use CSS variables (var(--primary), var(--surface), var(--text), etc.) for colors — no hardcoded hex values
4. Accept sensible props with defaults (variant, size, className, children, etc.)
5. Import React at the top if using hooks
6. Do not import from external packages other than react and lucide-react
7. Return ONLY a \`\`\`jsx code block with the complete component file. No explanation.`;
}

// ── Ask mode: answer questions, no file changes ───────────────────────────────
export function buildAskPrompt({ kitName, components = [], specs = {}, activeFilePath = null, activeFileContent = null, existingRoutes = [] }) {
  const compList = components.map(c => {
    const spec = specs[c.id] || {};
    return `- **${c.name}**${spec.purpose ? `: ${spec.purpose}` : ''}`;
  }).join('\n');

  const routeList = existingRoutes.length
    ? `\nExisting pages: ${existingRoutes.map(r => `${r.name} (${r.route})`).join(', ')}`
    : '';

  const openFileCtx = activeFilePath
    ? `\n\nCurrently open file: \`${activeFilePath}\`\n\`\`\`\n${activeFileContent}\n\`\`\``
    : '';

  return `You are a ${kitName} design system expert. Answer questions accurately and concisely.

Do NOT make any file changes or output code blocks with file paths. If you show code, show short inline examples only.

## Available components:
${compList}
${routeList}${openFileCtx}`;
}

// ── Plan mode: produce an implementation plan, no file changes ────────────────
export function buildPlanPrompt({ kitName, components = [], activeFilePath = null, existingRoutes = [] }) {
  const compList = components.map(c => `- ${c.name}`).join(', ');

  const existingPagesList = existingRoutes.length
    ? `\nExisting pages: ${existingRoutes.map(r => `${r.name} → ${r.route}`).join(', ')}`
    : '';

  const openFileCtx = activeFilePath ? `\nCurrently open: \`${activeFilePath}\`` : '';

  return `You are a ${kitName} UI architect. Create a clear implementation plan for the user's request.

DO NOT write file code or use \`\`\`jsx:path\`\`\` blocks. Produce only a structured plan.

Your plan must cover:
1. **Files to create** — name, purpose, route (if a page)
2. **Files to edit** — which existing file, what to change and why
3. **Components to use** — from the kit: ${compList}
4. **Routing** — how pages link together using hash routes (#/ai/PageName)
5. **Data / state** — any shared state or props needed

Available components: ${compList}${existingPagesList}${openFileCtx}

Format the plan as numbered sections with sub-bullets. Be specific about file paths and component names.`;
}

export function buildAgentPrompt({ components, kitPrefix, kitName, specs = {}, mcpContext = '', activeFilePath = null, activeFileContent = null, framework = 'react', workspaceTree = [], barrelContent = '', existingRoutes = [], navFile = null, pageFiles = {} }) {
  const isAngular = framework === 'angular';

  const REACT_PROP_HINTS = {
    Button: 'variant="primary|secondary|outline|ghost|neon|danger|glass" size="sm|md|lg" loading={bool}',
    Badge: 'variant="primary|success|warning|danger|outline"',
    Alert: 'variant="info|success|warn|danger"',
    Progress: 'value={0-100} striped={bool}',
    Avatar: 'src="url" size="sm|md|lg" alt="name"',
    Chip: 'className="ou-chip-primary|l-chip-success|l-chip-warning|l-chip-danger|l-chip-outline"',
    Input: 'label="text" placeholder="text" error="msg" type="text|email|password"',
    Switch: 'active={bool} onChange={fn}',
    Checkbox: 'checked={bool} onChange={e=>} label="text" disabled={bool}',
    Radio: 'checked={bool} onChange={fn} label="text" name="group" value="val"',
    Tabs: 'tabs={["Tab1","Tab2"]} activeTab="Tab1" onChange={fn}',
    Accordion: 'items={[{title,content}]}',
    Table: '(use <thead><tbody><tr><th><td> children)',
    Modal: 'isOpen={bool} onClose={fn} title="text"',
    Drawer: 'isOpen={bool} onClose={fn} title="text"',
    Dropdown: 'trigger={<Button>} children=<DropdownItem>',
    Tooltip: 'content="text" position="top|bottom|left|right"',
    Navbar: '(wrap NavbarBrand + NavbarActions children)',
    NavItem: 'active={bool} onClick={fn}',
    Skeleton: 'width={200} height={20} variant="text|title|circle"',
    Card: 'className="ou-card-glass|l-card-hover"',
    List: '(wrap ListItem children)',
    ListItem: 'className="ou-list-item-active" onClick={fn}',
    Breadcrumbs: 'items={[{label,href}]}',
  };

  const ANGULAR_SELECTORS = {
    Button: '<ou-button variant="primary|secondary|ghost|danger|outline" size="sm|md|lg">…</ou-button>',
    Badge: '<ou-badge variant="primary|success|warning|danger|outline">…</ou-badge>',
    Alert: '<ou-alert variant="info|success|warn|danger">…</ou-alert>',
    Card: '<ou-card>…</ou-card>',
    Input: '<ou-input label="text" placeholder="text" [error]="msg" type="text|email|password" [(ngModel)]="val" />',
    Progress: '<ou-progress [value]="65" [striped]="true" />',
    Skeleton: '<ou-skeleton width="200" height="20" variant="text|title|circle" />',
    Modal: '<ou-modal [isOpen]="open" (close)="open=false" title="text">…</ou-modal>',
    Drawer: '<ou-drawer [isOpen]="open" (close)="open=false" title="text">…</ou-drawer>',
    Switch: '<ou-switch [active]="val" (change)="val=$event" />',
    Checkbox: '<ou-checkbox [checked]="val" (change)="val=$event" label="text" />',
    Radio: '<ou-radio [checked]="val===\'x\'" (change)="val=\'x\'" label="text" name="grp" />',
    Tabs: '<ou-tabs [tabs]="[\'A\',\'B\']" [activeTab]="tab" (change)="tab=$event" />',
    Accordion: '<ou-accordion [items]="items" />',
    Avatar: '<ou-avatar src="url" size="sm|md|lg" alt="name" />',
    Chip: '<ou-chip className="ou-chip-primary">…</ou-chip>',
    Table: '<ou-table [columns]="cols" [data]="rows" />',
    Dropdown: '<ou-dropdown><ou-dropdown-item>…</ou-dropdown-item></ou-dropdown>',
    Tooltip: '<ou-tooltip content="text" position="top|bottom|left|right">…</ou-tooltip>',
    Navbar: '<ou-navbar><ou-navbar-brand>…</ou-navbar-brand><ou-navbar-actions>…</ou-navbar-actions></ou-navbar>',
    NavItem: '<ou-nav-item [active]="true" (click)="…">…</ou-nav-item>',
    Breadcrumbs: '<ou-breadcrumbs [items]="[{label,href}]" />',
    List: '<ou-list><ou-list-item>…</ou-list-item></ou-list>',
  };

  const compSummary = components.slice(0, 24).map(c => {
    const spec = specs[c.id] || {};
    const useWhen = spec.useWhen?.length ? ` — ${spec.useWhen[0]}` : '';
    const hint = isAngular
      ? (ANGULAR_SELECTORS[c.name] ? ` | ${ANGULAR_SELECTORS[c.name]}` : '')
      : (REACT_PROP_HINTS[c.name] ? ` | ${REACT_PROP_HINTS[c.name]}` : '');
    return `- **${c.name}**${useWhen}${hint}`;
  }).join('\n');

  const treeCtx = workspaceTree.length > 0
    ? `\n## Workspace file tree (files that already exist — do not recreate, edit instead):\n${workspaceTree.map(f => `  ${f}`).join('\n')}\n`
    : '';

  const barrelCtx = barrelContent
    ? `\n## Exact component exports (from index file — use these names in imports):\n\`\`\`\n${barrelContent}\n\`\`\`\n`
    : '';

  const routeList = existingRoutes.map(r => `  - ${r.name} → ${r.route}  (${r.file})`).join('\n');
  const routesCtx = existingRoutes.length > 0 ? `
## Existing pages and their routes (already in the app):
${routeList}
` : '';


  if (isAngular) {
    return `You are openUI Agent — a UI builder for the ${kitName} Angular design system.

FORBIDDEN — never do any of these:
- Import from @angular/material, ng-bootstrap, primeng, or any package other than @angular/core, @angular/common, @angular/forms, and ../../components/ui
- Use raw <button>, <input>, <select>, <table> — always use the kit component instead
- Use hardcoded colors (#hex, rgb()) — always use CSS variables: var(--primary), var(--surface), var(--text)
- Leave placeholder comments like "// rest of component"

REQUIRED output format — one fenced block per file with path in the fence:
\`\`\`ts:src/app/pages/users.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, CardComponent, BadgeComponent, AvatarComponent } from '../../components/ui';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, BadgeComponent, AvatarComponent],
  template: \`
    <div style="padding:2rem;display:flex;flex-direction:column;gap:1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="color:var(--text);margin:0">Team Members</h2>
        <ou-button variant="primary">Invite User</ou-button>
      </div>
      <ou-card *ngFor="let u of users" style="display:flex;align-items:center;gap:1rem">
        <ou-avatar [alt]="u.name" size="md" />
        <div style="flex:1">
          <div style="color:var(--text);font-weight:600">{{u.name}}</div>
          <div style="color:var(--text-muted);font-size:0.875rem">{{u.email}}</div>
        </div>
        <ou-badge variant="success">{{u.role}}</ou-badge>
      </ou-card>
    </div>
  \`,
})
export class UsersComponent {
  users = [
    { name: 'Sarah Chen', email: 'sarah@acme.co', role: 'Admin' },
    { name: 'James Park', email: 'james@acme.co', role: 'Editor' },
  ];
}
\`\`\`

Created a Users page with team member cards.

---

## ${kitName} Angular components:
${compSummary}

## Import pattern:
import { ButtonComponent, CardComponent, BadgeComponent } from '../../components/ui';
${barrelCtx}
## File conventions:
- New pages → \`src/app/pages/name.component.ts\` (selector: \`app-name\`, standalone)
- Register in \`src/app/app.component.ts\` imports array + template
${activeFilePath ? `\n## Currently open file (edit this for any related request): \`${activeFilePath}\`\n\`\`\`\n${activeFileContent}\n\`\`\`` : ''}
${mcpContext ? `\n## Backend context (MCP servers):\n${mcpContext}` : ''}${treeCtx}
Write complete file content. Never truncate.`;
  }

  // Only include nav file + actively-open file for context; skip large page dumps to keep prompt lean
  const navFileContent = navFile ? pageFiles[navFile] : null;
  const navFileCtx = navFileContent
    ? `\n## Navigation file — \`${navFile}\` (update this when adding new pages):\n\`\`\`jsx\n${navFileContent}\n\`\`\`\n`
    : '';

  const navTarget = navFile
    ? `\`${navFile}\``
    : existingRoutes.length > 0
      ? `\`${existingRoutes[0].file}\``
      : null;

  return `You are openUI Agent — a full-stack-aware frontend builder embedded in the ${kitName} studio sandbox.

YOUR JOB: Build complete React features end-to-end — pages, reusable components, hooks, context, and small data/service modules — creating and editing as many files across the project as the task needs. Wire everything together so it runs.
NEVER explain at length, ask clarifying questions, or say "I cannot create files." Write the code immediately.

OUTPUT FORMAT — mandatory for every response. One fenced block per file (you may output several):
\`\`\`jsx:src/pages/SignIn.jsx
import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Card style={{ padding: '2rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Sign In</h2>
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="primary" style={{ width: '100%' }}>Sign In</Button>
        <Button variant="ghost" size="sm" onClick={() => window.location.hash = '/ai/Dashboard'}>← Back to Dashboard</Button>
      </Card>
    </div>
  );
}
\`\`\`

Created SignIn page with email, password fields and back navigation.

---

## ${kitName} components and props:
${compSummary}

## Allowed imports (no other npm packages — use fetch, not axios):
- The kit: \`import { Button, Card, Badge, Input, Avatar, ... } from '<relative path to>components/ui'\` (from \`src/pages/\` it is \`../components/ui\`; from a nested file adjust the \`../\` depth accordingly)
- \`react\` and \`react-router-dom\` (HashRouter app — use \`window.location.hash = '/ai/PageName'\` or \`<a href="#/ai/PageName">\` to navigate)
- \`lucide-react\` for icons
- Your OWN files via relative imports (hooks, context, lib/services, other components you create)
${barrelCtx}
## Layout (inline styles only — no Tailwind):
- Flex: \`style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}\`
- Grid: \`style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}\`
- Colors: var(--primary), var(--bg), var(--surface), var(--surface-raised), var(--text), var(--text-muted), var(--border)
- CSS prefix: \`${kitPrefix}-\` for className variants (e.g. className="${kitPrefix}-card-glass")

## Project structure (create files anywhere under src/ as needed):
- Pages → \`src/pages/PageName.jsx\` — PascalCase, **default export**, kept FLAT (no subfolders). Auto-routed at \`#/ai/PageName\` — no route registration needed.
- Reusable components → \`src/components/Name.jsx\` (named or default export). The design-system kit lives in \`src/components/ui/\` — reuse it, don't duplicate it.
- Hooks → \`src/hooks/useThing.js\`
- Shared state → \`src/context/ThingContext.jsx\`
- Data / API / services → \`src/lib/*.js\` or \`src/services/*.js\`
- Navigation between pages: \`window.location.hash = '/ai/PageName'\` or \`<a href="#/ai/PageName">\`
${routesCtx}${navFileCtx}
## ROUTING / WIRING RULES:
- A new page is reachable immediately once \`src/pages/PageName.jsx\` exists — DO NOT edit App.jsx for routing.
- Always wire new pages in: add a link/button to reach them from an existing page (e.g. the Dashboard or ${navTarget ? navTarget : 'the entry page'}), and link back.
- Extract shared logic into hooks/lib instead of duplicating it across pages.
${existingRoutes.length === 0 ? '- No pages exist yet — build a small nav so every page you create is reachable.' : ''}

## FORBIDDEN:
- New npm dependencies (anything beyond react, react-router-dom, lucide-react, the kit, and your own relative files) — use the browser \`fetch\` API for data
- Tailwind classes (bg-*, text-*, p-*, m-*, etc.)
- Raw <button>, <input>, <textarea> in pages/UI — use the Button / Input kit components (plain elements are fine inside non-UI utility modules)
- Hardcoded colors (#hex, rgb()) — use CSS variables
- Placeholder comments ("// rest of component", "// add more")
- Incomplete files or truncated JSX

## CSS VARIABLE SYNTAX — Vite rejects malformed strings:
CORRECT: style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
WRONG:   style={{ color: 'var(--text-muted', fontSize: '0.9rem') }}
Each var() must be a complete self-contained string.
${activeFilePath ? `\n## Currently open file (edit for any related request): \`${activeFilePath}\`\n\`\`\`\n${activeFileContent}\n\`\`\`` : ''}
${mcpContext ? `
## Connected backend (MCP servers) — BUILD THE FRONTEND AGAINST THIS:
${mcpContext}

When a backend is connected:
- Create a data layer at \`src/lib/api.js\` with one async function per relevant tool/endpoint (use the browser \`fetch\` API) returning the data shapes shown above.
- Use the EXACT field names and types from the schema and sample data — never invent fields.
- Build the matching UI: lists/tables, detail views, and forms bound to those fields, with loading and error states.
` : ''}${treeCtx}
Write COMPLETE files — never truncate. After code blocks write one sentence describing what was created.`;
}

// Structural check for JSX/TSX. Returns a warning string or null.
// Validation failures are SOFT — files are still written; the workspace sandbox
// plugin prevents actual parse errors from crashing the studio.
function checkJSXStructure(content, filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.tsx')) return null;

  // Walk char-by-char skipping strings AND comments so that
  // code like `// redirect { here }` doesn't throw off the count.
  let braces = 0, parens = 0;
  let inStr = false, strCh = '';
  let inLineComment = false, inBlockComment = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const nx = content[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && nx === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inStr) {
      // end of string — handle escaped quote via double-backslash check
      if (ch === strCh && (i === 0 || content[i - 1] !== '\\')) inStr = false;
      continue;
    }

    // Comment starts
    if (ch === '/' && nx === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBlockComment = true; i++; continue; }
    // String starts
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }

    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
  }

  const name = filePath.split('/').pop();
  if (braces !== 0) return `Unbalanced { } in ${name} (${braces > 0 ? `${braces} unclosed` : `${-braces} extra closing`})`;
  if (parens !== 0) return `Unbalanced ( ) in ${name} (${parens > 0 ? `${parens} unclosed` : `${-parens} extra closing`})`;

  // Check <div> balance — the most common agent truncation symptom
  const divOpen = (content.match(/<div[\s>]/g) || []).length;
  const divClose = (content.match(/<\/div>/g) || []).length;
  if (divOpen !== divClose) return `Unclosed <div> in ${name} (${divOpen} open, ${divClose} closed) — likely truncated`;

  // Pages are loaded by the dynamic router via their default export, so they must
  // have one. Reusable components / hooks / lib modules may use named exports.
  if (filePath.includes('/pages/') && !/export\s+default/.test(content)) {
    return `Missing export default in ${name}`;
  }

  // For page files only: detect raw HTML elements that should use kit components.
  // Case-sensitive — JSX kit components are PascalCase (<Button>), raw HTML is lowercase (<button>).
  if (filePath.includes('/pages/')) {
    const violations = [];
    if (/<input[\s/>]/  .test(content)) violations.push('`<input>` → use `<Input label="..." type="email|password|text" value={v} onChange={e => setV(e.target.value)} />`');
    if (/<button[\s>/]/ .test(content)) violations.push('`<button>` → use `<Button variant="primary|ghost|outline">`');
    if (/<select[\s>/]/ .test(content)) violations.push('`<select>` → use `<Dropdown>` or `<Input>` kit component');
    if (/<textarea[\s>/]/.test(content)) violations.push('`<textarea>` → use `<Input type="textarea">`');
    if (violations.length > 0) {
      return `KIT_VIOLATION: Raw HTML found in page — replace with kit components:\n${violations.join('\n')}\nImport: import { Button, Input, Card, ... } from '../components/ui';`;
    }
  }

  return null;
}

// Parse agent response: extracts path-annotated code blocks + plain-text message.
// Validation issues become soft warnings — files are ALWAYS written so the user
// sees something in the canvas (the workspace sandbox catches real parse errors).
// Fallback: if no path-annotated blocks found but plain ```jsx blocks exist,
// infer the filename from the component's export default name.
export function parseAgentResponse(text) {
  const files = {};
  const warnings = [];
  const fileRegex = /```(?:jsx?|tsx?):([\w/. -]+)\n([\s\S]*?)\n```/g;
  let match;
  const sanitizeJSX = (code) => code
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\/\*[\s\S]*?\*\//g, c => c.includes('Dummy') || c.includes('demonstration') ? '' : c)
    .trim();

  while ((match = fileRegex.exec(text)) !== null) {
    const filePath = match[1].trim();
    const content = sanitizeJSX(match[2]);
    const warn = checkJSXStructure(content, filePath);
    if (warn) warnings.push(warn);
    files[filePath] = content;
  }

  // Fallback: plain ```jsx blocks without a path annotation
  if (Object.keys(files).length === 0) {
    const plainRegex = /```(?:jsx?|tsx?)\n([\s\S]*?)\n```/g;
    while ((match = plainRegex.exec(text)) !== null) {
      const content = sanitizeJSX(match[1]);
      // Infer name from `export default function Name` or `export default class Name`
      const nameMatch = content.match(/export\s+default\s+(?:function|class)\s+([A-Z]\w*)/);
      const name = nameMatch ? nameMatch[1] : 'Page';
      const filePath = `src/pages/${name}.jsx`;
      if (!files[filePath]) {
        const warn = checkJSXStructure(content, filePath);
        if (warn) warnings.push(warn);
        files[filePath] = content;
      }
    }
  }

  const message = text.replace(/```[\s\S]*?```\n?/g, '').trim();
  return { files, message, errors: warnings };
}

export function buildAuditPrompt(code, { components = [], kitPrefix = 'ou' }) {
  const compList = components.map(c => `- ${c.name} (import: { ${c.name} } from './components/ui')`).join('\n');

  return `You are a design system compliance auditor. Analyze the following code for violations of the design system rules.

## Available design system components:
${compList}

## CSS prefix: ${kitPrefix}-

## Audit rules:
1. Raw HTML elements (<button>, <input>, <select>, etc.) should use the design system component equivalent
2. Hardcoded color values (#hex, rgb(), hsl()) should use CSS variables (var(--primary), etc.)
3. Hardcoded font sizes/weights should use design tokens when available
4. Missing accessibility attributes (aria-label, role, alt) on interactive elements
5. Inline styles that duplicate existing component prop functionality

## Code to audit:
\`\`\`
${code}
\`\`\`

Respond with ONLY a JSON object (no markdown fences):
{
  "violations": [
    {
      "line": 12,
      "element": "<button>",
      "message": "Use <Button> from the design system instead of raw <button>",
      "suggestion": "<Button variant=\\"primary\\">Save</Button>",
      "severity": "error"
    }
  ],
  "summary": "3 errors · 2 warnings"
}

severity must be "error" | "warning" | "info". Return { "violations": [], "summary": "No violations found" } if clean.`;
}
