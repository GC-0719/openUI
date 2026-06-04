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

## Semver rules

| Change | Bump (1.0+) |
|--------|-------------|
| Remove or rename a manifest export | **Major** |
| Change component props in a breaking way | **Major** + migration note in [KIT_MIGRATION.md](../docs/KIT_MIGRATION.md) |
| Add a new component export | **Minor** (update manifest + both barrels + tests) |
| CSS variable renames, removed classes | **Major** or **Minor** with migration note |
| Bug fix, same API | **Patch** |
| Accessibility / behavior fix, same props | **Patch** (1.0.0 included many of these) |

Pre-1.0 (`0.x`) treated some breaks as **minor**; **1.0.0** is the stable baseline.

## How we enforce stability

1. Edit `kits/public-api.manifest.json` when intentionally changing the public API.
2. Keep `kits/react/template` and `kits/react/workspace` barrels identical.
3. Keep `kits/angular/template` and `kits/angular/workspace` barrels identical.
4. Run `npm test` — `server/kitPublicApi.test.js` fails if barrels drift from the manifest.

## Publishing

See [RELEASING.md](../RELEASING.md). Kit `package.json` versions must match `semver` in the manifest before tagging (e.g. `v1.0.0`).
