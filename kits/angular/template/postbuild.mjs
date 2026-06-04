// Ships the kit stylesheet with @openui/angular and exposes it as a subpath
// export, since ng-packagr only bundles the component code.
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(dir, 'dist');

copyFileSync(path.join(dir, 'src/styles/openui.css'), path.join(dist, 'styles.css'));

const pkgPath = path.join(dist, 'package.json');
const templatePkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf-8'));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
pkg.exports = { ...(pkg.exports || {}), './styles.css': { default: './styles.css' } };
pkg.publishConfig = { access: 'public', ...(templatePkg.publishConfig || {}) };
pkg.repository = templatePkg.repository;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('postbuild: bundled styles.css and added ./styles.css export');
