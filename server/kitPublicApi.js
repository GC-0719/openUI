import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KITS_DIR = 'kits';
const MANIFEST = 'public-api.manifest.json';

export function parseReactBarrel(content) {
  const stems = [];
  for (const line of content.split('\n')) {
    const m = line.match(/export\s+\*\s+from\s+['"]\.\/([^'"]+)['"]/);
    if (m) stems.push(m[1]);
  }
  return stems.sort();
}

export function parseAngularBarrel(content) {
  const symbols = [];
  for (const line of content.split('\n')) {
    const m = line.match(/export\s+\{([^}]+)\}/);
    if (!m) continue;
    for (const part of m[1].split(',')) {
      let sym = part.trim();
      const asMatch = sym.match(/\bas\s+(\w+)$/);
      if (asMatch) sym = asMatch[1];
      sym = sym.replace(/^type\s+/, '').trim();
      if (sym) symbols.push(sym);
    }
  }
  return symbols.sort();
}

export function loadPublicApiManifest(openuiRoot) {
  const file = path.join(openuiRoot, KITS_DIR, MANIFEST);
  if (!fs.existsSync(file)) {
    return { ok: false, error: `Missing ${KITS_DIR}/${MANIFEST}` };
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return { ok: true, manifest: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function readBarrel(root, relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return { ok: false, error: `Missing barrel: ${relPath}` };
  return { ok: true, content: fs.readFileSync(full, 'utf-8'), full };
}

function componentFilesExist(kitRoot, barrelRel, stems) {
  const dir = path.dirname(path.join(kitRoot, barrelRel));
  const missing = [];
  for (const stem of stems) {
    const jsx = path.join(dir, `${stem}.jsx`);
    const js = path.join(dir, `${stem}.js`);
    if (!fs.existsSync(jsx) && !fs.existsSync(js)) missing.push(stem);
  }
  return missing;
}

/**
 * Validate template + workspace barrels match the frozen public API manifest.
 * @param {string} openuiRoot — repo root
 */
export function validateKitPublicApi(openuiRoot) {
  const loaded = loadPublicApiManifest(openuiRoot);
  if (!loaded.ok) return loaded;
  const { manifest } = loaded;
  const errors = [];

  const reactKits = ['react/template', 'react/workspace'];
  const expectedReact = [...manifest.react.components].sort();
  const expectedAngular = [...manifest.angular.symbols].sort();

  for (const sub of reactKits) {
    const kitRoot = path.join(openuiRoot, KITS_DIR, sub);
    const barrelRel = manifest.react.barrel;
    const read = readBarrel(kitRoot, barrelRel);
    if (!read.ok) {
      errors.push(`react/${sub}: ${read.error}`);
      continue;
    }
    const stems = parseReactBarrel(read.content);
    if (stems.join(',') !== expectedReact.map(c => c).sort().join(',')) {
      errors.push(
        `react/${sub}: barrel exports [${stems.join(', ')}] !== manifest [${expectedReact.join(', ')}]`
      );
    }
    const missing = componentFilesExist(kitRoot, barrelRel, stems);
    if (missing.length) {
      errors.push(`react/${sub}: missing component files: ${missing.join(', ')}`);
    }
  }

  const angularKits = ['angular/template', 'angular/workspace'];
  for (const sub of angularKits) {
    const kitRoot = path.join(openuiRoot, KITS_DIR, sub);
    const barrelRel = manifest.angular.barrel;
    const read = readBarrel(kitRoot, barrelRel);
    if (!read.ok) {
      errors.push(`angular/${sub}: ${read.error}`);
      continue;
    }
    const symbols = parseAngularBarrel(read.content);
    if (symbols.join(',') !== expectedAngular.join(',')) {
      errors.push(
        `angular/${sub}: exports [${symbols.join(', ')}] !== manifest [${expectedAngular.join(', ')}]`
      );
    }
  }

  const reactPkg = path.join(openuiRoot, KITS_DIR, 'react/template/package.json');
  const angularPkg = path.join(openuiRoot, KITS_DIR, 'angular/template/package.json');
  if (fs.existsSync(reactPkg)) {
    const v = JSON.parse(fs.readFileSync(reactPkg, 'utf-8')).version;
    if (v !== manifest.react.semver) {
      errors.push(`@openedui/react package.json version ${v} !== manifest ${manifest.react.semver}`);
    }
  }
  if (fs.existsSync(angularPkg)) {
    const v = JSON.parse(fs.readFileSync(angularPkg, 'utf-8')).version;
    if (v !== manifest.angular.semver) {
      errors.push(`@openedui/angular package.json version ${v} !== manifest ${manifest.angular.semver}`);
    }
  }

  if (errors.length) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    react: { components: expectedReact.length, version: manifest.react.semver },
    angular: { symbols: expectedAngular.length, version: manifest.angular.semver },
  };
}

/** Vitest helper — repo root from server/ */
export function repoRootFromModule(metaUrl) {
  return path.join(path.dirname(fileURLToPath(metaUrl)), '..');
}
