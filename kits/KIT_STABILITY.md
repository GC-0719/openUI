# Kit public API & semver policy

The publishable packages **`@openedui/react`** and **`@openedui/angular`** expose a
**frozen public surface** checked on every CI run against
[`public-api.manifest.json`](public-api.manifest.json).

## What is public (stable)

| Package | Stable surface |
|---------|----------------|
| `@openedui/react` | Named exports from the 24 components listed in the manifest (`Button`, `Card`, …) and the `./styles.css` subpath |
| `@openedui/angular` | Named symbols in the manifest (`ButtonComponent`, `TableColumn`, `ToastService`, …) and `./styles.css` |

Anything not exported from the kit barrel is **internal** (workspace pages, demo CSS, studio-only files).

## Semver rules (pre-1.0)

While the packages are **0.x**, we follow [Semantic Versioning](https://semver.org/) intent:

| Change | Bump |
|--------|------|
| Remove or rename a manifest export | **Minor** (0.x) until 1.0 — treat as breaking and document in kit CHANGELOG |
| Change component props in a way that breaks typed/ documented usage | **Minor** + migration note |
| Add a new component export | **Minor** (update manifest + both barrels + tests) |
| CSS variable renames, removed classes | **Minor** + migration note |
| Bug fix, same API | **Patch** |

At **1.0.0**, breaking changes require a **major** bump only.

## How we enforce stability

1. Edit `kits/public-api.manifest.json` when intentionally changing the public API.
2. Keep `kits/react/template` and `kits/react/workspace` barrels identical.
3. Keep `kits/angular/template` and `kits/angular/workspace` barrels identical.
4. Run `npm test` — `server/kitPublicApi.test.js` fails if barrels drift from the manifest.

## Publishing

See [RELEASING.md](../RELEASING.md). Kit `package.json` versions must match `semver` in the manifest before tagging a release.
