# Kit migration guide

Guide for apps consuming **`@openedui/react`** or **`@openedui/angular`** from npm.

## Current stable baseline

| Package | Version | Public API lock |
|---------|---------|-----------------|
| `@openedui/react` | 0.2.0 | 24 components — see [public-api.manifest.json](../kits/public-api.manifest.json) |
| `@openedui/angular` | 0.2.0 | Standalone components + `ToastService` — same manifest |

## Upgrading from 0.1.x

### `@openedui/react` 0.1.1 → 0.2.0

- **No export renames** — the 24 component names are unchanged.
- **Export map** is explicit: `import '@openedui/react/styles.css'` (unchanged path).
- Pin in your app:

```bash
npm install @openedui/react@0.2.0
```

If you copied components into your repo instead of using the package, diff your barrel against `kits/react/template/src/components/ui/index.jsx` in the openUI repo.

### `@openedui/angular` 0.1.1 → 0.2.0

- **No symbol renames** on the public barrel (`ButtonComponent`, etc.).
- Styles: `import '@openedui/angular/styles.css'` after publish (postbuild adds the subpath).

```bash
npm install @openedui/angular@0.2.0
```

Angular 18+ standalone `imports: [ButtonComponent, …]` continues to work.

## When we publish breaking changes (pre-1.0)

We document every intentional break in:

- `kits/react/CHANGELOG.md`
- `kits/angular/CHANGELOG.md`

and bump the **minor** version with a section in this file.

## Studio-exported kits

ZIP export from the studio produces **your** package name (`@your-scope/your-kit`), not `@openedui/*`. Migration rules above apply only to the bundled npm kits.
