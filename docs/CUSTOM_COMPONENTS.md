# Custom kit components

Add your own components to the **workspace** kit (`kits/<framework>/workspace`) so the agent, Spec editor, and preview treat them like built-in UI primitives.

## Quick start (studio)

1. Open the studio for **React** or **Angular**.
2. In the file explorer header, click the **boxes** icon (**New kit component**).
3. Enter a **PascalCase** name (e.g. `StatCard`).
4. openUI will:
   - Create `src/components/ui/<Name>.jsx` (React) or `src/components/ui/<kebab>.component.ts` (Angular)
   - Append `export * from './<Name>'` or `export { <Name>Component } from './…'` to the UI barrel
   - Seed **AI spec JSON** under `kits/<framework>/workspace/.openui/specs.json`
5. Open the new file, switch to the **Spec** tab, refine purpose / useWhen / patterns, and **Save**.
6. Use the component in pages: `import { StatCard } from '../components/ui'` (React) or import the standalone component (Angular).

## What gets updated

| Artifact | Location |
|----------|----------|
| Component source | `src/components/ui/…` in the workspace |
| Barrel | `src/components/ui/index.jsx` or `index.ts` |
| AI spec (workspace) | `.openui/specs.json` keyed by component id (e.g. `statcard`) |
| Built-in specs | `src/data/ai-specs.json` (repo) — merged when the agent loads specs |

The agent receives **merged** specs: global `ai-specs.json` + workspace `.openui/specs.json` (workspace wins on duplicate keys).

## API (local dev server)

```http
POST /api/register-component
Content-Type: application/json

{ "kit": "react", "name": "StatCard" }
```

Response includes `path`, `componentId`, and whether the barrel was updated.

Specs for workspace components are saved with:

```http
POST /api/write-spec
{ "componentId": "statcard", "aiSpec": { ... }, "kit": "react", "scope": "workspace" }
```

## Agent auto-barrel

When the **agent** adds a new file under `src/components/ui/` without editing the barrel, the studio **still** appends the export before write (same logic as Edit mode). Prefer the **New kit component** flow when starting from scratch so you get a stub + spec immediately.

## Gallery & npm package

Custom workspace components are **not** part of the frozen [`public-api.manifest.json`](../kits/public-api.manifest.json) until you promote them to `kits/<framework>/template` and publish a new `@openedui/*` version.

Optional: add a preview block in `ComponentShowcase.jsx` / `showcase.component.ts` so `npm run gallery:sync` and CI gallery tests include your component (see [kits/gallery/README.md](../kits/gallery/README.md)).

## Naming rules

- **PascalCase** only (`StatCard`, not `stat-card`)
- Must not collide with an existing file in `src/components/ui/`
- Angular selector: `ou-<kebab-name>` (e.g. `ou-stat-card`)

## Related docs

- [KIT_STABILITY.md](../kits/KIT_STABILITY.md) — public npm API vs workspace-only
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contributing to core kits
