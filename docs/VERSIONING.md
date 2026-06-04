# Versioning policy (pre-1.0 → 1.0)

openUI follows [Semantic Versioning](https://semver.org/) for published packages and documented studio releases.

## Packages

| Package | Path | Current |
|---------|------|---------|
| openUI (repo) | root `package.json` | `1.0.0` (studio app) |
| `@openedui/react` | `kits/react/template` | `1.0.0` |
| `@openedui/angular` | `kits/angular/template` | `1.0.0` |

## Rules

- **Major** — breaking public kit API, barrel export removals, or incompatible studio workspace layout.
- **Minor** — new kit components, studio features, MCP tools (backward compatible).
- **Patch** — fixes, docs, security hardening, performance.

Pre-1.0 (`0.x`): minor releases may include small breaking changes; document them in `kits/*/CHANGELOG.md` and [KIT_MIGRATION.md](KIT_MIGRATION.md).

## 1.0 gate

Before tagging `1.0.0`:

1. CI green: `npm run lint` (0 errors), `npm test`, `npm run security:audit`, `npm run build:react`, kit template builds.
2. [ROADMAP.md](../ROADMAP.md) 1.0 checkboxes complete.
3. Kit manifests match barrels (`npm test` / `kitPublicApi`).

## Git tags & npm

| Tag | `package.json` | npm `@openedui/*` |
|-----|----------------|-------------------|
| `v1.0.0` | `1.0.0` (repo + kit templates) | Publish **1.0.0** on tag push (needs `NPM_TOKEN`) |
| `v0.2.0` | `0.2.0` | Studio milestone (superseded by 1.0 kits) |
| `v0.1.1` | — | First npm kits only |

Cut a release: update [CHANGELOG.md](../CHANGELOG.md) and kit CHANGELOGs, ensure versions match
`kits/public-api.manifest.json`, then:

```bash
git tag -a v1.0.0 -m "openUI 1.0.0 — stable @openedui kits"
git push origin v1.0.0
```

## Hosted site

[openui.live](https://openui.live) ships the **marketing build** only (`npm run build` + `server.js`). Studio features require `npm run dev` locally.
