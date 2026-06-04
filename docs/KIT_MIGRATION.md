# Kit migration guide

Guide for apps consuming **`@openedui/react`** or **`@openedui/angular`** from npm.

## Current stable baseline

| Package | Version | Public API lock |
|---------|---------|-----------------|
| `@openedui/react` | **1.0.0** | 24 components — [public-api.manifest.json](../kits/public-api.manifest.json) |
| `@openedui/angular` | **1.0.0** | Standalone components + `ToastService` — same manifest |

At **1.0.0**, breaking API changes require a **major** bump (see [KIT_STABILITY.md](../kits/KIT_STABILITY.md)).

## Upgrading to 1.0.0

### From 0.1.x or 0.2.0

```bash
npm install @openedui/react@1.0.0
# or
npm install @openedui/angular@1.0.0
```

**Export names are unchanged** — no renames on the public barrel.

#### React 1.0 — check these in your app

| Area | Action |
|------|--------|
| **Modal** | Still use `isOpen` + `onClose`. Optional: `closeOnOverlay={false}`; Escape now closes. |
| **Input** | `error` can be a string (shows message + ARIA). Optional `label` / `hint` props. |
| **Dropdown items** | Now `<button>` — custom `onClick` on `DropdownItem` unchanged. |
| **Button** | Supports `ref` via `forwardRef`. Loading state sets `aria-busy`. |

#### Angular 1.0 — check these in your app

| Area | Action |
|------|--------|
| **Modal** | `(close)` output unchanged. Optional `[footer]` slot: `<div footer>...</div>`. `isOpen` alias supported. |
| **Dropdown item** | Prefer `(select)="handler()"` on `ou-dropdown-item`. |
| **Button** | New `@Input() loading` and `outline` variant. |
| **Input** | Label wired with `for` / `id`; use `error` string for messages. |

### CSS

Continue importing kit styles:

```js
import '@openedui/react/styles.css';
```

```ts
import '@openedui/angular/styles.css';
```

Theme tokens (`--primary`, `--text`, …) are unchanged; 1.0 adds `.ou-sr-only`.

## Upgrading from 0.1.1 → 0.2.0 (historical)

- **No export renames** on either package.
- Pin: `npm install @openedui/react@0.2.0` or `@openedui/angular@0.2.0`.

## Studio-exported kits

ZIP export from the studio produces **your** package name (`@your-scope/your-kit`), not `@openedui/*`. Migration rules above apply only to the bundled npm kits.
