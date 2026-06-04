import fs from 'fs';
import path from 'path';
import { KITS_DIR } from './constants.js';
import { createPathResolver, safeKit } from './pathSafety.js';

export function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** @returns {{ ok: true, name: string } | { ok: false, error: string }} */
export function validateComponentName(name) {
  if (!name || typeof name !== 'string') {
    return { ok: false, error: 'Component name is required' };
  }
  const trimmed = name.trim();
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(trimmed)) {
    return { ok: false, error: 'Use PascalCase (e.g. StatCard, DatePicker)' };
  }
  if (trimmed.length > 48) {
    return { ok: false, error: 'Name is too long' };
  }
  return { ok: true, name: trimmed };
}

export function defaultComponentSpec(name) {
  return {
    purpose: `${name} is a custom kit component in this workspace.`,
    useWhen: [`When you need ${name} in a page or layout`],
    avoidWhen: ['When a built-in kit component already covers the use case'],
    defaultProps: {},
    accessibilityNotes: 'Add keyboard and ARIA guidance as you refine this component.',
    patterns: [
      {
        name: 'Default',
        props: {},
        whenToUse: `Standard ${name} usage`,
      },
    ],
  };
}

export function appendBarrelExport(barrelContent, exportLine) {
  const line = exportLine.trim();
  if (!line) return barrelContent;
  if (barrelContent.includes(line)) return barrelContent;
  return `${barrelContent.trimEnd()}\n${line}\n`;
}

/**
 * @param {'react' | 'angular'} framework
 * @param {string} name — PascalCase
 */
export function buildComponentStub(framework, name) {
  if (framework === 'angular') {
    const kebab = pascalToKebab(name);
    const selector = `ou-${kebab}`;
    return {
      path: `src/components/ui/${kebab}.component.ts`,
      content: `import { Component, Input } from '@angular/core';

@Component({
  selector: '${selector}',
  standalone: true,
  template: \`
    <div class="${selector}">{{ label }}</div>
  \`,
})
export class ${name}Component {
  @Input() label = '${name}';
}
`,
      exportLine: `export { ${name}Component } from './${kebab}.component';`,
      componentId: kebab.replace(/-/g, ''),
    };
  }

  return {
    path: `src/components/ui/${name}.jsx`,
    content: `export const ${name} = ({ children, className = '', ...props }) => (
  <div className={\`ou-${name.toLowerCase()} \${className}\`} {...props}>
    {children}
  </div>
);
`,
    exportLine: `export * from './${name}';`,
    componentId: name.toLowerCase(),
  };
}

export function workspaceSpecsPath(openuiRoot, kit) {
  return path.join(openuiRoot, KITS_DIR, kit, 'workspace', '.openui', 'specs.json');
}

export function readMergedSpecs(openuiRoot, kit) {
  const globalPath = path.join(openuiRoot, 'src/data/ai-specs.json');
  const base = fs.existsSync(globalPath)
    ? JSON.parse(fs.readFileSync(globalPath, 'utf-8'))
    : {};

  if (!safeKit(kit)) return base;

  const wsPath = workspaceSpecsPath(openuiRoot, kit);
  if (!fs.existsSync(wsPath)) return base;

  try {
    const ws = JSON.parse(fs.readFileSync(wsPath, 'utf-8'));
    return { ...base, ...ws };
  } catch {
    return base;
  }
}

export function writeWorkspaceSpec(openuiRoot, kit, componentId, aiSpec) {
  const file = workspaceSpecsPath(openuiRoot, kit);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const existing = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : {};
  existing[componentId] = aiSpec;
  fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf-8');
}

/**
 * Create component file, append barrel export, seed workspace spec JSON.
 */
export function registerCustomComponent(openuiRoot, kit, rawName) {
  if (!safeKit(kit)) return { ok: false, error: 'Invalid kit' };

  const check = validateComponentName(rawName);
  if (!check.ok) return check;

  const { resolveWs } = createPathResolver(openuiRoot);
  const stub = buildComponentStub(kit, check.name);
  const fileFull = resolveWs(kit, stub.path);
  if (!fileFull) return { ok: false, error: 'Invalid component path' };
  if (fs.existsSync(fileFull)) {
    return { ok: false, error: `Component already exists at ${stub.path}` };
  }

  const barrelPath = kit === 'angular'
    ? 'src/components/ui/index.ts'
    : 'src/components/ui/index.jsx';
  const barrelFull = resolveWs(kit, barrelPath);
  if (!barrelFull) return { ok: false, error: 'Barrel file not found' };

  fs.mkdirSync(path.dirname(fileFull), { recursive: true });
  fs.writeFileSync(fileFull, stub.content, 'utf-8');

  const barrelBefore = fs.readFileSync(barrelFull, 'utf-8');
  const barrelAfter = appendBarrelExport(barrelBefore, stub.exportLine);
  if (barrelAfter !== barrelBefore) {
    fs.writeFileSync(barrelFull, barrelAfter, 'utf-8');
  }

  const componentId = stub.componentId;
  writeWorkspaceSpec(openuiRoot, kit, componentId, defaultComponentSpec(check.name));

  return {
    ok: true,
    name: check.name,
    path: stub.path,
    componentId,
    barrelUpdated: barrelAfter !== barrelBefore,
    specPath: `.openui/specs.json (key: ${componentId})`,
  };
}
