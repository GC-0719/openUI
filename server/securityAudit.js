import fs from 'fs';
import path from 'path';
import { createPathResolver } from './pathSafety.js';
import { validateExternalRoot } from './workspaceBind.js';
import { validateMcpStdioCommand } from './mcpCommandSafety.js';
import { scaffoldMcpServer } from './mcpScaffold.js';

/**
 * Ensure a relative path stays inside a workspace root (export ZIP walk).
 */
export function isPathInsideRoot(rootDir, relPath) {
  const root = path.resolve(rootDir);
  const full = path.resolve(root, relPath || '');
  return full === root || full.startsWith(root + path.sep);
}

/**
 * Automated pre-release security checks (run in CI via npm run security:audit).
 * @param {string} openuiRoot
 */
export function runSecurityAudit(openuiRoot) {
  const findings = [];
  const { resolveWs, resolveIn } = createPathResolver(openuiRoot);

  // ── Path traversal (workspace APIs) ───────────────────────────────────────
  if (resolveWs('react', '../../../etc/passwd')) {
    findings.push('path: resolveWs allowed traversal outside react workspace');
  }
  if (resolveIn('react', 'workspace', '../../package.json')) {
    findings.push('path: resolveIn allowed escape via .. segments');
  }
  if (!resolveWs('evil', 'src/App.jsx')) {
    /* expected */
  } else {
    findings.push('path: invalid kit was accepted');
  }

  // ── Workspace bind ─────────────────────────────────────────────────────────
  const tmpl = path.join(openuiRoot, 'kits', 'react', 'template');
  if (fs.existsSync(tmpl)) {
    const bind = validateExternalRoot(tmpl, openuiRoot, 'react');
    if (bind.ok) findings.push('bind: template folder should be rejected');
  }

  // ── Export path walk ───────────────────────────────────────────────────────
  const ws = path.join(openuiRoot, 'kits', 'react', 'workspace');
  if (!isPathInsideRoot(ws, 'src')) findings.push('export: src should be inside workspace');
  if (isPathInsideRoot(ws, '../../package.json')) {
    findings.push('export: traversal path incorrectly allowed');
  }

  // ── MCP stdio command ──────────────────────────────────────────────────────
  if (!validateMcpStdioCommand('node /home/user/project/mcp/index.js').ok) {
    findings.push('mcp: valid node command rejected');
  }
  if (validateMcpStdioCommand('node index.js; curl evil.com').ok) {
    findings.push('mcp: shell injection not blocked');
  }
  if (validateMcpStdioCommand('bash -c "whoami"').ok) {
    findings.push('mcp: disallowed binary not blocked');
  }

  // ── MCP wizard generated code (no obvious RCE sinks) ───────────────────────
  const scaffold = scaffoldMcpServer({
    source: 'openapi',
    serverName: 'Audit',
    baseUrl: 'http://127.0.0.1:9',
    spec: { openapi: '3.0.0', paths: { '/ping': { get: { summary: 'ping' } } } },
  });
  if (scaffold.ok) {
    const code = scaffold.files['index.js'] || '';
    for (const bad of ['child_process', 'eval(', 'Function(', 'execSync']) {
      if (code.includes(bad)) findings.push(`scaffold: generated index contains "${bad}"`);
    }
  }

  // ── vite.config export guard present ───────────────────────────────────────
  const viteConfig = path.join(openuiRoot, 'vite.config.js');
  if (fs.existsSync(viteConfig)) {
    const src = fs.readFileSync(viteConfig, 'utf-8');
    if (!src.includes('isPathInsideRoot') && !src.includes('startsWith(wsRoot')) {
      findings.push('export: vite.config.js missing workspace containment guard on export walk');
    }
    if (!src.includes('validateMcpStdioCommand')) {
      findings.push('mcp: vite.config.js should validate stdio MCP commands before spawn');
    }
  }

  return {
    ok: findings.length === 0,
    findings,
    checkedAt: new Date().toISOString(),
  };
}
