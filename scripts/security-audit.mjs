#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { runSecurityAudit } from '../server/securityAudit.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = runSecurityAudit(root);

if (!result.ok) {
  console.error('[security:audit] FAILED');
  for (const f of result.findings) console.error(' -', f);
  process.exit(1);
}

console.log(`[security:audit] OK (${result.checkedAt})`);
