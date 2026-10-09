#!/usr/bin/env node
/**
 * Enforces the kit stylesheet single-source-of-truth invariant:
 *
 *   kits/<fw>/template/src/styles/*.css  →  kits/<fw>/workspace/src/styles/*.css
 *
 * The template is canonical (it is what publishes to npm as @openedui/react /
 * @openedui/angular). The workspace copy is a byte-identical mirror — the studio
 * agent edits component code, and theme edits go to theme-overrides.css
 * (see src/utils/themeSync.js), so the workspace stylesheet itself must never
 * diverge from the template.
 *
 * Usage:
 *   node scripts/sync-kit-styles.mjs --check   # CI: exits 1 on drift
 *   node scripts/sync-kit-styles.mjs --fix     # re-sync workspace from template
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const PAIRS = [
  ["kits/react/template/src/styles/openui.css", "kits/react/workspace/src/styles/openui.css"],
  ["kits/angular/template/src/styles/openui.css", "kits/angular/workspace/src/styles/openui.css"],
  ["kits/react/template/src/styles/demo.css", "kits/react/workspace/src/styles/demo.css"],
  ["kits/angular/template/src/styles/demo.css", "kits/angular/workspace/src/styles/demo.css"],
];

const sha = (p) =>
  createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 12);

const mode = process.argv.includes("--fix") ? "fix" : "check";
let dirty = false;

for (const [src, dst] of PAIRS) {
  const a = path.join(root, src);
  const b = path.join(root, dst);
  if (sha(a) === sha(b)) {
    console.log(`ok    ${dst}`);
    continue;
  }
  dirty = true;
  if (mode === "fix") {
    writeFileSync(b, readFileSync(a));
    console.log(`synced ${dst} <- ${src}`);
  } else {
    console.log(`DRIFT  ${dst} != ${src}`);
  }
}

if (dirty && mode === "check") {
  console.error("\nStylesheet drift detected. Run: npm run styles:sync");
  process.exit(1);
}
console.log(dirty ? "done." : "all kit stylesheets in sync.");
