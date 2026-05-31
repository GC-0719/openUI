# Releasing

openUI ships two kinds of npm packages: the **bundled kit** (`@openui/react`)
and **user-exported kits** (named after the user's own kit + scope).

## Prerequisites
- An npm account, and for scoped packages the org/scope must exist
  (e.g. `npm org create openui`).
- `npm login`. CI publishing uses an `NPM_TOKEN` secret.

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
