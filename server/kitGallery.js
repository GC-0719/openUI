import fs from 'fs';
import path from 'path';
import { loadPublicApiManifest } from './kitPublicApi.js';

const KITS_DIR = 'kits';

/** @param {string} content — ComponentShowcase.jsx source */
export function parseReactGalleryShowcase(content) {
  const block = content.match(/const RENDERS = \{([\s\S]*?)\};/);
  if (!block) return [];
  const keys = [];
  for (const line of block[1].split('\n')) {
    const m = line.match(/^\s*(\w+)\s*:/);
    if (m) keys.push(m[1]);
  }
  return keys.sort();
}

/** @param {string} content — showcase.component.ts source */
export function parseAngularGalleryShowcase(content) {
  const names = new Set();
  for (const m of content.matchAll(/preview === '([^']+)'/g)) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function readShowcase(root, framework) {
  const rel = framework === 'react'
    ? 'src/pages/ComponentShowcase.jsx'
    : 'src/showcase.component.ts';
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return { ok: false, error: `Missing ${rel}` };
  const content = fs.readFileSync(full, 'utf-8');
  const names = framework === 'react'
    ? parseReactGalleryShowcase(content)
    : parseAngularGalleryShowcase(content);
  return { ok: true, names, rel };
}

/**
 * Ensure kit showcase pages include every manifest component (Storybook-style gallery).
 */
export function validateKitGalleryCoverage(openuiRoot) {
  const loaded = loadPublicApiManifest(openuiRoot);
  if (!loaded.ok) return loaded;
  const expected = [...loaded.manifest.react.components].sort();
  const errors = [];

  for (const sub of ['react/template', 'react/workspace']) {
    const root = path.join(openuiRoot, KITS_DIR, sub);
    const read = readShowcase(root, 'react');
    if (!read.ok) {
      errors.push(`react/${sub}: ${read.error}`);
      continue;
    }
    const missing = expected.filter(c => !read.names.includes(c));
    const extra = read.names.filter(c => !expected.includes(c));
    if (missing.length) {
      errors.push(`react/${sub}: gallery missing previews for ${missing.join(', ')}`);
    }
    if (extra.length) {
      errors.push(`react/${sub}: gallery has unknown previews ${extra.join(', ')}`);
    }
  }

  for (const sub of ['angular/template', 'angular/workspace']) {
    const root = path.join(openuiRoot, KITS_DIR, sub);
    const read = readShowcase(root, 'angular');
    if (!read.ok) {
      errors.push(`angular/${sub}: ${read.error}`);
      continue;
    }
    const missing = expected.filter(c => !read.names.includes(c));
    const extra = read.names.filter(c => !expected.includes(c));
    if (missing.length) {
      errors.push(`angular/${sub}: gallery missing previews for ${missing.join(', ')}`);
    }
    if (extra.length) {
      errors.push(`angular/${sub}: gallery has unknown previews ${extra.join(', ')}`);
    }
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, componentCount: expected.length };
}

/**
 * Build static gallery index HTML from the public API manifest.
 */
export function generateGalleryHtml(manifest) {
  const components = manifest.react.components;
  const cards = components.map(name => {
    const reactUrl = `/kits/react/workspace/?preview=${encodeURIComponent(name)}`;
    const angularUrl = `/kits/angular/workspace/?preview=${encodeURIComponent(name)}`;
    return `
    <a class="gallery-card" href="${reactUrl}" data-react="${reactUrl}" data-angular="${angularUrl}">
      <span class="gallery-card-name">${name}</span>
      <span class="gallery-card-hint">Preview variants</span>
    </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>openUI Kit Gallery</title>
  <style>
    :root { font-family: system-ui, sans-serif; background: #0f0f12; color: #f4f4f5; }
    body { margin: 0; padding: 24px; }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    p { color: #a1a1aa; font-size: 0.875rem; max-width: 52rem; line-height: 1.5; }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-top: 20px; }
    .gallery-card {
      display: flex; flex-direction: column; gap: 4px;
      padding: 14px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: inherit; text-decoration: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .gallery-card:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.1); }
    .gallery-card-name { font-weight: 600; font-size: 0.9rem; }
    .gallery-card-hint { font-size: 0.65rem; color: #71717a; text-transform: uppercase; letter-spacing: 0.06em; }
    .fw-tabs { display: flex; gap: 8px; margin: 16px 0 0; }
    .fw-tab {
      padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12);
      background: transparent; color: #a1a1aa; cursor: pointer; font-size: 12px;
    }
    .fw-tab.active { background: rgba(99,102,241,0.2); color: #e0e7ff; border-color: rgba(99,102,241,0.4); }
  </style>
</head>
<body>
  <h1>openUI Kit Gallery</h1>
  <p>
    Storybook-style index for all <strong>${components.length}</strong> public kit components.
    Run <code>npm run dev</code> from the repo root, open this file via the dev server at
    <code>/kits/gallery/</code>, pick a framework tab, then click a component to preview variants
    (<code>?preview=ComponentName</code>).
  </p>
  <div class="fw-tabs">
    <button type="button" class="fw-tab active" data-fw="react">React workspace</button>
    <button type="button" class="fw-tab" data-fw="angular">Angular workspace</button>
  </div>
  <div class="gallery-grid" id="grid">${cards}</div>
  <script>
    let fw = 'react';
    function applyFramework() {
      document.querySelectorAll('.gallery-card').forEach(card => {
        card.href = fw === 'angular' ? card.dataset.angular : card.dataset.react;
      });
    }
    document.querySelectorAll('.fw-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        fw = btn.dataset.fw;
        document.querySelectorAll('.fw-tab').forEach(b => b.classList.toggle('active', b === btn));
        applyFramework();
      });
    });
    applyFramework();
  </script>
</body>
</html>
`;
}

export function syncKitGalleryFiles(openuiRoot) {
  const loaded = loadPublicApiManifest(openuiRoot);
  if (!loaded.ok) return loaded;
  const galleryDir = path.join(openuiRoot, KITS_DIR, 'gallery');
  fs.mkdirSync(galleryDir, { recursive: true });
  const html = generateGalleryHtml(loaded.manifest);
  fs.writeFileSync(path.join(galleryDir, 'index.html'), html, 'utf-8');
  fs.writeFileSync(
    path.join(galleryDir, 'components.json'),
    JSON.stringify({ components: loaded.manifest.react.components, generatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
  return { ok: true, path: galleryDir, count: loaded.manifest.react.components.length };
}
