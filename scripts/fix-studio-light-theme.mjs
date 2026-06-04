/**
 * Transform dark-studio palette → light monochrome in studio.css + shared docs.css blocks.
 * Run: node scripts/fix-studio-light-theme.mjs
 */
import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'src/styles/studio.css'),
  path.join(process.cwd(), 'src/styles/docs.css'),
];

const hexReplacements = [
  ['#09090b', '#fafafa'],
  ['#09090B', '#fafafa'],
  ['#111115', '#ffffff'],
  ['#0d0d10', '#f5f5f5'],
  ['#0a0a0c', '#f0f0f0'],
  ['#0c0c10', '#f5f5f5'],
  ['#f8f8f8', '#0a0a0a'],
  ['#e8e8e8', '#171717'],
  ['#d4d4d4', '#404040'],
  ['#d6d9e0', '#262626'],
  ['#6366f1', '#0a0a0a'],
  ['#4f46e5', '#262626'],
  ['#a5b4fc', '#0a0a0a'],
  ['#c7d2fe', '#262626'],
  ['#e0e7ff', '#0a0a0a'],
  ['color: var(--text, #fff)', 'color: #0a0a0a'],
];

function transform(css) {
  for (const [from, to] of hexReplacements) {
    css = css.split(from).join(to);
  }

  css = css.replace(/rgba\(99,\s*102,\s*241,\s*([\d.]+)\)/g, (_, a) => {
    const o = Math.min(0.2, parseFloat(a) * 0.65);
    return `rgba(0,0,0,${o.toFixed(2)})`;
  });

  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.07\)/g, '#e5e5e5');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'rgba(0,0,0,0.06)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'rgba(0,0,0,0.08)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(0,0,0,0.1)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.12\)/g, 'rgba(0,0,0,0.12)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.18\)/g, 'rgba(0,0,0,0.14)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'rgba(0,0,0,0.12)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.09\)/g, 'rgba(0,0,0,0.06)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(0,0,0,0.04)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.04\)/g, 'rgba(0,0,0,0.04)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'rgba(0,0,0,0.03)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'rgba(0,0,0,0.02)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.015\)/g, '#fafafa');

  css = css.replace(/rgba\(248,\s*248,\s*248,\s*([\d.]+)\)/g, (_, a) => {
    const opacity = Math.min(0.9, parseFloat(a) * 1.6 + 0.2);
    return `rgba(10,10,10,${opacity.toFixed(2)})`;
  });

  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.4\)/g, 'rgba(10,10,10,0.45)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.75\)/g, 'rgba(10,10,10,0.75)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.8\)/g, 'rgba(10,10,10,0.8)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.5\)/g, 'rgba(10,10,10,0.5)');
  css = css.replace(/rgba\(99,\s*102,\s*241,\s*0\.28\)/g, 'rgba(0,0,0,0.15)');

  css = css.replace(/#6ee7b7/g, '#166534');

  // Dark input surfaces on light shell
  css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.2\)/g, 'background: #fafafa');
  css = css.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.25\)/g, 'background: #f5f5f5');

  return css;
}

for (const file of files) {
  let css = fs.readFileSync(file, 'utf8');
  if (file.endsWith('studio.css')) {
    css = css.replace(
      /\.agent-file-badge-page \{[^}]+\}/,
      `.agent-file-badge-page {
  background: rgba(0,0,0,0.08);
  color: #0a0a0a;
  cursor: pointer;
  transition: background 0.15s;
}
.agent-file-badge-page:hover { background: rgba(0,0,0,0.14); }`
    );
    css = css.replace(
      /\.agent-file-badge-page:hover \{ background: rgba\(0,0,0,0\.18\); \}/,
      ''
    );
    css = css.replace(
      /\.ai-plan-build-btn:hover:not\(:disabled\) \{\s*background: #262626;\s*\}/,
      `.ai-plan-build-btn:hover:not(:disabled) { background: #262626; }`
    );
  }
  css = transform(css);
  fs.writeFileSync(file, css);
  console.log('Updated', file);
}
