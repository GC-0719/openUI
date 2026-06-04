# Releasing

openUI ships two kinds of npm packages: the **bundled kit** (`@openedui/react`)
and **user-exported kits** (named after the user's own kit + scope).

## First-time setup (one-time)
The packages publish under the **`@openedui`** npm org (already created).
Authenticate locally:

```bash
npm login          # opens a browser to your npm account
```

For automated releases via GitHub Actions, add an **`NPM_TOKEN`** repo secret
(npmjs.com → *Access Tokens* → *Generate* → "Automation"; then GitHub repo →
*Settings → Secrets and variables → Actions → New repository secret*). The
tag-triggered `.github/workflows/release.yml` publishes both packages.

## Publish the bundled `@openedui/react`
From `kits/react/template/`:

```bash
cd kits/react/template
npm install          # pulls vite + @vitejs/plugin-react (build-time only)
npm publish          # `prepack` runs the Vite library build automatically
```

This builds `dist/openui-react.js` (ESM) + `dist/styles.css` and publishes
`@openedui/react`. Bump `version` in `kits/react/template/package.json` first.

Consumers then:

```bash
npm install @openedui/react
```
```jsx
import { Button, Card } from '@openedui/react';
import '@openedui/react/styles.css';
```

## Publish the bundled `@openedui/angular`
From `kits/angular/template/` (ng-packagr builds an Angular Package Format
bundle into `dist/`, which is what gets published):

```bash
npm run build --prefix kits/angular/template   # runs ng-packagr
npm publish kits/angular/template/dist --access public
```

Consumers import the standalone components and the kit stylesheet:

```ts
import { ButtonComponent, CardComponent } from '@openedui/angular';
import '@openedui/angular/styles.css';
```

## Publish a user-exported kit (publish-by-name)
The studio's **Export → ZIP** produces a `package/` folder named from the
user's kit name and optional npm scope (set in the Export dialog). From the
unzipped project:

```bash
cd package
npm install
npm publish          # builds first via `prepack`
```

The package is published as `<kit-slug>` or `@<scope>/<kit-slug>`, exporting
the components and a `./styles.css` entry.

## Versioning

Kit public APIs are locked in [`kits/public-api.manifest.json`](kits/public-api.manifest.json).
CI fails if barrels drift. Policy: [`kits/KIT_STABILITY.md`](kits/KIT_STABILITY.md).
Consumer upgrades: [`docs/KIT_MIGRATION.md`](docs/KIT_MIGRATION.md).

**1.0.0+**: breaking manifest/API changes → **major**; new exports → **minor**; fixes → **patch**.
Keep `kits/react/template/package.json` and `kits/angular/template/package.json`
versions in sync with the manifest `semver` fields. Tag releases `vX.Y.Z` (e.g. `v1.0.0`).
(A `release.yml` GitHub Action publishes on tag when `NPM_TOKEN` is set — see
`.github/workflows/release.yml`.)
