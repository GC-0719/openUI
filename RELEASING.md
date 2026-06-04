# Releasing

openUI ships two kinds of npm packages: the **bundled kit** (`@openedui/react`)
and **user-exported kits** (named after the user's own kit + scope).

## First-time setup (one-time)
The packages publish under the **`@openedui`** npm org (already created).
Authenticate locally:

```bash
npm login          # opens a browser to your npm account
```

For automated releases via GitHub Actions, add an **`NPM_TOKEN`** repo secret on
**GC-0719/openUI** (Settings → Secrets and variables → Actions).

The token must belong to an npm user that can **publish** packages under
**`@openedui`** (the account that published `0.1.1`, or an org member with
read-write access).

### Create `NPM_TOKEN` (granular — recommended)

1. Log in at [npmjs.com](https://www.npmjs.com) as the **@openedui org owner** (or a member with publish rights).
2. Avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
3. Set:
   - **Packages and scopes** → **Read and write**
   - **Select packages** → choose `@openedui/react` and `@openedui/angular`, or the whole **`@openedui`** scope
   - Enable **Bypass 2FA for publish** if your account uses 2FA (required for CI)
4. Copy the token → GitHub repo → **Settings → Secrets → Actions** → `NPM_TOKEN`.

### Verify before tagging

```bash
npm login   # same account as the token
npm whoami
npm view @openedui/react version   # should show 0.1.1 (or latest)
cd kits/react/template
npm publish --dry-run --access public
```

If dry-run succeeds locally but CI fails, the **GitHub secret is wrong or expired** — rotate `NPM_TOKEN`.

### CI: `404 Not Found` on `PUT @openedui/react`

npm often returns **404** (not 403) when the token **cannot publish** to a scope:

| Cause | Fix |
|-------|-----|
| `NPM_TOKEN` missing or empty | Add secret; re-run workflow |
| Token from a different npm user | Use the publisher of `0.1.1`, or run `npm access grant read-write @openedui <npm-username>` as org owner |
| Granular token read-only | Regenerate with **read and write** on `@openedui/*` |
| 2FA without bypass | Enable **Bypass 2FA for publish** on the automation token |
| Not in @openedui org | npmjs.com → org **openedui** → Members → invite your user as maintainer |

After fixing the token, re-run: **Actions → Release @openedui packages → Run workflow**, or push a patch tag.

The tag-triggered [`.github/workflows/release.yml`](.github/workflows/release.yml) runs a **dry-run publish** first so failures are obvious in the log.

## Publish the bundled `@openedui/react`
From `kits/react/template/`:

```bash
cd kits/react/template
npm install          # pulls vite + @vitejs/plugin-react (build-time only)
npm publish --access public   # `prepack` runs the Vite library build automatically
```

Use the same npm account that owns **@openedui** (provenance optional locally; CI uses `--provenance`).

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
