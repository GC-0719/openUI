# Releasing

openUI ships two kinds of npm packages: the **bundled kit** (`@openui/react`)
and **user-exported kits** (named after the user's own kit + scope).

## First-time setup (one-time)
The packages are **scoped** as `@openui/*`. A scope is a namespace you must own
on npm. Two options:

1. **Create a free `@openui` org** (recommended — the name is currently
   available): sign in at npmjs.com → *Add Organization* → name it `openui`
   (free "public packages" plan). Or from the CLI: `npm org create openui`.
2. **Use your own username scope** instead: rename the packages to
   `@<your-npm-username>/react` and `@<your-npm-username>/angular` in
   `kits/react/template/package.json` and `kits/angular/template/package.json`.

Then authenticate locally:

```bash
npm login          # opens a browser to your npm account
```

For automated releases via GitHub Actions, add an **`NPM_TOKEN`** repo secret
(npmjs.com → *Access Tokens* → *Generate* → "Automation"; then GitHub repo →
*Settings → Secrets and variables → Actions → New repository secret*). The
tag-triggered `.github/workflows/release.yml` publishes both packages.

## Publish the bundled `@openui/react`
From `kits/react/template/`:

```bash
cd kits/react/template
npm install          # pulls vite + @vitejs/plugin-react (build-time only)
npm publish          # `prepack` runs the Vite library build automatically
```

This builds `dist/openui-react.js` (ESM) + `dist/styles.css` and publishes
`@openui/react`. Bump `version` in `kits/react/template/package.json` first.

Consumers then:

```bash
npm install @openui/react
```
```jsx
import { Button, Card } from '@openui/react';
import '@openui/react/styles.css';
```

## Publish the bundled `@openui/angular`
From `kits/angular/template/` (ng-packagr builds an Angular Package Format
bundle into `dist/`, which is what gets published):

```bash
npm run build --prefix kits/angular/template   # runs ng-packagr
npm publish kits/angular/template/dist --access public
```

Consumers import the standalone components and the kit stylesheet:

```ts
import { ButtonComponent, CardComponent } from '@openui/angular';
import '@openui/angular/styles.css';
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
Pre-1.0: bump the minor for features, patch for fixes. Tag releases
`v0.x.y`. (A `release.yml` GitHub Action can publish on tag once `NPM_TOKEN`
is configured — see `.github/workflows/`.)
